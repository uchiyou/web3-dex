'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { DEX_CORE_ABI } from '@/abi/dexCore'
import { useDexStore, TradingPair, Order } from '@/store'

const DEX_CORE_ADDRESS = process.env.NEXT_PUBLIC_DEX_CORE_ADDRESS || '0x0000000000000000000000000000000000000000'

interface UseTradingPairResult {
  price: bigint
  reserve0: bigint
  reserve1: bigint
  isLoading: boolean
  error: Error | null
}

export function useTradingPair(pairId: `0x${string}`): UseTradingPairResult {
  const { data: reserves, isLoading } = useReadContract({
    address: DEX_CORE_ADDRESS as `0x${string}`,
    abi: DEX_CORE_ABI,
    functionName: 'getPoolReserves',
    args: [pairId],
  })

  const [reserve0, reserve1] = reserves ? [reserves[0], reserves[1]] : [0n, 0n]
  const price = reserve0 > 0n ? reserve1 / reserve0 : 0n

  return {
    price,
    reserve0,
    reserve1,
    isLoading,
    error: null,
  }
}

interface UseOrderBookResult {
  bids: Array<{ price: bigint; quantity: bigint }>
  asks: Array<{ price: bigint; quantity: bigint }>
  isLoading: boolean
}

export function useOrderBook(pairId: `0x${string}`): UseOrderBookResult {
  const { data, isLoading } = useReadContract({
    address: DEX_CORE_ADDRESS as `0x${string}`,
    abi: DEX_CORE_ABI,
    functionName: 'getOrderBook',
    args: [pairId],
  })

  const bids = data?.[0]?.map((order: any) => ({
    price: order.price as bigint,
    quantity: BigInt(Number(order.quantity) - Number(order.filledQuantity)),
  })) || []

  const asks = data?.[1]?.map((order: any) => ({
    price: order.price as bigint,
    quantity: BigInt(Number(order.quantity) - Number(order.filledQuantity)),
  })) || []

  return { bids, asks, isLoading }
}

interface UsePlaceOrderParams {
  pairId: `0x${string}`
  direction: 'buy' | 'sell'
  orderType: 'market' | 'limit'
  price?: bigint
  quantity: bigint
  expiresAt?: bigint
}

export function usePlaceOrder() {
  const { address } = useAccount()
  const { addOrder } = useDexStore()

  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const placeOrder = useCallback(
    async (params: UsePlaceOrderParams) => {
      if (!address) throw new Error('Wallet not connected')

      const functionName = params.orderType === 'market' ? 'placeMarketOrder' : 'placeLimitOrder'
      const args: any = params.orderType === 'market'
        ? [params.pairId, params.direction === 'buy' ? 0 : 1, params.quantity]
        : [params.pairId, params.direction === 'buy' ? 0 : 1, params.price!, params.quantity, params.expiresAt || 0n]

      writeContract({
        address: DEX_CORE_ADDRESS as `0x${string}`,
        abi: DEX_CORE_ABI,
        functionName,
        args,
      })

      // Optimistic order update
      const order: Order = {
        id: `temp-${Date.now()}`,
        pair: params.pairId,
        type: params.orderType,
        side: params.direction,
        price: params.price ? Number(formatEther(params.price)) : 0,
        quantity: Number(formatEther(params.quantity)),
        filled: 0,
        status: 'pending',
        timestamp: Date.now(),
      }
      addOrder(order)
    },
    [address, writeContract, addOrder]
  )

  return {
    placeOrder,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

interface UseLiquidityParams {
  pairId: `0x${string}`
  baseAmount: bigint
  quoteAmount: bigint
}

export function useLiquidity() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const addLiquidity = useCallback(
    async (params: UseLiquidityParams) => {
      writeContract({
        address: DEX_CORE_ADDRESS as `0x${string}`,
        abi: DEX_CORE_ABI,
        functionName: 'addLiquidity',
        args: [params.pairId, params.baseAmount, params.quoteAmount],
      })
    },
    [writeContract]
  )

  const removeLiquidity = useCallback(
    async (pairId: `0x${string}`, lpTokens: bigint) => {
      writeContract({
        address: DEX_CORE_ADDRESS as `0x${string}`,
        abi: DEX_CORE_ABI,
        functionName: 'removeLiquidity',
        args: [pairId, lpTokens],
      })
    },
    [writeContract]
  )

  return {
    addLiquidity,
    removeLiquidity,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useWalletBalance(tokenAddress?: `0x${string}`) {
  const { address } = useAccount()

  const { data: ethBalance } = useBalance({ address })

  return {
    balance: ethBalance?.value || 0n,
    formatted: ethBalance ? formatEther(ethBalance.value) : '0',
    symbol: ethBalance?.symbol || 'ETH',
  }
}

// Hook to track supported trading pairs
export function useTradingPairs() {
  const { pairs, setActivePair, activePair } = useDexStore()

  const updatePairData = useCallback((pairData: TradingPair) => {
    const store = useDexStore.getState()
    const existingIndex = store.pairs.findIndex((p) => p.id === pairData.id)
    if (existingIndex >= 0) {
      store.pairs[existingIndex] = pairData
    } else {
      store.pairs.push(pairData)
    }
  }, [])

  return {
    pairs,
    activePair,
    setActivePair,
    updatePairData,
  }
}
