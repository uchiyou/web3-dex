'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-400">
      {/* Navigation */}
      <nav className="border-b border-dark-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-white">
              Web3<span className="text-primary-500">DEX</span>
            </h1>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/trade" className="text-gray-300 hover:text-white transition-colors">
                Trade
              </Link>
              <Link href="/pool" className="text-gray-300 hover:text-white transition-colors">
                Pool
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/referral" className="text-gray-300 hover:text-white transition-colors">
                Referral
              </Link>
            </div>
          </div>
          <Button>Connect Wallet</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full text-primary-500 text-sm mb-6">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            Now live on Ethereum Mainnet
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The Next Generation
            <br />
            <span className="text-gradient">Decentralized Exchange</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Experience lightning-fast trades with our hybrid Order Book + AMM model.
            Enjoy the best rates, lowest fees, and seamless cross-chain trading.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trade">
              <Button size="lg" className="w-full sm:w-auto">
                Start Trading
              </Button>
            </Link>
            <Link href="/pool">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Provide Liquidity
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            { label: 'Total Volume', value: '$1.2B+' },
            { label: 'Active Traders', value: '50K+' },
            { label: 'Trading Pairs', value: '100+' },
            { label: 'Avg. Fee', value: '0.1%' },
          ].map((stat, i) => (
            <Card key={i} className="p-6 text-center">
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20 border-t border-dark-100">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Why Choose Web3 DEX?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Hybrid Order Book',
              description: 'Combines AMM liquidity with order book precision for large trades',
              icon: '📊',
            },
            {
              title: 'Cross-Chain Support',
              description: 'Trade across Ethereum, BSC, Polygon, and more with our bridge',
              icon: '🔗',
            },
            {
              title: 'Referral Rewards',
              description: 'Earn up to 5% from your network with multi-level referrals',
              icon: '🎁',
            },
            {
              title: 'Low Fees',
              description: 'Maker: 0.05% | Taker: 0.1% - among the lowest in DeFi',
              icon: '💰',
            },
            {
              title: 'Real-time Analytics',
              description: 'Advanced charts, order flow, and portfolio tracking',
              icon: '📈',
            },
            {
              title: 'Non-Custodial',
              description: 'You control your funds at all times. No intermediary risk.',
              icon: '🔒',
            },
          ].map((feature, i) => (
            <Card key={i} className="p-6">
              <span className="text-4xl mb-4 block">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2024 Web3 DEX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
