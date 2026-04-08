'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { usePlaceOrder } from '@/hooks/useDex'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface TradeFormProps {
  pairId?: string
}

export function TradeForm({ pairId = '0x' + '11'.repeat(32) }: TradeFormProps) {
  const { isConnected } = useAccount()
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

      toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order placed!`)
      setPrice('')
      setQuantity('')
      setTotal('')
    } catch (err: any) {
      toast.error(err.message || 'Order failed')
    }
  }

  const setPercentage = (pct: number) => {
    const mockBalance = 10.0
    const qty = (mockBalance * pct / 100).toFixed(4)
    setQuantity(qty)
    if (price && parseFloat(price) > 0) {
      setTotal((parseFloat(qty) * parseFloat(price)).toFixed(2))
    }
  }

  return (
    <div className="trade-panel-body">
      {/* Buy/Sell Tabs */}
      <div className="trade-tabs">
        <button
          onClick={() => setSide('buy')}
          className={`trade-tab buy ${side === 'buy' ? 'active' : ''}`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`trade-tab sell ${side === 'sell' ? 'active' : ''}`}
        >
          Sell
        </button>
      </div>

      {/* Order Type Tabs */}
      <div className="order-type-tabs">
        <button
          onClick={() => setOrderType('limit')}
          className={`order-type-tab ${orderType === 'limit' ? 'active' : ''}`}
        >
          Limit
        </button>
        <button
          onClick={() => setOrderType('market')}
          className={`order-type-tab ${orderType === 'market' ? 'active' : ''}`}
        >
          Market
        </button>
      </div>

      {/* Price Input */}
      {orderType === 'limit' && (
        <div className="mb-3">
          <label className="form-label">Price (USD)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
          />
        </div>
      )}

      {/* Quantity Input */}
      <div className="mb-3">
        <label className="form-label">Quantity (ETH)</label>
        <Input
          type="number"
          placeholder="0.00"
          value={quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
        />
      </div>

      {/* Percentage Buttons */}
      <div className="pct-btns">
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            onClick={() => setPercentage(pct)}
            className="pct-btn"
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="total-display">
        <span className="total-label">Total</span>
        <span className="total-value">{total || '0.00'} USDT</span>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isPending || isConfirming || !isConnected}
        className={`btn-submit ${side}`}
      >
        {isPending
          ? 'Signing...'
          : isConfirming
          ? 'Confirming...'
          : `${side === 'buy' ? 'Buy' : 'Sell'} ETH`}
      </button>

      <p className="fee-note">
        Est. Fee: 0.1% &nbsp;·&nbsp; Maker: 0.05% &nbsp;·&nbsp; Taker: 0.1%
      </p>
    </div>
  )
}
