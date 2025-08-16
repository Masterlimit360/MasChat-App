package com.postgresql.MasChat.service;

import com.postgresql.MasChat.model.MarketplaceBusinessAccount;
import com.postgresql.MasChat.repository.MarketplaceBusinessAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MarketplaceBusinessAccountService {
    @Autowired
    private MarketplaceBusinessAccountRepository businessAccountRepository;

    public List<MarketplaceBusinessAccount> getAllBusinessAccounts() {
        return businessAccountRepository.findAll();
    }

    public Optional<MarketplaceBusinessAccount> getBusinessAccount(Long id) {
        return businessAccountRepository.findById(id);
    }

    public MarketplaceBusinessAccount createBusinessAccount(MarketplaceBusinessAccount account) {
        return businessAccountRepository.save(account);
    }

    public void deleteBusinessAccount(Long id) {
        businessAccountRepository.deleteById(id);
    }

    public MarketplaceBusinessAccount getBusinessAccountByUser(Long userId) {
        return businessAccountRepository.findByUserId(userId);
    }
} 