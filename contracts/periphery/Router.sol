// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IDexCore} from "../interfaces/IDexCore.sol";
import {IERC20} from "../tokens/MockERC20.sol";
import {SafeMath} from "../libraries/SafeMath.sol";

/**
 * @title Router
 * @notice DEX Router for user interactions
 * @dev Handles order placement, liquidity operations, and token transfers
 */
contract Router {
    using SafeMath for uint256;

    /// @notice DEX Core contract
    IDexCore public immutable dexCore;
    
    /// @notice Wrapped ETH address
    address public immutable WETH;

    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(address _dexCore, address _weth) {
        dexCore = IDexCore(_dexCore);
        WETH = _weth;
    }

    /**
     * @notice Place a market buy order
     */
    function placeMarketBuyOrder(bytes32 pairId, uint256 quantity) external returns (uint256 orderId) {
        // Approve quote token
        IDexCore.TradingPair memory pair = dexCore.getTradingPair(pairId);
        uint256 cost = quantity; // Simplified - should use price
        IERC20(pair.quoteToken).transferFrom(msg.sender, address(this), cost);
        IERC20(pair.quoteToken).approve(address(dexCore), cost);
        
        orderId = dexCore.placeMarketOrder(pairId, IDexCore.TradeDirection.BUY, quantity);
    }

    /**
     * @notice Place a market sell order
     */
    function placeMarketSellOrder(bytes32 pairId, uint256 quantity) external returns (uint256 orderId) {
        // Approve base token
        IDexCore.TradingPair memory pair = dexCore.getTradingPair(pairId);
        IERC20(pair.baseToken).transferFrom(msg.sender, address(this), quantity);
        IERC20(pair.baseToken).approve(address(dexCore), quantity);
        
        orderId = dexCore.placeMarketOrder(pairId, IDexCore.TradeDirection.SELL, quantity);
    }

    /**
     * @notice Place a limit order
     */
    function placeLimitOrder(
        bytes32 pairId,
        IDexCore.TradeDirection direction,
        uint256 price,
        uint256 quantity,
        uint256 expiresAt
    ) external returns (uint256 orderId) {
        IDexCore.TradingPair memory pair = dexCore.getTradingPair(pairId);
        
        if (direction == IDexCore.TradeDirection.BUY) {
            uint256 cost = quantity.mul(price);
            IERC20(pair.quoteToken).transferFrom(msg.sender, address(this), cost);
            IERC20(pair.quoteToken).approve(address(dexCore), cost);
        } else {
            IERC20(pair.baseToken).transferFrom(msg.sender, address(this), quantity);
            IERC20(pair.baseToken).approve(address(dexCore), quantity);
        }
        
        orderId = dexCore.placeLimitOrder(pairId, direction, price, quantity, expiresAt);
    }

    /**
     * @notice Cancel an order
     */
    function cancelOrder(uint256 orderId) external returns (bool) {
        return dexCore.cancelOrder(orderId);
    }

    /**
     * @notice Add liquidity to a pool
     */
    function addLiquidity(
        bytes32 pairId,
        uint256 baseAmount,
        uint256 quoteAmount
    ) external returns (uint256 lpTokens) {
        IDexCore.TradingPair memory pair = dexCore.getTradingPair(pairId);
        
        // Transfer tokens
        IERC20(pair.baseToken).transferFrom(msg.sender, address(this), baseAmount);
        IERC20(pair.quoteToken).transferFrom(msg.sender, address(this), quoteAmount);
        
        // Approve router
        IERC20(pair.baseToken).approve(address(dexCore), baseAmount);
        IERC20(pair.quoteToken).approve(address(dexCore), quoteAmount);
        
        lpTokens = dexCore.addLiquidity(pairId, baseAmount, quoteAmount);
    }

    /**
     * @notice Remove liquidity from a pool
     */
    function removeLiquidity(bytes32 pairId, uint256 lpTokens) 
        external returns (uint256 baseAmount, uint256 quoteAmount) {
        return dexCore.removeLiquidity(pairId, lpTokens);
    }

    /**
     * @notice Get expected output amount for a swap
     */
    function getSwapAmount(bytes32 pairId, uint256 amountIn, bool isBuy) 
        external view returns (uint256) {
        (uint256 baseReserve, uint256 quoteReserve) = dexCore.getPoolReserves(pairId);
        
        if (isBuy) {
            // Buy base with quote
            return quoteReserve > 0 ? amountIn.mul(baseReserve) / quoteReserve : 0;
        } else {
            // Sell base for quote
            return baseReserve > 0 ? amountIn.mul(quoteReserve) / baseReserve : 0;
        }
    }

    // ============ Utility Functions ============

    receive() external payable {
        require(msg.sender == WETH, "Router: not WETH");
    }
}

/**
 * @title Factory
 * @notice Factory for creating trading pairs
 */
contract Factory {
    using SafeMath for uint256;

    /// @notice Contract owner
    address public owner;
    
    /// @notice DEX Core address
    address public immutable dexCore;
    
    /// @notice All pairs
    bytes32[] public allPairs;
    
    /// @notice Pair existence check
    mapping(bytes32 => bool) public pairExists;

    event PairCreated(bytes32 indexed pairId, address indexed baseToken, address indexed quoteToken);

    constructor(address _dexCore) {
        owner = msg.sender;
        dexCore = _dexCore;
    }

    /**
     * @notice Create a new trading pair
     */
    function createPair(
        address baseToken,
        address quoteToken,
        uint256 makerFee,
        uint256 takerFee
    ) external returns (bytes32 pairId) {
        require(msg.sender == owner, "Factory: not owner");
        
        pairId = keccak256(abi.encodePacked(baseToken, quoteToken));
        require(!pairExists[pairId], "Factory: pair exists");
        
        IDexCore(dexCore).createTradingPair(
            baseToken, 
            quoteToken, 
            makerFee, 
            takerFee, 
            1e15 // min order size
        );
        
        pairExists[pairId] = true;
        allPairs.push(pairId);
        
        emit PairCreated(pairId, baseToken, quoteToken);
    }

    /**
     * @notice Get total number of pairs
     */
    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }
}
