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
    <div>
      <h3 className="text-sm font-semibold text-binance-text-muted mb-3">Recent Trades</h3>
      
      {/* Header */}
      <div className="grid grid-cols-3 text-xs text-binance-text-muted mb-2 px-1">
        <span>Price (USD)</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Time</span>
      </div>

      {/* Trades */}
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-3 text-xs py-1 px-1 hover:bg-binance-border/50 rounded transition-colors"
          >
            <span className={trade.side === 'buy' ? 'text-buy' : 'text-sell'}>
              {trade.price.toFixed(2)}
            </span>
            <span className="text-right text-binance-text">{trade.quantity}</span>
            <span className="text-right text-binance-text-muted">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
