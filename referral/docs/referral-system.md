# Web3 DEX Referral System

## Overview

A multi-level referral system that rewards users for bringing new traders to the platform. Rewards are distributed automatically based on trading volume of referred users.

## Reward Structure

### Multi-Level Rewards (Basis Points)

| Level | Reward (%) | Description |
|-------|------------|-------------|
| Level 1 | 5% (500 bps) | Direct referrals |
| Level 2 | 2% (200 bps) | Referrals of your referrals |
| Level 3 | 1% (100 bps) | 3rd level referrals |

### Example Calculation

If a Level 1 referral trades $10,000 with 0.1% taker fee ($10 fee):
- You earn: $10 × 5% = $0.50

If that referral also has their own referrals who trade:
- You earn 2% of their trading fees as Level 2 bonus

## How It Works

### Registration
1. User signs up with a referral code
2. System links user to referrer
3. Referrer's total_referrals count increases
4. All future trading by referred user generates rewards

### Reward Distribution
- Rewards are distributed in the token pair being traded
- Rewards are calculated at time of trade execution
- Automatic distribution via smart contract
- Real-time tracking in user dashboard

## Technical Implementation

### Smart Contract (ReferralSystem.sol)

```solidity
// Reward percentages by level (basis points)
referralTiers[1] = 500;  // 5%
referralTiers[2] = 200;  // 2%
referralTiers[3] = 100;  // 1%
```

### Database Schema

```sql
-- Users table stores referral relationship
referrer_id UUID REFERENCES users(id),
referral_code VARCHAR(64) UNIQUE,

-- Referral earnings tracked per trade
CREATE TABLE referral_earnings (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    referrer_id UUID REFERENCES users(id),
    level INTEGER NOT NULL,
    trade_volume DECIMAL(30, 0) NOT NULL,
    reward DECIMAL(30, 0) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/referral/info` | GET | Get user's referral info |
| `/api/referral/stats` | GET | Get referral statistics |
| `/api/referral/register` | POST | Register with code |
| `/api/referral/earnings` | GET | Get earnings history |

### Frontend Components

1. **Referral Dashboard** - Shows stats, code, referrals
2. **Share Modal** - Copy code, social sharing
3. **Referral Leaderboard** - Top earners display

## Referral Code Generation

- 12-character alphanumeric code
- Generated on user registration
- Example: `REF3X7K9M2LP`
- Case-insensitive

## Anti-Fraud Measures

1. **Self-referral prevention** - Cannot refer yourself
2. **KYC requirement** for withdrawal (optional)
3. **Minimum trade requirement** - $100 minimum volume
4. **Rate limiting** - Max 10 new referrals per day
5. **Suspicious activity monitoring** - Flag unusual patterns

## Marketing Integration

### Referral Tiers (Ambassador Program)

| Tier | Requirements | Bonus |
|------|--------------|-------|
| Bronze | 10+ active referrals | +0.5% reward boost |
| Silver | 50+ active referrals | +1% reward boost |
| Gold | 100+ active referrals | +1.5% reward boost |
| Platinum | 500+ active referrals | +2% reward boost |

Active = has traded in last 30 days

## Analytics Tracking

- Daily/weekly/monthly referral reports
- Conversion rate tracking
- Reward distribution reports
- User activity by referral source

## Legal Compliance

- Terms of service for referrals
- Anti-spam policy
- Data retention policies
- KYC/AML considerations for large rewards

---

## Quick Start Guide

### For Users

1. **Get your code**: Find it in Dashboard → Referral
2. **Share**: Copy link or code to share
3. **Track**: Monitor earnings in real-time
4. **Withdraw**: Rewards auto-deposit to wallet

### For Partners

1. **Apply**: Contact partnership@web3dex.io
2. **Integrate**: Get custom referral code
3. **Track**: Dedicated dashboard access
4. **Earn**: Enhanced reward rates available
