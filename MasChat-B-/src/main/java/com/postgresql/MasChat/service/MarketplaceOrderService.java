package com.postgresql.MasChat.service;

import com.postgresql.MasChat.model.MarketplaceOrder;
import com.postgresql.MasChat.repository.MarketplaceOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MarketplaceOrderService {
    @Autowired
    private MarketplaceOrderRepository orderRepository;

    public List<MarketplaceOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<MarketplaceOrder> getOrder(Long id) {
        return orderRepository.findById(id);
    }

    public MarketplaceOrder createOrder(MarketplaceOrder order) {
        return orderRepository.save(order);
    }

    public MarketplaceOrder updateOrder(Long id, MarketplaceOrder updated) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(updated.getStatus());
            order.setPaymentMethod(updated.getPaymentMethod());
            order.setDeliveryMethod(updated.getDeliveryMethod());
            order.setPrice(updated.getPrice());
            order.setFee(updated.getFee());
            order.setUpdatedAt(java.time.LocalDateTime.now());
            return orderRepository.save(order);
        }).orElseThrow();
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    public List<MarketplaceOrder> getOrdersByBuyer(Long buyerId) {
        return orderRepository.findByBuyerId(buyerId);
    }

    public List<MarketplaceOrder> getOrdersBySeller(Long sellerId) {
        return orderRepository.findBySellerId(sellerId);
    }

    public List<MarketplaceOrder> getOrdersByItem(Long itemId) {
        return orderRepository.findByItemId(itemId);
    }
} 