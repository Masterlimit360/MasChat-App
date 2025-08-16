package com.postgresql.MasChat.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@SuppressWarnings("unused")
@Table(name = "attachments")
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;

    private String fileType;

    private String url;

    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonBackReference
    private Post post;

    @ManyToOne
    @JoinColumn(name = "message_id")
    @JsonBackReference
    private Message message;

    private LocalDateTime uploadedAt = LocalDateTime.now();

    // Getters and setters...
}
