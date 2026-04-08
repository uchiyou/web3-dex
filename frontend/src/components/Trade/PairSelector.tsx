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

  const active = activePair || MOCK_PAIRS[0]
  const changeUp = active.change24h >= 0

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pair-btn"
      >
        <div className="flex items-center gap-2">
          <span className="pair-symbol">
            {active.baseSymbol}/{active.quoteSymbol}
          </span>
          <span className={`pair-change ${changeUp ? 'up' : 'down'}`}>
            {changeUp ? '+' : ''}{active.change24h.toFixed(2)}%
          </span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="pair-dropdown">
            {/* Search */}
            <div className="pair-search">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search pairs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pair-search-input"
                  autoFocus
                />
              </div>
            </div>

            {/* Favorites */}
            {favoritePairs.length > 0 && (
              <div>
                <p className="pair-section-label">Favorites</p>
                {favoritePairs.map((pair) => (
                  <PairRow
                    key={pair.id}
                    pair={pair}
                    isActive={activePair?.id === pair.id}
                    isFavorite={true}
                    onSelect={() => { setActivePair(pair); setIsOpen(false) }}
                    onToggleFavorite={() => toggleFavorite(pair.id)}
                  />
                ))}
              </div>
            )}

            {/* All Pairs */}
            <div className="border-t border-color">
              <p className="pair-section-label">All Pairs</p>
              {otherPairs.map((pair) => (
                <PairRow
                  key={pair.id}
                  pair={pair}
                  isActive={activePair?.id === pair.id}
                  isFavorite={false}
                  onSelect={() => { setActivePair(pair); setIsOpen(false) }}
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
  const changeUp = pair.change24h >= 0
  return (
    <div
      onClick={onSelect}
      className={`pair-row ${isActive ? 'active' : ''}`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
          className="text-muted hover:text-blue transition-colors"
        >
          <StarIcon className={`w-4 h-4 ${isFavorite ? 'fill-blue text-blue' : ''}`} />
        </button>
        <span className="font-semibold text-primary text-sm">
          {pair.baseSymbol}/{pair.quoteSymbol}
        </span>
      </div>
      <div className="text-right">
        <p className="text-sm text-primary font-medium">${pair.price.toLocaleString()}</p>
        <p className={`text-xs ${changeUp ? 'text-green' : 'text-red'}`}>
          {changeUp ? '+' : ''}{pair.change24h.toFixed(2)}%
        </p>
      </div>
    </div>
  )
}
