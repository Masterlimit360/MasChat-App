package com.postgresql.MasChat.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.LinkedHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.postgresql.MasChat.model.Message;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.MessageRepository;
import com.postgresql.MasChat.repository.UserRepository;
import com.postgresql.MasChat.repository.ChatRepository;
import com.postgresql.MasChat.model.Chat;
import com.postgresql.MasChat.dto.RecentChatDTO;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ChatRepository chatRepository;

    public Message sendMessage(Long senderId, Long recipientId, String content) {
        User sender = userRepository.findById(senderId).orElseThrow();
        User recipient = userRepository.findById(recipientId).orElseThrow();

        // Find or create chat
        Chat chat = chatRepository.findByUser1AndUser2OrUser2AndUser1(sender, recipient, sender, recipient)
            .orElseGet(() -> {
                Chat newChat = new Chat();
                newChat.setUser1(sender);
                newChat.setUser2(recipient);
                return chatRepository.save(newChat);
            });

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());
        message.setChat(chat);
        return messageRepository.save(message);
    }

    public Message sendImageMessage(Long senderId, Long recipientId, String imageUrl, String content) {
        try {
            // Validate inputs
            if (senderId == null || recipientId == null || imageUrl == null || imageUrl.trim().isEmpty()) {
                throw new IllegalArgumentException("Invalid parameters: senderId=" + senderId + ", recipientId=" + recipientId + ", imageUrl=" + imageUrl);
            }
            
            User sender = userRepository.findById(senderId).orElseThrow();
            User recipient = userRepository.findById(recipientId).orElseThrow();

            // Find or create chat
            Chat chat = chatRepository.findByUser1AndUser2OrUser2AndUser1(sender, recipient, sender, recipient)
                .orElseGet(() -> {
                    Chat newChat = new Chat();
                    newChat.setUser1(sender);
                    newChat.setUser2(recipient);
                    return chatRepository.save(newChat);
                });

            Message message = new Message();
            message.setSender(sender);
            message.setRecipient(recipient);
            message.setContent(content);
            message.setImage(imageUrl); // Set the image URL
            message.setSentAt(LocalDateTime.now());
            message.setChat(chat);
            return messageRepository.save(message);
        } catch (Exception e) {
            System.err.println("Error in sendImageMessage service: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<Message> getConversation(Long userId1, Long userId2) {
        List<Message> messages = messageRepository.findConversationBetweenUsers(userId1, userId2);
        // Deduplicate by id
        LinkedHashMap<Long, Message> unique = new LinkedHashMap<>();
        for (Message m : messages) unique.put(m.getId(), m);
        return new ArrayList<>(unique.values());
    }

    public List<RecentChatDTO> getRecentChats(Long userId) {
        // Ensure user exists or throw
        userRepository.findById(userId).orElseThrow();

        // Get all conversations for this user
        List<Message> allMessages = messageRepository.findBySenderIdOrRecipientIdOrderBySentAtDesc(userId);
        
        // Group by conversation partner and get latest message
        return allMessages.stream()
            .collect(Collectors.groupingBy(msg -> {
                if (msg.getSender().getId().equals(userId)) {
                    return msg.getRecipient();
                } else {
                    return msg.getSender();
                }
            }))
            .entrySet().stream()
            .map(entry -> {
                User partner = entry.getKey();
                List<Message> conversation = entry.getValue();
                Message latestMessage = conversation.get(0); // Already sorted by sentAt desc
                
                // Count unread messages
                long unreadCount = conversation.stream()
                    .filter(msg -> !msg.getSender().getId().equals(userId) && !msg.isRead())
                    .count();
                
                return new RecentChatDTO(
                    partner.getId(),
                    partner.getUsername(),
                    partner.getFullName(),
                    partner.getProfilePicture(),
                    latestMessage.getContent(),
                    latestMessage.getSentAt(),
                    unreadCount,
                    partner.getOnline() != null ? partner.getOnline() : false
                );
            })
            .collect(Collectors.toList());
    }

    public void markMessagesAsRead(Long userId, Long partnerId) {
        List<Message> unreadMessages = messageRepository.findByRecipientIdAndSenderIdAndReadFalse(userId, partnerId);
        unreadMessages.forEach(msg -> msg.setRead(true));
        messageRepository.saveAll(unreadMessages);
    }

    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId).orElseThrow();
        
        // Only sender can delete their own message
        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this message");
        }
        
        messageRepository.delete(message);
    }

    public void deleteConversation(Long userId, Long partnerId) {
        User user = userRepository.findById(userId).orElseThrow();
        User partner = userRepository.findById(partnerId).orElseThrow();
        
        List<Message> conversation = messageRepository.findBySenderAndRecipientOrSenderAndRecipientOrderBySentAt(
            user, partner, partner, user
        );
        
        messageRepository.deleteAll(conversation);
    }
}
