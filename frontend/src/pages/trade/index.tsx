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
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function TradePage() {
  const { address, isConnected } = useAccount()
  const { activePair } = useDexStore()
  const [showWalletModal, setShowWalletModal] = useState(false)

  const recentTrades = [
    { id: '1', price: 1850.42, quantity: 2.5, side: 'buy' as const, time: '12:34:56' },
    { id: '2', price: 1851.00, quantity: 1.2, side: 'sell' as const, time: '12:34:55' },
    { id: '3', price: 1850.80, quantity: 0.8, side: 'buy' as const, time: '12:34:54' },
    { id: '4', price: 1850.20, quantity: 3.1, side: 'sell' as const, time: '12:34:53' },
    { id: '5', price: 1849.50, quantity: 1.5, side: 'buy' as const, time: '12:34:52' },
    { id: '6', price: 1849.00, quantity: 0.9, side: 'sell' as const, time: '12:34:51' },
    { id: '7', price: 1848.80, quantity: 2.0, side: 'buy' as const, time: '12:34:50' },
    { id: '8', price: 1848.30, quantity: 1.8, side: 'sell' as const, time: '12:34:49' },
  ]

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="trade-panel text-center max-w-md w-full p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-light flex items-center justify-center">
            <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-3 tracking-tight">Connect Your Wallet</h1>
          <p className="text-secondary mb-6 text-sm leading-relaxed">
            Connect your wallet to start trading on the decentralized exchange.
          </p>
          <Button size="lg" onClick={() => setShowWalletModal(true)} className="w-full">
            Connect Wallet
          </Button>
        </div>
        {showWalletModal && <WalletModal onClose={() => setShowWalletModal(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto p-4">
        {/* Trade Header */}
        <div className="trade-header mb-3">
          <PairSelector />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted font-medium">Balance</p>
              <p className="text-base font-bold text-primary font-variant-numeric">10.2345 ETH</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-light flex items-center justify-center flex-shrink-0">
              <span className="text-blue font-semibold text-sm">
                {address ? `${address.slice(0, 2)}...${address.slice(-4)}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Column Grid */}
        <div className="trade-layout">
          {/* Left - Order Book */}
          <div>
            <Card className="h-full">
              <OrderBook bids={[]} asks={[]} />
            </Card>
          </div>

          {/* Center - Chart + Trades */}
          <div className="space-y-3">
            {/* Price Chart Card */}
            <div className="trade-panel">
              <div className="trade-panel-header">
                <div>
                  <span className="trade-panel-title">ETH/USDT</span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="chart-price">$1,850.42</p>
                    <p className="chart-change up">+2.34% (24h)</p>
                  </div>
                  <div className="chart-timeframes">
                    {['1H', '4H', '1D', '1W'].map((tf) => (
                      <button
                        key={tf}
                        className={`chart-tf-btn ${tf === '1H' ? 'active' : ''}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3">
                <PriceChart />
              </div>
            </div>

            {/* Recent Trades Card */}
            <Card>
              <RecentTrades trades={recentTrades} />
            </Card>
          </div>

          {/* Right - Trade Form */}
          <div>
            <div className="trade-panel sticky-top">
              <div className="trade-panel-header">
                <span className="trade-panel-title">Place Order</span>
                <span className="text-xs text-muted font-medium">ETH/USDT</span>
              </div>
              <TradeForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
