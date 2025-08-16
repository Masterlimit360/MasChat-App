package com.postgresql.MasChat.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "feeds")
public class Feed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @ManyToMany
    @JoinTable(
        name = "feed_posts",
        joinColumns = @JoinColumn(name = "feed_id"),
        inverseJoinColumns = @JoinColumn(name = "post_id")
    )
    @JsonIgnore
    private List<Post> posts;

    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and setters...
}
