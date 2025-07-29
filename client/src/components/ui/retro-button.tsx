import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  gradient?: string;
}

const variants = {
  primary: "linear-gradient(135deg, #FFD700 0%, #FF69B4 100%)",
  secondary: "linear-gradient(135deg, #00FFFF 0%, #8A2BE2 100%)",
  success: "linear-gradient(135deg, #90EE90 0%, #32CD32 100%)",
  warning: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
  danger: "linear-gradient(135deg, #FF6B6B 0%, #FF4444 100%)"
};

const sizes = {
  sm: "px-3 py-1 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-xl"
};

export function RetroButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  gradient,
  className, 
  ...props 
}: RetroButtonProps) {
  const buttonStyle = gradient || variants[variant];
  
  return (
    <button
      className={cn(
        "retro-button font-display font-bold rounded transition-all duration-200",
        sizes[size],
        className
      )}
      style={{ background: buttonStyle }}
      data-testid="retro-button"
      {...props}
    >
      {children}
    </button>
  );
}
