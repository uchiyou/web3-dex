// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IDexCore} from "../interfaces/IDexCore.sol";
import {SafeMath, MathUtils} from "../libraries/SafeMath.sol";
import {IERC20} from "../interfaces/IERC20.sol";

/**
 * @title DexCore
 * @notice Main DEX contract with Order Book + AMM hybrid model
 * @dev Combines limit order book for large trades with AMM for liquidity
 */
contract DexCore is IDexCore {
    using SafeMath for uint256;

    /// @notice Contract owner
    address public owner;
    
    /// @notice Fee recipient address
    address public feeRecipient;
    
    /// @notice Trading pair mapping: pairId => TradingPair
    mapping(bytes32 => TradingPair) public tradingPairs;
    
    /// @notice Order mapping: orderId => Order
    mapping(uint256 => Order) public orders;
    
    /// @notice User orders mapping: user => orderIds[]
    mapping(address => uint256[]) public userOrderIds;
    
    /// @notice Order book: pairId => bids (buy orders)
    mapping(bytes32 => Order[]) public bidOrders;
    
    /// @notice Order book: pairId => asks (sell orders)
    mapping(bytes32 => Order[]) public askOrders;
    
    /// @notice Liquidity pools: pairId => baseReserve
    mapping(bytes32 => uint256) public baseReserves;
    
    /// @notice Liquidity pools: pairId => quoteReserve
    mapping(bytes32 => uint256) public quoteReserves;
    
    /// @notice LP tokens: pairId => user => balance
    mapping(bytes32 => mapping(address => uint256)) public lpBalances;
    
    /// @notice Total LP supply per pair
    mapping(bytes32 => uint256) public totalLPSupply;
    
    /// @notice Order ID counter
    uint256 public orderIdCounter;
    
    /// @notice Minimum order size default
    uint256 public constant MIN_ORDER_SIZE = 1e15; // 0.001 ETH
    
    /// @notice Events
    event TradingPairCreated(bytes32 indexed pairId, address baseToken, address quoteToken);
    event OrderPlaced(uint256 indexed orderId, address indexed trader, bytes32 pairId);
    event OrderFilled(uint256 indexed orderId, uint256 filledQuantity, uint256 price);
    event OrderCancelled(uint256 indexed orderId, address indexed trader);
    event LiquidityAdded(bytes32 indexed pairId, address indexed provider, uint256 baseAmount, uint256 quoteAmount);
    event LiquidityRemoved(bytes32 indexed pairId, address indexed provider, uint256 baseAmount, uint256 quoteAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "DexCore: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        feeRecipient = msg.sender;
        orderIdCounter = 1;
    }

    /**
     * @notice Create a new trading pair
     */
    function createTradingPair(
        address baseToken,
        address quoteToken,
        uint256 makerFee,
        uint256 takerFee,
        uint256 minOrderSize
    ) external override onlyOwner returns (bytes32 pairId) {
        require(baseToken != address(0) && quoteToken != address(0), "DexCore: invalid tokens");
        require(baseToken != quoteToken, "DexCore: same tokens");
        require(makerFee < 10000 && takerFee < 10000, "DexCore: fee too high");
        
        pairId = keccak256(abi.encodePacked(baseToken, quoteToken));
        
        tradingPairs[pairId] = TradingPair({
            baseToken: baseToken,
            quoteToken: quoteToken,
            makerFee: makerFee,
            takerFee: takerFee,
            minOrderSize: minOrderSize > 0 ? minOrderSize : MIN_ORDER_SIZE,
            isActive: true
        });
        
        emit TradingPairCreated(pairId, baseToken, quoteToken);
    }

    /**
     * @notice Get trading pair info
     */
    function getTradingPair(bytes32 pairId) external view override returns (TradingPair memory) {
        return tradingPairs[pairId];
    }

    /**
     * @notice Place a market order
     */
    function placeMarketOrder(
        bytes32 pairId,
        TradeDirection direction,
        uint256 quantity
    ) external override returns (uint256 orderId) {
        TradingPair memory pair = tradingPairs[pairId];
        require(pair.isActive, "DexCore: pair not active");
        require(quantity >= pair.minOrderSize, "DexCore: order too small");
        
        // For market orders, find best price in order book or use AMM
        uint256 executionPrice = _findMarketPrice(pairId, direction, quantity);
        require(executionPrice > 0, "DexCore: no liquidity");
        
        orderId = _createOrder(pairId, direction, OrderType.MARKET, executionPrice, quantity, 0);
        
        // Immediately fill market order
        _fillOrder(orderId, quantity);
    }

    /**
     * @notice Place a limit order
     */
    function placeLimitOrder(
        bytes32 pairId,
        TradeDirection direction,
        uint256 price,
        uint256 quantity,
        uint256 expiresAt
    ) external override returns (uint256 orderId) {
        TradingPair memory pair = tradingPairs[pairId];
        require(pair.isActive, "DexCore: pair not active");
        require(price > 0, "DexCore: invalid price");
        require(quantity >= pair.minOrderSize, "DexCore: order too small");
        
        // Check if order can be matched immediately
        uint256 matchableQty = _getMatchableQuantity(pairId, direction, price);
        
        if (matchableQty > 0) {
            // Partially match immediately
            orderId = _createOrder(pairId, direction, OrderType.LIMIT, price, quantity, expiresAt);
            _fillOrder(orderId, MathUtils.clamp(matchableQty, 1, quantity));
        } else {
            orderId = _createOrder(pairId, direction, OrderType.LIMIT, price, quantity, expiresAt);
            _addToOrderBook(pairId, orderId, direction);
        }
        
        emit OrderPlaced(orderId, msg.sender, pairId);
    }

    /**
     * @notice Cancel an order
     */
    function cancelOrder(uint256 orderId) external override returns (bool) {
        Order storage order = orders[orderId];
        require(order.orderId == orderId, "DexCore: order not found");
        require(order.trader == msg.sender, "DexCore: not your order");
        require(order.status == OrderStatus.PENDING || order.status == OrderStatus.PARTIALLY_FILLED, 
            "DexCore: cannot cancel");
        
        // Return unfilled quantity
        uint256 unfilled = order.quantity.sub(order.filledQuantity);
        if (unfilled > 0) {
            if (order.direction == TradeDirection.BUY) {
                // Return quote tokens
                uint256 quoteReturn = unfilled.mul(order.price);
                IERC20(order.quoteToken).transfer(msg.sender, quoteReturn);
            } else {
                // Return base tokens
                IERC20(order.baseToken).transfer(msg.sender, unfilled);
            }
        }
        
        order.status = OrderStatus.CANCELLED;
        emit OrderCancelled(orderId, msg.sender);
        return true;
    }

    /**
     * @notice Get order details
     */
    function getOrder(uint256 orderId) external view override returns (Order memory) {
        return orders[orderId];
    }

    /**
     * @notice Get user orders
     */
    function getUserOrders(address user, uint256 limit, uint256 offset) 
        external view override returns (Order[] memory) {
        uint256[] storage ids = userOrderIds[user];
        uint256 total = ids.length;
        
        if (offset >= total) return new Order[](0);
        
        uint256 size = MathUtils.clamp(limit, 1, total.sub(offset));
        Order[] memory result = new Order[](size);
        
        for (uint256 i = 0; i < size; i++) {
            result[i] = orders[ids[offset.add(i)]];
        }
        return result;
    }

    /**
     * @notice Get order book for a pair
     */
    function getOrderBook(bytes32 pairId) 
        external view override returns (Order[] memory bids, Order[] memory asks) {
        return (bidOrders[pairId], askOrders[pairId]);
    }

    /**
     * @notice Add liquidity to the pool
     */
    function addLiquidity(
        bytes32 pairId,
        uint256 baseAmount,
        uint256 quoteAmount
    ) external override returns (uint256 lpTokens) {
        TradingPair memory pair = tradingPairs[pairId];
        require(pair.isActive, "DexCore: pair not active");
        
        // Transfer tokens
        IERC20(pair.baseToken).transferFrom(msg.sender, address(this), baseAmount);
        IERC20(pair.quoteToken).transferFrom(msg.sender, address(this), quoteAmount);
        
        // Calculate LP tokens
        uint256 totalBase = baseReserves[pairId];
        uint256 totalQuote = quoteReserves[pairId];
        
        if (totalBase == 0 && totalQuote == 0) {
            lpTokens = MathUtils.sqrt(baseAmount.mul(quoteAmount));
        } else {
            uint256 lpBase = baseAmount.mul(totalLPSupply[pairId]) / totalBase;
            uint256 lpQuote = quoteAmount.mul(totalLPSupply[pairId]) / totalQuote;
            lpTokens = lpBase < lpQuote ? lpBase : lpQuote;
        }
        
        require(lpTokens > 0, "DexCore: invalid liquidity amount");
        
        // Update reserves
        baseReserves[pairId] = totalBase.add(baseAmount);
        quoteReserves[pairId] = totalQuote.add(quoteAmount);
        lpBalances[pairId][msg.sender] = lpBalances[pairId][msg.sender].add(lpTokens);
        totalLPSupply[pairId] = totalLPSupply[pairId].add(lpTokens);
        
        emit LiquidityAdded(pairId, msg.sender, baseAmount, quoteAmount);
    }

    /**
     * @notice Remove liquidity from the pool
     */
    function removeLiquidity(
        bytes32 pairId,
        uint256 lpTokens
    ) external override returns (uint256 baseAmount, uint256 quoteAmount) {
        require(lpTokens > 0, "DexCore: invalid amount");
        require(lpBalances[pairId][msg.sender] >= lpTokens, "DexCore: insufficient LP");
        
        uint256 totalLP = totalLPSupply[pairId];
        baseAmount = lpTokens.mul(baseReserves[pairId]) / totalLP;
        quoteAmount = lpTokens.mul(quoteReserves[pairId]) / totalLP;
        
        // Update state
        lpBalances[pairId][msg.sender] = lpBalances[pairId][msg.sender].sub(lpTokens);
        totalLPSupply[pairId] = totalLP.sub(lpTokens);
        baseReserves[pairId] = baseReserves[pairId].sub(baseAmount);
        quoteReserves[pairId] = quoteReserves[pairId].sub(quoteAmount);
        
        // Transfer tokens
        TradingPair memory pair = tradingPairs[pairId];
        IERC20(pair.baseToken).transfer(msg.sender, baseAmount);
        IERC20(pair.quoteToken).transfer(msg.sender, quoteAmount);
        
        emit LiquidityRemoved(pairId, msg.sender, baseAmount, quoteAmount);
    }

    /**
     * @notice Get LP token balance
     */
    function getLPBalance(bytes32 pairId, address user) external view override returns (uint256) {
        return lpBalances[pairId][user];
    }

    /**
     * @notice Get pool reserves
     */
    function getPoolReserves(bytes32 pairId) external view override returns (uint256 baseReserve, uint256 quoteReserve) {
        return (baseReserves[pairId], quoteReserves[pairId]);
    }

    /**
     * @notice Execute a trade (internal)
     */
    function executeTrade(TradeExecution memory trade) external override {
        // This would be called by the trade executor
    }

    // ============ Internal Functions ============

    function _createOrder(
        bytes32 pairId,
        TradeDirection direction,
        OrderType orderType,
        uint256 price,
        uint256 quantity,
        uint256 expiresAt
    ) internal returns (uint256 orderId) {
        TradingPair memory pair = tradingPairs[pairId];
        
        // Transfer tokens for buy orders
        if (direction == TradeDirection.BUY) {
            uint256 totalCost = quantity.mul(price);
            IERC20(pair.quoteToken).transferFrom(msg.sender, address(this), totalCost);
        } else {
            IERC20(pair.baseToken).transferFrom(msg.sender, address(this), quantity);
        }
        
        orderId = orderIdCounter++;
        
        orders[orderId] = Order({
            orderId: orderId,
            trader: msg.sender,
            baseToken: pair.baseToken,
            quoteToken: pair.quoteToken,
            direction: direction,
            orderType: orderType,
            price: price,
            quantity: quantity,
            filledQuantity: 0,
            status: OrderStatus.PENDING,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });
        
        userOrderIds[msg.sender].push(orderId);
    }

    function _fillOrder(uint256 orderId, uint256 fillQuantity) internal {
        Order storage order = orders[orderId];
        TradingPair memory pair = tradingPairs[keccak256(abi.encodePacked(order.baseToken, order.quoteToken))];
        
        uint256 fillValue = fillQuantity.mul(order.price);
        uint256 fee = MathUtils.percentage(fillValue, pair.takerFee);
        
        if (order.direction == TradeDirection.BUY) {
            // Transfer base tokens to buyer
            IERC20(order.baseToken).transfer(order.trader, fillQuantity);
            // Refund excess quote tokens
            uint256 cost = fillQuantity.mul(order.price);
            uint256 excess = cost.add(fee);
            IERC20(order.quoteToken).transfer(order.trader, cost.add(fee).sub(cost));
        } else {
            // Transfer quote tokens to seller
            IERC20(order.quoteToken).transfer(order.trader, fillValue.sub(fee));
        }
        
        // Pay fee to fee recipient
        IERC20(order.quoteToken).transfer(feeRecipient, fee);
        
        order.filledQuantity = order.filledQuantity.add(fillQuantity);
        
        if (order.filledQuantity >= order.quantity) {
            order.status = OrderStatus.FILLED;
        } else {
            order.status = OrderStatus.PARTIALLY_FILLED;
        }
        
        emit OrderFilled(orderId, fillQuantity, order.price);
    }

    function _findMarketPrice(bytes32 pairId, TradeDirection direction, uint256 quantity) 
        internal view returns (uint256) {
        // First check order book
        Order[] storage orders = direction == TradeDirection.BUY ? bidOrders[pairId] : askOrders[pairId];
        
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].quantity >= quantity) {
                return orders[i].price;
            }
        }
        
        // Fall back to AMM price
        (uint256 baseReserve, uint256 quoteReserve) = getPoolReserves(pairId);
        if (baseReserve > 0 && quoteReserve > 0) {
            if (direction == TradeDirection.BUY) {
                // Buy base with quote
                return quoteReserve / baseReserve; // Simplified AMM price
            } else {
                return quoteReserve / baseReserve;
            }
        }
        
        return 0;
    }

    function _getMatchableQuantity(bytes32 pairId, TradeDirection direction, uint256 price) 
        internal view returns (uint256) {
        Order[] storage orders = direction == TradeDirection.BUY ? askOrders[pairId] : bidOrders[pairId];
        uint256 totalMatchable = 0;
        
        for (uint256 i = 0; i < orders.length; i++) {
            bool canMatch = direction == TradeDirection.BUY 
                ? orders[i].price <= price 
                : orders[i].price >= price;
            
            if (canMatch) {
                totalMatchable = totalMatchable.add(orders[i].quantity);
            }
        }
        
        return totalMatchable;
    }

    function _addToOrderBook(bytes32 pairId, uint256 orderId, TradeDirection direction) internal {
        if (direction == TradeDirection.BUY) {
            bidOrders[pairId].push(orders[orderId]);
        } else {
            askOrders[pairId].push(orders[orderId]);
        }
    }

    // ============ Admin Functions ============

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "DexCore: invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    function setPairActive(bytes32 pairId, bool active) external onlyOwner {
        tradingPairs[pairId].isActive = active;
    }
}
