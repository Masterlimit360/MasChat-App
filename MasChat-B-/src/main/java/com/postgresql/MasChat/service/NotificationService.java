package com.postgresql.MasChat.service;

import com.postgresql.MasChat.model.Notification;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.NotificationRepository;
import com.postgresql.MasChat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserRepository userRepository; // kept for future use
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(User user, String message) {
        return createNotification(user, "Notification", message, Notification.NotificationType.SYSTEM_MESSAGE);
    }

    public Notification createNotification(User user, String title, String message, Notification.NotificationType type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(type);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);
        
        // Send via WebSocket with enhanced payload
        try {
            Map<String, Object> notificationPayload = new HashMap<>();
            notificationPayload.put("id", saved.getId());
            notificationPayload.put("message", saved.getMessage());
            notificationPayload.put("title", saved.getTitle());
            notificationPayload.put("read", saved.isRead());
            notificationPayload.put("createdAt", saved.getCreatedAt());
            notificationPayload.put("type", "NEW_NOTIFICATION");
            // Optional metadata if present
            if (saved.getRelatedId() != null) notificationPayload.put("relatedId", saved.getRelatedId());
            if (saved.getRelatedType() != null) notificationPayload.put("relatedType", saved.getRelatedType());
            if (saved.getSenderId() != null) notificationPayload.put("senderId", saved.getSenderId());
            if (saved.getSenderName() != null) notificationPayload.put("senderName", saved.getSenderName());
            if (saved.getSenderAvatar() != null) notificationPayload.put("senderAvatar", saved.getSenderAvatar());
            
            messagingTemplate.convertAndSendToUser(
                user.getId().toString(),
                "/queue/notifications",
                notificationPayload
            );
        } catch (Exception e) {
            // Log WebSocket error but don't fail the notification creation
            System.err.println("WebSocket notification failed: " + e.getMessage());
        }
        
        return saved;
    }

    public Notification createFriendRequestNotification(User sender, User receiver) {
        return createNotification(
            receiver,
            "Friend Request",
            sender.getFullName() + " sent you a friend request.",
            Notification.NotificationType.FRIEND_REQUEST
        );
    }

    public Notification createFriendRequestAcceptedNotification(User receiver, User sender) {
        return createNotification(
            sender,
            "Friend Request Accepted",
            receiver.getFullName() + " accepted your friend request.",
            Notification.NotificationType.FRIEND_REQUEST
        );
    }

    // Overload that sets related metadata for friend-request notifications
    public Notification createFriendRequestNotification(User sender, User receiver, Long requestId) {
        Notification notification = new Notification();
        notification.setUser(receiver);
        notification.setTitle("Friend Request");
        notification.setMessage(sender.getFullName() + " sent you a friend request.");
        notification.setNotificationType(Notification.NotificationType.FRIEND_REQUEST);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        // Set metadata so client can act on it
        notification.setRelatedId(requestId != null ? requestId.toString() : null);
        notification.setRelatedType("FRIEND_REQUEST");
        notification.setSenderId(sender.getId());
        notification.setSenderName(sender.getFullName());
        notification.setSenderAvatar(sender.getProfilePicture());
        Notification saved = notificationRepository.save(notification);

        // Emit with metadata
        try {
            Map<String, Object> notificationPayload = new HashMap<>();
            notificationPayload.put("id", saved.getId());
            notificationPayload.put("message", saved.getMessage());
            notificationPayload.put("title", saved.getTitle());
            notificationPayload.put("read", saved.isRead());
            notificationPayload.put("createdAt", saved.getCreatedAt());
            notificationPayload.put("type", "NEW_NOTIFICATION");
            notificationPayload.put("relatedId", saved.getRelatedId());
            notificationPayload.put("relatedType", saved.getRelatedType());
            notificationPayload.put("senderId", saved.getSenderId());
            notificationPayload.put("senderName", saved.getSenderName());
            notificationPayload.put("senderAvatar", saved.getSenderAvatar());

            messagingTemplate.convertAndSendToUser(
                receiver.getId().toString(),
                "/queue/notifications",
                notificationPayload
            );
        } catch (Exception e) {
            System.err.println("WebSocket notification failed: " + e.getMessage());
        }

        return saved;
    }

    public List<Notification> getNotifications(User user) {
        // Use a default Pageable for the latest 50 notifications
        return notificationRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 50)).getContent();
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserIdAndReadFalseAndDeletedFalseOrderByCreatedAtDesc(user.getId());
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
            
            // Send real-time update via WebSocket
            try {
                Map<String, Object> updatePayload = new HashMap<>();
                updatePayload.put("id", notification.getId());
                updatePayload.put("read", true);
                updatePayload.put("readAt", notification.getReadAt());
                updatePayload.put("type", "NOTIFICATION_READ");
                
                messagingTemplate.convertAndSendToUser(
                    notification.getUser().getId().toString(),
                    "/queue/notifications",
                    updatePayload
                );
            } catch (Exception e) {
                System.err.println("WebSocket read update failed: " + e.getMessage());
            }
        }
    }

    public void markMultipleAsRead(List<Long> notificationIds) {
        if (notificationIds != null && !notificationIds.isEmpty()) {
            notificationRepository.markMultipleAsRead(notificationIds, LocalDateTime.now());
            
            // Send bulk update via WebSocket
            try {
                Map<String, Object> bulkUpdatePayload = new HashMap<>();
                bulkUpdatePayload.put("notificationIds", notificationIds);
                bulkUpdatePayload.put("read", true);
                bulkUpdatePayload.put("readAt", LocalDateTime.now());
                bulkUpdatePayload.put("type", "BULK_NOTIFICATIONS_READ");
                
                // Get the user ID from the first notification
                Notification firstNotification = notificationRepository.findById(notificationIds.get(0)).orElse(null);
                if (firstNotification != null) {
                    messagingTemplate.convertAndSendToUser(
                        firstNotification.getUser().getId().toString(),
                        "/queue/notifications",
                        bulkUpdatePayload
                    );
                }
            } catch (Exception e) {
                System.err.println("WebSocket bulk read update failed: " + e.getMessage());
            }
        }
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId, LocalDateTime.now());
        
        // Send bulk update via WebSocket
        try {
            Map<String, Object> bulkUpdatePayload = new HashMap<>();
            bulkUpdatePayload.put("userId", userId);
            bulkUpdatePayload.put("read", true);
            bulkUpdatePayload.put("readAt", LocalDateTime.now());
            bulkUpdatePayload.put("type", "ALL_NOTIFICATIONS_READ");
            
            messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                bulkUpdatePayload
            );
        } catch (Exception e) {
            System.err.println("WebSocket all read update failed: " + e.getMessage());
        }
    }

    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            Long userId = notification.getUser().getId();
            notificationRepository.deleteById(notificationId);
            
            // Send real-time delete update via WebSocket
            try {
                Map<String, Object> deletePayload = new HashMap<>();
                deletePayload.put("id", notificationId);
                deletePayload.put("type", "NOTIFICATION_DELETED");
                
                messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    deletePayload
                );
            } catch (Exception e) {
                System.err.println("WebSocket delete update failed: " + e.getMessage());
            }
        }
    }

    public void deleteMultipleNotifications(List<Long> notificationIds) {
        if (notificationIds != null && !notificationIds.isEmpty()) {
            // Get user ID before deletion
            Notification firstNotification = notificationRepository.findById(notificationIds.get(0)).orElse(null);
            Long userId = firstNotification != null ? firstNotification.getUser().getId() : null;
            
            notificationRepository.deleteAllById(notificationIds);
            
            // Send bulk delete update via WebSocket
            if (userId != null) {
                try {
                    Map<String, Object> bulkDeletePayload = new HashMap<>();
                    bulkDeletePayload.put("notificationIds", notificationIds);
                    bulkDeletePayload.put("type", "BULK_NOTIFICATIONS_DELETED");
                    
                    messagingTemplate.convertAndSendToUser(
                        userId.toString(),
                        "/queue/notifications",
                        bulkDeletePayload
                    );
                } catch (Exception e) {
                    System.err.println("WebSocket bulk delete update failed: " + e.getMessage());
                }
            }
        }
    }
} 