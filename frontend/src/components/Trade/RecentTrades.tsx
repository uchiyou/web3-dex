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
      <div className="trade-panel-header">
        <span className="trade-panel-title">Recent Trades</span>
      </div>

      <div className="rt-header">
        <span>Price (USD)</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Time</span>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
        {trades.map((trade) => (
          <div key={trade.id} className="rt-row">
            <span className={`rt-price ${trade.side}`}>
              {trade.price.toFixed(2)}
            </span>
            <span className="rt-amount">{trade.quantity}</span>
            <span className="rt-time">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
