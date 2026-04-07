import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  rightElement?: React.ReactNode
}

export function Input({
  label,
  error,
  rightElement,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-binance-text-muted mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={clsx(
            'w-full px-3 py-2 bg-binance-border border border-binance-border rounded-md text-binance-text placeholder-binance-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-binance-gold focus:border-transparent',
            'transition-all duration-200',
            error && 'border-sell focus:ring-sell',
            rightElement && 'pr-16',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-sell">{error}</p>
      )}
    </div>
  )
}
