'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function NotFound() {
  const isEn = useLocale() === 'en';

  const links = isEn ? [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/estadisticas', label: 'Statistics', icon: '📊' },
    { href: '/estadisticas/pbi', label: 'GDP Nowcast', icon: '📈' },
    { href: '/estadisticas/inflacion', label: 'Inflation', icon: '💰' },
    { href: '/estadisticas/pobreza', label: 'Poverty', icon: '🗺️' },
    { href: '/datos', label: 'Open Data', icon: '📥' },
    { href: '/simuladores', label: 'Simulators', icon: '🔬' },
    { href: '/metodologia', label: 'Methodology', icon: '📖' },
  ] : [
    { href: '/', label: 'Inicio', icon: '🏠' },
    { href: '/estadisticas', label: 'Estadísticas', icon: '📊' },
    { href: '/estadisticas/pbi', label: 'PBI Nowcast', icon: '📈' },
    { href: '/estadisticas/inflacion', label: 'Inflación', icon: '💰' },
    { href: '/estadisticas/pobreza', label: 'Pobreza', icon: '🗺️' },
    { href: '/datos', label: 'Datos Abiertos', icon: '📥' },
    { href: '/simuladores', label: 'Simuladores', icon: '🔬' },
    { href: '/metodologia', label: 'Metodología', icon: '📖' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <p className="text-8xl font-bold text-blue-800 mb-2">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEn ? 'Page not found' : 'Página no encontrada'}
        </h1>
        <p className="text-gray-500 mb-8">
          {isEn
            ? 'The page you are looking for does not exist or was moved. Try one of these links:'
            : 'La página que buscas no existe o fue movida. Intenta con alguno de estos enlaces:'}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8 text-left">
          {links.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-blue-400 hover:text-blue-800 transition-colors"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors"
        >
          {isEn ? '← Back to home' : '← Volver al inicio'}
        </Link>
      </div>
    </div>
  );
}
