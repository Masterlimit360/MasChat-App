package com.postgresql.MasChat.service;

import com.postgresql.MasChat.model.MarketplaceItem;
import com.postgresql.MasChat.model.MarketplaceCategory;
import com.postgresql.MasChat.model.MarketplaceOrder;
import com.postgresql.MasChat.repository.MarketplaceItemRepository;
import com.postgresql.MasChat.repository.MarketplaceCategoryRepository;
import com.postgresql.MasChat.repository.MarketplaceOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.UserRepository;
import java.util.ArrayList;

@Service
public class MarketplaceService {
    @Autowired
    private MarketplaceItemRepository itemRepository;
    @Autowired
    private MarketplaceCategoryRepository categoryRepository;
    @Autowired
    private MarketplaceOrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;

    public List<MarketplaceItem> getAllItems() {
        try {
            System.out.println("=== DEBUG: Service getAllItems called ===");
            List<MarketplaceItem> items = itemRepository.findAllWithSeller();
            System.out.println("=== DEBUG: Repository returned " + items.size() + " items ===");
            return items;
        } catch (Exception e) {
            System.err.println("=== ERROR: Service getAllItems failed ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            
            // Try fallback method if the JOIN FETCH fails
            try {
                System.out.println("=== DEBUG: Trying fallback method ===");
                List<MarketplaceItem> fallbackItems = itemRepository.findAll();
                System.out.println("=== DEBUG: Fallback returned " + fallbackItems.size() + " items ===");
                return fallbackItems;
            } catch (Exception fallbackError) {
                System.err.println("=== ERROR: Fallback method also failed ===");
                System.err.println("Fallback error: " + fallbackError.getMessage());
                fallbackError.printStackTrace();
                return new ArrayList<>();
            }
        }
    }

    public Optional<MarketplaceItem> getItem(Long id) {
        return itemRepository.findByIdWithSeller(id);
    }

    public MarketplaceItem createItem(MarketplaceItem item) {
        // Validate that seller is not null
        if (item.getSeller() == null) {
            throw new IllegalArgumentException("Seller cannot be null for marketplace items");
        }
        
        // Validate that seller exists in database
        User seller = userRepository.findById(item.getSeller().getId())
            .orElseThrow(() -> new IllegalArgumentException("Seller with ID " + item.getSeller().getId() + " does not exist"));
        
        // Set the validated seller
        item.setSeller(seller);
        
        return itemRepository.save(item);
    }

    public MarketplaceItem updateItem(Long id, MarketplaceItem updated) {
        return itemRepository.findById(id).map(item -> {
            item.setTitle(updated.getTitle());
            item.setDescription(updated.getDescription());
            item.setPrice(updated.getPrice());
            item.setNegotiable(updated.getNegotiable());
            item.setCategory(updated.getCategory());
            item.setCondition(updated.getCondition());
            item.setImages(updated.getImages());
            item.setDeliveryMethod(updated.getDeliveryMethod());
            item.setLocation(updated.getLocation());
            item.setStatus(updated.getStatus());
            item.setUpdatedAt(java.time.LocalDateTime.now());
            return itemRepository.save(item);
        }).orElseThrow();
    }

    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }

    public List<MarketplaceItem> searchItems(String keyword) {
        return itemRepository.findByTitleContainingIgnoreCaseWithSeller(keyword);
    }

    public List<MarketplaceItem> filterByCategory(Long categoryId) {
        return itemRepository.findByCategoryIdWithSeller(categoryId);
    }

    public List<MarketplaceItem> filterBySeller(Long sellerId) {
        return itemRepository.findBySellerIdWithSeller(sellerId);
    }

    public List<MarketplaceItem> filterByStatus(String status) {
        return itemRepository.findByStatusWithSeller(status);
    }

    public List<MarketplaceCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<MarketplaceCategory> getCategory(Long id) {
        return categoryRepository.findById(id);
    }

    public MarketplaceCategory createCategory(MarketplaceCategory category) {
        return categoryRepository.save(category);
    }

    public MarketplaceOrder createOrder(MarketplaceOrder order) {
        return orderRepository.save(order);
    }

    public List<MarketplaceOrder> getUserOrders(Long userId) {
        return orderRepository.findByBuyerIdOrSellerId(userId, userId);
    }

    public Optional<MarketplaceOrder> getOrderDetails(Long orderId) {
        return orderRepository.findById(orderId);
    }

    public void updateOrderStatus(Long orderId, String status) {
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus(status);
            order.setUpdatedAt(java.time.LocalDateTime.now());
            orderRepository.save(order);
        });
    }

    public void updateItemStatus(Long itemId, String status) {
        itemRepository.findById(itemId).ifPresent(item -> {
            item.setStatus(status);
            item.setUpdatedAt(java.time.LocalDateTime.now());
            itemRepository.save(item);
        });
    }

    public void notifySeller(Long sellerId, Long orderId, String type) {
        // This would typically integrate with a notification service
        // For now, we'll just log the notification
        System.out.println("Notification sent to seller " + sellerId + " for order " + orderId + " of type " + type);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }

    public User getFirstUser() {
        return userRepository.findAll().stream().findFirst().orElse(null);
    }
} 