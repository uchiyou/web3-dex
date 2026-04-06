import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import { logger } from './utils/logger'
import { initializeDatabase } from './config/database'
import { redis } from './config/database'

// Routes
import { authRouter } from './routes/auth'
import { pairsRouter } from './routes/pairs'
import { ordersRouter } from './routes/orders'
import { poolsRouter } from './routes/pools'
import { referralRouter } from './routes/referral'
import { pricesRouter } from './routes/prices'
import { userRouter } from './routes/user'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/pairs', pairsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/pools', poolsRouter)
app.use('/api/referral', referralRouter)
app.use('/api/prices', pricesRouter)
app.use('/api/user', userRouter)

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)

  // Join pair-specific room
  socket.on('join:pair', (pairId: string) => {
    socket.join(`pair:${pairId}`)
    logger.debug(`Client ${socket.id} joined room: pair:${pairId}`)
  })

  // Leave pair room
  socket.on('leave:pair', (pairId: string) => {
    socket.leave(`pair:${pairId}`)
  })

  // Subscribe to order book updates
  socket.on('subscribe:orderbook', async (pairId: string) => {
    socket.join(`orderbook:${pairId}`)
    // Send initial order book data
    const orderBook = await getOrderBookData(pairId)
    socket.emit('orderbook:data', orderBook)
  })

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Order book data fetcher (mock - in production would be from contract/indexer)
async function getOrderBookData(pairId: string) {
  // Mock data
  return {
    pairId,
    bids: [
      { price: 1850.20, quantity: 12.5, orders: 3 },
      { price: 1850.00, quantity: 8.3, orders: 2 },
      { price: 1849.50, quantity: 15.2, orders: 4 },
    ],
    asks: [
      { price: 1850.80, quantity: 5.2, orders: 2 },
      { price: 1851.00, quantity: 9.7, orders: 3 },
      { price: 1851.50, quantity: 14.3, orders: 5 },
    ],
    spread: 0.60,
    timestamp: Date.now(),
  }
}

// Broadcast price updates to all clients
export function broadcastPriceUpdate(pairId: string, data: any) {
  io.to(`pair:${pairId}`).emit('price:update', data)
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase()
    logger.info('Database connected')

    // Test Redis connection
    await redis.ping()
    logger.info('Redis connected')

    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
      logger.info(`WebSocket server ready`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export { io }
