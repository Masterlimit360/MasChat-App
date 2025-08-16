package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.MarketplaceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketplaceCategoryRepository extends JpaRepository<MarketplaceCategory, Long> {
} 