'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="alipay-header">
        <div className="container flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="alipay-logo select-none">
            <div className="alipay-logo-icon">D</div>
            <span className="alipay-logo-text">
              Web3<span>DEX</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="alipay-nav hidden md:flex">
            <Link href="/trade" className="alipay-nav-link active">Trade</Link>
            <Link href="/pool" className="alipay-nav-link">Pool</Link>
            <Link href="/dashboard" className="alipay-nav-link">Dashboard</Link>
            <Link href="/referral" className="alipay-nav-link">Referral</Link>
          </nav>

          {/* Wallet + Mobile */}
          <div className="flex items-center gap-3">
            <button className="alipay-wallet-btn hidden md:inline-flex">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5z"/>
                <path d="M16 12a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
              Connect
            </button>
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="alipay-mobile-menu">
          <div className="alipay-mobile-menu-header">
            <span className="text-xl font-semibold text-primary">Menu</span>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded hover:bg-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <Link href="/trade" onClick={() => setMobileOpen(false)}>Trade</Link>
          <Link href="/pool" onClick={() => setMobileOpen(false)}>Pool</Link>
          <Link href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          <Link href="/referral" onClick={() => setMobileOpen(false)}>Referral</Link>
          <div className="mt-4">
            <button className="alipay-btn alipay-btn-primary w-full">Connect Wallet</button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="alipay-hero">
        <div className="container text-center">
          <div className="alipay-badge mb-6">
            <span className="alipay-badge-dot" />
            Now live on Ethereum Mainnet
          </div>

          <h1 className="alipay-hero-title">
            The Next Generation
            <br />
            <span>Decentralized Exchange</span>
          </h1>

          <p className="alipay-hero-desc mx-auto px-2">
            Experience lightning-fast trades with our hybrid Order Book + AMM model.
            Enjoy the best rates, lowest fees, and seamless cross-chain trading.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0 w-full sm:w-auto">
            <Link href="/trade" className="alipay-btn alipay-btn-primary alipay-btn-lg">
              Start Trading
            </Link>
            <Link href="/pool" className="alipay-btn alipay-btn-secondary alipay-btn-lg">
              Provide Liquidity
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Volume', value: '$1.2B+', change: '+12.5%', up: true },
            { label: 'Active Traders', value: '50K+', change: '+8.2%', up: true },
            { label: 'Trading Pairs', value: '100+', change: '0', up: true },
            { label: 'Avg. Fee', value: '0.1%', change: '-0.05%', up: true },
          ].map((stat, i) => (
            <div key={i} className="alipay-stat-card">
              <p className="alipay-stat-value">{stat.value}</p>
              <p className="alipay-stat-label">{stat.label}</p>
              {stat.change !== '0' && (
                <span className={`alipay-stat-change ${stat.up ? 'up' : 'down'}`}>
                  {stat.up ? '↑' : '↓'} {stat.change}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mt-12">
        <h2 className="text-2xl font-bold text-center text-primary mb-8">
          Why Choose Web3 DEX?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="alipay-feature-card">
              <div className={`alipay-feature-icon ${f.iconColor}`}>
                {f.icon}
              </div>
              <h3 className="alipay-feature-title">{f.title}</h3>
              <p className="alipay-feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mt-12">
        <div className="alipay-card p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-3">Ready to Start Trading?</h2>
          <p className="text-secondary mb-6 max-w-md mx-auto">
            Connect your wallet and join thousands of traders on the most advanced DeFi platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
            <Link href="/trade" className="alipay-btn alipay-btn-primary alipay-btn-lg w-full sm:w-auto text-center">Start Trading</Link>
            <Link href="/referral" className="alipay-btn alipay-btn-secondary alipay-btn-lg w-full sm:w-auto text-center">Join Referral Program</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="alipay-footer">
        <div className="container text-center">
          <p className="text-muted text-sm">© 2024 Web3 DEX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    title: 'Hybrid Order Book',
    description: 'Combines AMM liquidity with order book precision for large trades',
    iconColor: 'blue',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Cross-Chain Support',
    description: 'Trade across Ethereum, BSC, Polygon, and more with our bridge',
    iconColor: 'green',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    title: 'Referral Rewards',
    description: 'Earn up to 5% from your network with multi-level referrals',
    iconColor: 'orange',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
  {
    title: 'Low Fees',
    description: 'Maker: 0.05% | Taker: 0.1% — among the lowest in DeFi',
    iconColor: 'green',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Real-time Analytics',
    description: 'Advanced charts, order flow, and portfolio tracking',
    iconColor: 'blue',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    title: 'Non-Custodial',
    description: 'You control your funds at all times. No intermediary risk.',
    iconColor: 'red',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
]
