'use client'

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const generateChartData = () => {
  const data = []
  let price = 1800
  for (let i = 0; i < 48; i++) {
    price += (Math.random() - 0.45) * 20
    price = Math.max(1750, Math.min(1900, price))
    data.push({ time: i, price })
  }
  return data
}

const chartData = generateChartData()

export function PriceChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1677FF" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#1677FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#999999' }}
            tickFormatter={(value) => `${value}h`}
          />
          <YAxis
            domain={['dataMin - 20', 'dataMax + 20']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#999999' }}
            tickFormatter={(value) => `$${value}`}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8E8E8',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              fontSize: 13,
            }}
            labelStyle={{ color: '#999999', fontSize: 11 }}
            itemStyle={{ color: '#111111', fontSize: 14, fontWeight: 600 }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#1677FF"
            strokeWidth={2}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
