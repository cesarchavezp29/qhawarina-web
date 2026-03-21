import { ReactNode } from 'react';

interface ChartCardProps {
  children: ReactNode;
  className?: string;
  /** Extra padding override — defaults to p-6 */
  padding?: string;
}

/**
 * Standard chart container used across all Qhawarina stat pages.
 * bg: #FAF8F4, rounded-xl, border border-gray-200, p-6 mb-6
 */
export default function ChartCard({ children, className = '', padding = 'p-6' }: ChartCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 ${padding} mb-6 ${className}`}
      style={{ background: '#FAF8F4' }}
    >
      {children}
    </div>
  );
}
