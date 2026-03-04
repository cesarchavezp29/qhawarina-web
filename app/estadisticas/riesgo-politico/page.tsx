'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LastUpdate from '../../components/stats/LastUpdate';
import EmbedWidget from '../../components/EmbedWidget';

interface PoliticalData {
  metadata: { generated_at: string; coverage_days: number; rss_feeds: number };
  current: { date: string; score: number; level: string; articles_total: number; articles_political: number; articles_economic: number };
}

const LEVEL_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  BAJO:       { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-300' },
  'MEDIO-BAJO': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  MEDIO:      { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  ALTO:       { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-300' },
  'MUY ALTO': { bg: 'bg-red-100',   text: 'text-red-900',    border: 'border-red-500' },
};

export default function RiesgoPoliticoPage() {
  const [data, setData] = useState<PoliticalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/political_index_daily.json?v=${new Date().toISOString().split('T')[0]}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando datos...</p></div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">Error cargando datos. <button onClick={() => window.location.reload()} className="underline">Reintentar</button></p></div>;

  const level = data.current.level;
  const styles = LEVEL_STYLES[level] ?? LEVEL_STYLES['MEDIO'];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {' / '}
          <span className="text-gray-900 font-medium">Riesgo Político</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">Índice de Riesgo Político</h1>
          <EmbedWidget path="/estadisticas/riesgo-politico" title="Índice de Riesgo Político — Qhawarina" height={600} />
        </div>

        {/* Current score */}
        <div className={`mt-4 inline-flex items-center gap-4 px-5 py-3 rounded-xl border-2 ${styles.border} ${styles.bg}`}>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nivel actual</p>
            <p className={`text-3xl font-bold ${styles.text}`}>{data.current.score.toFixed(3)}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${styles.bg} ${styles.text} border ${styles.border}`}>
            {level}
          </div>
        </div>

        <div className="mt-3">
          <LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Artículos analizados hoy', value: data.current.articles_total.toString() },
            { label: 'Artículos políticos', value: data.current.articles_political.toString() },
            { label: 'Artículos económicos', value: data.current.articles_economic.toString() },
            { label: 'Feeds RSS monitoreados', value: data.metadata.rss_feeds.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/estadisticas/riesgo-politico/metodologia">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📖</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Metodología</h2>
                  <p className="text-sm text-gray-600 mt-1">Clasificación GPT-4o de 81 feeds RSS, componentes y pesos</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/datos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📥</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Descargar Datos</h2>
                  <p className="text-sm text-gray-600 mt-1">Serie diaria completa — {data.metadata.coverage_days} días de cobertura</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
