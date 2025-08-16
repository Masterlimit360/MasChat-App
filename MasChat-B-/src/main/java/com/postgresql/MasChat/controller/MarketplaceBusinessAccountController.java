package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.model.MarketplaceBusinessAccount;
import com.postgresql.MasChat.service.MarketplaceBusinessAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace/business-accounts")
public class MarketplaceBusinessAccountController {
    @Autowired
    private MarketplaceBusinessAccountService businessAccountService;

    @GetMapping
    public List<MarketplaceBusinessAccount> getAllBusinessAccounts() {
        return businessAccountService.getAllBusinessAccounts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceBusinessAccount> getBusinessAccount(@PathVariable Long id) {
        return businessAccountService.getBusinessAccount(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MarketplaceBusinessAccount createBusinessAccount(@RequestBody MarketplaceBusinessAccount account) {
        return businessAccountService.createBusinessAccount(account);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBusinessAccount(@PathVariable Long id) {
        businessAccountService.deleteBusinessAccount(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public MarketplaceBusinessAccount getBusinessAccountByUser(@PathVariable Long userId) {
        return businessAccountService.getBusinessAccountByUser(userId);
    }
} 