package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.model.Notification;
import com.postgresql.MasChat.repository.NotificationRepository;
import com.postgresql.MasChat.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    // Get notifications for a user
    @GetMapping
    public ResponseEntity<Page<Notification>> getNotifications(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Notification> notifications = notificationRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId, pageable);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get unread notifications count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam Long userId) {
        try {
            long count = notificationRepository.countByUserIdAndReadFalseAndDeletedFalse(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get unread notifications
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestParam Long userId) {
        try {
            List<Notification> notifications = notificationRepository.findByUserIdAndReadFalseAndDeletedFalseOrderByCreatedAtDesc(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Mark notification as read
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Mark multiple notifications as read
    @PostMapping("/mark-read")
    public ResponseEntity<Void> markMultipleAsRead(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> notificationIds = request.get("notificationIds");
            notificationService.markMultipleAsRead(notificationIds);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Mark all notifications as read for a user
    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long userId) {
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete a notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete multiple notifications
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<Void> deleteMultipleNotifications(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> notificationIds = request.get("notificationIds");
            notificationService.deleteMultipleNotifications(notificationIds);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get notifications by type
    @GetMapping("/by-type")
    public ResponseEntity<List<Notification>> getNotificationsByType(
            @RequestParam Long userId,
            @RequestParam Notification.NotificationType notificationType) {
        try {
            List<Notification> notifications = notificationRepository.findByUserIdAndNotificationTypeAndDeletedFalseOrderByCreatedAtDesc(userId, notificationType);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get Mass Coin related notifications
    @GetMapping("/masscoin")
    public ResponseEntity<List<Notification>> getMassCoinNotifications(@RequestParam Long userId) {
        try {
            List<Notification> notifications = notificationRepository.findMassCoinNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get recent notifications (last 24 hours)
    @GetMapping("/recent")
    public ResponseEntity<List<Notification>> getRecentNotifications(@RequestParam Long userId) {
        try {
            LocalDateTime since = LocalDateTime.now().minusHours(24);
            List<Notification> notifications = notificationRepository.findRecentNotifications(userId, since);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get notifications by date range
    @GetMapping("/by-date-range")
    public ResponseEntity<List<Notification>> getNotificationsByDateRange(
            @RequestParam Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            List<Notification> notifications = notificationRepository.findNotificationsByDateRange(userId, start, end);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Create notification (for testing or admin use)
    @PostMapping("/create")
    public ResponseEntity<Notification> createNotification(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unused") Long userId = Long.valueOf(request.get("userId").toString());
            String title = (String) request.get("title");
            String message = (String) request.get("message");
            Notification.NotificationType type = Notification.NotificationType.valueOf((String) request.get("type"));
            
            Notification notification = new Notification();
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setNotificationType(type);
            
            // Set optional fields
            if (request.containsKey("relatedId")) {
                notification.setRelatedId((String) request.get("relatedId"));
            }
            if (request.containsKey("relatedType")) {
                notification.setRelatedType((String) request.get("relatedType"));
            }
            if (request.containsKey("senderId")) {
                notification.setSenderId(Long.valueOf(request.get("senderId").toString()));
            }
            if (request.containsKey("senderName")) {
                notification.setSenderName((String) request.get("senderName"));
            }
            if (request.containsKey("senderAvatar")) {
                notification.setSenderAvatar((String) request.get("senderAvatar"));
            }
            
            notification = notificationRepository.save(notification);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "healthy", "service", "Notification"));
    }
} 