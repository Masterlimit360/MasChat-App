package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.dto.DashboardStatsDTO;
import com.postgresql.MasChat.dto.RecentActivityDTO;
import com.postgresql.MasChat.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            DashboardStatsDTO stats = dashboardService.getDashboardStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<RecentActivityDTO>> getRecentActivity(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            List<RecentActivityDTO> activities = dashboardService.getRecentActivity(userId, limit);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<DashboardStatsDTO> getAnalytics(Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            DashboardStatsDTO analytics = dashboardService.getAnalytics(userId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/growth")
    public ResponseEntity<DashboardStatsDTO> getGrowthMetrics(Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            DashboardStatsDTO growth = dashboardService.getGrowthMetrics(userId);
            return ResponseEntity.ok(growth);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 