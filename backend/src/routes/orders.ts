import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool, redis } from '../config/database'
import { logger } from '../utils/logger'
import { z } from 'zod'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Middleware to authenticate
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

// Validation schemas
const placeOrderSchema = z.object({
  pairId: z.string(),
  direction: z.enum(['BUY', 'SELL']),
  orderType: z.enum(['MARKET', 'LIMIT']),
  price: z.number().optional(),
  quantity: z.number().positive(),
  expiresAt: z.number().optional(),
})

// Place order
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { pairId, direction, orderType, price, quantity, expiresAt } = placeOrderSchema.parse(req.body)
    const userId = (req as any).user.userId

    // Validate pair exists
    const pairResult = await pool.query('SELECT * FROM trading_pairs WHERE pair_id = $1', [pairId])
    if (pairResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trading pair not found' })
    }

    const pair = pairResult.rows[0]

    // Check minimum order size
    if (quantity < Number(pair.min_order_size)) {
      return res.status(400).json({ error: 'Order size too small' })
    }

    // For limit orders, price is required
    if (orderType === 'LIMIT' && !price) {
      return res.status(400).json({ error: 'Price required for limit orders' })
    }

    // Create order
    const result = await pool.query(`
      INSERT INTO orders (user_id, pair_id, direction, order_type, price, quantity, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [userId, pairId, direction, orderType, price || 0, quantity, expiresAt ? new Date(expiresAt) : null])

    const order = result.rows[0]

    // Invalidate order book cache
    await redis.del(`orderbook:${pairId}`)

    // If market order, execute immediately (simplified)
    if (orderType === 'MARKET') {
      // Update order status
      await pool.query(`
        UPDATE orders SET status = 'FILLED', filled_quantity = $1 WHERE id = $2
      `, [quantity, order.id])

      // Record trade
      await pool.query(`
        INSERT INTO trades (order_id, pair_id, direction, price, quantity, fee, taker_user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [order.id, pairId, direction, price || 0, quantity, quantity * Number(pair.taker_fee), userId])
    }

    res.status(201).json({
      order: {
        id: order.id,
        orderId: order.order_id,
        pairId: order.pair_id,
        direction: order.direction,
        orderType: order.order_type,
        price: Number(order.price),
        quantity: Number(order.quantity),
        filledQuantity: Number(order.filled_quantity),
        status: order.status,
        createdAt: order.created_at,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    logger.error('Place order error:', error)
    res.status(500).json({ error: 'Failed to place order' })
  }
})

// Get user's orders
router.get('/my', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0
    const status = req.query.status as string

    let query = `
      SELECT o.*, tp.base_symbol, tp.quote_symbol
      FROM orders o
      JOIN trading_pairs tp ON o.pair_id = tp.pair_id
      WHERE o.user_id = $1
    `
    const params: any[] = [userId]

    if (status) {
      query += ` AND o.status = $${params.length + 1}`
      params.push(status)
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    res.json({
      orders: result.rows.map(o => ({
        id: o.id,
        orderId: o.order_id,
        pair: `${o.base_symbol}/${o.quote_symbol}`,
        pairId: o.pair_id,
        direction: o.direction.toLowerCase(),
        orderType: o.order_type.toLowerCase(),
        price: Number(o.price),
        quantity: Number(o.quantity),
        filledQuantity: Number(o.filled_quantity),
        status: o.status.toLowerCase().replace('_', ''),
        createdAt: o.created_at,
        expiresAt: o.expires_at,
      })),
    })
  } catch (error) {
    logger.error('Get orders error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Cancel order
router.delete('/:orderId', authenticate, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    const userId = (req as any).user.userId

    // Check order exists and belongs to user
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    )

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orderResult.rows[0]

    if (order.status !== 'PENDING' && order.status !== 'PARTIALLY_FILLED') {
      return res.status(400).json({ error: 'Order cannot be cancelled' })
    }

    // Update order status
    await pool.query(
      "UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1",
      [orderId]
    )

    // Invalidate cache
    await redis.del(`orderbook:${order.pair_id}`)

    res.json({ success: true, message: 'Order cancelled' })
  } catch (error) {
    logger.error('Cancel order error:', error)
    res.status(500).json({ error: 'Failed to cancel order' })
  }
})

export { router as ordersRouter }
