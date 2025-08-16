package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @GetMapping("/jwt")
    public Map<String, Object> testJwt() {
        try {
            String testUsername = "testuser";
            String token = jwtTokenProvider.generateToken(testUsername);
            String extractedUsername = jwtTokenProvider.getUsernameFromToken(token);
            boolean isValid = jwtTokenProvider.validateToken(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("extractedUsername", extractedUsername);
            response.put("isValid", isValid);
            response.put("message", "JWT token generation and validation successful");
            
            return response;
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("message", "JWT token generation failed");
            e.printStackTrace();
            return response;
        }
    }
} 