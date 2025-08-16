package com.postgresql.MasChat.service;

import com.postgresql.MasChat.dto.MemoryDTO;
import com.postgresql.MasChat.dto.MemoryStatsDTO;
import com.postgresql.MasChat.model.Post;
import com.postgresql.MasChat.model.Story;
import com.postgresql.MasChat.model.Reel;
import com.postgresql.MasChat.repository.PostRepository;
import com.postgresql.MasChat.repository.StoryRepository;
import com.postgresql.MasChat.repository.ReelRepository;
import com.postgresql.MasChat.repository.LikeRepository;
import com.postgresql.MasChat.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MemoriesService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ReelRepository reelRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    public List<MemoryDTO> getMemories(Long userId, String filter, int year) {
        List<MemoryDTO> memories = new ArrayList<>();

        if (filter.equals("all") || filter.equals("posts")) {
            List<Post> posts = postRepository.findByUserIdAndYear(userId, year);
            memories.addAll(posts.stream().map(this::convertPostToMemory).collect(Collectors.toList()));
        }

        if (filter.equals("all") || filter.equals("stories")) {
            List<Story> stories = storyRepository.findByUserIdAndYear(userId, year);
            memories.addAll(stories.stream().map(this::convertStoryToMemory).collect(Collectors.toList()));
        }

        if (filter.equals("all") || filter.equals("reels")) {
            List<Reel> reels = reelRepository.findByUserIdAndYear(userId, year);
            memories.addAll(reels.stream().map(this::convertReelToMemory).collect(Collectors.toList()));
        }

        // Sort by date (newest first)
        memories.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return memories;
    }

    public MemoryStatsDTO getMemoryStats(Long userId) {
        MemoryStatsDTO stats = new MemoryStatsDTO();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yearStart = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime weekStart = now.minusDays(now.getDayOfWeek().getValue() - 1).withHour(0).withMinute(0).withSecond(0);

        // Total memories (all time)
        long totalPosts = postRepository.countByUserId(userId);
        long totalStories = storyRepository.countByUserId(userId);
        long totalReels = reelRepository.countByUserId(userId);
        stats.setTotalMemories(totalPosts + totalStories + totalReels);

        // This year
        long yearPosts = postRepository.countByUserIdAndCreatedAtAfter(userId, yearStart);
        long yearStories = storyRepository.countByUserIdAndCreatedAtAfter(userId, yearStart);
        long yearReels = reelRepository.countByUserIdAndCreatedAtAfter(userId, yearStart);
        stats.setThisYear(yearPosts + yearStories + yearReels);

        // This month
        long monthPosts = postRepository.countByUserIdAndCreatedAtAfter(userId, monthStart);
        long monthStories = storyRepository.countByUserIdAndCreatedAtAfter(userId, monthStart);
        long monthReels = reelRepository.countByUserIdAndCreatedAtAfter(userId, monthStart);
        stats.setThisMonth(monthPosts + monthStories + monthReels);

        // This week
        long weekPosts = postRepository.countByUserIdAndCreatedAtAfter(userId, weekStart);
        long weekStories = storyRepository.countByUserIdAndCreatedAtAfter(userId, weekStart);
        long weekReels = reelRepository.countByUserIdAndCreatedAtAfter(userId, weekStart);
        stats.setThisWeek(weekPosts + weekStories + weekReels);

        // Total engagement
        long totalLikes = likeRepository.countByPostUserId(userId);
        long totalComments = commentRepository.countByPostUserId(userId);
        stats.setTotalLikes(totalLikes);
        stats.setTotalComments(totalComments);
        stats.setTotalViews(0L); // TODO: Implement view tracking
        stats.setTotalShares(0L); // TODO: Implement share tracking

        return stats;
    }

    public List<MemoryDTO> getOnThisDay(Long userId) {
        LocalDate today = LocalDate.now();
        int dayOfYear = today.getDayOfYear();
        
        List<MemoryDTO> memories = new ArrayList<>();

        // Get posts from previous years on this day
        List<Post> posts = postRepository.findByUserIdAndDayOfYear(userId, dayOfYear);
        memories.addAll(posts.stream().map(this::convertPostToMemory).collect(Collectors.toList()));

        // Get stories from previous years on this day
        List<Story> stories = storyRepository.findByUserIdAndDayOfYear(userId, dayOfYear);
        memories.addAll(stories.stream().map(this::convertStoryToMemory).collect(Collectors.toList()));

        // Get reels from previous years on this day
        List<Reel> reels = reelRepository.findByUserIdAndDayOfYear(userId, dayOfYear);
        memories.addAll(reels.stream().map(this::convertReelToMemory).collect(Collectors.toList()));

        return memories;
    }

    public List<MemoryDTO> getMemoriesByYear(Long userId, int year) {
        return getMemories(userId, "all", year);
    }

    public List<MemoryDTO> getMemoriesByMonth(Long userId, int year, int month) {
        List<MemoryDTO> memories = new ArrayList<>();

        // Get posts for the specific month
        List<Post> posts = postRepository.findByUserIdAndYearAndMonth(userId, year, month);
        memories.addAll(posts.stream().map(this::convertPostToMemory).collect(Collectors.toList()));

        // Get stories for the specific month
        List<Story> stories = storyRepository.findByUserIdAndYearAndMonth(userId, year, month);
        memories.addAll(stories.stream().map(this::convertStoryToMemory).collect(Collectors.toList()));

        // Get reels for the specific month
        List<Reel> reels = reelRepository.findByUserIdAndYearAndMonth(userId, year, month);
        memories.addAll(reels.stream().map(this::convertReelToMemory).collect(Collectors.toList()));

        // Sort by date
        memories.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return memories;
    }

    private MemoryDTO convertPostToMemory(Post post) {
        MemoryDTO memory = new MemoryDTO();
        memory.setId(post.getId());
        memory.setType("post");
        memory.setTitle("Post");
        memory.setDescription(post.getContent());
        memory.setImageUrl(post.getImageUrl() != null ? post.getImageUrl() : "");
        memory.setDate(post.getCreatedAt());
        memory.setLikes((long) post.getLikedBy().size());
        memory.setComments((long) post.getComments().size());
        memory.setShares(0L); // TODO: Implement shares
        memory.setViews(0L); // TODO: Implement views
        memory.setVideo(false);
        memory.setOriginalContent(post.getContent());
        return memory;
    }

    private MemoryDTO convertStoryToMemory(Story story) {
        MemoryDTO memory = new MemoryDTO();
        memory.setId(story.getId());
        memory.setType("story");
        memory.setTitle("Story");
        memory.setDescription(story.getCaption());
        memory.setImageUrl(story.getMediaUrl());
        memory.setDate(story.getCreatedAt());
        memory.setLikes(0L); // Stories typically don't have likes
        memory.setComments(0L); // Stories typically don't have comments
        memory.setShares(0L);
        memory.setViews(0L);
        memory.setVideo(false);
        memory.setOriginalContent(story.getCaption());
        return memory;
    }

    private MemoryDTO convertReelToMemory(Reel reel) {
        MemoryDTO memory = new MemoryDTO();
        memory.setId(reel.getId());
        memory.setType("reel");
        memory.setTitle("Reel");
        memory.setDescription(reel.getCaption());
        memory.setImageUrl(reel.getMediaUrl());
        memory.setDate(reel.getCreatedAt());
        memory.setLikes((long) reel.getLikedBy().size());
        memory.setComments((long) reel.getComments().size());
        memory.setShares((long) reel.getShareCount());
        memory.setViews(0L);
        memory.setVideo(true);
        memory.setDuration("0"); // Reel model doesn't have duration field
        memory.setOriginalContent(reel.getCaption());
        return memory;
    }
} 