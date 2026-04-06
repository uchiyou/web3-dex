'use client'

import React from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'

interface WalletModalProps {
  onClose: () => void
}

export function WalletModal({ onClose }: WalletModalProps) {
  const { openConnectModal } = useConnectModal()

  const handleConnect = async () => {
    try {
      await openConnectModal?.()
      onClose()
    } catch (error) {
      console.error('Failed to open connect modal:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-dark-300 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-dark-100">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-gray-400 text-sm">
            Connect your wallet to start trading on Web3 DEX
          </p>
        </div>

        <div className="space-y-3">
          <WalletOption
            name="MetaMask"
            icon="🦊"
            description="Connect using MetaMask browser extension"
            onClick={handleConnect}
          />
          <WalletOption
            name="WalletConnect"
            icon="💳"
            description="Scan with your mobile wallet"
            onClick={handleConnect}
          />
          <WalletOption
            name="Coinbase Wallet"
            icon="🔐"
            description="Use Coinbase Wallet"
            onClick={handleConnect}
          />
          <WalletOption
            name="Ledger"
            icon="📟"
            description="Connect your Ledger hardware wallet"
            onClick={handleConnect}
          />
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 text-gray-400 hover:text-white transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

interface WalletOptionProps {
  name: string
  icon: string
  description: string
  onClick: () => void
}

function WalletOption({ name, icon, description, onClick }: WalletOptionProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-dark-200 rounded-xl hover:bg-dark-100 transition-colors group"
    >
      <span className="text-2xl">{icon}</span>
      <div className="text-left">
        <p className="font-medium text-white group-hover:text-primary-500 transition-colors">
          {name}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </button>
  )
}
