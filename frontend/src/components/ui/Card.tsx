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
        'trade-panel',
        onClick && 'cursor-pointer transition-all',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
