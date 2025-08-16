package com.postgresql.MasChat.security;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import io.jsonwebtoken.JwtException;
import jakarta.annotation.PostConstruct;


@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;
    
    @PostConstruct
    public void validateConfiguration() {
        System.out.println("=== JWT Configuration Validation ===");
        System.out.println("Secret length: " + (secret != null ? secret.length() : 0) + " characters");
        System.out.println("Expiration: " + expiration + " ms");
        
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 characters long. Current length: " + (secret != null ? secret.length() : 0));
        }
        
        try {
            // Ensure signing key is valid
            getSigningKey();
            System.out.println("JWT configuration is valid");
        } catch (Exception e) {
            System.err.println("JWT configuration validation failed: " + e.getMessage());
            throw e;
        }
    }
    
    private SecretKey getSigningKey() {
        try {
            if (secret == null || secret.length() < 32) {
                throw new IllegalArgumentException("JWT secret must be at least 32 characters long. Current length: " + (secret != null ? secret.length() : 0));
            }
            byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            System.out.println("Secret key length: " + keyBytes.length + " bytes (" + (keyBytes.length * 8) + " bits)");
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            System.err.println("Error creating signing key: " + e.getMessage());
            throw e;
        }
    }

    public String generateToken(String username) {
        System.out.println("=== Generating JWT Token ===");
        System.out.println("Username: " + username);
        System.out.println("Secret: " + secret.substring(0, Math.min(10, secret.length())) + "...");
        System.out.println("Expiration: " + expiration + "ms");
        
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (Exception e) {
            System.out.println("Error extracting username from token: " + e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            System.out.println("Validating token with secret: " + secret.substring(0, Math.min(10, secret.length())) + "...");
            System.out.println("Token to validate: " + token.substring(0, Math.min(20, token.length())) + "...");
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            System.out.println("Token validation successful");
            return true;
        } catch (JwtException e) {
            System.out.println("JWT validation failed: " + e.getMessage());
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.out.println("Unexpected error during token validation: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
