package com.postgresql.MasChat.service;

import com.postgresql.MasChat.model.MarketplaceReview;
import com.postgresql.MasChat.repository.MarketplaceReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MarketplaceReviewService {
    @Autowired
    private MarketplaceReviewRepository reviewRepository;

    public List<MarketplaceReview> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Optional<MarketplaceReview> getReview(Long id) {
        return reviewRepository.findById(id);
    }

    public MarketplaceReview createReview(MarketplaceReview review) {
        return reviewRepository.save(review);
    }

    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    public List<MarketplaceReview> getReviewsByItem(Long itemId) {
        return reviewRepository.findByItemId(itemId);
    }

    public List<MarketplaceReview> getReviewsByReviewer(Long reviewerId) {
        return reviewRepository.findByReviewerId(reviewerId);
    }
} 