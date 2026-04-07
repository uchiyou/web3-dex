import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-binance-card rounded-lg border border-binance-border',
        onClick && 'cursor-pointer hover:border-binance-border/80 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
