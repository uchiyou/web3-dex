'use client'

import React from 'react'

interface OrderBookProps {
  bids: Array<{ price: bigint; quantity: bigint }>
  asks: Array<{ price: bigint; quantity: bigint }>
}

export function OrderBook({ bids, asks }: OrderBookProps) {
  // Use mock data for display
  const mockBids = [
    { price: 1850.20, quantity: 12.5, total: 23127.50 },
    { price: 1850.00, quantity: 8.3, total: 15355.00 },
    { price: 1849.50, quantity: 15.2, total: 28112.40 },
    { price: 1849.00, quantity: 6.8, total: 12573.20 },
    { price: 1848.50, quantity: 22.1, total: 40851.85 },
  ]

  const mockAsks = [
    { price: 1850.80, quantity: 5.2, total: 9624.16 },
    { price: 1851.00, quantity: 9.7, total: 17954.70 },
    { price: 1851.50, quantity: 14.3, total: 26476.45 },
    { price: 1852.00, quantity: 7.6, total: 14075.20 },
    { price: 1852.50, quantity: 11.2, total: 20748.00 },
  ]

  const maxTotal = Math.max(
    ...mockBids.map((b) => b.total),
    ...mockAsks.map((a) => a.total)
  )

  return (
    <div>
      <h3 className="text-sm font-semibold text-binance-text-muted mb-3">Order Book</h3>
      
      {/* Header */}
      <div className="grid grid-cols-3 text-xs text-binance-text-muted mb-2 px-1">
        <span>Price (USD)</span>
        <span className="text-right">Amount (ETH)</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sells) - Reversed order */}
      <div className="space-y-0.5 mb-1">
        {[...mockAsks].reverse().map((ask, i) => (
          <div key={`ask-${i}`} className="relative">
            <div
              className="absolute right-0 h-full bg-sell/10"
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <div className="relative grid grid-cols-3 text-xs py-0.5 px-1">
              <span className="text-sell">{ask.price.toFixed(2)}</span>
              <span className="text-right text-binance-text">{ask.quantity}</span>
              <span className="text-right text-binance-text-muted">{ask.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="border-y border-binance-border py-2 my-2">
        <div className="text-center">
          <span className="text-lg font-bold text-binance-text">1,850.42</span>
          <span className="text-xs text-binance-text-muted ml-2">Spread: $0.38</span>
        </div>
      </div>

      {/* Bids (Buys) */}
      <div className="space-y-0.5">
        {mockBids.map((bid, i) => (
          <div key={`bid-${i}`} className="relative">
            <div
              className="absolute right-0 h-full bg-buy/10"
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <div className="relative grid grid-cols-3 text-xs py-0.5 px-1">
              <span className="text-buy">{bid.price.toFixed(2)}</span>
              <span className="text-right text-binance-text">{bid.quantity}</span>
              <span className="text-right text-binance-text-muted">{bid.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
