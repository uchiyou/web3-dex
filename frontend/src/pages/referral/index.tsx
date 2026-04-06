'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CopyIcon, ExternalLinkIcon } from '@/components/icons'

export default function ReferralPage() {
  const { address, isConnected } = useAccount()
  const [referralCode] = useState('REF3X7K9M2LP') // Mock code
  
  const stats = {
    totalReferrals: 47,
    activeReferrals: 32,
    totalEarnings: 1250.75,
    pendingRewards: 45.20,
  }

  const referrals = [
    { address: '0x1234...5678', trades: 156, volume: 45678.90, earnings: 234.50 },
    { address: '0xabcd...efgh', trades: 89, volume: 23456.78, earnings: 123.40 },
    { address: '0x9876...ijkl', trades: 45, volume: 12345.67, earnings: 67.80 },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://web3dex.io/ref/${referralCode}`)
    // Toast notification would go here
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect your wallet to view your referral program.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-400">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-gray-400">Invite friends and earn up to 5% from their trades</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-gray-400">Total Referrals</p>
            <p className="text-2xl font-bold text-white">{stats.totalReferrals}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-400">Active (30d)</p>
            <p className="text-2xl font-bold text-green-500">{stats.activeReferrals}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-400">Total Earnings</p>
            <p className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-500">${stats.pendingRewards.toFixed(2)}</p>
          </Card>
        </div>

        {/* Share Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your Referral Link</h2>
          <div className="flex gap-4">
            <div className="flex-1 bg-dark-200 rounded-lg px-4 py-3 flex items-center">
              <span className="text-gray-300">web3dex.io/ref/</span>
              <span className="text-primary-500 font-mono font-bold">{referralCode}</span>
            </div>
            <Button variant="secondary" onClick={handleCopy}>
              <CopyIcon className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Earn 5% from Level 1, 2% from Level 2, and 1% from Level 3 referrals
          </p>
        </Card>

        {/* Reward Tiers */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Reward Tiers</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-dark-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👤</span>
                <span className="text-white font-semibold">Level 1</span>
              </div>
              <p className="text-3xl font-bold text-green-500">5%</p>
              <p className="text-sm text-gray-400 mt-1">Direct referrals</p>
            </div>
            <div className="bg-dark-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👥</span>
                <span className="text-white font-semibold">Level 2</span>
              </div>
              <p className="text-3xl font-bold text-green-400">2%</p>
              <p className="text-sm text-gray-400 mt-1">Friends of friends</p>
            </div>
            <div className="bg-dark-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌐</span>
                <span className="text-white font-semibold">Level 3</span>
              </div>
              <p className="text-3xl font-bold text-green-300">1%</p>
              <p className="text-sm text-gray-400 mt-1">Extended network</p>
            </div>
          </div>
        </Card>

        {/* Top Referrals */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Top Referrals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-dark-100">
                  <th className="pb-3">Address</th>
                  <th className="pb-3">Trades</th>
                  <th className="pb-3">Volume</th>
                  <th className="pb-3">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref, i) => (
                  <tr key={i} className="border-b border-dark-100/50">
                    <td className="py-3 text-white font-mono">{ref.address}</td>
                    <td className="py-3 text-gray-300">{ref.trades}</td>
                    <td className="py-3 text-gray-300">${ref.volume.toFixed(2)}</td>
                    <td className="py-3 text-green-500">${ref.earnings.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
