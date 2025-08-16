package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.MarketplaceSavedSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketplaceSavedSearchRepository extends JpaRepository<MarketplaceSavedSearch, Long> {
    List<MarketplaceSavedSearch> findByUserId(Long userId);
} 