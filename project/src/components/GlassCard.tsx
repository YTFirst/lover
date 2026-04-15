import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  borderRadius?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  padding = 'p-4',
  borderRadius = 'rounded-lg',
}) => {
  return (
    <div
      className={`backdrop-blur-md bg-white/20 ${padding} ${borderRadius} border border-white/30 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};
