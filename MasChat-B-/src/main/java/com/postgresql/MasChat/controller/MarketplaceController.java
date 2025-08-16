package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.config.AppConfig;
import com.postgresql.MasChat.model.MarketplaceCategory;
import com.postgresql.MasChat.model.MarketplaceItem;
import com.postgresql.MasChat.model.MarketplaceOrder;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.MarketplaceItemRepository;
import com.postgresql.MasChat.repository.UserRepository;
import com.postgresql.MasChat.service.MarketplaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "*")
public class MarketplaceController {
    @Autowired
    private MarketplaceService marketplaceService;
    @Autowired
    private MarketplaceItemRepository itemRepository;
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AppConfig appConfig;

    // --- Items ---
    @GetMapping("/items")
    public ResponseEntity<List<MarketplaceItem>> getAllItems() {
        try {
            System.out.println("=== DEBUG: Starting getAllItems request ===");
            List<MarketplaceItem> items = marketplaceService.getAllItems();
            System.out.println("=== DEBUG: Retrieved " + items.size() + " items from service ===");
            
            // Check each item for potential issues
            for (int i = 0; i < items.size(); i++) {
                MarketplaceItem item = items.get(i);
                System.out.println("Item " + i + ": ID=" + item.getId() + ", Title=" + item.getTitle());
                System.out.println("  Seller: " + (item.getSeller() != null ? 
                    "ID=" + item.getSeller().getId() + ", Name=" + item.getSeller().getUsername() : "NULL"));
                System.out.println("  Category: " + (item.getCategory() != null ? 
                    "ID=" + item.getCategory().getId() + ", Name=" + item.getCategory().getName() : "NULL"));
            }
            
            System.out.println("=== DEBUG: Returning " + items.size() + " items successfully ===");
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("=== ERROR: Failed to get all items ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            
            // Return empty list instead of error to prevent frontend crashes
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<MarketplaceItem> getItem(@PathVariable Long id) {
        System.out.println("=== DEBUG: Getting Item " + id + " ===");
        return marketplaceService.getItem(id)
                .map(item -> {
                    System.out.println("Item found: " + item.getTitle());
                    System.out.println("Seller: " + (item.getSeller() != null ?
                        "ID=" + item.getSeller().getId() + ", Name=" + item.getSeller().getUsername() : "NULL"));
                    System.out.println("=== END DEBUG ===");
                    return ResponseEntity.ok(item);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/items")
    public ResponseEntity<MarketplaceItem> createItem(@RequestBody MarketplaceItem item) {
        try {
            // Validate required fields
            if (item.getSeller() == null) {
                return ResponseEntity.badRequest().build();
            }
            
            // Ensure seller exists
            User seller = userRepository.findById(item.getSeller().getId())
                .orElse(null);
            if (seller == null) {
                return ResponseEntity.badRequest().build();
            }
            
            // Set the validated seller
            item.setSeller(seller);
            
            MarketplaceItem createdItem = marketplaceService.createItem(item);
            return ResponseEntity.ok(createdItem);
        } catch (Exception e) {
            System.err.println("Error creating marketplace item: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = saveImage(file, "marketplace");
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to upload image");
        }
    }

    private String saveImage(MultipartFile file, String type) throws IOException {
        String uploadDir = "uploads/";
        Files.createDirectories(Paths.get(uploadDir));
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String fileName = type + "_" + UUID.randomUUID() + fileExtension;
        Path filePath = Paths.get(uploadDir + fileName);
        Files.write(filePath, file.getBytes());
        return appConfig.getUploadUrl(fileName);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<MarketplaceItem> updateItem(@PathVariable Long id, @RequestBody MarketplaceItem item) {
        return ResponseEntity.ok(marketplaceService.updateItem(id, item));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        marketplaceService.deleteItem(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/items/search")
    public ResponseEntity<List<MarketplaceItem>> searchItems(@RequestParam String q) {
        return ResponseEntity.ok(marketplaceService.searchItems(q));
    }

    @GetMapping("/items/category/{categoryId}")
    public ResponseEntity<List<MarketplaceItem>> getItemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(marketplaceService.filterByCategory(categoryId));
    }

    @GetMapping("/items/seller/{sellerId}")
    public List<MarketplaceItem> filterBySeller(@PathVariable Long sellerId) {
        return marketplaceService.filterBySeller(sellerId);
    }

    @GetMapping("/items/status/{status}")
    public List<MarketplaceItem> filterByStatus(@PathVariable String status) {
        return marketplaceService.filterByStatus(status);
    }

    // --- Categories ---
    @GetMapping("/categories")
    public ResponseEntity<List<MarketplaceCategory>> getAllCategories() {
        return ResponseEntity.ok(marketplaceService.getAllCategories());
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<MarketplaceCategory> getCategory(@PathVariable Long id) {
        return marketplaceService.getCategory(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/categories")
    public ResponseEntity<MarketplaceCategory> createCategory(@RequestBody MarketplaceCategory category) {
        return ResponseEntity.ok(marketplaceService.createCategory(category));
    }

    // Order management endpoints
    @PostMapping("/orders")
    public ResponseEntity<MarketplaceOrder> createOrder(@RequestBody Map<String, Object> orderRequest) {
        try {
            MarketplaceOrder order = new MarketplaceOrder();
            order.setItemId(Long.valueOf(orderRequest.get("itemId").toString()));
            order.setBuyerId(Long.valueOf(orderRequest.get("buyerId").toString()));
            order.setSellerId(Long.valueOf(orderRequest.get("sellerId").toString()));
            order.setQuantity(Integer.valueOf(orderRequest.get("quantity").toString()));
            order.setTotalAmount(Double.valueOf(orderRequest.get("totalAmount").toString()));
            order.setShippingAddress((String) orderRequest.get("shippingAddress"));
            order.setPhoneNumber((String) orderRequest.get("phoneNumber"));
            order.setPaymentMethod((String) orderRequest.get("paymentMethod"));
            order.setStatus((String) orderRequest.get("status"));

            MarketplaceOrder createdOrder = marketplaceService.createOrder(order);
            return ResponseEntity.ok(createdOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<List<MarketplaceOrder>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(marketplaceService.getUserOrders(userId));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<MarketplaceOrder> getOrderDetails(@PathVariable Long orderId) {
        return marketplaceService.getOrderDetails(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        marketplaceService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok().build();
    }

    // Item status management
    @PatchMapping("/items/{itemId}/status")
    public ResponseEntity<Void> updateItemStatus(@PathVariable Long itemId, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        marketplaceService.updateItemStatus(itemId, status);
        return ResponseEntity.ok().build();
    }

    // Seller notifications
    @PostMapping("/notifications/seller")
    public ResponseEntity<Void> notifySeller(@RequestBody Map<String, Object> notification) {
        try {
            Long sellerId = Long.valueOf(notification.get("sellerId").toString());
            Long orderId = Long.valueOf(notification.get("orderId").toString());
            String type = (String) notification.get("type");
            
            marketplaceService.notifySeller(sellerId, orderId, type);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Debug endpoint to check database state
    @GetMapping("/debug/items")
    public ResponseEntity<Map<String, Object>> debugItems() {
        try {
            List<MarketplaceItem> items = marketplaceService.getAllItems();
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("totalItems", items.size());
            
            List<Map<String, Object>> itemDetails = new ArrayList<>();
            for (MarketplaceItem item : items) {
                Map<String, Object> itemInfo = new HashMap<>();
                itemInfo.put("id", item.getId());
                itemInfo.put("title", item.getTitle());
                itemInfo.put("sellerId", item.getSeller() != null ? item.getSeller().getId() : null);
                itemInfo.put("sellerName", item.getSeller() != null ? item.getSeller().getUsername() : null);
                itemInfo.put("hasSeller", item.getSeller() != null);
                itemDetails.add(itemInfo);
            }
            debugInfo.put("items", itemDetails);
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("stackTrace", e.getStackTrace());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Simple health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            Map<String, Object> health = new HashMap<>();
            health.put("status", "healthy");
            health.put("timestamp", java.time.LocalDateTime.now().toString());
            
            // Test database connection
            try {
                long itemCount = itemRepository.count();
                health.put("database", "connected");
                health.put("marketplaceItems", itemCount);
            } catch (Exception dbError) {
                health.put("database", "error");
                health.put("databaseError", dbError.getMessage());
            }
            
            // Test user connection
            try {
                long userCount = userRepository.count();
                health.put("users", userCount);
            } catch (Exception userError) {
                health.put("users", "error");
                health.put("userError", userError.getMessage());
            }
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "unhealthy");
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Create marketplace item with proper seller data
    @PostMapping("/items/create-with-seller")
    public ResponseEntity<MarketplaceItem> createItemWithSeller(@RequestBody Map<String, Object> request) {
        try {
            MarketplaceItem item = new MarketplaceItem();
            item.setTitle((String) request.get("title"));
            item.setDescription((String) request.get("description"));
            item.setPrice(Double.valueOf(request.get("price").toString()));
            item.setNegotiable(Boolean.valueOf(request.get("negotiable").toString()));
            item.setCondition((String) request.get("condition"));
            item.setDeliveryMethod((String) request.get("deliveryMethod"));
            item.setLocation((String) request.get("location"));
            item.setStatus("active");
            
            // Set images if provided
            if (request.containsKey("images")) {
                @SuppressWarnings("unchecked")
                List<String> images = (List<String>) request.get("images");
                item.setImages(images);
            }
            
            // Set seller
            Long sellerId = Long.valueOf(request.get("sellerId").toString());
            User seller = marketplaceService.getUserById(sellerId);
            if (seller == null) {
                return ResponseEntity.badRequest().build();
            }
            item.setSeller(seller);
            
            // Set category if provided
            if (request.containsKey("categoryId")) {
                Long categoryId = Long.valueOf(request.get("categoryId").toString());
                MarketplaceCategory category = marketplaceService.getCategory(categoryId).orElse(null);
                item.setCategory(category);
            }
            
            MarketplaceItem createdItem = marketplaceService.createItem(item);
            return ResponseEntity.ok(createdItem);
        } catch (Exception e) {
            System.err.println("Error creating item with seller: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Populate sample data for testing
    @PostMapping("/populate-sample-data")
    public ResponseEntity<Map<String, Object>> populateSampleData() {
        try {
            Map<String, Object> result = new HashMap<>();
            List<MarketplaceItem> createdItems = new ArrayList<>();
            
            // Get first user as seller (or create one if needed)
            User seller = marketplaceService.getFirstUser();
            if (seller == null) {
                result.put("error", "No users found. Please create a user first.");
                return ResponseEntity.badRequest().body(result);
            }
            
            // Create sample categories
            MarketplaceCategory electronics = marketplaceService.createCategory(new MarketplaceCategory("Electronics"));
            MarketplaceCategory clothing = marketplaceService.createCategory(new MarketplaceCategory("Clothing"));
            MarketplaceCategory books = marketplaceService.createCategory(new MarketplaceCategory("Books"));
            
            // Sample items
            String[] sampleItems = {
                "iPhone 12 Pro - Excellent condition, 128GB, Space Gray",
                "Nike Air Max 270 - Size 10, barely worn",
                "Harry Potter Complete Set - All 7 books, like new",
                "MacBook Air M1 - 2020 model, 8GB RAM, 256GB SSD",
                "Samsung Galaxy S21 - 128GB, Phantom Black",
                "Adidas Ultraboost - Size 9, white colorway"
            };
            
            double[] prices = {699.99, 89.99, 45.00, 899.99, 599.99, 129.99};
            String[] conditions = {"Used", "Used", "Like New", "Used", "Used", "Used"};
            String[] locations = {"New York", "Los Angeles", "Chicago", "Miami", "Seattle", "Boston"};
            MarketplaceCategory[] categories = {electronics, clothing, books, electronics, electronics, clothing};
            
            for (int i = 0; i < sampleItems.length; i++) {
                MarketplaceItem item = new MarketplaceItem();
                item.setTitle(sampleItems[i].split(" - ")[0]);
                item.setDescription(sampleItems[i]);
                item.setPrice(prices[i]);
                item.setNegotiable(i % 2 == 0); // Alternate negotiable
                item.setCondition(conditions[i]);
                item.setDeliveryMethod(i % 2 == 0 ? "Shipping" : "Local Pickup");
                item.setLocation(locations[i]);
                item.setStatus("active");
                item.setSeller(seller);
                item.setCategory(categories[i]);
                
                // Add sample images
                List<String> images = new ArrayList<>();
                images.add("https://via.placeholder.com/400x300/007AFF/FFFFFF?text=" + item.getTitle().replace(" ", "+"));
                item.setImages(images);
                
                MarketplaceItem createdItem = marketplaceService.createItem(item);
                createdItems.add(createdItem);
            }
            
            result.put("message", "Sample data created successfully");
            result.put("itemsCreated", createdItems.size());
            result.put("sellerId", seller.getId());
            result.put("sellerName", seller.getUsername());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to populate sample data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(error);
        }
    }

    // Fix existing items with null sellers
    @PostMapping("/fix-null-sellers")
    public ResponseEntity<Map<String, Object>> fixNullSellers() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Get first user as default seller
            User defaultSeller = marketplaceService.getFirstUser();
            if (defaultSeller == null) {
                result.put("error", "No users found. Cannot fix null sellers without a user.");
                return ResponseEntity.badRequest().body(result);
            }
            
            // Get all items with null sellers
            List<MarketplaceItem> itemsWithNullSellers = itemRepository.findAll().stream()
                .filter(item -> item.getSeller() == null)
                .collect(Collectors.toList());
            
            int fixedCount = 0;
            for (MarketplaceItem item : itemsWithNullSellers) {
                item.setSeller(defaultSeller);
                itemRepository.save(item);
                fixedCount++;
            }
            
            result.put("message", "Fixed items with null sellers");
            result.put("itemsFixed", fixedCount);
            result.put("defaultSellerId", defaultSeller.getId());
            result.put("defaultSellerName", defaultSeller.getUsername());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fix null sellers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(error);
        }
    }
} 