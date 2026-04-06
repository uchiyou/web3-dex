// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SafeMath} from "../libraries/SafeMath.sol";
import {IERC20} from "../tokens/MockERC20.sol";

/**
 * @title CrossChainBridge
 * @notice Bridge contract for cross-chain asset transfers
 */
contract CrossChainBridge {
    using SafeMath for uint256;

    /// @notice Contract owner
    address public owner;
    
    /// @notice Supported chains
    mapping(uint256 => bool) public supportedChains;
    
    /// @notice Chain ID
    uint256 public chainId;
    
    /// @notice Bridge fee percentage (in basis points)
    uint256 public bridgeFee;
    
    /// @notice Minimum bridge amount
    uint256 public minBridgeAmount;
    
    /// @notice Maximum bridge amount
    uint256 public maxBridgeAmount;
    
    /// @notice Transfer requests
    struct BridgeRequest {
        address user;
        address token;
        uint256 amount;
        uint256 targetChain;
        address targetAddress;
        uint256 fees;
        bool executed;
        uint256 timestamp;
    }
    
    /// @notice Request ID => BridgeRequest
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    
    /// @notice Nonce for request IDs
    uint256 public nonce;
    
    /// @notice Required confirmations for cross-chain messages
    uint256 public requiredConfirmations;
    
    /// @notice Events
    event BridgeRequestCreated(
        bytes32 indexed requestId,
        address indexed user,
        address token,
        uint256 amount,
        uint256 targetChain,
        address targetAddress
    );
    event BridgeRequestExecuted(bytes32 indexed requestId);
    event ChainSupportUpdated(uint256 indexed chainId, bool supported);

    modifier onlyOwner() {
        require(msg.sender == owner, "Bridge: not owner");
        _;
    }

    constructor(uint256 _chainId) {
        owner = msg.sender;
        chainId = _chainId;
        bridgeFee = 50; // 0.5%
        minBridgeAmount = 1e16; // 0.01 ETH
        maxBridgeAmount = 1e24; // 1000 ETH
        requiredConfirmations = 2;
    }

    /**
     * @notice Update bridge fee
     */
    function setBridgeFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Bridge: fee too high"); // Max 10%
        bridgeFee = _fee;
    }

    /**
     * @notice Update chain support
     */
    function setChainSupport(uint256 _chainId, bool supported) external onlyOwner {
        supportedChains[_chainId] = supported;
        emit ChainSupportUpdated(_chainId, supported);
    }

    /**
     * @notice Update min/max bridge amounts
     */
    function setBridgeLimits(uint256 _min, uint256 _max) external onlyOwner {
        require(_min < _max, "Bridge: invalid limits");
        minBridgeAmount = _min;
        maxBridgeAmount = _max;
    }

    /**
     * @notice Request a cross-chain bridge transfer
     */
    function requestBridge(
        address token,
        uint256 amount,
        uint256 targetChain,
        address targetAddress
    ) external payable returns (bytes32 requestId) {
        require(supportedChains[targetChain], "Bridge: unsupported chain");
        require(amount >= minBridgeAmount && amount <= maxBridgeAmount, "Bridge: invalid amount");
        require(targetAddress != address(0), "Bridge: invalid target");
        
        uint256 fee = SafeMath.mul(amount, bridgeFee) / 10000;
        require(msg.value >= fee, "Bridge: insufficient fee");
        
        // Generate request ID
        requestId = keccak256(abi.encodePacked(
            msg.sender,
            token,
            amount,
            targetChain,
            targetAddress,
            nonce++,
            block.timestamp
        ));
        
        // Transfer tokens to bridge
        if (token == address(0)) {
            // Native token
            require(address(this).balance >= amount + fee, "Bridge: insufficient balance");
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }
        
        bridgeRequests[requestId] = BridgeRequest({
            user: msg.sender,
            token: token,
            amount: amount,
            targetChain: targetChain,
            targetAddress: targetAddress,
            fees: fee,
            executed: false,
            timestamp: block.timestamp
        });
        
        // Refund excess fees
        if (msg.value > fee) {
            (bool success, ) = msg.sender.call{value: msg.value - fee}("");
            require(success, "Bridge: refund failed");
        }
        
        emit BridgeRequestCreated(requestId, msg.sender, token, amount, targetChain, targetAddress);
    }

    /**
     * @notice Execute a bridge request (called by relayer/oracle)
     */
    function executeBridge(bytes32 requestId) external onlyOwner {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(!request.executed, "Bridge: already executed");
        require(request.user != address(0), "Bridge: request not found");
        
        request.executed = true;
        
        // In production, this would trigger cross-chain message
        // For now, we simulate the completion
        
        emit BridgeRequestExecuted(requestId);
    }

    /**
     * @notice Cancel a bridge request (only before execution)
     */
    function cancelBridge(bytes32 requestId) external {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.user == msg.sender, "Bridge: not your request");
        require(!request.executed, "Bridge: already executed");
        
        // Return tokens
        if (request.token == address(0)) {
            (bool success, ) = msg.sender.call{value: request.amount}("");
            require(success, "Bridge: transfer failed");
        } else {
            IERC20(request.token).transfer(msg.sender, request.amount);
        }
        
        // Return fees
        if (request.fees > 0) {
            (bool success, ) = msg.sender.call{value: request.fees}("");
            require(success, "Bridge: fee refund failed");
        }
        
        delete bridgeRequests[requestId];
    }

    /**
     * @notice Get bridge request details
     */
    function getBridgeRequest(bytes32 requestId) external view returns (BridgeRequest memory) {
        return bridgeRequests[requestId];
    }

    /**
     * @notice Get bridge fee for an amount
     */
    function getBridgeFee(uint256 amount) external view returns (uint256) {
        return SafeMath.mul(amount, bridgeFee) / 10000;
    }

    receive() external payable {}
}

/**
 * @title BridgeAggregator
 * @notice Aggregates multiple bridges for unified interface
 */
contract BridgeAggregator {
    struct BridgeInfo {
        address bridgeAddress;
        uint256 chainId;
        bool isActive;
        uint256 priority;
    }
    
    mapping(uint256 => BridgeInfo) public bridges;
    address public owner;
    
    event BridgeRegistered(uint256 indexed chainId, address indexed bridge);
    event BridgeUpdated(uint256 indexed chainId, address indexed bridge);
    event BridgeSwitched(uint256 indexed chainId, address indexed newBridge);

    constructor() {
        owner = msg.sender;
    }

    function registerBridge(
        uint256 chainId,
        address bridgeAddress,
        uint256 priority
    ) external {
        require(msg.sender == owner, "Aggregator: not owner");
        bridges[chainId] = BridgeInfo({
            bridgeAddress: bridgeAddress,
            chainId: chainId,
            isActive: true,
            priority: priority
        });
        emit BridgeRegistered(chainId, bridgeAddress);
    }

    function getBridge(uint256 chainId) external view returns (address) {
        return bridges[chainId].bridgeAddress;
    }

    function bridgeTo(
        uint256 targetChain,
        address token,
        uint256 amount,
        address targetAddress
    ) external payable returns (bytes32) {
        require(bridges[targetChain].isActive, "Aggregator: no bridge");
        BridgeInfo memory bridge = bridges[targetChain];
        
        CrossChainBridge bridgeContract = CrossChainBridge(bridge.bridgeAddress);
        return bridgeContract.requestBridge(token, amount, targetChain, targetAddress);
    }
}
