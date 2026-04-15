import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white dark:bg-gray-700 dark:hover:bg-gray-800',
    outline: 'border border-gray-300 hover:bg-gray-100 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300',
    ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300',
    destructive: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`rounded-lg font-medium transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
