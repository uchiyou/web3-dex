import { Router, Request, Response } from 'express'
import { pool, redis } from '../config/database'
import { logger } from '../utils/logger'

const router = Router()

// Get price history for charting
router.get('/:pairId/history', async (req: Request, res: Response) => {
  try {
    const { pairId } = req.params
    const period = req.query.period as string || '1H'
    const limit = parseInt(req.query.limit as string) || 100

    // Map period to interval
    const intervalMap: Record<string, string> = {
      '1H': '5 minutes',
      '4H': '15 minutes',
      '1D': '1 hour',
      '1W': '1 day',
    }

    const interval = intervalMap[period] || '5 minutes'

    const result = await pool.query(`
      SELECT 
        time_bucket($3, timestamp) as bucket,
        first(close, timestamp) as open,
        max(high) as high,
        min(low) as low,
        last(close, timestamp) as close,
        sum(volume) as volume
      FROM price_history
      WHERE pair_id = $1 AND timestamp > NOW() - INTERVAL '7 days'
      GROUP BY bucket
      ORDER BY bucket DESC
      LIMIT $2
    `, [pairId, limit])

    res.json({
      period,
      candles: result.rows.map(r => ({
        timestamp: r.bucket,
        open: Number(r.open),
        high: Number(r.high),
        low: Number(r.low),
        close: Number(r.close),
        volume: Number(r.volume),
      })).reverse(),
    })
  } catch (error) {
    logger.error('Get price history error:', error)
    res.status(500).json({ error: 'Failed to fetch price history' })
  }
})

// Get current price
router.get('/:pairId/price', async (req: Request, res: Response) => {
  try {
    const { pairId } = req.params

    // Try cache first
    const cached = await redis.get(`price:${pairId}`)
    if (cached) {
      return res.json({ price: JSON.parse(cached) })
    }

    const result = await pool.query(`
      SELECT 
        pair_id,
        (ARRAY_AGG(close ORDER BY timestamp DESC))[1] as price,
        (ARRAY_AGG(price_change ORDER BY timestamp DESC))[1] as change_24h
      FROM price_history
      WHERE pair_id = $1 AND timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY pair_id
    `, [pairId])

    if (result.rows.length === 0) {
      return res.json({ price: null })
    }

    const price = {
      pairId: result.rows[0].pair_id,
      price: Number(result.rows[0].price),
      change24h: Number(result.rows[0].change_24h),
      timestamp: Date.now(),
    }

    // Cache for 5 seconds
    await redis.setex(`price:${pairId}`, 5, JSON.stringify(price))

    res.json({ price })
  } catch (error) {
    logger.error('Get price error:', error)
    res.status(500).json({ error: 'Failed to fetch price' })
  }
})

// Get ticker (24h stats)
router.get('/:pairId/ticker', async (req: Request, res: Response) => {
  try {
    const { pairId } = req.params

    const result = await pool.query(`
      SELECT 
        pair_id,
        MIN(low) as low_24h,
        MAX(high) as high_24h,
        SUM(volume) as volume_24h,
        AVG(close) as avg_price,
        (ARRAY_AGG(close ORDER BY timestamp DESC))[1] as last_price,
        (ARRAY_AGG(open ORDER BY timestamp ASC))[1] as open_price
      FROM price_history
      WHERE pair_id = $1 AND timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY pair_id
    `, [pairId])

    if (result.rows.length === 0) {
      return res.json({ ticker: null })
    }

    const r = result.rows[0]
    const open = Number(r.open_price)
    const last = Number(r.last_price)
    const change = open > 0 ? ((last - open) / open) * 100 : 0

    res.json({
      ticker: {
        pairId: r.pair_id,
        lastPrice: last,
        openPrice: open,
        high24h: Number(r.high_24h),
        low24h: Number(r.low_24h),
        volume24h: Number(r.volume_24h),
        change24h: change.toFixed(2),
      },
    })
  } catch (error) {
    logger.error('Get ticker error:', error)
    res.status(500).json({ error: 'Failed to fetch ticker' })
  }
})

export { router as pricesRouter }
