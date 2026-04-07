import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database'
import { logger } from '../utils/logger'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function authenticate(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; address: string }
    ;(req as any).user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Get user dashboard data
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    // Get user info
    const userResult = await pool.query(`
      SELECT address, username, email, total_volume, total_fees, 
             referral_earnings, referral_code, created_at
      FROM users WHERE id = $1
    `, [userId])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get recent orders
    const ordersResult = await pool.query(`
      SELECT o.*, tp.base_symbol, tp.quote_symbol
      FROM orders o
      JOIN trading_pairs tp ON o.pair_id = tp.pair_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [userId])

    // Get LP positions
    const positionsResult = await pool.query(`
      SELECT lp.*, tp.base_symbol, tp.quote_symbol
      FROM lp_positions lp
      JOIN liquidity_pools l ON lp.pool_id = l.id
      JOIN trading_pairs tp ON l.pair_id = tp.pair_id
      WHERE lp.user_id = $1 AND lp.lp_balance > 0
    `, [userId])

    // Get referral earnings history
    const earningsResult = await pool.query(`
      SELECT SUM(reward) as total, DATE(created_at) as date
      FROM referral_earnings
      WHERE referrer_id = $1 AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [userId])

    res.json({
      user: userResult.rows[0],
      recentOrders: ordersResult.rows,
      lpPositions: positionsResult.rows,
      referralEarnings: earningsResult.rows,
    })
  } catch (error) {
    logger.error('Get dashboard error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard' })
  }
})

// Update user profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const { username, email } = req.body

    await pool.query(`
      UPDATE users SET username = COALESCE($1, username),
                       email = COALESCE($2, email),
                       updated_at = NOW()
      WHERE id = $3
    `, [username, email, userId])

    res.json({ success: true })
  } catch (error) {
    logger.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Get user statistics
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    // Get trade stats
    const tradeStats = await pool.query(`
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN direction = 'BUY' THEN quantity ELSE 0 END) as total_buys,
        SUM(CASE WHEN direction = 'SELL' THEN quantity ELSE 0 END) as total_sells,
        SUM(fee) as total_fees_paid
      FROM orders
      WHERE user_id = $1 AND status = 'FILLED'
    `, [userId])

    // Get P&L (simplified)
    const pnResult = await pool.query(`
      SELECT 
        SUM(CASE WHEN direction = 'SELL' THEN quantity * price 
                 WHEN direction = 'BUY' THEN -quantity * price END) as pnl
      FROM trades
      WHERE taker_user_id = $1
    `, [userId])

    res.json({
      totalTrades: parseInt(tradeStats.rows[0].total_trades) || 0,
      totalBuys: Number(tradeStats.rows[0].total_buys) || 0,
      totalSells: Number(tradeStats.rows[0].total_sells) || 0,
      totalFeesPaid: Number(tradeStats.rows[0].total_fees_paid) || 0,
      estimatedPnL: Number(pnResult.rows[0].pnl) || 0,
    })
  } catch (error) {
    logger.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export { router as userRouter }
