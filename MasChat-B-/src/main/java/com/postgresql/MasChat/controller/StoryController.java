package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.dto.StoryDTO;
import com.postgresql.MasChat.model.Story;
import com.postgresql.MasChat.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stories")
public class StoryController {
    @Autowired
    private StoryService storyService;

    @GetMapping
    public List<StoryDTO> getRecentStories() {
        return storyService.getRecentStories().stream().map(StoryDTO::fromEntity).collect(Collectors.toList());
    }

    @GetMapping("/user/{userId}")
    public List<StoryDTO> getStoriesByUser(@PathVariable Long userId) {
        return storyService.getStoriesByUser(userId).stream().map(StoryDTO::fromEntity).collect(Collectors.toList());
    }

    @PostMapping("/create")
    public StoryDTO createStory(@RequestBody StoryCreateRequest req) {
        Story story = storyService.createStory(req.getUserId(), req.getMediaUrl(), req.getCaption());
        return StoryDTO.fromEntity(story);
    }

    @PostMapping("/{storyId}/like")
    public StoryDTO likeStory(@PathVariable Long storyId, @RequestParam Long userId) {
        return StoryDTO.fromEntity(storyService.likeStory(storyId, userId));
    }

    @PostMapping("/{storyId}/unlike")
    public StoryDTO unlikeStory(@PathVariable Long storyId, @RequestParam Long userId) {
        return StoryDTO.fromEntity(storyService.unlikeStory(storyId, userId));
    }

    @DeleteMapping("/{storyId}")
    public void deleteStory(@PathVariable Long storyId, @RequestParam Long userId) {
        storyService.deleteStory(storyId, userId);
    }

    public static class StoryCreateRequest {
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