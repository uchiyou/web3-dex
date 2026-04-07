'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-binance-bg">
      {/* Navigation */}
      <nav className="border-b border-binance-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-binance-gold rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-binance-bg">
                  <path d="M12 2L6.5 7.5L12 13L17.5 7.5L12 2Z" fill="currentColor"/>
                  <path d="M12 11L6.5 16.5L12 22L17.5 16.5L12 11Z" fill="currentColor" opacity="0.6"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-binance-text">
                Web3<span className="text-binance-gold">DEX</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/trade" className="text-binance-text-muted hover:text-binance-gold transition-colors text-sm font-medium">
                Trade
              </Link>
              <Link href="/pool" className="text-binance-text-muted hover:text-binance-gold transition-colors text-sm font-medium">
                Pool
              </Link>
              <Link href="/dashboard" className="text-binance-text-muted hover:text-binance-gold transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/referral" className="text-binance-text-muted hover:text-binance-gold transition-colors text-sm font-medium">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-binance-gold/10 rounded-full text-binance-gold text-sm mb-6 border border-binance-gold/20">
            <span className="w-2 h-2 bg-binance-gold rounded-full animate-pulse" />
            Now live on Ethereum Mainnet
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-binance-text mb-6 leading-tight">
            The Next Generation
            <br />
            <span className="text-binance-gold">Decentralized Exchange</span>
          </h1>
          
          <p className="text-xl text-binance-text-muted mb-10 max-w-2xl mx-auto">
            Experience lightning-fast trades with our hybrid Order Book + AMM model.
            Enjoy the best rates, lowest fees, and seamless cross-chain trading.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trade">
              <Button size="lg" className="w-full sm:w-auto bg-binance-gold hover:bg-binance-gold/90 text-binance-bg font-semibold">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
          {[
            { label: 'Total Volume', value: '$1.2B+' },
            { label: 'Active Traders', value: '50K+' },
            { label: 'Trading Pairs', value: '100+' },
            { label: 'Avg. Fee', value: '0.1%' },
          ].map((stat, i) => (
            <Card key={i} className="p-6 text-center border-binance-border">
              <p className="text-3xl font-bold text-binance-text mb-1">{stat.value}</p>
              <p className="text-binance-text-muted text-sm">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20 border-t border-binance-border">
        <h2 className="text-3xl font-bold text-center text-binance-text mb-12">
          Why Choose Web3 DEX?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Hybrid Order Book',
              description: 'Combines AMM liquidity with order book precision for large trades',
              icon: (
                <svg className="w-6 h-6 text-binance-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
            },
            {
              title: 'Cross-Chain Support',
              description: 'Trade across Ethereum, BSC, Polygon, and more with our bridge',
              icon: (
                <svg className="w-6 h-6 text-binance-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              ),
            },
            {
              title: 'Referral Rewards',
              description: 'Earn up to 5% from your network with multi-level referrals',
              icon: (
                <svg className="w-6 h-6 text-binance-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              ),
            },
            {
              title: 'Low Fees',
              description: 'Maker: 0.05% | Taker: 0.1% - among the lowest in DeFi',
              icon: (
                <svg className="w-6 h-6 text-binance-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              title: 'Real-time Analytics',
              description: 'Advanced charts, order flow, and portfolio tracking',
              icon: (
                <svg className="w-6 h-6 text-binance-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              ),
            },
            {
              title: 'Non-Custodial',
              description: 'You control your funds at all times. No intermediary risk.',
              icon: (
                <svg className="w-6 h-6 text-binance-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
            },
          ].map((feature, i) => (
            <Card key={i} className="p-6 border-binance-border hover:border-binance-gold/30 transition-colors">
              <div className="w-12 h-12 bg-binance-gold/10 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-binance-text mb-2">{feature.title}</h3>
              <p className="text-binance-text-muted text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-binance-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-binance-text-muted text-sm">
          <p>&copy; 2024 Web3 DEX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
