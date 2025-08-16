package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.dto.MassCoinDTO;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.repository.UserRepository;
import com.postgresql.MasChat.service.MassCoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/masscoin")
@CrossOrigin(origins = "*")
public class MassCoinController {

    @Autowired
    private MassCoinService massCoinService;

    @Autowired
    private UserRepository userRepository;

    // Wallet endpoints
    @GetMapping("/wallet")
    public ResponseEntity<MassCoinDTO.WalletInfo> getWallet(@RequestParam Long userId) {
        try {
            MassCoinDTO.WalletInfo wallet = massCoinService.getWallet(userId);
            return ResponseEntity.ok(wallet);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("User not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(500).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/wallet/address")
    public ResponseEntity<MassCoinDTO.WalletInfo> updateWalletAddress(
            @RequestParam Long userId,
            @RequestBody Map<String, String> request) {
        try {
            String newAddress = request.get("address");
            MassCoinDTO.WalletInfo wallet = massCoinService.updateWalletAddress(userId, newAddress);
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Transfer request endpoints
    @PostMapping("/transfer-request")
    public ResponseEntity<MassCoinDTO.TransferRequestInfo> createTransferRequest(
            @RequestParam Long senderId,
            @RequestBody MassCoinDTO.TransferRequest request) {
        try {
            MassCoinDTO.TransferRequestInfo transferRequest = massCoinService.createTransferRequest(senderId, request);
            return ResponseEntity.ok(transferRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/transfer-request/{requestId}/approve")
    public ResponseEntity<MassCoinDTO.TransactionInfo> approveTransferRequest(
            @PathVariable Long requestId,
            @RequestParam Long recipientId) {
        try {
            MassCoinDTO.TransactionInfo transaction = massCoinService.approveTransferRequest(recipientId, requestId);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/transfer-request/{requestId}/reject")
    public ResponseEntity<Void> rejectTransferRequest(
            @PathVariable Long requestId,
            @RequestParam Long recipientId) {
        try {
            massCoinService.rejectTransferRequest(recipientId, requestId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/transfer-requests")
    public ResponseEntity<List<MassCoinDTO.TransferRequestInfo>> getTransferRequests(@RequestParam Long userId) {
        try {
            List<MassCoinDTO.TransferRequestInfo> requests = massCoinService.getTransferRequests(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/transfer-requests/pending-count")
    public ResponseEntity<Map<String, Long>> getPendingTransferRequestsCount(@RequestParam Long userId) {
        try {
            long count = massCoinService.getPendingTransferRequestsCount(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Direct transfer endpoints
    @PostMapping("/transfer")
    public ResponseEntity<MassCoinDTO.TransactionInfo> transferMass(
            @RequestParam Long senderId,
            @RequestBody MassCoinDTO.TransferRequest request) {
        try {
            MassCoinDTO.TransactionInfo transaction = massCoinService.transferMass(senderId, request);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Tip endpoints
    @PostMapping("/tip")
    public ResponseEntity<MassCoinDTO.TransactionInfo> tipCreator(
            @RequestParam Long senderId,
            @RequestParam String postId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String description) {
        try {
            System.out.println("=== DEBUG: Tip request received ===");
            System.out.println("Sender ID: " + senderId);
            System.out.println("Post ID: " + postId);
            System.out.println("Amount: " + amount);
            System.out.println("Description: " + description);
            
            MassCoinDTO.TransactionInfo transaction = massCoinService.tipCreator(senderId, postId, amount, description);
            System.out.println("=== DEBUG: Tip successful ===");
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            System.err.println("=== ERROR: Tip failed with RuntimeException ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("=== ERROR: Tip failed with Exception ===");
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Reward endpoints
    @PostMapping("/reward")
    public ResponseEntity<MassCoinDTO.TransactionInfo> rewardUser(
            @RequestParam Long userId,
            @RequestParam BigDecimal amount,
            @RequestParam String reason) {
        try {
            MassCoinDTO.TransactionInfo transaction = massCoinService.rewardUser(userId, amount, reason);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Staking endpoints
    @PostMapping("/stake")
    public ResponseEntity<MassCoinDTO.WalletInfo> stakeMass(
            @RequestParam Long userId,
            @RequestParam BigDecimal amount) {
        try {
            MassCoinDTO.WalletInfo wallet = massCoinService.stakeMass(userId, amount);
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/unstake")
    public ResponseEntity<MassCoinDTO.WalletInfo> unstakeMass(
            @RequestParam Long userId,
            @RequestParam BigDecimal amount) {
        try {
            MassCoinDTO.WalletInfo wallet = massCoinService.unstakeMass(userId, amount);
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Transaction endpoints
    @GetMapping("/transactions")
    public ResponseEntity<Page<MassCoinDTO.TransactionInfo>> getUserTransactions(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<MassCoinDTO.TransactionInfo> transactions = massCoinService.getUserTransactions(userId, page, size);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Withdrawal endpoints
    @PostMapping("/withdrawals")
    public ResponseEntity<MassCoinDTO.WithdrawalInfo> requestWithdrawal(@RequestBody MassCoinDTO.WithdrawalRequest request) {
        try {
            MassCoinDTO.WithdrawalInfo info = massCoinService.requestWithdrawal(request);
            return ResponseEntity.ok(info);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/withdrawals")
    public ResponseEntity<List<MassCoinDTO.WithdrawalInfo>> getWithdrawals(@RequestParam Long userId) {
        try {
            List<MassCoinDTO.WithdrawalInfo> withdrawals = massCoinService.getWithdrawals(userId);
            return ResponseEntity.ok(withdrawals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "healthy", "service", "MassCoin"));
    }

    // User search endpoint
    @GetMapping("/search-users")
    public ResponseEntity<List<MassCoinDTO.UserSearchResult>> searchUsers(
            @RequestParam String query,
            @RequestParam Long currentUserId) {
        try {
            List<MassCoinDTO.UserSearchResult> results = massCoinService.searchUsers(query, currentUserId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get user statistics
    @GetMapping("/user-stats")
    public ResponseEntity<MassCoinDTO.UserStats> getUserStats(@RequestParam Long userId) {
        try {
            MassCoinDTO.UserStats stats = massCoinService.getUserStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Test endpoint to create wallet
    @PostMapping("/create-wallet")
    public ResponseEntity<MassCoinDTO.WalletInfo> createWallet(@RequestParam Long userId) {
        try {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            MassCoinDTO.WalletInfo wallet = massCoinService.createWallet(user);
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 