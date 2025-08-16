package com.postgresql.MasChat.config;

import com.postgresql.MasChat.model.MarketplaceCategory;
import com.postgresql.MasChat.repository.MarketplaceCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private MarketplaceCategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Initialize marketplace categories if they don't exist
            if (categoryRepository.count() == 0) {
                List<MarketplaceCategory> categories = Arrays.asList(
                    new MarketplaceCategory("Electronics", "📱"),
                    new MarketplaceCategory("Clothing", "👕"),
                    new MarketplaceCategory("Books", "📚"),
                    new MarketplaceCategory("Sports", "⚽"),
                    new MarketplaceCategory("Home & Garden", "🏠"),
                    new MarketplaceCategory("Vehicles", "🚗"),
                    new MarketplaceCategory("Services", "🔧"),
                    new MarketplaceCategory("Other", "📦")
                );
                
                categoryRepository.saveAll(categories);
                logger.info("Initialized {} marketplace categories", categories.size());
            } else {
                logger.info("Marketplace categories already exist, skipping initialization");
            }
        } catch (Exception e) {
            logger.error("Error during data initialization: {}", e.getMessage(), e);
            // Don't throw the exception to prevent application startup failure
        }
    }
} 