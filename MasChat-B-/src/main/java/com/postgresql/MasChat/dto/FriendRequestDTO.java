package com.postgresql.MasChat.dto;

import java.time.LocalDateTime;

public class FriendRequestDTO {
    private Long id;
    private UserDTO sender;
    private UserDTO receiver;
    private String status;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserDTO getSender() { return sender; }
    public void setSender(UserDTO sender) { this.sender = sender; }
    public UserDTO getReceiver() { return receiver; }
    public void setReceiver(UserDTO receiver) { this.receiver = receiver; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static FriendRequestDTO fromEntity(com.postgresql.MasChat.model.FriendRequest request) {
        if (request == null) return null;
        FriendRequestDTO dto = new FriendRequestDTO();
        dto.setId(request.getId());
        dto.setSender(UserDTO.fromEntity(request.getSender()));
        dto.setReceiver(UserDTO.fromEntity(request.getReceiver()));
        dto.setStatus(request.getStatus());
        dto.setCreatedAt(request.getCreatedAt());
        return dto;
    }
} 