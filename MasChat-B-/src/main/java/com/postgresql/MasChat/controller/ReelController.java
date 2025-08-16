
package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.dto.ReelDTO;
import com.postgresql.MasChat.dto.ReelCommentDTO;
import com.postgresql.MasChat.model.Reel;
import com.postgresql.MasChat.model.ReelComment;
import com.postgresql.MasChat.service.ReelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import com.postgresql.MasChat.repository.ReelRepository;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/reels")
public class ReelController {

    @GetMapping("/{reelId}")
    public ReelDTO getReelById(@PathVariable Long reelId) {
        Reel reel = reelService.getReelById(reelId);
        return ReelDTO.fromEntity(reel);
    }
    @Autowired
    private ReelService reelService;

    @GetMapping
    public List<ReelDTO> getRecentReels() {
        System.out.println("Received request for recent reels");
        List<Reel> reels = reelService.getRecentReels();
        List<ReelDTO> dtos = reels.stream().map(ReelDTO::fromEntity).collect(Collectors.toList());
        System.out.println("Returning " + dtos.size() + " reels");
        return dtos;
    }

    @GetMapping("/search")
    public List<ReelDTO> searchReels(@RequestParam String query) {
        return reelService.searchReels(query).stream().map(ReelDTO::fromEntity).collect(Collectors.toList());
    }

    @PostMapping("/create")
    public ReelDTO createReel(@RequestBody ReelCreateRequest req) {
        System.out.println("Received create reel request:");
        System.out.println("  User ID: " + req.getUserId());
        System.out.println("  Media URL: " + req.getMediaUrl());
        System.out.println("  Caption: " + req.getCaption());
        
        Reel reel = reelService.createReel(req.getUserId(), req.getMediaUrl(), req.getCaption());
        ReelDTO dto = ReelDTO.fromEntity(reel);
        
        System.out.println("Returning reel DTO with ID: " + dto.getId());
        return dto;
    }

    @PostMapping("/{reelId}/like")
    public ReelDTO likeReel(@PathVariable Long reelId, @RequestParam Long userId) {
        return ReelDTO.fromEntity(reelService.likeReel(reelId, userId));
    }

    @PostMapping("/{reelId}/unlike")
    public ReelDTO unlikeReel(@PathVariable Long reelId, @RequestParam Long userId) {
        return ReelDTO.fromEntity(reelService.unlikeReel(reelId, userId));
    }

    @PostMapping("/{reelId}/comment")
    public ReelComment addComment(@PathVariable Long reelId, @RequestParam Long userId, @RequestBody String content) {
        return reelService.addComment(reelId, userId, content);
    }

    @GetMapping("/{reelId}/comments")
    public List<ReelCommentDTO> getComments(@PathVariable Long reelId) {
        return reelService.getComments(reelId).stream().map(ReelCommentDTO::fromEntity).collect(Collectors.toList());
    }

    @PostMapping("/{reelId}/share")
    public ReelDTO shareReel(@PathVariable Long reelId) {
        return ReelDTO.fromEntity(reelService.shareReel(reelId));
    }

    @DeleteMapping("/{reelId}")
    public void deleteReel(@PathVariable Long reelId, @RequestParam Long userId) {
        reelService.deleteReel(reelId, userId);
    }

    @Autowired
    private ReelRepository reelRepository;

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testReels() {
        System.out.println("=== Testing Reels Endpoint ===");
        try {
            List<Reel> allReels = reelRepository.findAll();
            System.out.println("Total reels in database: " + allReels.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalReels", allReels.size());
            response.put("reels", allReels.stream().map(reel -> {
                Map<String, Object> reelInfo = new HashMap<>();
                reelInfo.put("id", reel.getId());
                reelInfo.put("userId", reel.getUser() != null ? reel.getUser().getId() : "null");
                reelInfo.put("username", reel.getUser() != null ? reel.getUser().getUsername() : "null");
                reelInfo.put("mediaUrl", reel.getMediaUrl());
                reelInfo.put("caption", reel.getCaption());
                reelInfo.put("createdAt", reel.getCreatedAt());
                return reelInfo;
            }).collect(Collectors.toList()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in test endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    public static class ReelCreateRequest {
        private Long userId;
        private String mediaUrl;
        private String caption;
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getMediaUrl() { return mediaUrl; }
        public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
        public String getCaption() { return caption; }
        public void setCaption(String caption) { this.caption = caption; }
    }
} 