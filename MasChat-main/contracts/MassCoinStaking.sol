// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./MassCoin.sol";

/**
 * @title MassCoinStaking
 * @dev Staking contract for MassCoin tokens
 * @notice Users can stake MASS tokens and earn rewards
 */
contract MassCoinStaking is ReentrancyGuard, Ownable, Pausable {
    
    MassCoin public massCoin;
    
    // Staking periods and APY rates
    uint256 public constant MIN_STAKE_PERIOD = 30 days;
    uint256 public constant MAX_STAKE_PERIOD = 365 days;
    
    // APY rates (in basis points, 100 = 1%)
    uint256 public constant FLEXIBLE_APY = 500; // 5% APY
    uint256 public constant LOCKED_30_APY = 800; // 8% APY
    uint256 public constant LOCKED_90_APY = 1200; // 12% APY
    uint256 public constant LOCKED_365_APY = 1500; // 15% APY
    
    // Minimum stake amounts
    uint256 public constant MIN_FLEXIBLE_STAKE = 100 * 10**18; // 100 MASS
    uint256 public constant MIN_LOCKED_STAKE = 500 * 10**18; // 500 MASS
    
    // Staking period options
    enum StakingPeriod {
        FLEXIBLE,   // No lock period
        LOCKED_30,  // 30 days lock
        LOCKED_90,  // 90 days lock
        LOCKED_365  // 365 days lock
    }
    
    struct Stake {
        uint256 amount;
        uint256 stakedAt;
        uint256 unlockAt;
        StakingPeriod period;
        uint256 lastRewardClaim;
        bool isActive;
    }
    
    struct StakingStats {
        uint256 totalStaked;
        uint256 totalRewardsDistributed;
        uint256 activeStakes;
        uint256 totalStakers;
    }
    
    // User stakes mapping
    mapping(address => Stake[]) public userStakes;
    mapping(address => uint256) public userTotalStaked;
    mapping(address => uint256) public userTotalRewards;
    
    // Global stats
    StakingStats public stakingStats;
    
    // Events
    event Staked(address indexed user, uint256 amount, StakingPeriod period, uint256 unlockAt);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);
    event EmergencyUnstake(address indexed user, uint256 amount, uint256 penalty);
    
    constructor(address _massCoin) {
        require(_massCoin != address(0), "Invalid MassCoin address");
        massCoin = MassCoin(_massCoin);
    }
    
    /**
     * @dev Stake tokens for a specific period
     * @param amount Amount to stake
     * @param period Staking period
     */
    function stake(uint256 amount, StakingPeriod period) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(period <= StakingPeriod.LOCKED_365, "Invalid staking period");
        
        // Check minimum stake requirements
        if (period == StakingPeriod.FLEXIBLE) {
            require(amount >= MIN_FLEXIBLE_STAKE, "Below minimum flexible stake");
        } else {
            require(amount >= MIN_LOCKED_STAKE, "Below minimum locked stake");
        }
        
        // Check user has enough tokens
        require(massCoin.balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Calculate unlock time
        uint256 unlockAt = block.timestamp;
        if (period == StakingPeriod.LOCKED_30) {
            unlockAt += 30 days;
        } else if (period == StakingPeriod.LOCKED_90) {
            unlockAt += 90 days;
        } else if (period == StakingPeriod.LOCKED_365) {
            unlockAt += 365 days;
        }
        
        // Transfer tokens to staking contract
        massCoin.stake(msg.sender, amount);
        
        // Create stake record
        Stake memory newStake = Stake({
            amount: amount,
            stakedAt: block.timestamp,
            unlockAt: unlockAt,
            period: period,
            lastRewardClaim: block.timestamp,
            isActive: true
        });
        
        userStakes[msg.sender].push(newStake);
        
        // Update stats
        userTotalStaked[msg.sender] += amount;
        stakingStats.totalStaked += amount;
        stakingStats.activeStakes++;
        
        if (userStakes[msg.sender].length == 1) {
            stakingStats.totalStakers++;
        }
        
        emit Staked(msg.sender, amount, period, unlockAt);
    }
    
    /**
     * @dev Unstake tokens (only for flexible stakes or after lock period)
     * @param stakeIndex Index of the stake to unstake
     */
    function unstake(uint256 stakeIndex) external whenNotPaused nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.isActive, "Stake is not active");
        
        // Check if stake can be unstaked
        if (userStake.period != StakingPeriod.FLEXIBLE) {
            require(block.timestamp >= userStake.unlockAt, "Stake is still locked");
        }
        
        // Calculate rewards
        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        
        // Update stats
        stakingStats.totalStaked -= userStake.amount;
        stakingStats.totalRewardsDistributed += rewards;
        stakingStats.activeStakes--;
        userTotalStaked[msg.sender] -= userStake.amount;
        userTotalRewards[msg.sender] += rewards;
        
        // Mark stake as inactive
        userStake.isActive = false;
        
        // Transfer tokens back to user
        uint256 totalAmount = userStake.amount + rewards;
        massCoin.unstake(msg.sender, totalAmount);
        
        // Distribute rewards if any
        if (rewards > 0) {
            massCoin.distributeReward(msg.sender, rewards);
        }
        
        emit Unstaked(msg.sender, userStake.amount, rewards);
    }
    
    /**
     * @dev Claim rewards for a specific stake
     * @param stakeIndex Index of the stake
     */
    function claimRewards(uint256 stakeIndex) external whenNotPaused nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.isActive, "Stake is not active");
        
        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        require(rewards > 0, "No rewards to claim");
        
        // Update last reward claim time
        userStake.lastRewardClaim = block.timestamp;
        
        // Update stats
        stakingStats.totalRewardsDistributed += rewards;
        userTotalRewards[msg.sender] += rewards;
        
        // Distribute rewards
        massCoin.distributeReward(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Emergency unstake with penalty (for locked stakes)
     * @param stakeIndex Index of the stake
     */
    function emergencyUnstake(uint256 stakeIndex) external whenNotPaused nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.isActive, "Stake is not active");
        require(userStake.period != StakingPeriod.FLEXIBLE, "Cannot emergency unstake flexible");
        require(block.timestamp < userStake.unlockAt, "Stake is already unlocked");
        
        // Calculate penalty (50% of staked amount)
        uint256 penalty = userStake.amount / 2;
        uint256 returnAmount = userStake.amount - penalty;
        
        // Calculate partial rewards
        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        
        // Update stats
        stakingStats.totalStaked -= userStake.amount;
        stakingStats.totalRewardsDistributed += rewards;
        stakingStats.activeStakes--;
        userTotalStaked[msg.sender] -= userStake.amount;
        userTotalRewards[msg.sender] += rewards;
        
        // Mark stake as inactive
        userStake.isActive = false;
        
        // Transfer tokens back to user (minus penalty)
        uint256 totalAmount = returnAmount + rewards;
        massCoin.unstake(msg.sender, totalAmount);
        
        // Distribute rewards if any
        if (rewards > 0) {
            massCoin.distributeReward(msg.sender, rewards);
        }
        
        emit EmergencyUnstake(msg.sender, returnAmount, penalty);
    }
    
    /**
     * @dev Calculate rewards for a specific stake
     * @param user User address
     * @param stakeIndex Index of the stake
     * @return rewards Calculated rewards
     */
    function calculateRewards(address user, uint256 stakeIndex) public view returns (uint256) {
        require(stakeIndex < userStakes[user].length, "Invalid stake index");
        
        Stake memory userStake = userStakes[user][stakeIndex];
        if (!userStake.isActive) return 0;
        
        uint256 timeStaked = block.timestamp - userStake.lastRewardClaim;
        if (timeStaked == 0) return 0;
        
        uint256 apy;
        if (userStake.period == StakingPeriod.FLEXIBLE) {
            apy = FLEXIBLE_APY;
        } else if (userStake.period == StakingPeriod.LOCKED_30) {
            apy = LOCKED_30_APY;
        } else if (userStake.period == StakingPeriod.LOCKED_90) {
            apy = LOCKED_90_APY;
        } else if (userStake.period == StakingPeriod.LOCKED_365) {
            apy = LOCKED_365_APY;
        }
        
        // Calculate rewards: (amount * apy * time) / (365 days * 10000)
        return (userStake.amount * apy * timeStaked) / (365 days * 10000);
    }
    
    /**
     * @dev Get user's total pending rewards
     * @param user User address
     * @return totalRewards Total pending rewards
     */
    function getTotalPendingRewards(address user) external view returns (uint256 totalRewards) {
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            if (userStakes[user][i].isActive) {
                totalRewards += calculateRewards(user, i);
            }
        }
    }
    
    /**
     * @dev Get user's active stakes
     * @param user User address
     * @return stakes Array of active stakes
     */
    function getUserStakes(address user) external view returns (Stake[] memory stakes) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            if (userStakes[user][i].isActive) {
                activeCount++;
            }
        }
        
        stakes = new Stake[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            if (userStakes[user][i].isActive) {
                stakes[index] = userStakes[user][i];
                index++;
            }
        }
    }
    
    /**
     * @dev Get staking statistics
     * @return stats Staking statistics
     */
    function getStakingStats() external view returns (StakingStats memory) {
        return stakingStats;
    }
    
    // Admin functions
    
    /**
     * @dev Pause staking
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause staking
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency function to recover tokens
     */
    function emergencyWithdraw(address token, address to) external onlyOwner {
        require(token != address(massCoin), "Cannot withdraw MASS tokens");
        require(to != address(0), "Invalid recipient");
        
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        IERC20(token).transfer(to, balance);
    }
}

