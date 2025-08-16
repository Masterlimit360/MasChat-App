package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.model.MarketplaceReview;
import com.postgresql.MasChat.service.MarketplaceReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace/reviews")
public class MarketplaceReviewController {
    @Autowired
    private MarketplaceReviewService reviewService;

    @GetMapping
    public List<MarketplaceReview> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceReview> getReview(@PathVariable Long id) {
        return reviewService.getReview(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MarketplaceReview createReview(@RequestBody MarketplaceReview review) {
        return reviewService.createReview(review);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/item/{itemId}")
    public List<MarketplaceReview> getReviewsByItem(@PathVariable Long itemId) {
        return reviewService.getReviewsByItem(itemId);
    }

    @GetMapping("/reviewer/{reviewerId}")
    public List<MarketplaceReview> getReviewsByReviewer(@PathVariable Long reviewerId) {
        return reviewService.getReviewsByReviewer(reviewerId);
    }
} 