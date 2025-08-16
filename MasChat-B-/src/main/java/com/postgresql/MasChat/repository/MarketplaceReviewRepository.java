package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.MarketplaceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketplaceReviewRepository extends JpaRepository<MarketplaceReview, Long> {
    List<MarketplaceReview> findByItemId(Long itemId);
    List<MarketplaceReview> findByReviewerId(Long reviewerId);
} 