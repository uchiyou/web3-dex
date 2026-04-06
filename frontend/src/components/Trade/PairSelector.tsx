'use client'

import React, { useState } from 'react'
import { useDexStore, TradingPair } from '@/store'
import { SearchIcon, StarIcon, ChevronDownIcon } from '@/components/icons'

const MOCK_PAIRS: TradingPair[] = [
  { id: 'eth-usdt', baseToken: 'ETH', quoteToken: 'USDT', baseSymbol: 'ETH', quoteSymbol: 'USDT', price: 1850.42, change24h: 2.34, volume24h: 1234567890, high24h: 1870.00, low24h: 1800.00 },
  { id: 'btc-usdt', baseToken: 'BTC', quoteToken: 'USDT', baseSymbol: 'BTC', quoteSymbol: 'USDT', price: 43500.00, change24h: 1.21, volume24h: 2345678901, high24h: 44000.00, low24h: 42000.00 },
  { id: 'eth-btc', baseToken: 'ETH', quoteToken: 'BTC', baseSymbol: 'ETH', quoteSymbol: 'BTC', price: 0.0425, change24h: -0.85, volume24h: 567890123, high24h: 0.0435, low24h: 0.0418 },
  { id: 'sol-usdt', baseToken: 'SOL', quoteToken: 'USDT', baseSymbol: 'SOL', quoteSymbol: 'USDT', price: 98.50, change24h: 5.67, volume24h: 890123456, high24h: 102.00, low24h: 92.00 },
  { id: 'link-usdt', baseToken: 'LINK', quoteToken: 'USDT', baseSymbol: 'LINK', quoteSymbol: 'USDT', price: 14.25, change24h: 3.45, volume24h: 345678901, high24h: 15.00, low24h: 13.50 },
]

export function PairSelector() {
  const { activePair, setActivePair } = useDexStore()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>(['eth-usdt', 'btc-usdt'])

  const filteredPairs = MOCK_PAIRS.filter(
    (pair) =>
      pair.baseSymbol.toLowerCase().includes(search.toLowerCase()) ||
      pair.quoteSymbol.toLowerCase().includes(search.toLowerCase())
  )

  const favoritePairs = filteredPairs.filter((p) => favorites.includes(p.id))
  const otherPairs = filteredPairs.filter((p) => !favorites.includes(p.id))

  const toggleFavorite = (pairId: string) => {
    setFavorites((prev) =>
      prev.includes(pairId)
        ? prev.filter((id) => id !== pairId)
        : [...prev, pairId]
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-dark-300 rounded-lg hover:bg-dark-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">
            {activePair?.baseSymbol || 'ETH'}/{activePair?.quoteSymbol || 'USDT'}
          </span>
          <span
            className={`text-sm font-medium ${
              (activePair?.change24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {(activePair?.change24h || 0) >= 0 ? '+' : ''}
            {(activePair?.change24h || 0).toFixed(2)}%
          </span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 bg-dark-300 rounded-lg shadow-xl z-50 border border-dark-100">
            {/* Search */}
            <div className="p-3 border-b border-dark-100">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search pairs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-200 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Favorites */}
            {favoritePairs.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-gray-500 px-2 py-1">Favorites</p>
                {favoritePairs.map((pair) => (
                  <PairRow
                    key={pair.id}
                    pair={pair}
                    isActive={activePair?.id === pair.id}
                    isFavorite={true}
                    onSelect={() => {
                      setActivePair(pair)
                      setIsOpen(false)
                    }}
                    onToggleFavorite={() => toggleFavorite(pair.id)}
                  />
                ))}
              </div>
            )}

            {/* All Pairs */}
            <div className="p-2 border-t border-dark-100">
              <p className="text-xs text-gray-500 px-2 py-1">All Pairs</p>
              {otherPairs.map((pair) => (
                <PairRow
                  key={pair.id}
                  pair={pair}
                  isActive={activePair?.id === pair.id}
                  isFavorite={false}
                  onSelect={() => {
                    setActivePair(pair)
                    setIsOpen(false)
                  }}
                  onToggleFavorite={() => toggleFavorite(pair.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface PairRowProps {
  pair: TradingPair
  isActive: boolean
  isFavorite: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}

function PairRow({ pair, isActive, isFavorite, onSelect, onToggleFavorite }: PairRowProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-dark-200 ${
        isActive ? 'bg-primary-500/10' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className="text-gray-500 hover:text-yellow-500"
        >
          <StarIcon className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
        </button>
        <div>
          <span className="font-medium text-white">
            {pair.baseSymbol}/{pair.quoteSymbol}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-white">${pair.price.toLocaleString()}</p>
        <p className={`text-xs ${pair.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
        </p>
      </div>
    </div>
  )
}
