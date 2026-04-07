import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { pool } from '../config/database'
import { z } from 'zod'
import { logger } from '../utils/logger'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Validation schemas
const registerSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  username: z.string().min(3).max(100).optional(),
  email: z.string().email().optional(),
  referrerCode: z.string().optional(),
})

const loginSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string(),
  message: z.string(),
})

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { address, username, email, referrerCode } = registerSchema.parse(req.body)

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE address = $1', [address])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Generate referral code
    const referralCode = uuidv4().replace(/-/g, '').substring(0, 12)

    // Find referrer if code provided
    let referrerId = null
    if (referrerCode) {
      const referrer = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referrerCode])
      if (referrer.rows.length > 0) {
        referrerId = referrer.rows[0].id
      }
    }

    // Create user
    const result = await pool.query(
      `INSERT INTO users (address, username, email, referrer_id, referral_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, address, username, email, referral_code, created_at`,
      [address, username, email, referrerId, referralCode]
    )

    const user = result.rows[0]

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, address: user.address },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.status(201).json({
      user: {
        id: user.id,
        address: user.address,
        username: user.username,
        referralCode: user.referral_code,
      },
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    logger.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login (simplified - in production would verify signature)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { address } = loginSchema.parse(req.body)

    // Find user
    const result = await pool.query(
      'SELECT id, address, username, email, referral_code FROM users WHERE address = $1',
      [address]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = result.rows[0]

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, address: user.address },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({
      user: {
        id: user.id,
        address: user.address,
        username: user.username,
        referralCode: user.referral_code,
      },
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    logger.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; address: string }

    const result = await pool.query(
      `SELECT id, address, username, email, referral_code, total_volume, 
              total_fees, referral_earnings, created_at
       FROM users WHERE id = $1`,
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    logger.error('Get user error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
})

export { router as authRouter }
