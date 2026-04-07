'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useDexStore } from '@/store'
import { OrderBook } from '@/components/Trade/OrderBook'
import { TradeForm } from '@/components/Trade/TradeForm'
import { RecentTrades } from '@/components/Trade/RecentTrades'
import { PairSelector } from '@/components/Trade/PairSelector'
import { PriceChart } from '@/components/Trade/PriceChart'
import { WalletModal } from '@/components/common/WalletModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function TradePage() {
  const { address, isConnected } = useAccount()
  const { activePair } = useDexStore()
  const [showWalletModal, setShowWalletModal] = useState(false)
  
  // Mock pair data
  const pairId = '0x' + '11'.repeat(32) as `0x${string}`
  
  // Mock recent trades
  const recentTrades = [
    { id: '1', price: 1850.42, quantity: 2.5, side: 'buy' as const, time: '12:34:56' },
    { id: '2', price: 1851.00, quantity: 1.2, side: 'sell' as const, time: '12:34:55' },
    { id: '3', price: 1850.80, quantity: 0.8, side: 'buy' as const, time: '12:34:54' },
    { id: '4', price: 1850.20, quantity: 3.1, side: 'sell' as const, time: '12:34:53' },
    { id: '5', price: 1849.50, quantity: 1.5, side: 'buy' as const, time: '12:34:52' },
  ]

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-binance-bg flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center border-binance-border">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-binance-gold/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-binance-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-binance-text mb-3">Connect Your Wallet</h1>
          <p className="text-binance-text-muted mb-6">
            Connect your wallet to start trading on the decentralized exchange.
          </p>
          <Button size="lg" onClick={() => setShowWalletModal(true)} className="bg-binance-gold hover:bg-binance-gold/90 text-binance-bg font-semibold">
            Connect Wallet
          </Button>
        </Card>
        {showWalletModal && <WalletModal onClose={() => setShowWalletModal(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-binance-bg">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <PairSelector />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-binance-text-muted">Balance</p>
              <p className="text-lg font-semibold text-binance-text">
                10.2345 ETH
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-binance-gold/20 flex items-center justify-center">
              <span className="text-binance-gold font-medium text-sm">
                {address?.slice(0, 2)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid - 3 Column Layout */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Order Book */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="p-3 border-binance-border">
              <OrderBook bids={[]} asks={[]} />
            </Card>
          </div>

          {/* Center Column - Chart */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            {/* Price Chart */}
            <Card className="p-4 border-binance-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-binance-text">ETH/USDT</h2>
                  <p className="text-2xl font-bold text-binance-text">$1,850.42</p>
                  <p className="text-sm text-buy">+2.34% (24h)</p>
                </div>
                <div className="flex gap-1">
                  {['1H', '4H', '1D', '1W'].map((tf, idx) => (
                    <button
                      key={tf}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        tf === '1H' 
                          ? 'bg-binance-gold text-binance-bg' 
                          : 'bg-transparent text-binance-text-muted hover:bg-binance-border'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <PriceChart />
            </Card>

            {/* Recent Trades */}
            <Card className="p-3 border-binance-border">
              <RecentTrades trades={recentTrades} />
            </Card>
          </div>

          {/* Right Column - Trade Form */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="p-4 border-binance-border sticky top-4">
              <TradeForm />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
