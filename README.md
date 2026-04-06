# Web3 DEX - Complete Project Architecture

## Overview
A decentralized exchange built with Order Book + AMM hybrid model for efficient trading.

## Tech Stack

### Smart Contracts (Layer 1/2)
- **Language**: Solidity ^0.8.20
- **Framework**: Hardhat + Foundry hybrid
- **Networks**: Ethereum, BSC, Polygon, Arbitrum

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Web3**: wagmi + viem +rainbowKit
- **State**: Zustand
- **Styling**: Tailwind CSS

### Backend
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **WebSocket**: Socket.io for real-time
- **Queue**: Redis + Bull

### Database
- **Primary**: PostgreSQL 15
- **Cache**: Redis 7
- **Search**: Elasticsearch 8

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │  Trade   │  │  Pool    │  │Dashboard │  │  Refer   │    │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└────────┼─────────────┼─────────────┼─────────────┼──────────┘
         │             │             │             │
         ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Node.js)                        │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │  REST    │  │  WS      │  │  Indexer │  │  Auth    │    │
│   │  API     │  │  Server  │  │  Service │  │  Service │    │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└────────┼─────────────┼─────────────┼─────────────┼──────────┘
         │             │             │             │
         ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │PostgreSQL│  │  Redis   │  │Elastic   │  │  Graph   │    │
│   │          │  │  Cache   │  │Search    │  │ Node     │    │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Smart Contracts                            │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│   │ Exchange │  │  Token   │  │ Bridge   │  │ Refer    │    │
│   │ (AMM+OB) │  │(ERC20/721│  │ Contracts│  │ System   │    │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
web3-dex/
├── contracts/
│   ├── core/
│   │   ├── DexCore.sol           # Main exchange contract
│   │   ├── OrderBook.sol         # Order book management
│   │   ├── LiquidityPool.sol     # AMM pool management
│   │   └── TradeExecutor.sol     # Trade execution engine
│   ├── periphery/
│   │   ├── Router.sol           # DEX Router
│   │   ├── Factory.sol           # Pool factory
│   │   └── PriceOracle.sol       # Price feed oracle
│   ├── tokens/
│   │   ├── MockERC20.sol        # Test token
│   │   └── MockERC721.sol       # NFT test token
│   ├── bridges/
│   │   ├── CrossChainBridge.sol # Base bridge contract
│   │   └── BridgeAggregator.sol # Multi-chain aggregation
│   ├── interfaces/
│   │   ├── IDexCore.sol
│   │   ├── IOrderBook.sol
│   │   ├── ILiquidityPool.sol
│   │   └── IERC20.sol
│   └── libraries/
│       ├── MathUtils.sol
│       ├── SafeMath.sol
│       └── OrderBooksUtils.sol
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Trade/
│   │   │   ├── Pool/
│   │   │   ├── Dashboard/
│   │   │   └── common/
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   ├── trade/[[...pair]].tsx
│   │   │   ├── pool/
│   │   │   ├── dashboard/
│   │   │   └── referral/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── utils/
│   │   └── types/
│   └── public/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── config/
│   └── scripts/
├── database/
│   ├── migrations/
│   └── schemas/
└── marketing/
    ├── pages/
    ├── assets/
    └── docs/
```
