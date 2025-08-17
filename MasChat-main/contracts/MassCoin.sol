// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MassCoin
 * @dev ERC-20 token for MasChat social platform
 * @notice This contract manages the MASS token with social features
 */
contract MassCoin is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    // Token details
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_AIRDROP = 1000 * 10**18; // 1000 tokens per user
    
    // MasChat platform address (can be updated)
    address public masChatPlatform;
    
    // Staking contract address
    address public stakingContract;
    
    // User registration mapping
    mapping(address => bool) public registeredUsers;
    
    // Transfer limits
    uint256 public maxTransferAmount = 10000 * 10**18; // 10k tokens max per transfer
    uint256 public dailyTransferLimit = 100000 * 10**18; // 100k tokens daily limit
    
    // Daily transfer tracking
    mapping(address => uint256) public dailyTransferAmount;
    mapping(address => uint256) public lastTransferDate;
    
    // Events
    event UserRegistered(address indexed user, uint256 amount);
    event PlatformAddressUpdated(address indexed oldPlatform, address indexed newPlatform);
    event StakingContractUpdated(address indexed oldContract, address indexed newContract);
    event TransferLimitUpdated(uint256 maxTransfer, uint256 dailyLimit);
    
    // Modifiers
    modifier onlyPlatform() {
        require(msg.sender == masChatPlatform || msg.sender == owner(), "Only platform can call");
        _;
    }
    
    modifier onlyStakingContract() {
        require(msg.sender == stakingContract, "Only staking contract can call");
        _;
    }
    
    constructor() ERC20("Mass Coin", "MASS") {
        masChatPlatform = msg.sender;
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    /**
     * @dev Register a new user and give them initial tokens
     * @param user Address of the user to register
     */
    function registerUser(address user) external onlyPlatform whenNotPaused {
        require(!registeredUsers[user], "User already registered");
        require(balanceOf(masChatPlatform) >= INITIAL_AIRDROP, "Insufficient tokens for airdrop");
        
        registeredUsers[user] = true;
        _transfer(masChatPlatform, user, INITIAL_AIRDROP);
        
        emit UserRegistered(user, INITIAL_AIRDROP);
    }
    
    /**
     * @dev Transfer tokens with platform approval (for in-app transfers)
     * @param from Sender address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function platformTransfer(address from, address to, uint256 amount) 
        external 
        onlyPlatform 
        whenNotPaused 
        nonReentrant 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= maxTransferAmount, "Amount exceeds max transfer limit");
        require(checkDailyLimit(from, amount), "Daily transfer limit exceeded");
        
        _transfer(from, to, amount);
        updateDailyTransferTracking(from, amount);
    }
    
    /**
     * @dev Stake tokens (called by staking contract)
     * @param user User address
     * @param amount Amount to stake
     */
    function stake(address user, uint256 amount) external onlyStakingContract {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(user) >= amount, "Insufficient balance");
        
        _transfer(user, stakingContract, amount);
    }
    
    /**
     * @dev Unstake tokens (called by staking contract)
     * @param user User address
     * @param amount Amount to unstake
     */
    function unstake(address user, uint256 amount) external onlyStakingContract {
        require(amount > 0, "Amount must be greater than 0");
        
        _transfer(stakingContract, user, amount);
    }
    
    /**
     * @dev Distribute rewards (called by staking contract)
     * @param user User address
     * @param amount Reward amount
     */
    function distributeReward(address user, uint256 amount) external onlyStakingContract {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(masChatPlatform) >= amount, "Insufficient rewards");
        
        _transfer(masChatPlatform, user, amount);
    }
    
    /**
     * @dev Override transfer function to include limits
     */
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(amount <= maxTransferAmount, "Amount exceeds max transfer limit");
        require(checkDailyLimit(msg.sender, amount), "Daily transfer limit exceeded");
        
        bool success = super.transfer(to, amount);
        if (success) {
            updateDailyTransferTracking(msg.sender, amount);
        }
        return success;
    }
    
    /**
     * @dev Override transferFrom function to include limits
     */
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        require(amount <= maxTransferAmount, "Amount exceeds max transfer limit");
        require(checkDailyLimit(from, amount), "Daily transfer limit exceeded");
        
        bool success = super.transferFrom(from, to, amount);
        if (success) {
            updateDailyTransferTracking(from, amount);
        }
        return success;
    }
    
    /**
     * @dev Check if transfer is within daily limit
     */
    function checkDailyLimit(address user, uint256 amount) internal view returns (bool) {
        uint256 today = block.timestamp / 1 days;
        
        if (lastTransferDate[user] != today) {
            return amount <= dailyTransferLimit;
        }
        
        return (dailyTransferAmount[user] + amount) <= dailyTransferLimit;
    }
    
    /**
     * @dev Update daily transfer tracking
     */
    function updateDailyTransferTracking(address user, uint256 amount) internal {
        uint256 today = block.timestamp / 1 days;
        
        if (lastTransferDate[user] != today) {
            dailyTransferAmount[user] = amount;
            lastTransferDate[user] = today;
        } else {
            dailyTransferAmount[user] += amount;
        }
    }
    
    // Admin functions
    
    /**
     * @dev Update platform address
     */
    function updatePlatformAddress(address newPlatform) external onlyOwner {
        require(newPlatform != address(0), "Invalid platform address");
        address oldPlatform = masChatPlatform;
        masChatPlatform = newPlatform;
        emit PlatformAddressUpdated(oldPlatform, newPlatform);
    }
    
    /**
     * @dev Update staking contract address
     */
    function updateStakingContract(address newContract) external onlyOwner {
        require(newContract != address(0), "Invalid contract address");
        address oldContract = stakingContract;
        stakingContract = newContract;
        emit StakingContractUpdated(oldContract, newContract);
    }
    
    /**
     * @dev Update transfer limits
     */
    function updateTransferLimits(uint256 newMaxTransfer, uint256 newDailyLimit) external onlyOwner {
        require(newMaxTransfer > 0, "Max transfer must be greater than 0");
        require(newDailyLimit > 0, "Daily limit must be greater than 0");
        
        maxTransferAmount = newMaxTransfer;
        dailyTransferLimit = newDailyLimit;
        
        emit TransferLimitUpdated(newMaxTransfer, newDailyLimit);
    }
    
    /**
     * @dev Pause all transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause all transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency function to recover tokens sent to contract
     */
    function emergencyWithdraw(address token, address to) external onlyOwner {
        require(token != address(this), "Cannot withdraw MASS tokens");
        require(to != address(0), "Invalid recipient");
        
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        IERC20(token).transfer(to, balance);
    }
}

