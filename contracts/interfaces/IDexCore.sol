// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDexCore
 * @notice Core interface for the DEX exchange
 */
interface IDexCore {
    /// @notice Trade direction enum
    enum TradeDirection { BUY, SELL }
    
    /// @notice Order type enum
    enum OrderType { MARKET, LIMIT }
    
    /// @notice Order status enum
    enum OrderStatus { PENDING, FILLED, PARTIALLY_FILLED, CANCELLED }
    
    /// @notice Structure for trading pair
    struct TradingPair {
        address baseToken;
        address quoteToken;
        uint256 makerFee;
        uint256 takerFee;
        uint256 minOrderSize;
        bool isActive;
    }
    
    /// @notice Structure for order
    struct Order {
        uint256 orderId;
        address trader;
        address baseToken;
        address quoteToken;
        TradeDirection direction;
        OrderType orderType;
        uint256 price;
        uint256 quantity;
        uint256 filledQuantity;
        OrderStatus status;
        uint256 createdAt;
        uint256 expiresAt;
    }
    
    /// @notice Structure for trade execution
    struct TradeExecution {
        uint256 orderId;
        address baseToken;
        address quoteToken;
        TradeDirection direction;
        uint256 price;
        uint256 quantity;
        uint256 fee;
        uint256 timestamp;
    }

    /// @notice Create a new trading pair
    function createTradingPair(
        address baseToken,
        address quoteToken,
        uint256 makerFee,
        uint256 takerFee,
        uint256 minOrderSize
    ) external returns (bytes32 pairId);

    /// @notice Get trading pair info
    function getTradingPair(bytes32 pairId) external view returns (TradingPair memory);

    /// @notice Place a market order
    function placeMarketOrder(
        bytes32 pairId,
        TradeDirection direction,
        uint256 quantity
    ) external returns (uint256 orderId);

    /// @notice Place a limit order
    function placeLimitOrder(
        bytes32 pairId,
        TradeDirection direction,
        uint256 price,
        uint256 quantity,
        uint256 expiresAt
    ) external returns (uint256 orderId);

    /// @notice Cancel an order
    function cancelOrder(uint256 orderId) external returns (bool);

    /// @notice Get order details
    function getOrder(uint256 orderId) external view returns (Order memory);

    /// @notice Get user orders
    function getUserOrders(address user, uint256 limit, uint256 offset) 
        external view returns (Order[] memory);

    /// @notice Get order book for a pair
    function getOrderBook(bytes32 pairId) 
        external view returns (Order[] memory bids, Order[] memory asks);

    /// @notice Execute a trade (internal)
    function executeTrade(TradeExecution memory trade) external;

    /// @notice Add liquidity
    function addLiquidity(
        bytes32 pairId,
        uint256 baseAmount,
        uint256 quoteAmount
    ) external returns (uint256 lpTokens);

    /// @notice Remove liquidity
    function removeLiquidity(
        bytes32 pairId,
        uint256 lpTokens
    ) external returns (uint256 baseAmount, uint256 quoteAmount);

    /// @notice Get LP token balance
    function getLPBalance(bytes32 pairId, address user) external view returns (uint256);

    /// @notice Get pool reserves
    function getPoolReserves(bytes32 pairId) external view returns (uint256 baseReserve, uint256 quoteReserve);
}
