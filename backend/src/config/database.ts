import { Pool } from 'pg'
import Redis from 'ioredis'
import { logger } from '../utils/logger'

export const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'web3_dex',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL error:', err)
})

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

redis.on('error', (err) => {
  logger.error('Redis connection error:', err)
})

export async function initializeDatabase() {
  const client = await pool.connect()
  try {
    // Create tables if not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        address VARCHAR(42) UNIQUE NOT NULL,
        username VARCHAR(100),
        email VARCHAR(255),
        referrer_id UUID REFERENCES users(id),
        referral_code VARCHAR(64) UNIQUE,
        total_volume DECIMAL(30, 0) DEFAULT 0,
        total_fees DECIMAL(30, 0) DEFAULT 0,
        referral_earnings DECIMAL(30, 0) DEFAULT 0,
        total_referrals INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS trading_pairs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pair_id VARCHAR(66) UNIQUE NOT NULL,
        base_token VARCHAR(42) NOT NULL,
        quote_token VARCHAR(42) NOT NULL,
        base_symbol VARCHAR(20) NOT NULL,
        quote_symbol VARCHAR(20) NOT NULL,
        maker_fee DECIMAL(10, 4) DEFAULT 0.0005,
        taker_fee DECIMAL(10, 4) DEFAULT 0.001,
        min_order_size DECIMAL(30, 0) DEFAULT 1000000000000000,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id BIGSERIAL,
        user_id UUID REFERENCES users(id),
        pair_id VARCHAR(66) REFERENCES trading_pairs(pair_id),
        direction VARCHAR(4) NOT NULL,
        order_type VARCHAR(10) NOT NULL,
        price DECIMAL(30, 0),
        quantity DECIMAL(30, 0) NOT NULL,
        filled_quantity DECIMAL(30, 0) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'PENDING',
        expires_at TIMESTAMP,
        tx_hash VARCHAR(66),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS liquidity_pools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pair_id VARCHAR(66) REFERENCES trading_pairs(pair_id),
        base_reserve DECIMAL(30, 0) DEFAULT 0,
        quote_reserve DECIMAL(30, 0) DEFAULT 0,
        lp_supply DECIMAL(30, 0) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(pair_id)
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS lp_positions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        pool_id UUID REFERENCES liquidity_pools(id),
        lp_balance DECIMAL(30, 0) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, pool_id)
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id),
        pair_id VARCHAR(66) REFERENCES trading_pairs(pair_id),
        direction VARCHAR(4) NOT NULL,
        price DECIMAL(30, 0) NOT NULL,
        quantity DECIMAL(30, 0) NOT NULL,
        fee DECIMAL(30, 0) NOT NULL,
        maker_user_id UUID REFERENCES users(id),
        taker_user_id UUID REFERENCES users(id),
        tx_hash VARCHAR(66),
        block_number BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pair_id VARCHAR(66) REFERENCES trading_pairs(pair_id),
        open DECIMAL(30, 0) NOT NULL,
        high DECIMAL(30, 0) NOT NULL,
        low DECIMAL(30, 0) NOT NULL,
        close DECIMAL(30, 0) NOT NULL,
        volume DECIMAL(30, 0) NOT NULL,
        price_change DECIMAL(10, 4) DEFAULT 0,
        period VARCHAR(10) NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS referral_earnings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        referrer_id UUID REFERENCES users(id),
        level INTEGER NOT NULL,
        trade_volume DECIMAL(30, 0) NOT NULL,
        reward DECIMAL(30, 0) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    logger.info('Database tables initialized')
  } catch (error) {
    logger.error('Database initialization error:', error)
    throw error
  } finally {
    client.release()
  }
}
