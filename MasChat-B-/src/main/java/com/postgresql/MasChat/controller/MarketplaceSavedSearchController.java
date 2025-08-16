package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.model.MarketplaceSavedSearch;
import com.postgresql.MasChat.service.MarketplaceSavedSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace/saved-searches")
public class MarketplaceSavedSearchController {
    @Autowired
    private MarketplaceSavedSearchService savedSearchService;

    @GetMapping
    public List<MarketplaceSavedSearch> getAllSavedSearches() {
        return savedSearchService.getAllSavedSearches();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceSavedSearch> getSavedSearch(@PathVariable Long id) {
        return savedSearchService.getSavedSearch(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MarketplaceSavedSearch createSavedSearch(@RequestBody MarketplaceSavedSearch savedSearch) {
        return savedSearchService.createSavedSearch(savedSearch);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavedSearch(@PathVariable Long id) {
        savedSearchService.deleteSavedSearch(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public List<MarketplaceSavedSearch> getSavedSearchesByUser(@PathVariable Long userId) {
        return savedSearchService.getSavedSearchesByUser(userId);
    }
} 