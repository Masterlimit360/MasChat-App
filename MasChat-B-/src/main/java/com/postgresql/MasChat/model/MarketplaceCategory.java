package com.postgresql.MasChat.model;

import jakarta.persistence.*;

@Entity
@Table(name = "marketplace_categories")
public class MarketplaceCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String icon; // Optional: icon name or URL

    // Constructors
    public MarketplaceCategory() {}

    public MarketplaceCategory(String name) {
        this.name = name;
    }

    public MarketplaceCategory(String name, String icon) {
        this.name = name;
        this.icon = icon;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
} 