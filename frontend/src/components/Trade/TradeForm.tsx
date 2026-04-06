'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { usePlaceOrder } from '@/hooks/useDex'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface TradeFormProps {
  pairId?: string
}

export function TradeForm({ pairId = '0x' + '11'.repeat(32) }: TradeFormProps) {
  const { address, isConnected } = useAccount()
  const { placeOrder, isPending, isConfirming } = usePlaceOrder()
  
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [total, setTotal] = useState('')

  const handlePriceChange = (value: string) => {
    setPrice(value)
    if (quantity && parseFloat(value) > 0) {
      setTotal((parseFloat(quantity) * parseFloat(value)).toFixed(2))
    }
  }

  const handleQuantityChange = (value: string) => {
    setQuantity(value)
    if (price && parseFloat(price) > 0) {
      setTotal((parseFloat(value) * parseFloat(price)).toFixed(2))
    }
  }

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      toast.error('Please enter a valid price')
      return
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    try {
      const quantityWei = parseEther(quantity)
      const priceWei = orderType === 'limit' ? parseEther(price) : undefined

      await placeOrder({
        pairId: pairId as `0x${string}`,
        direction: side === 'buy' ? 'buy' : 'sell',
        orderType,
        price: priceWei,
        quantity: quantityWei,
      })

      toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`)
      
      // Reset form
      setPrice('')
      setQuantity('')
      setTotal('')
    } catch (err: any) {
      toast.error(err.message || 'Order failed')
    }
  }

  const setPercentage = (pct: number) => {
    // Mock balance - in real app would use actual balance
    const mockBalance = 10.0
    const qty = (mockBalance * pct / 100).toFixed(4)
    setQuantity(qty)
    if (price && parseFloat(price) > 0) {
      setTotal((parseFloat(qty) * parseFloat(price)).toFixed(2))
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Place Order</h3>
      
      {/* Buy/Sell Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setSide('buy')}
          className={`py-2 rounded font-medium transition-colors ${
            side === 'buy'
              ? 'bg-green-500 text-white'
              : 'bg-dark-200 text-gray-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`py-2 rounded font-medium transition-colors ${
            side === 'sell'
              ? 'bg-red-500 text-white'
              : 'bg-dark-200 text-gray-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order Type Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-2 rounded text-sm font-medium ${
            orderType === 'limit'
              ? 'bg-primary-500/20 text-primary-500 border border-primary-500'
              : 'bg-dark-200 text-gray-400'
          }`}
        >
          Limit
        </button>
        <button
          onClick={() => setOrderType('market')}
          className={`flex-1 py-2 rounded text-sm font-medium ${
            orderType === 'market'
              ? 'bg-primary-500/20 text-primary-500 border border-primary-500'
              : 'bg-dark-200 text-gray-400'
          }`}
        >
          Market
        </button>
      </div>

      {/* Price Input */}
      {orderType === 'limit' && (
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Price (USD)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
          />
        </div>
      )}

      {/* Quantity Input */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Quantity (ETH)</label>
        <Input
          type="number"
          placeholder="0.00"
          value={quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
        />
      </div>

      {/* Percentage Buttons */}
      <div className="flex gap-2 mb-4">
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            onClick={() => setPercentage(pct)}
            className="flex-1 py-1 text-xs rounded bg-dark-200 text-gray-400 hover:text-white"
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="mb-4 p-3 bg-dark-200 rounded">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total</span>
          <span className="text-white font-medium">{total || '0.00'} USDT</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isPending || isConfirming || !isConnected}
        className={`w-full ${
          side === 'buy'
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {isPending
          ? 'Signing...'
          : isConfirming
          ? 'Confirming...'
          : `${side === 'buy' ? 'Buy' : 'Sell'} ETH`}
      </Button>

      {/* Fee Info */}
      <p className="text-xs text-gray-500 mt-3 text-center">
        Est. Fee: 0.1% • Maker: 0.05% • Taker: 0.1%
      </p>
    </div>
  )
}
