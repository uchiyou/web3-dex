import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../../config/database'
import { logger } from '../../utils/logger'

const router = Router()

// Get all pools
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        lp.id,
        tp.pair_id,
        tp.base_symbol,
        tp.quote_symbol,
        tp.base_token,
        tp.quote_token,
        lp.base_reserve,
        lp.quote_reserve,
        lp.lp_supply,
        tp.maker_fee,
        tp.taker_fee,
        CASE WHEN lp.lp_supply > 0 
          THEN (2 * SQRT(lp.base_reserve * lp.quote_reserve) / lp.lp_supply - 1) * 100 
          ELSE 0 
        END as apr
      FROM liquidity_pools lp
      JOIN trading_pairs tp ON lp.pair_id = tp.pair_id
      WHERE tp.is_active = true
      ORDER BY lp.lp_supply DESC
    `)

    res.json({ pools: result.rows.map(p => ({
      id: p.id,
      pairId: p.pair_id,
      pair: `${p.base_symbol}/${p.quote_symbol}`,
      baseToken: p.base_token,
      quoteToken: p.quote_token,
      baseReserve: Number(p.base_reserve),
      quoteReserve: Number(p.quote_reserve),
      lpSupply: Number(p.lp_supply),
      apr: Number(p.apr || 0).toFixed(2),
    }))})
  } catch (error) {
    logger.error('Get pools error:', error)
    res.status(500).json({ error: 'Failed to fetch pools' })
  }
})

// Get pool by pair ID
router.get('/:pairId', async (req: Request, res: Response) => {
  try {
    const { pairId } = req.params

    const result = await pool.query(`
      SELECT 
        lp.*,
        tp.base_symbol,
        tp.quote_symbol,
        tp.base_token,
        tp.quote_token
      FROM liquidity_pools lp
      JOIN trading_pairs tp ON lp.pair_id = tp.pair_id
      WHERE lp.pair_id = $1
    `, [pairId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pool not found' })
    }

    res.json({ pool: result.rows[0] })
  } catch (error) {
    logger.error('Get pool error:', error)
    res.status(500).json({ error: 'Failed to fetch pool' })
  }
})

// Add liquidity (mock - would interact with contract)
router.post('/:pairId/add', async (req: Request, res: Response) => {
  try {
    const { pairId } = req.params
    const { baseAmount, quoteAmount } = req.body

    // Update pool reserves (simplified)
    await pool.query(`
      UPDATE liquidity_pools 
      SET base_reserve = base_reserve + $1,
          quote_reserve = quote_reserve + $2,
          lp_supply = lp_supply + $3,
          updated_at = NOW()
      WHERE pair_id = $4
    `, [baseAmount, quoteAmount, Math.sqrt(baseAmount * quoteAmount), pairId])

    res.json({ success: true, message: 'Liquidity added' })
  } catch (error) {
    logger.error('Add liquidity error:', error)
    res.status(500).json({ error: 'Failed to add liquidity' })
  }
})

export { router as poolsRouter }
