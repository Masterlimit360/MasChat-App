package com.postgresql.MasChat.service;

import com.postgresql.MasChat.model.FriendRequest;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.FriendRequestRepository;
import com.postgresql.MasChat.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.HashSet;
import java.util.Set;

@Service
public class FriendService {
    private FriendRequestRepository friendRequestRepository;
    private UserRepository userRepository;
    private NotificationService notificationService;

    public FriendService(FriendRequestRepository friendRequestRepository, UserRepository userRepository, NotificationService notificationService) {
        this.friendRequestRepository = friendRequestRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<User> getSuggestions(Long userId) {
        try {
            System.out.println("Getting suggestions for user: " + userId);
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                System.out.println("User not found: " + userId);
                return List.of();
            }
            
            // Get all users first
            List<User> allUsers = userRepository.findAll();
            System.out.println("Total users in database: " + allUsers.size());
            
            // Get friends, sent requests, and received requests
            Set<Long> excludeIds = new HashSet<>();
            excludeIds.add(userId); // Exclude self
            
            // Add friends
            if (user.getFriends() != null) {
                for (User friend : user.getFriends()) {
                    excludeIds.add(friend.getId());
                }
            }
            System.out.println("User's friends count: " + (user.getFriends() != null ? user.getFriends().size() : 0));
            
            // Add sent requests
            try {
                List<FriendRequest> sentRequests = friendRequestRepository.findBySenderId(userId);
                for (FriendRequest request : sentRequests) {
                    excludeIds.add(request.getReceiver().getId());
                }
            } catch (Exception e) {
                System.err.println("Error getting sent requests: " + e.getMessage());
            }
            
            // Add received requests
            try {
                List<FriendRequest> receivedRequests = friendRequestRepository.findByReceiverId(userId);
                for (FriendRequest request : receivedRequests) {
                    excludeIds.add(request.getSender().getId());
                }
            } catch (Exception e) {
                System.err.println("Error getting received requests: " + e.getMessage());
            }
            
            // Filter users to get suggestions
            List<User> suggestions = allUsers.stream()
                .filter(u -> !excludeIds.contains(u.getId()))
                .limit(20) // Limit to 20 suggestions
                .toList();
            
            System.out.println("Suggestions found: " + suggestions.size());
            return suggestions;
            
        } catch (Exception e) {
            System.err.println("Error getting suggestions for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    // New method for messenger suggestions - friends you haven't chatted with
    public List<User> getMessengerSuggestions(Long userId) {
        try {
            System.out.println("Getting messenger suggestions for user: " + userId);
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                System.out.println("User not found: " + userId);
                return List.of();
            }
            
            // Get user's friends
            List<User> friends = user.getFriends();
            if (friends == null || friends.isEmpty()) {
                System.out.println("User has no friends");
                return List.of();
            }
            
            // Get users the current user has already chatted with
            Set<Long> chattedUserIds = new HashSet<>();
            try {
                // Get sent messages
                if (user.getSentMessages() != null) {
                    for (var message : user.getSentMessages()) {
                        chattedUserIds.add(message.getRecipient().getId());
                    }
                }
                
                // Get received messages
                if (user.getReceivedMessages() != null) {
                    for (var message : user.getReceivedMessages()) {
                        chattedUserIds.add(message.getSender().getId());
                    }
                }
            } catch (Exception e) {
                System.err.println("Error getting chat history: " + e.getMessage());
            }
            
            // Filter friends to get those you haven't chatted with
            List<User> messengerSuggestions = friends.stream()
                .filter(friend -> !chattedUserIds.contains(friend.getId()))
                .limit(10) // Limit to 10 suggestions
                .toList();
            
            System.out.println("Messenger suggestions found: " + messengerSuggestions.size());
            return messengerSuggestions;
            
        } catch (Exception e) {
            System.err.println("Error getting messenger suggestions for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    public List<FriendRequest> getFriendRequests(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return List.of();
            // Get only pending requests for this user
            return friendRequestRepository.findByReceiverIdAndStatus(userId, "PENDING");
        } catch (Exception e) {
            System.err.println("Error getting friend requests for user " + userId + ": " + e.getMessage());
            return List.of();
        }
    }

    public void sendFriendRequest(Long senderId, Long receiverId) {
        try {
            User sender = userRepository.findById(senderId).orElse(null);
            User receiver = userRepository.findById(receiverId).orElse(null);
            if (sender == null || receiver == null) {
                throw new IllegalArgumentException("Sender or receiver not found");
            }
            
            // Check if they are already friends
            if (sender.getFriends() != null && sender.getFriends().contains(receiver)) {
                throw new IllegalStateException("Users are already friends");
            }
            
            // Check if request already exists
            List<FriendRequest> existingRequests = friendRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId);
            if (!existingRequests.isEmpty()) {
                throw new IllegalStateException("Friend request already exists");
            }
            
            // Check if reverse request exists
            List<FriendRequest> reverseRequests = friendRequestRepository.findBySenderIdAndReceiverId(receiverId, senderId);
            if (!reverseRequests.isEmpty()) {
                throw new IllegalStateException("Friend request already exists");
            }
            
            FriendRequest request = new FriendRequest();
            request.setSender(sender);
            request.setReceiver(receiver);
            request.setStatus("PENDING");
            request.setCreatedAt(LocalDateTime.now());
            request = friendRequestRepository.save(request);
            
            // Notify receiver with related metadata (request id, sender info)
            try {
                notificationService.createFriendRequestNotification(sender, receiver, request.getId());
            } catch (Exception e) {
                System.err.println("Failed to send friend request notification: " + e.getMessage());
            }
        } catch (Exception e) {
            System.err.println("Error sending friend request: " + e.getMessage());
            throw e;
        }
    }

    public void acceptFriendRequest(Long requestId) {
        try {
            FriendRequest request = friendRequestRepository.findById(requestId).orElse(null);
            if (request == null) return;
            
            request.setStatus("ACCEPTED");
            friendRequestRepository.save(request);
            
            User sender = request.getSender();
            User receiver = request.getReceiver();
            
            // Initialize friends list if null
            if (sender.getFriends() == null) {
                sender.setFriends(new java.util.ArrayList<>());
            }
            if (receiver.getFriends() == null) {
                receiver.setFriends(new java.util.ArrayList<>());
            }
            
            // Add to friends list
            sender.getFriends().add(receiver);
            receiver.getFriends().add(sender);
            userRepository.save(sender);
            userRepository.save(receiver);
            
            // Notify sender that request was accepted
            notificationService.createFriendRequestAcceptedNotification(receiver, sender);
        } catch (Exception e) {
            System.err.println("Error accepting friend request: " + e.getMessage());
            throw e;
        }
    }

    public List<User> getFriends(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return List.of();
            return user.getFriends() != null ? user.getFriends() : List.of();
        } catch (Exception e) {
            System.err.println("Error getting friends for user " + userId + ": " + e.getMessage());
            return List.of();
        }
    }

    public void removeFriend(Long userId, Long friendId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            User friend = userRepository.findById(friendId).orElse(null);
            if (user == null || friend == null) return;
            
            // Remove from both users' friend lists
            if (user.getFriends() != null) {
                user.getFriends().removeIf(f -> f.getId().equals(friendId));
            }
            if (friend.getFriends() != null) {
                friend.getFriends().removeIf(f -> f.getId().equals(userId));
            }
            
            userRepository.save(user);
            userRepository.save(friend);
        } catch (Exception e) {
            System.err.println("Error removing friend: " + e.getMessage());
            throw e;
        }
    }

    public String getFriendRequestStatus(Long senderId, Long receiverId) {
        try {
            User sender = userRepository.findById(senderId).orElse(null);
            User receiver = userRepository.findById(receiverId).orElse(null);
            if (sender == null || receiver == null) return "NONE";
            
            // Check if they are already friends
            if (sender.getFriends() != null && sender.getFriends().contains(receiver)) {
                return "FRIENDS";
            }
            
            // Check if request exists from sender to receiver
            List<FriendRequest> requests = friendRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId);
            if (!requests.isEmpty()) {
                return "SENT";
            }
            
            // Check if request exists from receiver to sender
            List<FriendRequest> reverseRequests = friendRequestRepository.findBySenderIdAndReceiverId(receiverId, senderId);
            if (!reverseRequests.isEmpty()) {
                return "RECEIVED";
            }
            
            return "NONE";
        } catch (Exception e) {
            System.err.println("Error getting friend request status: " + e.getMessage());
            return "NONE";
        }
    }

    public void deleteFriendRequest(Long requestId) {
        try {
            friendRequestRepository.deleteById(requestId);
        } catch (Exception e) {
            System.err.println("Error deleting friend request: " + e.getMessage());
            throw e;
        }
    }

    public void cancelFriendRequest(Long senderId, Long receiverId) {
        try {
            List<FriendRequest> requests = friendRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId);
            if (!requests.isEmpty()) {
                friendRequestRepository.deleteAll(requests);
            }
        } catch (Exception e) {
            System.err.println("Error cancelling friend request: " + e.getMessage());
            throw e;
        }
    }

    public void unfriend(Long userId, Long friendId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            User friend = userRepository.findById(friendId).orElse(null);
            if (user == null || friend == null) return;
            
            if (user.getFriends() != null) {
                user.getFriends().removeIf(f -> f.getId().equals(friendId));
            }
            if (friend.getFriends() != null) {
                friend.getFriends().removeIf(f -> f.getId().equals(userId));
            }
            userRepository.save(user);
            userRepository.save(friend);
        } catch (Exception e) {
            System.err.println("Error unfriending: " + e.getMessage());
            throw e;
        }
    }
}
