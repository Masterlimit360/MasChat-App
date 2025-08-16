package com.postgresql.MasChat.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_saved_searches")
public class MarketplaceSavedSearch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String query;
    private String filters; // JSON or stringified filters
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public String getFilters() { return filters; }
    public void setFilters(String filters) { this.filters = filters; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 