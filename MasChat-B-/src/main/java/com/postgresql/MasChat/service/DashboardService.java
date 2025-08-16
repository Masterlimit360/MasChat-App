package com.postgresql.MasChat.service;

import com.postgresql.MasChat.dto.DashboardStatsDTO;
import com.postgresql.MasChat.dto.RecentActivityDTO;
import com.postgresql.MasChat.model.*;
import com.postgresql.MasChat.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRepository friendRepository;

    // Removed unused repositories to satisfy linter

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private LikeRepository likeRepository;


    public DashboardStatsDTO getDashboardStats(Long userId) {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        // Basic stats
        stats.setTotalPosts(postRepository.countByUserId(userId));
        stats.setTotalLikes(likeRepository.countByUserId(userId));
        stats.setTotalComments(commentRepository.countByUserId(userId));
        stats.setTotalShares(0L); // TODO: Implement shares functionality
        
        // Social stats
        stats.setFollowers(friendRepository.countByFriendId(userId));
        stats.setFollowing(friendRepository.countByUserId(userId));
        stats.setProfileViews(0L); // TODO: Implement profile views tracking
        
        // Calculate engagement rate
        long totalInteractions = stats.getTotalLikes() + stats.getTotalComments();
        long totalPosts = stats.getTotalPosts();
        if (totalPosts > 0) {
            stats.setEngagementRate((double) totalInteractions / totalPosts);
        } else {
            stats.setEngagementRate(0.0);
        }
        
        // Growth metrics (mock data for now)
        stats.setWeeklyGrowth(12.3);
        stats.setMonthlyGrowth(23.7);
        
        return stats;
    }

    public List<RecentActivityDTO> getRecentActivity(Long userId, int limit) {
        List<RecentActivityDTO> activities = new ArrayList<>();
        
        // Get recent posts
        List<Post> recentPosts = postRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
        for (Post post : recentPosts) {
            RecentActivityDTO activity = new RecentActivityDTO();
            activity.setId(post.getId().toString());
            activity.setType("post");
            activity.setTitle("New Post Created");
            activity.setDescription("Your post \"" + post.getContent().substring(0, Math.min(50, post.getContent().length())) + "...\" received " + post.getLikedBy().size() + " likes");
            activity.setTimestamp(formatTimestamp(post.getCreatedAt()));
            activity.setIcon("document-text");
            activity.setColor("#4361EE");
            activities.add(activity);
        }
        
        // Get recent likes received
        List<Like> recentLikes = likeRepository.findTop10ByPostUserIdOrderByCreatedAtDesc(userId);
        for (Like like : recentLikes) {
            RecentActivityDTO activity = new RecentActivityDTO();
            activity.setId(like.getId().toString());
            activity.setType("like");
            activity.setTitle("Post Liked");
            activity.setDescription(like.getUser().getFullName() + " liked your post");
            activity.setTimestamp(formatTimestamp(like.getCreatedAt()));
            activity.setIcon("heart");
            activity.setColor("#FF6B6B");
            activity.setUserId(like.getUser().getId().toString());
            activity.setUserName(like.getUser().getFullName());
            activity.setUserAvatar(like.getUser().getProfilePicture());
            activities.add(activity);
        }
        
        // Get recent comments received
        List<Comment> recentComments = commentRepository.findTop10ByPostUserIdOrderByCreatedAtDesc(userId);
        for (Comment comment : recentComments) {
            RecentActivityDTO activity = new RecentActivityDTO();
            activity.setId(comment.getId().toString());
            activity.setType("comment");
            activity.setTitle("New Comment");
            activity.setDescription(comment.getUser().getFullName() + " commented on your post");
            activity.setTimestamp(formatTimestamp(comment.getCreatedAt()));
            activity.setIcon("chatbubble");
            activity.setColor("#FF7F11");
            activity.setUserId(comment.getUser().getId().toString());
            activity.setUserName(comment.getUser().getFullName());
            activity.setUserAvatar(comment.getUser().getProfilePicture());
            activities.add(activity);
        }
        
        // Sort by timestamp and limit
        activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return activities.subList(0, Math.min(limit, activities.size()));
    }

    public DashboardStatsDTO getAnalytics(Long userId) {
        DashboardStatsDTO analytics = new DashboardStatsDTO();
        
        // Get user
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            
            // Profile analytics
            analytics.setFollowers(friendRepository.countByFriendId(userId));
            analytics.setFollowing(friendRepository.countByUserId(userId));
            analytics.setProfileViews(0L); // TODO: Implement profile views
            
            // Calculate engagement rate
            long totalLikes = likeRepository.countByUserId(userId);
            long totalComments = commentRepository.countByUserId(userId);
            long totalPosts = postRepository.countByUserId(userId);
            
            if (totalPosts > 0) {
                analytics.setEngagementRate((double) (totalLikes + totalComments) / totalPosts);
            } else {
                analytics.setEngagementRate(0.0);
            }
        }
        
        return analytics;
    }

    public DashboardStatsDTO getGrowthMetrics(Long userId) {
        DashboardStatsDTO growth = new DashboardStatsDTO();
        
        // Calculate weekly growth (mock data for now)
        growth.setWeeklyGrowth(12.3);
        growth.setMonthlyGrowth(23.7);
        
        // Calculate engagement rate
        long totalLikes = likeRepository.countByUserId(userId);
        long totalComments = commentRepository.countByUserId(userId);
        long totalPosts = postRepository.countByUserId(userId);
        
        if (totalPosts > 0) {
            growth.setEngagementRate((double) (totalLikes + totalComments) / totalPosts);
        } else {
            growth.setEngagementRate(0.0);
        }
        
        return growth;
    }

    private String formatTimestamp(LocalDateTime timestamp) {
        LocalDateTime now = LocalDateTime.now();
        long diffInHours = java.time.Duration.between(timestamp, now).toHours();
        
        if (diffInHours < 1) {
            return "Just now";
        } else if (diffInHours < 24) {
            return diffInHours + " hours ago";
        } else {
            long diffInDays = diffInHours / 24;
            return diffInDays + " days ago";
        }
    }
} 