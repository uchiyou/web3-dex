// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SafeMath} from "../libraries/SafeMath.sol";
import {IERC20} from "../tokens/MockERC20.sol";

/**
 * @title ReferralSystem
 * @notice Multi-level referral system with reward distribution
 */
contract ReferralSystem {
    using SafeMath for uint256;

    /// @notice Contract owner
    address public owner;
    
    /// @notice DEX Core contract for fee calculation
    address public dexCore;
    
    /// @notice Reward token
    IERC20 public rewardToken;
    
    /// @notice Referral tiers (level => reward percentage in basis points)
    mapping(uint8 => uint256) public referralTiers;
    
    /// @notice User referral info
    struct ReferralInfo {
        address referrer;
        uint256 totalRewards;
        uint256 directReferrals;
        uint256 totalVolume;
    }
    
    /// @notice User referral mapping
    mapping(address => ReferralInfo) public userReferrals;
    
    /// @notice Referral code to user mapping
    mapping(bytes32 => address) public referralCodes;
    
    /// @notice User's referral code
    mapping(address => bytes32) public userReferralCodes;
    
    /// @notice Total rewards distributed
    uint256 public totalRewardsDistributed;
    
    /// @notice Maximum referral levels
    uint8 public constant MAX_REFERRAL_LEVELS = 3;
    
    /// @notice Events
    event ReferralRegistered(address indexed user, address indexed referrer, bytes32 code);
    event RewardDistributed(address indexed user, address indexed referrer, uint256 level, uint256 amount);
    event ReferralTierUpdated(uint8 level, uint256 rewardPercentage);

    modifier onlyOwner() {
        require(msg.sender == owner, "ReferralSystem: not owner");
        _;
    }

    constructor(address _rewardToken) {
        owner = msg.sender;
        rewardToken = IERC20(_rewardToken);
        
        // Default tier rewards (in basis points)
        referralTiers[1] = 500;  // 5% for level 1
        referralTiers[2] = 200;  // 2% for level 2
        referralTiers[3] = 100;  // 1% for level 3
    }

    /**
     * @notice Set DEX Core address
     */
    function setDexCore(address _dexCore) external onlyOwner {
        dexCore = _dexCore;
    }

    /**
     * @notice Update referral tier reward
     */
    function updateReferralTier(uint8 level, uint256 rewardBps) external onlyOwner {
        require(level > 0 && level <= MAX_REFERRAL_LEVELS, "ReferralSystem: invalid level");
        require(rewardBps <= 1000, "ReferralSystem: reward too high"); // Max 10%
        referralTiers[level] = rewardBps;
        emit ReferralTierUpdated(level, rewardBps);
    }

    /**
     * @notice Generate a unique referral code for a user
     */
    function generateReferralCode(address user) external returns (bytes32) {
        require(userReferralCodes[user] == bytes32(0), "ReferralSystem: code exists");
        
        bytes32 code = keccak256(abi.encodePacked(user, block.timestamp, "REF"));
        referralCodes[code] = user;
        userReferralCodes[user] = code;
        
        return code;
    }

    /**
     * @notice Register a referral relationship
     */
    function registerReferral(address user, bytes32 code) external {
        require(msg.sender == dexCore || msg.sender == owner, "ReferralSystem: unauthorized");
        require(code != bytes32(0), "ReferralSystem: invalid code");
        require(referralCodes[code] != address(0), "ReferralSystem: code not found");
        require(userReferrals[user].referrer == address(0), "ReferralSystem: already referred");
        
        address referrer = referralCodes[code];
        require(referrer != user, "ReferralSystem: self-referral");
        
        userReferrals[user].referrer = referrer;
        userReferrals[referrer].directReferrals++;
        
        emit ReferralRegistered(user, referrer, code);
    }

    /**
     * @notice Calculate referral rewards for a trade
     */
    function calculateRewards(uint256 tradeVolume) public view returns (uint256[] memory rewards) {
        rewards = new uint256[](MAX_REFERRAL_LEVELS);
        for (uint8 i = 1; i <= MAX_REFERRAL_LEVELS; i++) {
            rewards[i - 1] = SafeMath.mul(tradeVolume, referralTiers[i]) / 10000;
        }
    }

    /**
     * @notice Distribute referral rewards
     */
    function distributeRewards(address user, uint256 tradeVolume) external {
        require(msg.sender == dexCore || msg.sender == owner, "ReferralSystem: unauthorized");
        
        ReferralInfo memory info = userReferrals[user];
        if (info.referrer == address(0)) return;
        
        uint256[] memory rewards = calculateRewards(tradeVolume);
        address currentReferrer = info.referrer;
        
        for (uint8 level = 1; level <= MAX_REFERRAL_LEVELS; level++) {
            if (currentReferrer == address(0)) break;
            
            uint256 reward = rewards[level - 1];
            if (reward > 0) {
                // Transfer reward
                if (address(rewardToken) != address(0)) {
                    // Using native token transfer
                    (bool success, ) = currentReferrer.call{value: reward}("");
                    if (success) {
                        userReferrals[currentReferrer].totalRewards += reward;
                        totalRewardsDistributed += reward;
                        emit RewardDistributed(user, currentReferrer, level, reward);
                    }
                }
            }
            
            // Move to next level referrer
            currentReferrer = userReferrals[currentReferrer].referrer;
        }
    }

    /**
     * @notice Get referral info for a user
     */
    function getReferralInfo(address user) external view returns (ReferralInfo memory) {
        return userReferrals[user];
    }

    /**
     * @notice Get referral code for a user
     */
    function getReferralCode(address user) external view returns (bytes32) {
        return userReferralCodes[user];
    }

    /**
     * @notice Get team performance (all downstream referrals)
     */
    function getTeamPerformance(address user) external view returns (
        uint256 totalTeamVolume,
        uint256 totalReferrals,
        address[] memory level1Referrers
    ) {
        ReferralInfo memory info = userReferrals[user];
        
        totalReferrals = info.directReferrals;
        totalTeamVolume = info.totalVolume;
        
        // Simplified - in production would track all levels
        level1Referrers = new address[](info.directReferrals);
        
        return (totalTeamVolume, totalReferrals, level1Referrers);
    }

    /**
     * @notice Withdraw rewards (for contract safety)
     */
    function withdrawRewards(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "ReferralSystem: invalid address");
        (bool success, ) = to.call{value: amount}("");
        require(success, "ReferralSystem: transfer failed");
    }

    receive() external payable {}
}
