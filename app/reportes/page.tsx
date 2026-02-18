'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Parse YYYY-MM-DD as local date (avoids UTC-to-local day-shift bug)
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

type ReportType = 'diario-economico' | 'diario-politico' | 'mensual-economico' | 'mensual-politico';

interface Report {
  id: string;
  title: string;
  date: string;
  filename: string;
  size: string;
  description: string;
}

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('diario-economico');
  const [reports, setReports] = useState<Record<ReportType, Report[]>>({
    'diario-economico': [],
    'diario-politico': [],
    'mensual-economico': [],
    'mensual-politico': []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - in production, this would fetch from an API
    const sampleReports: Record<ReportType, Report[]> = {
      'diario-economico': [
        {
          id: '2026-02-15',
          title: 'Reporte Económico Diario',
          date: '2026-02-15',
          filename: 'reporte_economico_2026-02-15.pdf',
          size: '1.2 MB',
          description: 'Indicadores clave: PBI, inflación, tipo de cambio, reservas, crédito'
        },
        {
          id: '2026-02-14',
          title: 'Reporte Económico Diario',
          date: '2026-02-14',
          filename: 'reporte_economico_2026-02-14.pdf',
          size: '1.1 MB',
          description: 'Indicadores clave: PBI, inflación, tipo de cambio, reservas, crédito'
        }
      ],
      'diario-politico': [
        {
          id: '2026-02-15',
          title: 'Reporte Político Diario',
          date: '2026-02-15',
          filename: 'reporte_politico_2026-02-15.pdf',
          size: '0.8 MB',
          description: 'Índice de inestabilidad, eventos destacados, análisis de noticias'
        },
        {
          id: '2026-02-14',
          title: 'Reporte Político Diario',
          date: '2026-02-14',
          filename: 'reporte_politico_2026-02-14.pdf',
          size: '0.9 MB',
          description: 'Índice de inestabilidad, eventos destacados, análisis de noticias'
        }
      ],
      'mensual-economico': [
        {
          id: '2026-01',
          title: 'Reporte Económico Mensual - Enero 2026',
          date: '2026-02-01',
          filename: 'reporte_economico_mensual_2026-01.pdf',
          size: '3.5 MB',
          description: 'Análisis completo: nowcasts, backtests, tendencias, comparativas regionales'
        },
        {
          id: '2025-12',
          title: 'Reporte Económico Mensual - Diciembre 2025',
          date: '2026-01-01',
          filename: 'reporte_economico_mensual_2025-12.pdf',
          size: '3.4 MB',
          description: 'Análisis completo: nowcasts, backtests, tendencias, comparativas regionales'
        }
      ],
      'mensual-politico': [
        {
          id: '2026-01',
          title: 'Reporte Político Mensual - Enero 2026',
          date: '2026-02-01',
          filename: 'reporte_politico_mensual_2026-01.pdf',
          size: '2.1 MB',
          description: 'Resumen mensual: tendencias, eventos críticos, análisis de componentes'
        },
        {
          id: '2025-12',
          title: 'Reporte Político Mensual - Diciembre 2025',
          date: '2026-01-01',
          filename: 'reporte_politico_mensual_2025-12.pdf',
          size: '2.0 MB',
          description: 'Resumen mensual: tendencias, eventos críticos, análisis de componentes'
        }
      ]
    };

    setReports(sampleReports);
    setLoading(false);
  }, []);

  const tabs: { id: ReportType; label: string; description: string }[] = [
    { id: 'diario-economico', label: 'Diario Económico', description: 'Actualizaciones diarias de indicadores económicos' },
    { id: 'diario-politico', label: 'Diario Político', description: 'Índice de inestabilidad y eventos políticos diarios' },
    { id: 'mensual-economico', label: 'Mensual Económico', description: 'Análisis mensual completo de economía' },
    { id: 'mensual-politico', label: 'Mensual Político', description: 'Resumen mensual de riesgo político' }
  ];

  const currentReports = reports[activeTab];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
                <Link href="/reportes" className="text-gray-900 font-semibold">Reportes</Link>
                <Link href="/data" className="text-gray-600 hover:text-gray-900 font-medium">Datos</Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Reportes
          </h1>
          <p className="text-sm text-gray-600">
            Documentos generados automáticamente con análisis económico y político
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 mb-8">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Description */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>{tabs.find(t => t.id === activeTab)?.label}:</strong>{' '}
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </div>

        {/* Reports List */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="border border-gray-300">
            <div className="bg-gray-50 border-b border-gray-300 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Reportes Disponibles ({currentReports.length})
              </h3>
            </div>

            {currentReports.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p className="text-sm">No hay reportes disponibles en esta categoría.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 bg-white">
                {currentReports.map((report) => (
                  <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-1">
                          {report.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {parseLocalDate(report.date).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {report.size}
                          </span>
                          <span className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-300 font-mono text-xs">
                            PDF
                          </span>
                        </div>
                      </div>
                      <div className="ml-6 flex gap-2">
                        <button
                          onClick={() => {
                            // In production, this would open a preview
                            window.open(`/assets/reportes/${report.filename}`, '_blank');
                          }}
                          className="px-4 py-2 text-xs text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium"
                        >
                          Vista Previa
                        </button>
                        <a
                          href={`/assets/reportes/${report.filename}`}
                          download
                          className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 font-medium"
                        >
                          Descargar ↓
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 border border-gray-300 p-6 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Información
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Generación:</strong> Los reportes se generan automáticamente cada día a las 08:00 PET
              utilizando los datos más recientes disponibles.
            </p>
            <p>
              <strong>Formato:</strong> Todos los reportes están en formato PDF optimizado para impresión y lectura digital.
            </p>
            <p>
              <strong>Licencia:</strong> Los reportes están disponibles bajo licencia CC BY 4.0.
              Puedes compartirlos y adaptarlos con atribución apropiada.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="border border-gray-300">
      <div className="bg-gray-50 border-b border-gray-300 px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>
      <div className="divide-y divide-gray-200">
        {[1, 2, 3].map(i => (
          <div key={i} className="px-6 py-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
