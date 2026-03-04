import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <p className="text-8xl font-bold text-blue-800 mb-2">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-500 mb-8">
          La página que buscas no existe o fue movida. Intenta con alguno de estos enlaces:
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8 text-left">
          {[
            { href: '/', label: 'Inicio', icon: '🏠' },
            { href: '/estadisticas', label: 'Estadísticas', icon: '📊' },
            { href: '/estadisticas/pbi', label: 'PBI Nowcast', icon: '📈' },
            { href: '/estadisticas/inflacion', label: 'Inflación', icon: '💰' },
            { href: '/estadisticas/pobreza', label: 'Pobreza', icon: '🗺️' },
            { href: '/datos', label: 'Datos Abiertos', icon: '📥' },
            { href: '/simuladores', label: 'Simuladores', icon: '🔬' },
            { href: '/metodologia', label: 'Metodología', icon: '📖' },
          ].map(({ href, label, icon }) => (
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
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
