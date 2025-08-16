package com.postgresql.MasChat.service;

import com.postgresql.MasChat.model.Story;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.StoryRepository;
import com.postgresql.MasChat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StoryService {
    @Autowired
    private StoryRepository storyRepository;
    @Autowired
    private UserRepository userRepository;

    public Story createStory(Long userId, String mediaUrl, String caption) {
        User user = userRepository.findById(userId).orElseThrow();
        Story story = new Story();
        story.setUser(user);
        story.setMediaUrl(mediaUrl);
        story.setCaption(caption);
        story.setCreatedAt(LocalDateTime.now());
        return storyRepository.save(story);
    }

    public List<Story> getRecentStories() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return storyRepository.findByCreatedAtAfter(since);
    }

    public void deleteStory(Long storyId, Long userId) {
        Story story = storyRepository.findById(storyId).orElseThrow();
        if (!story.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        storyRepository.delete(story);
    }

    public Story likeStory(Long storyId, Long userId) {
        Story story = storyRepository.findById(storyId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        story.getLikedBy().add(user);
        return storyRepository.save(story);
    }

    public Story unlikeStory(Long storyId, Long userId) {
        Story story = storyRepository.findById(storyId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        story.getLikedBy().remove(user);
        return storyRepository.save(story);
    }

    public List<Story> getStoriesByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return storyRepository.findByUser(user).stream()
            .filter(story -> story.getCreatedAt().isAfter(since))
            .toList();
    }
} 