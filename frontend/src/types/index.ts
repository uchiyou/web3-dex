// Trading Types
export interface TradingPair {
  id: string
  pairId: string
  baseToken: string
  quoteToken: string
  baseSymbol: string
  quoteSymbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  makerFee: number
  takerFee: number
  minOrderSize: number
  isActive: boolean
}

export interface OrderBookEntry {
  price: number
  quantity: number
  orders: number
  total?: number
}

export interface OrderBook {
  pairId: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  spread: number
  timestamp: number
}

export interface Trade {
  id: string
  pairId: string
  price: number
  quantity: number
  side: 'buy' | 'sell'
  fee: number
  txHash: string
  timestamp: number
}

export interface Order {
  id: string
  orderId: string
  pair: string
  pairId: string
  direction: 'buy' | 'sell'
  orderType: 'market' | 'limit'
  price: number
  quantity: number
  filledQuantity: number
  status: 'pending' | 'filled' | 'partiallyfilled' | 'cancelled' | 'expired'
  createdAt: number
  expiresAt?: number
}

// Pool Types
export interface LiquidityPool {
  id: string
  pairId: string
  pair: string
  baseToken: string
  quoteToken: string
  baseReserve: number
  quoteReserve: number
  lpSupply: number
  apr: number
}

export interface LPPosition {
  id: string
  poolId: string
  pair: string
  lpBalance: number
  value: number
  sharePercent: number
}

// User Types
export interface User {
  id: string
  address: string
  username?: string
  email?: string
  referralCode: string
  totalVolume: number
  totalFees: number
  referralEarnings: number
  createdAt: number
}

export interface UserStats {
  totalTrades: number
  totalBuys: number
  totalSells: number
  totalFeesPaid: number
  estimatedPnL: number
}

// Referral Types
export interface ReferralInfo {
  referralCode: string
  totalReferrals: number
  totalEarnings: number
  referrals: ReferralUser[]
}

export interface ReferralUser {
  address: string
  username?: string
  trades: number
  volume: number
  earnings: number
  joinedAt: number
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// WebSocket Event Types
export interface PriceUpdateEvent {
  pairId: string
  price: number
  change24h: number
  timestamp: number
}

export interface OrderBookUpdateEvent {
  pairId: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  timestamp: number
}

export interface TradeEvent {
  id: string
  pairId: string
  price: number
  quantity: number
  side: 'buy' | 'sell'
  timestamp: number
}

// Chart Types
export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Ticker {
  pairId: string
  lastPrice: number
  openPrice: number
  high24h: number
  low24h: number
  volume24h: number
  change24h: number
}
