package com.postgresql.MasChat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.postgresql.MasChat.model.Message;
import com.postgresql.MasChat.service.MessageService;
import com.postgresql.MasChat.dto.RecentChatDTO;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(
        @RequestParam Long senderId,
        @RequestParam Long recipientId,
        @RequestParam String content
    ) {
        Message message = messageService.sendMessage(senderId, recipientId, content);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/send-image")
    public ResponseEntity<Message> sendImageMessage(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("Received send-image request: " + request);
            
            // Validate required fields
            if (!request.containsKey("senderId") || !request.containsKey("recipientId") || !request.containsKey("imageUrl")) {
                System.err.println("Missing required fields in request: " + request.keySet());
                return ResponseEntity.badRequest().build();
            }
            
            Long senderId = Long.valueOf(request.get("senderId").toString());
            Long recipientId = Long.valueOf(request.get("recipientId").toString());
            String imageUrl = (String) request.get("imageUrl");
            String content = (String) request.get("content");
            
            System.out.println("Parsed values - senderId: " + senderId + ", recipientId: " + recipientId + ", imageUrl: " + imageUrl + ", content: " + content);
            
            Message message = messageService.sendImageMessage(senderId, recipientId, imageUrl, content);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            System.err.println("Error in sendImageMessage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(
        @RequestParam Long userId1,
        @RequestParam Long userId2
    ) {
        List<Message> conversation = messageService.getConversation(userId1, userId2);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/recent/{userId}")
    public ResponseEntity<List<RecentChatDTO>> getRecentChats(@PathVariable Long userId) {
        List<RecentChatDTO> recentChats = messageService.getRecentChats(userId);
        return ResponseEntity.ok(recentChats);
    }

    @PostMapping("/mark-read")
    public ResponseEntity<Void> markMessagesAsRead(
        @RequestParam Long userId,
        @RequestParam Long partnerId
    ) {
        messageService.markMessagesAsRead(userId, partnerId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
        @PathVariable Long messageId,
        @RequestParam Long userId
    ) {
        messageService.deleteMessage(messageId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/conversation")
    public ResponseEntity<Void> deleteConversation(
        @RequestParam Long userId,
        @RequestParam Long partnerId
    ) {
        messageService.deleteConversation(userId, partnerId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/test-image-column")
    public ResponseEntity<Map<String, Object>> testImageColumn() {
        try {
            // Try to create a test message with image to see if the column exists
            Message testMessage = messageService.sendImageMessage(1L, 1L, "test-image-url", "test content");
            Map<String, Object> result = new HashMap<>();
            result.put("status", "success");
            result.put("message", "Image column exists and is working");
            result.put("testMessageId", testMessage.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("status", "error");
            result.put("message", e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
}
