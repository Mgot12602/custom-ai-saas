import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'default', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-display font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none'
  
  const variantClasses = {
    default: 'bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-sm',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-sm',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm',
    outline: 'border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-secondary-200 dark:hover:bg-neutral-700',
    destructive: 'bg-error-500 text-white hover:bg-error-600 shadow-sm'
  }
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
