'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LastUpdate from "../../components/stats/LastUpdate";
import EmbedWidget from "../../components/EmbedWidget";
import ShareButton from "../../components/ShareButton";
import DataFreshnessWarning from "../../components/DataFreshnessWarning";
import PageSkeleton from "../../components/PageSkeleton";

interface InflationData {
  metadata: { generated_at: string };
  recent_months: Array<{ month: string; official: number | null; nowcast: number | null }>;
  nowcast: { target_period: string; value: number };
}

export default function InflacionPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const T = isEn ? {
    breadcrumb: 'Statistics',
    title: 'Inflation',
    nowcastLabel: 'Monthly nowcast',
    cardCharts: 'Time Series',
    cardChartsDesc: 'Monthly inflation historical series',
    cardCategories: 'Categories',
    cardCategoriesDesc: 'Core, food, tradables and more',
    cardMaps: 'Regional Distribution',
    cardMapsDesc: 'CPI by main cities',
    methodology: 'View full methodology →',
    error: 'Error loading data.',
    retry: 'Retry',
    dataName: 'inflation data',
  } : {
    breadcrumb: 'Estadísticas',
    title: 'Inflación',
    nowcastLabel: 'Nowcast mensual',
    cardCharts: 'Evolución Temporal',
    cardChartsDesc: 'Serie histórica mensual de inflación',
    cardCategories: 'Categorías',
    cardCategoriesDesc: 'Core, alimentos, transables y más',
    cardMaps: 'Distribución Regional',
    cardMapsDesc: 'IPC por ciudades principales',
    methodology: 'Ver metodología completa →',
    error: 'Error cargando datos.',
    retry: 'Reintentar',
    dataName: 'los datos de inflación',
  };

  const [data, setData] = useState<InflationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/inflation_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return <PageSkeleton cards={3} />;
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{T.error} <button onClick={() => window.location.reload()} className="underline">{T.retry}</button></p>
    </div>
  );

  const valStr = `${data.nowcast.value > 0 ? '+' : ''}${data.nowcast.value.toFixed(3)}%`;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">{T.breadcrumb}</a>
          {" / "}
          <span className="text-gray-900 font-medium">{T.title}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">{T.title}</h1>
          <div className="flex gap-2">
            <ShareButton title={`${T.title} — Qhawarina`} text={isEn ? `📊 Inflation Nowcast Peru ${data.nowcast.target_period}: ${valStr} (MA3M) | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion` : `📊 Inflación Perú ${data.nowcast.target_period}: ${valStr} (MA3M) | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion`} />
            <EmbedWidget path="/estadisticas/inflacion" title={`${T.title} — Nowcasting Qhawarina`} height={600} />
          </div>
        </div>
        <p className="text-lg text-gray-600">{T.nowcastLabel} - {data.nowcast.target_period}: {valStr}</p>
        <div className="mt-4">
          <LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>
        <DataFreshnessWarning generatedAt={data.metadata.generated_at} dataName={T.dataName} />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/estadisticas/inflacion/graficos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardCharts}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardChartsDesc}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/estadisticas/inflacion/categorias">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏷️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardCategories}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardCategoriesDesc}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/estadisticas/inflacion/mapas">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🗺️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardMaps}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardMapsDesc}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <a href="/estadisticas/inflacion/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            📖 {T.methodology}
          </a>
        </div>
      </div>
    </div>
  );
}
