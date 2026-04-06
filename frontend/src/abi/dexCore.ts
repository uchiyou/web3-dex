export const DEX_CORE_ABI = [
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "baseToken", "type": "address" },
      { "internalType": "address", "name": "quoteToken", "type": "address" },
      { "internalType": "uint256", "name": "makerFee", "type": "uint256" },
      { "internalType": "uint256", "name": "takerFee", "type": "uint256" },
      { "internalType": "uint256", "name": "minOrderSize", "type": "uint256" }
    ],
    "name": "createTradingPair",
    "outputs": [{ "internalType": "bytes32", "name": "pairId", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "pairId", "type": "bytes32" }],
    "name": "getTradingPair",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "baseToken", "type": "address" },
          { "internalType": "address", "name": "quoteToken", "type": "address" },
          { "internalType": "uint256", "name": "makerFee", "type": "uint256" },
          { "internalType": "uint256", "name": "takerFee", "type": "uint256" },
          { "internalType": "uint256", "name": "minOrderSize", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "internalType": "struct IDexCore.TradingPair",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "pairId", "type": "bytes32" },
      { "internalType": "uint8", "name": "direction", "type": "uint8" },
      { "internalType": "uint256", "name": "quantity", "type": "uint256" }
    ],
    "name": "placeMarketOrder",
    "outputs": [{ "internalType": "uint256", "name": "orderId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "pairId", "type": "bytes32" },
      { "internalType": "uint8", "name": "direction", "type": "uint8" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "uint256", "name": "quantity", "type": "uint256" },
      { "internalType": "uint256", "name": "expiresAt", "type": "uint256" }
    ],
    "name": "placeLimitOrder",
    "outputs": [{ "internalType": "uint256", "name": "orderId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "orderId", "type": "uint256" }],
    "name": "cancelOrder",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "orderId", "type": "uint256" }],
    "name": "getOrder",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "orderId", "type": "uint256" },
          { "internalType": "address", "name": "trader", "type": "address" },
          { "internalType": "address", "name": "baseToken", "type": "address" },
          { "internalType": "address", "name": "quoteToken", "type": "address" },
          { "internalType": "uint8", "name": "direction", "type": "uint8" },
          { "internalType": "uint8", "name": "orderType", "type": "uint8" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "quantity", "type": "uint256" },
          { "internalType": "uint256", "name": "filledQuantity", "type": "uint256" },
          { "internalType": "uint8", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "expiresAt", "type": "uint256" }
        ],
        "internalType": "struct IDexCore.Order",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "pairId", "type": "bytes32" }],
    "name": "getOrderBook",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "orderId", "type": "uint256" },
          { "internalType": "address", "name": "trader", "type": "address" },
          { "internalType": "address", "name": "baseToken", "type": "address" },
          { "internalType": "address", "name": "quoteToken", "type": "address" },
          { "internalType": "uint8", "name": "direction", "type": "uint8" },
          { "internalType": "uint8", "name": "orderType", "type": "uint8" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "quantity", "type": "uint256" },
          { "internalType": "uint256", "name": "filledQuantity", "type": "uint256" },
          { "internalType": "uint8", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "expiresAt", "type": "uint256" }
        ],
        "internalType": "struct IDexCore.Order[]",
        "name": "bids",
        "type": "tuple[]"
      },
      {
        "components": [
          { "internalType": "uint256", "name": "orderId", "type": "uint256" },
          { "internalType": "address", "name": "trader", "type": "address" },
          { "internalType": "address", "name": "baseToken", "type": "address" },
          { "internalType": "address", "name": "quoteToken", "type": "address" },
          { "internalType": "uint8", "name": "direction", "type": "uint8" },
          { "internalType": "uint8", "name": "orderType", "type": "uint8" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "quantity", "type": "uint256" },
          { "internalType": "uint256", "name": "filledQuantity", "type": "uint256" },
          { "internalType": "uint8", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "expiresAt", "type": "uint256" }
        ],
        "internalType": "struct IDexCore.Order[]",
        "name": "asks",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "pairId", "type": "bytes32" }],
    "name": "getPoolReserves",
    "outputs": [
      { "internalType": "uint256", "name": "baseReserve", "type": "uint256" },
      { "internalType": "uint256", "name": "quoteReserve", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "pairId", "type": "bytes32" },
      { "internalType": "uint256", "name": "baseAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "quoteAmount", "type": "uint256" }
    ],
    "name": "addLiquidity",
    "outputs": [{ "internalType": "uint256", "name": "lpTokens", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "pairId", "type": "bytes32" },
      { "internalType": "uint256", "name": "lpTokens", "type": "uint256" }
    ],
    "name": "removeLiquidity",
    "outputs": [
      { "internalType": "uint256", "name": "baseAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "quoteAmount", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "pairId", "type": "bytes32" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getLPBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const
