package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.MarketplaceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketplaceOrderRepository extends JpaRepository<MarketplaceOrder, Long> {
    List<MarketplaceOrder> findByBuyerId(Long buyerId);
    List<MarketplaceOrder> findBySellerId(Long sellerId);
    List<MarketplaceOrder> findByItemId(Long itemId);
    List<MarketplaceOrder> findByBuyerIdOrSellerId(Long buyerId, Long sellerId);
} 