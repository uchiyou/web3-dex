'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

// Mock data for the chart
const generateChartData = () => {
  const data = []
  let price = 1800
  for (let i = 0; i < 48; i++) {
    price += (Math.random() - 0.45) * 20
    price = Math.max(1750, Math.min(1900, price))
    data.push({
      time: i,
      price: price,
      volume: Math.random() * 1000000,
    })
  }
  return data
}

const chartData = generateChartData()

export function PriceChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F0B90B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#848E9C' }}
            tickFormatter={(value) => `${value}h`}
          />
          <YAxis
            domain={['dataMin - 20', 'dataMax + 20']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#848E9C' }}
            tickFormatter={(value) => `$${value}`}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E2026',
              border: '1px solid #2A2E39',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            }}
            labelStyle={{ color: '#848E9C', fontSize: 12 }}
            itemStyle={{ color: '#EAECEF', fontSize: 14 }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#F0B90B"
            strokeWidth={2}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
