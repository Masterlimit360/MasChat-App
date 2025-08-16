package com.postgresql.MasChat.service;

import com.postgresql.MasChat.dto.AIChatDTO;
import com.postgresql.MasChat.model.AIChat;
import com.postgresql.MasChat.model.AIChatMessage;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.AIChatRepository;
import com.postgresql.MasChat.repository.AIChatMessageRepository;
import com.postgresql.MasChat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIChatService {
    
    @Autowired
    private AIChatRepository aiChatRepository;
    
    @Autowired
    private AIChatMessageRepository aiChatMessageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final String CLAUDE_API_URL = "https://open-ai21.p.rapidapi.com/claude3";
    private static final String API_KEY = "355060685fmsh742abd58eb438d7p1f4d66jsn22cd506769c9";
    private static final String API_HOST = "open-ai21.p.rapidapi.com";

    public AIChatDTO createNewChat(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String sessionId = generateSessionId();
        
        AIChat aiChat = new AIChat();
        aiChat.setUser(user);
        aiChat.setSessionId(sessionId);
        aiChat.setMessageCount(0);
        aiChat.setIsActive(true);
        
        AIChat savedChat = aiChatRepository.save(aiChat);
        
        // Add welcome message
        AIChatMessage welcomeMessage = new AIChatMessage();
        welcomeMessage.setAiChat(savedChat);
        welcomeMessage.setContent("Hi! I'm your MasChat AI assistant. I can help you with:\n\n• Account and profile questions\n• Privacy and security settings\n• Finding and connecting with friends\n• Using app features like posts, stories, and marketplace\n• General social media tips\n\nHow can I help you today?");
        welcomeMessage.setIsUserMessage(false);
        welcomeMessage.setModelUsed("claude-3-sonnet");
        
        aiChatMessageRepository.save(welcomeMessage);
        
        // Update message count
        savedChat.setMessageCount(1);
        aiChatRepository.save(savedChat);
        
        return new AIChatDTO(savedChat, Arrays.asList(welcomeMessage));
    }

    public AIChatDTO sendMessage(Long userId, String sessionId, String userMessage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        AIChat aiChat = aiChatRepository.findByUserAndSessionId(user, sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));
        
        // Save user message
        AIChatMessage userMsg = new AIChatMessage();
        userMsg.setAiChat(aiChat);
        userMsg.setContent(userMessage);
        userMsg.setIsUserMessage(true);
        userMsg.setModelUsed("user-input");
        
        aiChatMessageRepository.save(userMsg);
        
        // Get AI response
        long startTime = System.currentTimeMillis();
        String aiResponse = getClaudeResponse(aiChat, userMessage);
        long responseTime = System.currentTimeMillis() - startTime;
        
        // Save AI response
        AIChatMessage aiMsg = new AIChatMessage();
        aiMsg.setAiChat(aiChat);
        aiMsg.setContent(aiResponse);
        aiMsg.setIsUserMessage(false);
        aiMsg.setAiResponseTimeMs(responseTime);
        aiMsg.setModelUsed("claude-3-sonnet");
        
        aiChatMessageRepository.save(aiMsg);
        
        // Update chat stats
        aiChat.setMessageCount(aiChat.getMessageCount() + 2);
        aiChat.setLastActivity(LocalDateTime.now());
        aiChatRepository.save(aiChat);
        
        // Return updated chat with messages
        List<AIChatMessage> allMessages = aiChatMessageRepository.findByAiChatOrderBySentAtAsc(aiChat);
        return new AIChatDTO(aiChat, allMessages);
    }

    public AIChatDTO getChatHistory(Long userId, String sessionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        AIChat aiChat = aiChatRepository.findByUserAndSessionId(user, sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));
        
        List<AIChatMessage> messages = aiChatMessageRepository.findByAiChatOrderBySentAtAsc(aiChat);
        return new AIChatDTO(aiChat, messages);
    }

    public List<AIChatDTO> getUserChats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<AIChat> chats = aiChatRepository.findByUserAndIsActiveTrueOrderByLastActivityDesc(user);
        return chats.stream()
                .map(chat -> {
                    List<AIChatMessage> allMessages = aiChatMessageRepository.findRecentMessages(chat);
                    List<AIChatMessage> recentMessages = allMessages.stream()
                            .limit(5)
                            .collect(Collectors.toList());
                    return new AIChatDTO(chat, recentMessages);
                })
                .collect(Collectors.toList());
    }

    public void deleteChat(Long userId, String sessionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        AIChat aiChat = aiChatRepository.findByUserAndSessionId(user, sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));
        
        aiChat.setIsActive(false);
        aiChatRepository.save(aiChat);
    }

    private String getClaudeResponse(AIChat aiChat, String userMessage) {
        try {
            // Build conversation history
            List<AIChatMessage> history = aiChatMessageRepository.findConversationHistory(aiChat);
            List<Map<String, Object>> messages = new ArrayList<>();
            
            // Add system message
            Map<String, Object> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", "You are MasChat AI, a helpful assistant for a social media app. Help users with account questions, privacy settings, finding friends, using features like posts/stories/marketplace, and general social media tips. Be friendly, concise, and helpful.");
            messages.add(systemMsg);
            
            // Add conversation history (last 10 messages for context)
            List<AIChatMessage> recentHistory = history.stream()
                    .skip(Math.max(0, history.size() - 10))
                    .collect(Collectors.toList());
            
            for (AIChatMessage msg : recentHistory) {
                Map<String, Object> msgMap = new HashMap<>();
                msgMap.put("role", msg.getIsUserMessage() ? "user" : "assistant");
                msgMap.put("content", msg.getContent());
                messages.add(msgMap);
            }
            
            // Add current user message
            Map<String, Object> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            messages.add(userMsg);
            
            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("messages", messages);
            requestBody.put("web_access", false);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-rapidapi-key", API_KEY);
            headers.set("x-rapidapi-host", API_HOST);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // Make API call
            ResponseEntity<String> response = restTemplate.exchange(
                    CLAUDE_API_URL,
                    HttpMethod.POST,
                    request,
                    String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                
                // Handle new API response format
                if (jsonResponse.has("status") && jsonResponse.get("status").asBoolean()) {
                    if (jsonResponse.has("result")) {
                        return jsonResponse.get("result").asText();
                    }
                }
                
                // Fallback to old format if needed
                if (jsonResponse.has("content") && jsonResponse.get("content").isArray() && 
                    jsonResponse.get("content").size() > 0) {
                    return jsonResponse.get("content").get(0).get("text").asText();
                } else if (jsonResponse.has("text")) {
                    return jsonResponse.get("text").asText();
                } else if (jsonResponse.has("message")) {
                    return jsonResponse.get("message").asText();
                } else {
                    return getFallbackResponse(userMessage);
                }
            } else {
                return getFallbackResponse(userMessage);
            }
            
        } catch (Exception e) {
            System.err.println("Error calling Claude API: " + e.getMessage());
            return getFallbackResponse(userMessage);
        }
    }

    private String getFallbackResponse(String userMessage) {
        String[] fallbackResponses = {
            "I understand you're asking about \"" + userMessage + "\". As your MasChat AI assistant, I can help with account questions, privacy settings, and connecting with friends. Could you please rephrase your question?",
            "I'm having trouble processing that right now. I can help you with MasChat features, account settings, privacy, and finding friends. What would you like to know?",
            "Let me help you with that! I'm here to assist with MasChat questions, profile settings, privacy, and social features. Could you try asking again?"
        };
        return fallbackResponses[new Random().nextInt(fallbackResponses.length)];
    }

    private String generateSessionId() {
        return UUID.randomUUID().toString();
    }
} 