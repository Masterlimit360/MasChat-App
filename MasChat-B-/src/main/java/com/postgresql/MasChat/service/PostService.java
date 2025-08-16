package com.postgresql.MasChat.service;

import com.postgresql.MasChat.model.*;
import com.postgresql.MasChat.repository.*;
import com.postgresql.MasChat.dto.PostRequestDto;
import com.postgresql.MasChat.dto.CommentDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private LikeRepository likeRepository;

    public Post createPost(PostRequestDto dto, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Post post = new Post();
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());
        post.setVideoUrl(dto.getVideoUrl());
        post.setUser(user);
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Post> getPostsByUser(Long userId) {
        return postRepository.findByUserId(userId);
    }

    public Post likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        if (!post.getLikedBy().contains(user)) {
            post.getLikedBy().add(user);
        }
        return postRepository.save(post);
    }

    public Post unlikePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        post.getLikedBy().remove(user);
        return postRepository.save(post);
    }

    public Comment addComment(Long postId, Long userId, String content) {
        Post post = postRepository.findById(postId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(content); // Use setContent instead of setText
        comment.setCreatedAt(java.time.LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public Comment addReply(Long postId, Long userId, Long parentCommentId, String content) {
        Post post = postRepository.findById(postId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        Comment parentComment = commentRepository.findById(parentCommentId).orElseThrow();
        
        Comment reply = new Comment();
        reply.setPost(post);
        reply.setUser(user);
        reply.setContent(content);
        reply.setParentComment(parentComment);
        reply.setCreatedAt(java.time.LocalDateTime.now());
        return commentRepository.save(reply);
    }

    public Comment likeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        
        // Check if user already liked this comment
        if (comment.isLikedByUser(userId)) {
            throw new RuntimeException("User already liked this comment");
        }
        
        Like like = new Like();
        like.setComment(comment);
        like.setUser(user);
        like.setCreatedAt(java.time.LocalDateTime.now());
        likeRepository.save(like);
        
        return comment;
    }

    public Comment unlikeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        
        // Find and remove the like
        Like like = likeRepository.findByCommentAndUser(comment, user);
        if (like != null) {
            likeRepository.delete(like);
        }
        
        return comment;
    }

    public List<Post> searchPosts(String query) {
        return postRepository.findByContentContainingIgnoreCase(query);
    }

    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow();
        // Check if the user is the owner of the post
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("User not authorized to delete this post");
        }
        postRepository.delete(post);
    }

    public java.util.List<CommentDTO> getComments(Long postId) {
        return getComments(postId, null);
    }

    public java.util.List<CommentDTO> getComments(Long postId, Long currentUserId) {
        try {
            Post post = postRepository.findById(postId).orElseThrow();
            java.util.List<Comment> topLevelComments = commentRepository.findTopLevelCommentsByPost(post);
            java.util.List<CommentDTO> dtos = new java.util.ArrayList<>();
            for (Comment c : topLevelComments) {
                try {
                    dtos.add(CommentDTO.fromEntity(c, currentUserId));
                } catch (Exception e) {
                    System.err.println("Error converting comment to DTO: " + e.getMessage());
                    // Continue with other comments
                }
            }
            return dtos;
        } catch (Exception e) {
            System.err.println("Error getting comments for post " + postId + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public java.util.List<CommentDTO> searchComments(Long postId, String searchTerm, Long currentUserId) {
        Post post = postRepository.findById(postId).orElseThrow();
        java.util.List<Comment> comments = commentRepository.searchCommentsByContent(post, searchTerm);
        java.util.List<CommentDTO> dtos = new java.util.ArrayList<>();
        for (Comment c : comments) {
            dtos.add(CommentDTO.fromEntity(c, currentUserId));
        }
        return dtos;
    }

    public java.util.List<CommentDTO> getCommentReplies(Long commentId, Long currentUserId) {
        java.util.List<Comment> replies = commentRepository.findRepliesByParentCommentId(commentId);
        java.util.List<CommentDTO> dtos = new java.util.ArrayList<>();
        for (Comment c : replies) {
            dtos.add(CommentDTO.fromEntity(c, currentUserId));
        }
        return dtos;
    }
}