import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#0078d4] text-white hover:bg-[#106ebe] shadow-sm',
        secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700',
        outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800',
        ghost: 'hover:bg-neutral-100 hover:text-neutral-900 text-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        subtle: 'text-[#0078d4] hover:bg-blue-50 dark:hover:bg-blue-950/40',
      },
      size: {
        default: 'h-8 px-3 py-1.5',
        sm: 'h-7 rounded px-2 text-xs',
        lg: 'h-9 px-4',
        icon: 'h-8 w-8',
        iconSm: 'h-6 w-6 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
