package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.dto.MemoryDTO;
import com.postgresql.MasChat.dto.MemoryStatsDTO;
import com.postgresql.MasChat.service.MemoriesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memories")
@CrossOrigin(origins = "*")
public class MemoriesController {

    @Autowired
    private MemoriesService memoriesService;

    @GetMapping
    public ResponseEntity<List<MemoryDTO>> getMemories(
            Authentication authentication,
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(defaultValue = "2024") int year) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            List<MemoryDTO> memories = memoriesService.getMemories(userId, filter, year);
            return ResponseEntity.ok(memories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<MemoryStatsDTO> getMemoryStats(Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            MemoryStatsDTO stats = memoriesService.getMemoryStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/on-this-day")
    public ResponseEntity<List<MemoryDTO>> getOnThisDay(Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            List<MemoryDTO> memories = memoriesService.getOnThisDay(userId);
            return ResponseEntity.ok(memories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<MemoryDTO>> getMemoriesByYear(
            Authentication authentication,
            @PathVariable int year) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            List<MemoryDTO> memories = memoriesService.getMemoriesByYear(userId, year);
            return ResponseEntity.ok(memories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/month/{year}/{month}")
    public ResponseEntity<List<MemoryDTO>> getMemoriesByMonth(
            Authentication authentication,
            @PathVariable int year,
            @PathVariable int month) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            List<MemoryDTO> memories = memoriesService.getMemoriesByMonth(userId, year, month);
            return ResponseEntity.ok(memories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 