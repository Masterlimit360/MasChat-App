package com.postgresql.MasChat.service;

import com.postgresql.MasChat.model.MarketplaceSavedSearch;
import com.postgresql.MasChat.repository.MarketplaceSavedSearchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MarketplaceSavedSearchService {
    @Autowired
    private MarketplaceSavedSearchRepository savedSearchRepository;

    public List<MarketplaceSavedSearch> getAllSavedSearches() {
        return savedSearchRepository.findAll();
    }

    public Optional<MarketplaceSavedSearch> getSavedSearch(Long id) {
        return savedSearchRepository.findById(id);
    }

    public MarketplaceSavedSearch createSavedSearch(MarketplaceSavedSearch savedSearch) {
        return savedSearchRepository.save(savedSearch);
    }

    public void deleteSavedSearch(Long id) {
        savedSearchRepository.deleteById(id);
    }

    public List<MarketplaceSavedSearch> getSavedSearchesByUser(Long userId) {
        return savedSearchRepository.findByUserId(userId);
    }
} 