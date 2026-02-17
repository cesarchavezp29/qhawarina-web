'use client';

import Link from 'next/link';

const dataFiles = [
  {
    category: 'Nowcasts (Predicciones Actuales)',
    files: [
      { name: 'Nowcast PBI', file: 'gdp_nowcast.json', format: 'JSON', size: '1.6 KB', desc: 'Predicción trimestral de crecimiento' },
      { name: 'Nowcast Inflación', file: 'inflation_nowcast.json', format: 'JSON', size: '1.3 KB', desc: 'Predicción mensual de variación IPC' },
      { name: 'Nowcast Pobreza', file: 'poverty_nowcast.json', format: 'JSON', size: '18 KB', desc: '24 departamentos + 1,891 distritos' },
      { name: 'Índice Político', file: 'political_index_daily.json', format: 'JSON', size: '7.3 KB', desc: 'Índice diario de inestabilidad (90 días)' },
    ]
  },
  {
    category: 'Panel Histórico',
    files: [
      { name: 'Panel Nacional', file: 'panel_national_monthly.csv', format: 'CSV', size: '2.2 MB', desc: '84 series nacionales (2003-2026)' },
      { name: 'Panel Departamental', file: 'panel_departmental_monthly.csv', format: 'CSV', size: '17 MB', desc: '406 series regionales (2007-2025)' },
      { name: 'Pobreza Distrital', file: 'poverty_districts_full.csv', format: 'CSV', size: '138 KB', desc: 'Estimaciones distritales completas' },
    ]
  },
  {
    category: 'Resultados de Backtest',
    files: [
      { name: 'Backtest PBI', file: 'backtest_gdp.csv', format: 'CSV', size: '9 KB', desc: '2009-2025 (60 trimestres)' },
      { name: 'Backtest Inflación', file: 'backtest_inflation.csv', format: 'CSV', size: '43 KB', desc: '2012-2026 (180 meses)' },
      { name: 'Backtest Pobreza', file: 'backtest_poverty.csv', format: 'CSV', size: '59 KB', desc: '2012-2024 (312 observaciones)' },
    ]
  }
];

export default function DataPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Cabecera */}
      <header className="border-b border-gray-300 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-6">
              <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
                QHAWARINA
              </Link>
              <nav className="flex gap-6 text-sm">
                <Link href="/gdp" className="text-gray-600 hover:text-gray-900 font-medium">PBI</Link>
                <Link href="/inflation" className="text-gray-600 hover:text-gray-900 font-medium">Inflación</Link>
                <Link href="/poverty" className="text-gray-600 hover:text-gray-900 font-medium">Pobreza</Link>
                <Link href="/political" className="text-gray-600 hover:text-gray-900 font-medium">Riesgo Político</Link>
                <Link href="/reportes" className="text-gray-600 hover:text-gray-900 font-medium">Reportes</Link>
                <Link href="/data" className="text-gray-900 font-semibold">Datos</Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Descargas de Datos
          </h1>
          <p className="text-sm text-gray-600">
            Actualización diaria a las 08:00 PET | Licencia:{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              CC BY 4.0
            </a>
          </p>
        </div>

        {/* Secciones de Datos */}
        {dataFiles.map((category, idx) => (
          <div key={idx} className="border border-gray-300 mb-8">
            <div className="bg-gray-50 border-b border-gray-300 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {category.category}
              </h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Formato
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Descarga
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {category.files.map((file, fidx) => (
                  <tr key={fidx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {file.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {file.desc}
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-gray-600">
                      <span className="inline-block px-2 py-1 bg-gray-100 border border-gray-300 font-mono">
                        {file.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-gray-600">
                      {file.size}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={`/assets/data/${file.file}`}
                        download
                        className="inline-block text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Descargar ↓
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Licencia */}
        <div className="border border-gray-300 p-6 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Licencia y Citación
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Licencia:</strong> Todos los datos están disponibles bajo{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Creative Commons Attribution 4.0 International (CC BY 4.0)
              </a>.
              Eres libre de usar, compartir y adaptar estos datos, siempre que des crédito apropiado.
            </p>
            <p>
              <strong>Citación sugerida:</strong>
            </p>
            <div className="border border-gray-300 bg-white p-4 mt-2">
              <p className="text-sm font-mono text-gray-800">
                Qhawarina (2026). "Plataforma de Nowcasting Económico para Perú."
                <br />
                Consultado desde https://qhawarina.pe
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
