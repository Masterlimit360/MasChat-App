package com.postgresql.MasChat.config;

import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    @Autowired
    private UserRepository userRepository;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = headerAccessor.getUser() != null ? headerAccessor.getUser().getName() : null;
        if (userId != null) {
            try {
                Long id = Long.valueOf(userId);
                User user = userRepository.findById(id).orElse(null);
                if (user != null) {
                    user.setOnline(true);
                    userRepository.save(user);
                    logger.info("User {} is now online", userId);
                }
            } catch (Exception e) {
                logger.warn("Could not set user online status for userId {}: {}", userId, e.getMessage());
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = headerAccessor.getUser() != null ? headerAccessor.getUser().getName() : null;
        if (userId != null) {
            try {
                Long id = Long.valueOf(userId);
                User user = userRepository.findById(id).orElse(null);
                if (user != null) {
                    user.setOnline(false);
                    userRepository.save(user);
                    logger.info("User {} is now offline", userId);
                }
            } catch (Exception e) {
                logger.warn("Could not set user offline status for userId {}: {}", userId, e.getMessage());
            }
        }
    }
} 