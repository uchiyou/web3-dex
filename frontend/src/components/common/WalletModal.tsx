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
    <div className="wallet-modal-overlay">
      <div className="wallet-modal">
        <div className="wallet-modal-header">
          <h2 className="wallet-modal-title">Connect Wallet</h2>
          <button className="wallet-modal-close" onClick={onClose}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <WalletOption name="MetaMask" icon="🦊" description="Browser extension wallet" onClick={handleConnect} />
          <WalletOption name="WalletConnect" icon="💳" description="Mobile wallet connection" onClick={handleConnect} />
          <WalletOption name="Coinbase Wallet" icon="🔐" description="Coinbase mobile & extension" onClick={handleConnect} />
          <WalletOption name="Ledger" icon="📟" description="Hardware wallet" onClick={handleConnect} />
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 text-secondary text-sm font-medium hover:text-primary transition-colors border-t border-color"
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
      className="wallet-option w-full text-left"
    >
      <div className="wallet-option-icon">
        <span className="text-lg">{icon}</span>
      </div>
      <div>
        <p className="wallet-option-name">{name}</p>
        <p className="wallet-option-desc">{description}</p>
      </div>
    </button>
  )
}
