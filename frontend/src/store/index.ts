import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface TradingPair {
  id: string
  baseToken: string
  quoteToken: string
  baseSymbol: string
  quoteSymbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
}

export interface Order {
  id: string
  pair: string
  type: 'market' | 'limit'
  side: 'buy' | 'sell'
  price: number
  quantity: number
  filled: number
  status: 'pending' | 'filled' | 'cancelled'
  timestamp: number
}

export interface LiquidityPool {
  id: string
  pair: string
  baseReserve: number
  quoteReserve: number
  lpSupply: number
  apr: number
}

export interface UserStats {
  totalVolume: number
  totalFees: number
  totalReferrals: number
  referralEarnings: number
}

interface DexStore {
  // Trading pairs
  pairs: TradingPair[]
  activePair: TradingPair | null
  setActivePair: (pair: TradingPair) => void
  updatePairPrice: (pairId: string, price: number, change: number) => void
  
  // Orders
  orders: Order[]
  addOrder: (order: Order) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  cancelOrder: (orderId: string) => void
  
  // Liquidity pools
  pools: LiquidityPool[]
  addPool: (pool: LiquidityPool) => void
  
  // User stats
  userStats: UserStats
  
  // UI State
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useDexStore = create<DexStore>()(
  persist(
    (set, get) => ({
      // Trading pairs
      pairs: [],
      activePair: null,
      setActivePair: (pair) => set({ activePair: pair }),
      updatePairPrice: (pairId, price, change) =>
        set((state) => ({
          pairs: state.pairs.map((p) =>
            p.id === pairId ? { ...p, price, change24h: change } : p
          ),
        })),

      // Orders
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (orderId, updates) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, ...updates } : o
          ),
        })),
      cancelOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' as const } : o
          ),
        })),

      // Liquidity pools
      pools: [],
      addPool: (pool) => set((state) => ({ pools: [...state.pools, pool] })),

      // User stats
      userStats: {
        totalVolume: 0,
        totalFees: 0,
        totalReferrals: 0,
        referralEarnings: 0,
      },

      // UI State
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'dex-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)

// WebSocket connection store
interface WSStore {
  connected: boolean
  setConnected: (connected: boolean) => void
}

export const useWSStore = create<WSStore>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
}))
