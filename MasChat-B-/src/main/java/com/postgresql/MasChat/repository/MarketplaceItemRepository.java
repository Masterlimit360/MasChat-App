package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.MarketplaceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MarketplaceItemRepository extends JpaRepository<MarketplaceItem, Long> {
    
    @Query("SELECT mi FROM MarketplaceItem mi LEFT JOIN FETCH mi.seller WHERE mi.id = :id")
    Optional<MarketplaceItem> findByIdWithSeller(@Param("id") Long id);
    
    @Query("SELECT mi FROM MarketplaceItem mi LEFT JOIN FETCH mi.seller")
    List<MarketplaceItem> findAllWithSeller();
    
    @Query("SELECT mi FROM MarketplaceItem mi LEFT JOIN FETCH mi.seller WHERE mi.category.id = :categoryId")
    List<MarketplaceItem> findByCategoryIdWithSeller(@Param("categoryId") Long categoryId);
    
    @Query("SELECT mi FROM MarketplaceItem mi LEFT JOIN FETCH mi.seller WHERE mi.seller.id = :sellerId")
    List<MarketplaceItem> findBySellerIdWithSeller(@Param("sellerId") Long sellerId);
    
    @Query("SELECT mi FROM MarketplaceItem mi LEFT JOIN FETCH mi.seller WHERE mi.status = :status")
    List<MarketplaceItem> findByStatusWithSeller(@Param("status") String status);
    
    @Query("SELECT mi FROM MarketplaceItem mi LEFT JOIN FETCH mi.seller WHERE LOWER(mi.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<MarketplaceItem> findByTitleContainingIgnoreCaseWithSeller(@Param("keyword") String keyword);
} 