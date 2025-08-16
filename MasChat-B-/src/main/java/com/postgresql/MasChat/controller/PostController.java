package com.postgresql.MasChat.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.postgresql.MasChat.model.Comment;
import com.postgresql.MasChat.model.Post;
import com.postgresql.MasChat.dto.PostRequestDto;
import com.postgresql.MasChat.dto.PostDTO;
import com.postgresql.MasChat.dto.CommentDTO;
import com.postgresql.MasChat.service.PostService;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody PostRequestDto postDto, @RequestParam Long userId) {
        Post post = postService.createPost(postDto, userId);
        return ResponseEntity.status(201).body(PostDTO.fromEntity(post));
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts().stream().map(PostDTO::fromEntity).toList());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(postService.getPostsByUser(userId).stream().map(PostDTO::fromEntity).toList());
    }

    @GetMapping("/search")
    public ResponseEntity<List<PostDTO>> searchPosts(@RequestParam String query) {
        return ResponseEntity.ok(postService.searchPosts(query).stream().map(PostDTO::fromEntity).toList());
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<PostDTO> likePost(@PathVariable Long postId, @RequestParam Long userId) {
        Post post = postService.likePost(postId, userId);
        return ResponseEntity.ok(PostDTO.fromEntity(post));
    }

    @PostMapping("/{postId}/unlike")
    public ResponseEntity<PostDTO> unlikePost(@PathVariable Long postId, @RequestParam Long userId) {
        Post post = postService.unlikePost(postId, userId);
        return ResponseEntity.ok(PostDTO.fromEntity(post));
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<Comment> addComment(@PathVariable Long postId, @RequestParam Long userId, @RequestBody Map<String, String> request) {
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(postService.addComment(postId, userId, content));
    }

    @PostMapping("/{postId}/comment/{parentCommentId}/reply")
    public ResponseEntity<Comment> addReply(@PathVariable Long postId, @PathVariable Long parentCommentId, @RequestParam Long userId, @RequestBody Map<String, String> request) {
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(postService.addReply(postId, userId, parentCommentId, content));
    }

    @PostMapping("/comment/{commentId}/like")
    public ResponseEntity<Comment> likeComment(@PathVariable Long commentId, @RequestParam Long userId) {
        return ResponseEntity.ok(postService.likeComment(commentId, userId));
    }

    @PostMapping("/comment/{commentId}/unlike")
    public ResponseEntity<Comment> unlikeComment(@PathVariable Long commentId, @RequestParam Long userId) {
        return ResponseEntity.ok(postService.unlikeComment(commentId, userId));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId, @RequestParam Long userId) {
        postService.deletePost(postId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long postId, @RequestParam(required = false) String currentUserId) {
        try {
            Long userId = currentUserId != null ? Long.valueOf(currentUserId) : null;
            List<CommentDTO> comments = postService.getComments(postId, userId);
            return ResponseEntity.ok(comments);
        } catch (NumberFormatException e) {
            System.err.println("Invalid currentUserId format: " + currentUserId);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Error getting comments for post " + postId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{postId}/comments/search")
    public ResponseEntity<List<CommentDTO>> searchComments(@PathVariable Long postId, @RequestParam String searchTerm, @RequestParam(required = false) String currentUserId) {
        try {
            Long userId = currentUserId != null ? Long.valueOf(currentUserId) : null;
            List<CommentDTO> comments = postService.searchComments(postId, searchTerm, userId);
            return ResponseEntity.ok(comments);
        } catch (NumberFormatException e) {
            System.err.println("Invalid currentUserId format: " + currentUserId);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Error searching comments for post " + postId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/comment/{commentId}/replies")
    public ResponseEntity<List<CommentDTO>> getCommentReplies(@PathVariable Long commentId, @RequestParam(required = false) String currentUserId) {
        try {
            Long userId = currentUserId != null ? Long.valueOf(currentUserId) : null;
            List<CommentDTO> replies = postService.getCommentReplies(commentId, userId);
            return ResponseEntity.ok(replies);
        } catch (NumberFormatException e) {
            System.err.println("Invalid currentUserId format: " + currentUserId);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Error getting replies for comment " + commentId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
