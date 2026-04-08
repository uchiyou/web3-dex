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
        <label className="block text-sm font-semibold text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={clsx(
            'form-input',
            error && 'border-red focus:border-red focus:ring-red/20',
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
        <p className="mt-1 text-sm text-red">{error}</p>
      )}
    </div>
  )
}
