package com.postgresql.MasChat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to MasChat Backend API!");
        response.put("version", "1.0.0");
        response.put("status", "running");
        response.put("endpoints", Map.of(
            "health", "/api/health",
            "auth", "/api/auth",
            "users", "/api/users",
            "posts", "/api/posts",
            "friends", "/api/friends",
            "messages", "/api/messages",
            "marketplace", "/api/marketplace",
            "masscoin", "/api/masscoin",
            "ai-chat", "/api/ai-chat"
        ));
        return ResponseEntity.ok(response);
    }
} 