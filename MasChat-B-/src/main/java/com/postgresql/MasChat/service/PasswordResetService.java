package com.postgresql.MasChat.service;

import com.postgresql.MasChat.dto.ForgotPasswordRequest;
import com.postgresql.MasChat.dto.ResetPasswordRequest;
import com.postgresql.MasChat.model.PasswordResetToken;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.PasswordResetTokenRepository;
import com.postgresql.MasChat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Generate reset token
            String token = UUID.randomUUID().toString();
            LocalDateTime expiryDate = LocalDateTime.now().plusHours(24); // Token expires in 24 hours
            
            PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
            tokenRepository.save(resetToken);
            
            // In a real application, you would send an email here
            // For now, we'll just print the token to console for testing
            System.out.println("Password reset token for " + user.getEmail() + ": " + token);
            System.out.println("Reset URL: http://localhost:8080/reset-password?token=" + token);
        }
        // Always return success to prevent email enumeration attacks
    }

    public void resetPassword(ResetPasswordRequest request) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByTokenAndUsedFalse(request.getToken());
        
        if (tokenOpt.isEmpty()) {
            throw new RuntimeException("Invalid or expired reset token");
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        
        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired");
        }
        
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
} 