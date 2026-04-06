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
        'bg-dark-300 rounded-xl border border-dark-100',
        onClick && 'cursor-pointer hover:bg-dark-200 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
