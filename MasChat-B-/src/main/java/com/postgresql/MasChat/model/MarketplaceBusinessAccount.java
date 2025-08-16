package com.postgresql.MasChat.model;

import jakarta.persistence.*;

@Entity
@Table(name = "marketplace_business_accounts")
public class MarketplaceBusinessAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String businessName;
    private String description;
    private String logo;
    private String contactInfo;

    // Removed inventory field to fix JPA mapping error

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
} 