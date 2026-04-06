'use client'

import React from 'react'

interface Trade {
  id: string
  price: number
  quantity: number
  side: 'buy' | 'sell'
  time: string
}

interface RecentTradesProps {
  trades: Trade[]
}

export function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <div className="bg-dark-300 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Trades</h3>
      
      {/* Header */}
      <div className="grid grid-cols-3 text-xs text-gray-500 mb-2">
        <span>Price (USD)</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Time</span>
      </div>

      {/* Trades */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-3 text-xs py-1 hover:bg-dark-200 rounded"
          >
            <span className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
              {trade.price.toFixed(2)}
            </span>
            <span className="text-right text-gray-300">{trade.quantity}</span>
            <span className="text-right text-gray-500">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
