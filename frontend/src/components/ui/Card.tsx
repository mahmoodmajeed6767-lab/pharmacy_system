import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  value?: string | number;
  icon?: ReactNode;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'warning';
  accent?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function Card({ title, value, icon, subtitle, className = '', children, onClick, variant = 'default', accent }: CardProps) {
  const borderStyles = {
    default: 'border-gray-200 dark:border-gray-700',
    danger: 'border-red-200 dark:border-red-800',
    warning: 'border-yellow-200 dark:border-yellow-800',
  };

  const accentBars: Record<string, string> = {
    blue: 'bg-[#1a5c7a]',
    green: 'bg-emerald-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${borderStyles[variant]} ${onClick ? 'cursor-pointer hover:shadow-md' : ''} overflow-hidden ${className}`}
      onClick={onClick}
    >
      {accent && <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBars[accent]}`} />}
      <div className="p-5">
        {title && value ? (
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5">{value}</p>
              {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {icon && <div className="ml-3 w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-500 shrink-0">{icon}</div>}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
