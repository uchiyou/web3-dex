import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database'
import { logger } from '../utils/logger'
import { z } from 'zod'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function authenticate(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    ;(req as any).user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Get referral info
router.get('/info', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    const userResult = await pool.query(
      'SELECT referral_code, total_referrals, referral_earnings FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = userResult.rows[0]

    // Get direct referrals
    const referralsResult = await pool.query(`
      SELECT u.address, u.username, u.created_at
      FROM users u
      WHERE u.referrer_id = $1
      ORDER BY u.created_at DESC
      LIMIT 100
    `, [userId])

    res.json({
      referralCode: user.referral_code,
      totalReferrals: parseInt(user.total_referrals) || 0,
      totalEarnings: Number(user.referral_earnings) || 0,
      referrals: referralsResult.rows,
    })
  } catch (error) {
    logger.error('Get referral info error:', error)
    res.status(500).json({ error: 'Failed to fetch referral info' })
  }
})

// Get referral statistics
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    // Get earnings by level
    const earningsResult = await pool.query(`
      SELECT level, SUM(reward) as total, COUNT(*) as count
      FROM referral_earnings
      WHERE referrer_id = $1
      GROUP BY level
      ORDER BY level
    `, [userId])

    // Get volume by referral
    const volumeResult = await pool.query(`
      SELECT SUM(re.trade_volume) as volume, u.id, u.address
      FROM referral_earnings re
      JOIN users u ON re.user_id = u.id
      WHERE re.referrer_id = $1
      GROUP BY u.id, u.address
      ORDER BY volume DESC
      LIMIT 10
    `, [userId])

    res.json({
      earningsByLevel: earningsResult.rows,
      topReferrals: volumeResult.rows,
    })
  } catch (error) {
    logger.error('Get referral stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Register referral (called when user signs up with code)
router.post('/register', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const { referralCode } = req.body

    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code required' })
    }

    // Find referrer
    const referrerResult = await pool.query(
      'SELECT id FROM users WHERE referral_code = $1',
      [referralCode]
    )

    if (referrerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid referral code' })
    }

    const referrerId = referrerResult.rows[0].id

    // Can't refer yourself
    if (referrerId === userId) {
      return res.status(400).json({ error: 'Cannot refer yourself' })
    }

    // Update user's referrer
    await pool.query(
      'UPDATE users SET referrer_id = $1 WHERE id = $2',
      [referrerId, userId]
    )

    // Update referrer's count
    await pool.query(
      'UPDATE users SET total_referrals = total_referrals + 1 WHERE id = $1',
      [referrerId]
    )

    res.json({ success: true, message: 'Referral registered' })
  } catch (error) {
    logger.error('Register referral error:', error)
    res.status(500).json({ error: 'Failed to register referral' })
  }
})

export { router as referralRouter }
