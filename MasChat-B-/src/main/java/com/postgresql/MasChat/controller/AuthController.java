package com.postgresql.MasChat.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.postgresql.MasChat.dto.ForgotPasswordRequest;
import com.postgresql.MasChat.dto.LoginRequest;
import com.postgresql.MasChat.dto.ProfileUpdateRequest;
import com.postgresql.MasChat.dto.RegisterRequest;
import com.postgresql.MasChat.dto.ResetPasswordRequest;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.security.JwtTokenProvider;
import com.postgresql.MasChat.service.PasswordResetService;
import com.postgresql.MasChat.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager authManager;
    @Autowired private UserService userService;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private PasswordResetService passwordResetService;

    @PutMapping("/{id}/profile")
    public ResponseEntity<User> updateProfile(
            @PathVariable Long id,
            @RequestBody ProfileUpdateRequest request
    ) {
        User updatedUser = userService.updateProfile(id, request);
        return ResponseEntity.ok(updatedUser);
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User registeredUser = userService.register(request);
            String token = jwtTokenProvider.generateToken(registeredUser.getUsername());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully!");
            response.put("token", token);
            response.put("username", registeredUser.getUsername());
            response.put("userId", registeredUser.getId());
            
            // Add user object with all necessary fields
            Map<String, Object> userObj = new HashMap<>();
            userObj.put("id", registeredUser.getId());
            userObj.put("username", registeredUser.getUsername());
            userObj.put("email", registeredUser.getEmail());
            userObj.put("fullName", registeredUser.getFullName());
            userObj.put("profilePicture", registeredUser.getProfilePicture());
            userObj.put("coverPhoto", registeredUser.getCoverPhoto());
            userObj.put("bio", registeredUser.getBio());
            userObj.put("createdAt", registeredUser.getCreatedAt());
            userObj.put("updatedAt", registeredUser.getUpdatedAt());
            userObj.put("verified", registeredUser.getVerified());
            
            response.put("user", userObj);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed. Please try again."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            User user = userService.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtTokenProvider.generateToken(user.getUsername());

            // Return the same format as signup for consistency
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful!");
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("userId", user.getId());
            
            // Add user object with all necessary fields
            Map<String, Object> userObj = new HashMap<>();
            userObj.put("id", user.getId());
            userObj.put("username", user.getUsername());
            userObj.put("email", user.getEmail());
            userObj.put("fullName", user.getFullName());
            userObj.put("profilePicture", user.getProfilePicture());
            userObj.put("coverPhoto", user.getCoverPhoto());
            userObj.put("bio", user.getBio());
            userObj.put("createdAt", user.getCreatedAt());
            userObj.put("updatedAt", user.getUpdatedAt());
            userObj.put("verified", user.getVerified());
            
            response.put("user", userObj);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.forgotPassword(request);
            return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a password reset link has been sent."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testConnection() {
        return ResponseEntity.ok("Backend connection successful");
    }

    @GetMapping("/test-token")
    public ResponseEntity<?> testTokenGeneration() {
      try {
        System.out.println("=== Testing Token Generation ===");
        String testUsername = "testuser";
        String token = jwtTokenProvider.generateToken(testUsername);
        System.out.println("Generated token: " + token);
        
        String extractedUsername = jwtTokenProvider.getUsernameFromToken(token);
        System.out.println("Extracted username: " + extractedUsername);
        
        boolean isValid = jwtTokenProvider.validateToken(token);
        System.out.println("Token is valid: " + isValid);
        
        return ResponseEntity.ok(Map.of(
          "generated_token", token,
          "extracted_username", extractedUsername,
          "is_valid", isValid
        ));
      } catch (Exception e) {
        System.out.println("Token generation test failed: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
      }
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        System.out.println("=== Token Validation Debug ===");
        System.out.println("Auth header: " + authHeader);
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("Invalid authorization header format");
                return ResponseEntity.status(401).body(Map.of("error", "Invalid authorization header"));
            }
            
            String token = authHeader.substring(7);
            System.out.println("Extracted token: " + token.substring(0, Math.min(20, token.length())) + "...");
            
            String username = jwtTokenProvider.getUsernameFromToken(token);
            System.out.println("Username from token: " + username);
            
            if (username != null && jwtTokenProvider.validateToken(token)) {
                System.out.println("Token is valid, looking up user...");
                Optional<User> userOpt = userService.findByUsername(username);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    System.out.println("User found: " + user.getUsername());
                    return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "user", Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "email", user.getEmail()
                        )
                    ));
                } else {
                    System.out.println("User not found in database");
                }
            } else {
                System.out.println("Token validation failed - username: " + username + ", token valid: " + (username != null ? jwtTokenProvider.validateToken(token) : "N/A"));
            }
            
            System.out.println("Returning 401 - Invalid token");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        } catch (Exception e) {
            System.out.println("Exception during token validation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("error", "Token validation failed"));
        }
    }
}