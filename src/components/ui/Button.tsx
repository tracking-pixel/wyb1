import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none';

  const sizeStyles = {
    sm: 'min-h-[36px] px-3 text-xs rounded-xl',
    md: 'min-h-[44px] px-4 text-sm rounded-xl',
    lg: 'min-h-[48px] px-6 text-base rounded-2xl shadow-sm',
    xl: 'min-h-[54px] px-6 text-base font-semibold rounded-2xl shadow-md w-full',
  }[size];

  const variantStyles = {
    primary:
      'bg-rose-800 hover:bg-rose-900 active:bg-rose-950 text-white shadow-rose-900/15 focus-visible:outline-rose-800',
    secondary:
      'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white shadow-rose-500/20 focus-visible:outline-rose-500',
    soft: 'bg-rose-100/80 hover:bg-rose-100 text-rose-900 focus-visible:outline-rose-400',
    outline:
      'border border-rose-200 hover:border-rose-300 bg-white hover:bg-rose-50/50 text-rose-900 focus-visible:outline-rose-300',
    ghost:
      'text-slate-600 hover:text-rose-900 hover:bg-rose-50/60 focus-visible:outline-rose-400',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
