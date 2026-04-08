'use client'

import React from 'react'

interface OrderBookProps {
  bids: Array<{ price: bigint; quantity: bigint }>
  asks: Array<{ price: bigint; quantity: bigint }>
}

export function OrderBook({ bids, asks }: OrderBookProps) {
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
      <div className="trade-panel-header">
        <span className="trade-panel-title">Order Book</span>
        <span className="text-xs text-muted font-medium">ETH/USDT</span>
      </div>

      {/* Header */}
      <div className="ob-header">
        <span>Price (USD)</span>
        <span className="text-right">Amount (ETH)</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sells) */}
      <div className="space-y-0.5">
        {[...mockAsks].reverse().map((ask, i) => (
          <div key={`ask-${i}`} className="ob-row">
            <div
              className="ob-bar ask"
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <span className="ob-price ask relative z-10">{ask.price.toFixed(2)}</span>
            <span className="ob-amount relative z-10">{ask.quantity}</span>
            <span className="ob-total relative z-10">{ask.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="ob-spread">
        <span className="ob-mid-price">1,850.42</span>
        <span className="ob-spread-label">Spread: $0.38</span>
      </div>

      {/* Bids (Buys) */}
      <div className="space-y-0.5">
        {mockBids.map((bid, i) => (
          <div key={`bid-${i}`} className="ob-row">
            <div
              className="ob-bar bid"
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <span className="ob-price bid relative z-10">{bid.price.toFixed(2)}</span>
            <span className="ob-amount relative z-10">{bid.quantity}</span>
            <span className="ob-total relative z-10">{bid.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
