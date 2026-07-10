interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-500/20',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-600/10 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-500/20',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/20',
    info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500/20',
    default: 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/10 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
