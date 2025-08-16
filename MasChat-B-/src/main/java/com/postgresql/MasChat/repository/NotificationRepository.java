package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find notifications for a user (not deleted)
    Page<Notification> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find unread notifications for a user
    List<Notification> findByUserIdAndReadFalseAndDeletedFalseOrderByCreatedAtDesc(Long userId);
    
    // Find notifications by type
    List<Notification> findByUserIdAndNotificationTypeAndDeletedFalseOrderByCreatedAtDesc(Long userId, Notification.NotificationType notificationType);
    
    // Find notifications by related content
    List<Notification> findByUserIdAndRelatedTypeAndRelatedIdAndDeletedFalseOrderByCreatedAtDesc(Long userId, String relatedType, String relatedId);
    
    // Count unread notifications
    long countByUserIdAndReadFalseAndDeletedFalse(Long userId);
    
    // Find notifications from a specific sender
    List<Notification> findByUserIdAndSenderIdAndDeletedFalseOrderByCreatedAtDesc(Long userId, Long senderId);
    
    // Find Mass Coin related notifications
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.deleted = false AND " +
           "(n.notificationType = 'MASS_COIN_TRANSFER_REQUEST' OR " +
           "n.notificationType = 'MASS_COIN_TRANSFER_APPROVED' OR " +
           "n.notificationType = 'MASS_COIN_TRANSFER_REJECTED' OR " +
           "n.notificationType = 'MASS_COIN_RECEIVED' OR " +
           "n.notificationType = 'MASS_COIN_SENT') " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findMassCoinNotifications(@Param("userId") Long userId);
    
    // Mark notifications as read
    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.id = :notificationId")
    void markAsRead(@Param("notificationId") Long notificationId, @Param("readAt") LocalDateTime readAt);
    
    // Mark multiple notifications as read
    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.id IN :notificationIds")
    void markMultipleAsRead(@Param("notificationIds") List<Long> notificationIds, @Param("readAt") LocalDateTime readAt);
    
    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.user.id = :userId AND n.read = false")
    void markAllAsRead(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);
    
    // Soft delete notification
    @Modifying
    @Query("UPDATE Notification n SET n.deleted = true, n.deletedAt = :deletedAt WHERE n.id = :notificationId")
    void softDelete(@Param("notificationId") Long notificationId, @Param("deletedAt") LocalDateTime deletedAt);
    
    // Soft delete multiple notifications
    @Modifying
    @Query("UPDATE Notification n SET n.deleted = true, n.deletedAt = :deletedAt WHERE n.id IN :notificationIds")
    void softDeleteMultiple(@Param("notificationIds") List<Long> notificationIds, @Param("deletedAt") LocalDateTime deletedAt);
    
    // Find recent notifications (last 24 hours)
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.deleted = false AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("userId") Long userId, @Param("since") LocalDateTime since);
    
    // Find notifications by date range
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.deleted = false AND n.createdAt BETWEEN :startDate AND :endDate ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsByDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
} 