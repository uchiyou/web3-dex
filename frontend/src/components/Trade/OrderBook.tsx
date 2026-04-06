'use client'

import React from 'react'
import { formatEther } from 'viem'

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
    <div className="bg-dark-300 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">Order Book</h3>
      
      {/* Header */}
      <div className="grid grid-cols-3 text-xs text-gray-500 mb-2">
        <span>Price (USD)</span>
        <span className="text-right">Amount (ETH)</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sells) - Reversed order */}
      <div className="space-y-0.5 mb-2">
        {[...mockAsks].reverse().map((ask, i) => (
          <div key={`ask-${i}`} className="relative">
            <div
              className="absolute right-0 h-full bg-red-500/10"
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <div className="relative grid grid-cols-3 text-xs py-0.5">
              <span className="text-red-500">{ask.price.toFixed(2)}</span>
              <span className="text-right text-gray-300">{ask.quantity}</span>
              <span className="text-right text-gray-500">{ask.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="border-y border-dark-100 py-2 my-2">
        <div className="text-center">
          <span className="text-lg font-bold text-white">1,850.42</span>
          <span className="text-xs text-gray-500 ml-2">Spread: $0.38</span>
        </div>
      </div>

      {/* Bids (Buys) */}
      <div className="space-y-0.5">
        {mockBids.map((bid, i) => (
          <div key={`bid-${i}`} className="relative">
            <div
              className="absolute right-0 h-full bg-green-500/10"
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <div className="relative grid grid-cols-3 text-xs py-0.5">
              <span className="text-green-500">{bid.price.toFixed(2)}</span>
              <span className="text-right text-gray-300">{bid.quantity}</span>
              <span className="text-right text-gray-500">{bid.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
