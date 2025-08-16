package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.dto.AIChatDTO;
import com.postgresql.MasChat.service.AIChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import com.postgresql.MasChat.repository.AIChatRepository;
import com.postgresql.MasChat.repository.AIChatMessageRepository;
import com.postgresql.MasChat.repository.UserRepository;
import com.postgresql.MasChat.model.AIChat;

@RestController
@RequestMapping("/api/ai-chat")
@CrossOrigin(origins = "*")
public class AIChatController {
    
    private static final Logger logger = LoggerFactory.getLogger(AIChatController.class);
    
    @Autowired
    private AIChatService aiChatService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AIChatRepository aiChatRepository;
    
    @Autowired
    private AIChatMessageRepository aiChatMessageRepository;
    
    @PostMapping("/create")
    public ResponseEntity<?> createNewChat(@RequestParam Long userId) {
        try {
            logger.info("Creating new AI chat for user: {}", userId);
            AIChatDTO newChat = aiChatService.createNewChat(userId);
            logger.info("Successfully created AI chat with session ID: {}", newChat.getSessionId());
            return ResponseEntity.ok(newChat);
        } catch (Exception e) {
            logger.error("Error creating new AI chat for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to create AI chat",
                "message", e.getMessage(),
                "userId", userId
            ));
        }
    }
    
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestParam Long userId,
            @RequestParam String sessionId,
            @RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
            }
            
            logger.info("Sending AI message for user: {}, session: {}", userId, sessionId);
            AIChatDTO updatedChat = aiChatService.sendMessage(userId, sessionId, message);
            return ResponseEntity.ok(updatedChat);
        } catch (Exception e) {
            logger.error("Error sending AI message for user {} session {}: {}", userId, sessionId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to send message",
                "message", e.getMessage(),
                "userId", userId,
                "sessionId", sessionId
            ));
        }
    }
    
    @GetMapping("/history")
    public ResponseEntity<?> getChatHistory(
            @RequestParam Long userId,
            @RequestParam String sessionId) {
        try {
            logger.info("Getting chat history for user: {}, session: {}", userId, sessionId);
            AIChatDTO chatHistory = aiChatService.getChatHistory(userId, sessionId);
            return ResponseEntity.ok(chatHistory);
        } catch (Exception e) {
            logger.error("Error getting chat history for user {} session {}: {}", userId, sessionId, e.getMessage(), e);
            return ResponseEntity.status(404).body(Map.of(
                "error", "Chat session not found",
                "message", e.getMessage(),
                "userId", userId,
                "sessionId", sessionId
            ));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserChats(@PathVariable Long userId) {
        try {
            logger.info("Getting AI chats for user: {}", userId);
            List<AIChatDTO> userChats = aiChatService.getUserChats(userId);
            return ResponseEntity.ok(userChats);
        } catch (Exception e) {
            logger.error("Error getting AI chats for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to get user chats",
                "message", e.getMessage(),
                "userId", userId
            ));
        }
    }
    
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteChat(
            @RequestParam Long userId,
            @RequestParam String sessionId) {
        try {
            logger.info("Deleting AI chat for user: {}, session: {}", userId, sessionId);
            aiChatService.deleteChat(userId, sessionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting AI chat for user {} session {}: {}", userId, sessionId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to delete chat",
                "message", e.getMessage(),
                "userId", userId,
                "sessionId", sessionId
            ));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        logger.info("AI Chat health check requested");
        return ResponseEntity.ok(Map.of("status", "AI Chat service is running"));
    }
    
    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            logger.info("Testing database connectivity");
            
            // Test if repositories are working
            long userCount = userRepository.count();
            long aiChatCount = aiChatRepository.count();
            long aiMessageCount = aiChatMessageRepository.count();
            
            Map<String, Object> result = Map.of(
                "status", "Database connection successful",
                "userCount", userCount,
                "aiChatCount", aiChatCount,
                "aiMessageCount", aiMessageCount,
                "timestamp", java.time.LocalDateTime.now().toString()
            );
            
            logger.info("Database test successful: {}", result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Database test failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Database connection failed",
                "message", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        }
    }
    
    @PostMapping("/init-db")
    public ResponseEntity<?> initializeDatabase() {
        try {
            logger.info("Initializing AI chat database tables");
            
            // Create a test AI chat to verify tables work
            AIChat testChat = new AIChat();
            testChat.setSessionId("test-session-" + System.currentTimeMillis());
            testChat.setMessageCount(0);
            testChat.setIsActive(false); // Mark as inactive so it doesn't interfere
            
            // Get the first user for testing
            var firstUser = userRepository.findAll().stream().findFirst();
            if (firstUser.isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "No users found in database",
                    "message", "Please create a user account first"
                ));
            }
            
            testChat.setUser(firstUser.get());
            AIChat savedChat = aiChatRepository.save(testChat);
            
            // Clean up the test chat
            aiChatRepository.delete(savedChat);
            
            Map<String, Object> result = Map.of(
                "status", "Database tables initialized successfully",
                "message", "AI chat tables are working properly",
                "timestamp", java.time.LocalDateTime.now().toString()
            );
            
            logger.info("Database initialization successful: {}", result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Database initialization failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Database initialization failed",
                "message", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        }
    }
} 