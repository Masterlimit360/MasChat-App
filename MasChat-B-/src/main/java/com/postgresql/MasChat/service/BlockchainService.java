package com.postgresql.MasChat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tx.gas.StaticGasProvider;
import org.web3j.utils.Convert;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;

import java.math.BigInteger;
import java.util.concurrent.CompletableFuture;

@Service
public class BlockchainService {

    @Value("${blockchain.polygon.rpc-url}")
    private String polygonRpcUrl;

    @Value("${blockchain.private-key}")
    private String privateKey;

    @Value("${blockchain.masscoin.contract-address}")
    private String massCoinContractAddress;

    @Value("${blockchain.staking.contract-address}")
    private String stakingContractAddress;

    private Web3j web3j;
    private Credentials credentials;
    private ContractGasProvider gasProvider;

    // Initialize Web3j connection
    public void initialize() {
        try {
            this.web3j = Web3j.build(new HttpService(polygonRpcUrl));
            this.credentials = Credentials.create(privateKey);
            
            // Set gas provider with reasonable limits
            BigInteger gasPrice = Convert.toWei("30", Convert.Unit.GWEI).toBigInteger();
            BigInteger gasLimit = BigInteger.valueOf(3000000L);
            this.gasProvider = new StaticGasProvider(gasPrice, gasLimit);
            
            System.out.println("✅ Blockchain service initialized successfully");
        } catch (Exception e) {
            System.err.println("❌ Failed to initialize blockchain service: " + e.getMessage());
        }
    }

    /**
     * Register a new user on the blockchain
     */
    @Async
    public CompletableFuture<Boolean> registerUserOnBlockchain(String userAddress) {
        try {
            // Load the MassCoin contract
            MassCoin massCoin = MassCoin.load(
                massCoinContractAddress,
                web3j,
                credentials,
                gasProvider
            );

            // Call registerUser function
            var result = massCoin.registerUser(userAddress).send();
            
            System.out.println("✅ User registered on blockchain: " + userAddress);
            return CompletableFuture.completedFuture(true);
        } catch (Exception e) {
            System.err.println("❌ Failed to register user on blockchain: " + e.getMessage());
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Transfer MassCoin tokens between users
     */
    @Async
    public CompletableFuture<String> transferTokens(String fromAddress, String toAddress, BigInteger amount) {
        try {
            // Load the MassCoin contract
            MassCoin massCoin = MassCoin.load(
                massCoinContractAddress,
                web3j,
                credentials,
                gasProvider
            );

            // Call platformTransfer function
            var result = massCoin.platformTransfer(fromAddress, toAddress, amount).send();
            
            System.out.println("✅ Tokens transferred: " + amount + " from " + fromAddress + " to " + toAddress);
            return CompletableFuture.completedFuture(result.getTransactionHash());
        } catch (Exception e) {
            System.err.println("❌ Failed to transfer tokens: " + e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }

    /**
     * Get user's MassCoin balance from blockchain
     */
    public BigInteger getBalanceFromBlockchain(String userAddress) {
        try {
            // Load the MassCoin contract
            MassCoin massCoin = MassCoin.load(
                massCoinContractAddress,
                web3j,
                credentials,
                gasProvider
            );

            // Call balanceOf function
            return massCoin.balanceOf(userAddress).send();
        } catch (Exception e) {
            System.err.println("❌ Failed to get balance from blockchain: " + e.getMessage());
            return BigInteger.ZERO;
        }
    }

    /**
     * Check if user is registered on blockchain
     */
    public boolean isUserRegisteredOnBlockchain(String userAddress) {
        try {
            // Load the MassCoin contract
            MassCoin massCoin = MassCoin.load(
                massCoinContractAddress,
                web3j,
                credentials,
                gasProvider
            );

            // Call registeredUsers function
            return massCoin.registeredUsers(userAddress).send();
        } catch (Exception e) {
            System.err.println("❌ Failed to check user registration: " + e.getMessage());
            return false;
        }
    }

    /**
     * Stake tokens on blockchain
     */
    @Async
    public CompletableFuture<Boolean> stakeTokens(String userAddress, BigInteger amount, BigInteger period) {
        try {
            // Load the Staking contract
            MassCoinStaking staking = MassCoinStaking.load(
                stakingContractAddress,
                web3j,
                credentials,
                gasProvider
            );

            // Call stake function
            var result = staking.stake(amount, period).send();
            
            System.out.println("✅ Tokens staked: " + amount + " for user " + userAddress);
            return CompletableFuture.completedFuture(true);
        } catch (Exception e) {
            System.err.println("❌ Failed to stake tokens: " + e.getMessage());
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Unstake tokens from blockchain
     */
    @Async
    public CompletableFuture<Boolean> unstakeTokens(String userAddress, BigInteger stakeIndex) {
        try {
            // Load the Staking contract
            MassCoinStaking staking = MassCoinStaking.load(
                stakingContractAddress,
                web3j,
                credentials,
                gasProvider
            );

            // Call unstake function
            var result = staking.unstake(stakeIndex).send();
            
            System.out.println("✅ Tokens unstaked for user " + userAddress);
            return CompletableFuture.completedFuture(true);
        } catch (Exception e) {
            System.err.println("❌ Failed to unstake tokens: " + e.getMessage());
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Get user's staking information from blockchain
     */
    public StakingInfo getStakingInfoFromBlockchain(String userAddress) {
        try {
            // Load the Staking contract
            MassCoinStaking staking = MassCoinStaking.load(
                stakingContractAddress,
                web3j,
                credentials,
                gasProvider
            );

            // Get user stakes
            var stakes = staking.getUserStakes(userAddress).send();
            
            // Get total pending rewards
            var pendingRewards = staking.getTotalPendingRewards(userAddress).send();
            
            return new StakingInfo(stakes, pendingRewards);
        } catch (Exception e) {
            System.err.println("❌ Failed to get staking info: " + e.getMessage());
            return new StakingInfo();
        }
    }

    /**
     * Sync user's blockchain balance with database
     */
    @Async
    public CompletableFuture<Boolean> syncUserBalance(String userAddress) {
        try {
            BigInteger blockchainBalance = getBalanceFromBlockchain(userAddress);
            
            // Update database balance (you'll need to implement this)
            // userWalletService.updateBalanceFromBlockchain(userAddress, blockchainBalance);
            
            System.out.println("✅ Balance synced for user " + userAddress + ": " + blockchainBalance);
            return CompletableFuture.completedFuture(true);
        } catch (Exception e) {
            System.err.println("❌ Failed to sync balance: " + e.getMessage());
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Scheduled task to sync all user balances
     */
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void syncAllBalances() {
        System.out.println("🔄 Starting scheduled balance sync...");
        
        // Get all users with wallets and sync their balances
        // This is a placeholder - implement based on your user service
        // List<User> users = userService.getAllUsersWithWallets();
        // users.forEach(user -> syncUserBalance(user.getWalletAddress()));
        
        System.out.println("✅ Scheduled balance sync completed");
    }

    /**
     * Get blockchain network status
     */
    public boolean isBlockchainConnected() {
        try {
            return web3j != null && web3j.ethBlockNumber().send().hasError() == false;
        } catch (Exception e) {
            return false;
        }
    }

    // Inner class to hold staking information
    public static class StakingInfo {
        private Object stakes;
        private BigInteger pendingRewards;

        public StakingInfo() {
            this.stakes = null;
            this.pendingRewards = BigInteger.ZERO;
        }

        public StakingInfo(Object stakes, BigInteger pendingRewards) {
            this.stakes = stakes;
            this.pendingRewards = pendingRewards;
        }

        // Getters and setters
        public Object getStakes() { return stakes; }
        public void setStakes(Object stakes) { this.stakes = stakes; }
        public BigInteger getPendingRewards() { return pendingRewards; }
        public void setPendingRewards(BigInteger pendingRewards) { this.pendingRewards = pendingRewards; }
    }
}

