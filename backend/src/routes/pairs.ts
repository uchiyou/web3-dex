import { Router, Request, Response } from 'express'
import { pool, redis } from '../config/database'
import { logger } from '../utils/logger'

const router = Router()

// Get all trading pairs
router.get('/', async (req: Request, res: Response) => {
  try {
    // Try cache first
    const cached = await redis.get('trading_pairs')
    if (cached) {
      return res.json({ pairs: JSON.parse(cached) })
    }

    const result = await pool.query(`
      SELECT 
        tp.pair_id,
        tp.base_token,
        tp.quote_token,
        tp.base_symbol,
        tp.quote_symbol,
        tp.maker_fee,
        tp.taker_fee,
        tp.min_order_size,
        tp.is_active,
        lp.base_reserve,
        lp.quote_reserve,
        COALESCE(pv.volume_24h, 0) as volume_24h,
        COALESCE(pv.price_change_24h, 0) as price_change_24h,
        COALESCE(pv.high_24h, 0) as high_24h,
        COALESCE(pv.low_24h, 0) as low_24h,
        COALESCE(pv.last_price, 0) as last_price
      FROM trading_pairs tp
      LEFT JOIN liquidity_pools lp ON tp.pair_id = lp.pair_id
      LEFT JOIN (
        SELECT pair_id,
               SUM(volume) as volume_24h,
               AVG(price_change) as price_change_24h,
               MAX(high) as high_24h,
               MIN(low) as low_24h,
               (ARRAY_AGG(close ORDER BY timestamp DESC))[1] as last_price
        FROM price_history
        WHERE timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY pair_id
      ) pv ON tp.pair_id = pv.pair_id
      WHERE tp.is_active = true
      ORDER BY pv.volume_24h DESC NULLS LAST
    `)

    // Cache for 10 seconds
    await redis.setex('trading_pairs', 10, JSON.stringify(result.rows))

    res.json({ pairs: result.rows })
  } catch (error) {
    logger.error('Get pairs error:', error)
    res.status(500).json({ error: 'Failed to fetch pairs' })
  }
})

// Get single pair
router.get('/:pairId', async (req: Request, res: Response) => {
  try {
    const { pairId } = req.params

    const result = await pool.query(`
      SELECT 
        tp.*,
        lp.base_reserve,
        lp.quote_reserve,
        lp.lp_supply
      FROM trading_pairs tp
      LEFT JOIN liquidity_pools lp ON tp.pair_id = lp.pair_id
      WHERE tp.pair_id = $1
    `, [pairId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pair not found' })
    }

    res.json({ pair: result.rows[0] })
  } catch (error) {
    logger.error('Get pair error:', error)
    res.status(500).json({ error: 'Failed to fetch pair' })
  }
})

// Get order book for a pair
router.get('/:pairId/orderbook', async (req: Request, res: Response) => {
  try {
    const { pairId } = req.params
    const limit = parseInt(req.query.limit as string) || 20

    // Get pending buy orders (bids) - sorted by price descending
    const bidsResult = await pool.query(`
      SELECT price, SUM(quantity - filled_quantity) as quantity, COUNT(*) as order_count
      FROM orders
      WHERE pair_id = $1 AND direction = 'BUY' AND status IN ('PENDING', 'PARTIALLY_FILLED')
      GROUP BY price
      ORDER BY price DESC
      LIMIT $2
    `, [pairId, limit])

    // Get pending sell orders (asks) - sorted by price ascending
    const asksResult = await pool.query(`
      SELECT price, SUM(quantity - filled_quantity) as quantity, COUNT(*) as order_count
      FROM orders
      WHERE pair_id = $1 AND direction = 'SELL' AND status IN ('PENDING', 'PARTIALLY_FILLED')
      GROUP BY price
      ORDER BY price ASC
      LIMIT $2
    `, [pairId, limit])

    // Calculate spread
    const bestBid = bidsResult.rows[0]?.price || 0
    const bestAsk = asksResult.rows[0]?.price || 0
    const spread = bestAsk > 0 && bestBid > 0 ? Number(bestAsk) - Number(bestBid) : 0

    res.json({
      pairId,
      bids: bidsResult.rows.map(r => ({
        price: Number(r.price),
        quantity: Number(r.quantity),
        orders: parseInt(r.order_count),
      })),
      asks: asksResult.rows.map(r => ({
        price: Number(r.price),
        quantity: Number(r.quantity),
        orders: parseInt(r.order_count),
      })),
      spread,
      timestamp: Date.now(),
    })
  } catch (error) {
    logger.error('Get orderbook error:', error)
    res.status(500).json({ error: 'Failed to fetch order book' })
  }
})

// Get recent trades for a pair
router.get('/:pairId/trades', async (req: Request, res: Response) => {
  try {
    const { pairId } = req.params
    const limit = parseInt(req.query.limit as string) || 50

    const result = await pool.query(`
      SELECT 
        t.id,
        t.price,
        t.quantity,
        t.direction,
        t.fee,
        t.tx_hash,
        t.created_at
      FROM trades t
      WHERE t.pair_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2
    `, [pairId, limit])

    res.json({
      trades: result.rows.map(t => ({
        id: t.id,
        price: Number(t.price),
        quantity: Number(t.quantity),
        side: t.direction.toLowerCase(),
        fee: Number(t.fee),
        txHash: t.tx_hash,
        timestamp: t.created_at,
      })),
    })
  } catch (error) {
    logger.error('Get trades error:', error)
    res.status(500).json({ error: 'Failed to fetch trades' })
  }
})

export { router as pairsRouter }
