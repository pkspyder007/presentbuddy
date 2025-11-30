import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'lg'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild, ...props }, ref) => {
    const baseClasses = cn(
          'inline-flex items-center justify-center font-medium transition-colors',
          'focus:outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2',
          {
            'bg-gray-950 text-white hover:bg-gray-900 active:bg-gray-800':
              variant === 'default',
            'bg-white text-gray-950 border border-gray-300 hover:bg-gray-50 active:bg-gray-100':
              variant === 'outline',
            'bg-transparent text-gray-950 hover:bg-gray-100 active:bg-gray-200':
              variant === 'ghost',
            'text-base px-6 py-3': size === 'lg',
            'text-sm px-5 py-2': size === 'default',
          },
          className
    )

    if (asChild && React.isValidElement(props.children)) {
      return React.cloneElement(props.children as React.ReactElement, {
        className: cn(baseClasses, (props.children as React.ReactElement).props.className),
        ref,
      })
    }

    return (
      <button
        className={baseClasses}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
