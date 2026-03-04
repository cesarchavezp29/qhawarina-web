'use client';

interface ImpactCardProps {
  title: string
  value: string | number
  change?: number
  unit?: string
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'default' | 'success' | 'danger' | 'warning'
}

export default function ImpactCard({
  title,
  value,
  change,
  unit = '',
  description,
  trend,
  variant = 'default'
}: ImpactCardProps) {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    danger: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200'
  }

  const trendIcon = { up: '↑', down: '↓', neutral: '→' }
  const trendColor = { up: 'text-green-600', down: 'text-red-600', neutral: 'text-gray-600' }

  return (
    <div className={`border rounded-lg p-6 ${variantClasses[variant]}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {unit && <span className="text-lg text-gray-600">{unit}</span>}
      </div>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <span className={`text-xl ${trendColor[trend]}`}>{trendIcon[trend]}</span>
          )}
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {change > 0 ? '+' : ''}{change.toFixed(2)}pp
          </span>
        </div>
      )}
      {description && <p className="mt-3 text-sm text-gray-600">{description}</p>}
    </div>
  )
}
