package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.MarketplaceBusinessAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketplaceBusinessAccountRepository extends JpaRepository<MarketplaceBusinessAccount, Long> {
    MarketplaceBusinessAccount findByUserId(Long userId);
} 