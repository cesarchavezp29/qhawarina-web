'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [data, setData] = useState<InflationData | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/inflation_nowcast.json?v=${new Date().toISOString().split('T')[0]}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return <PageSkeleton cards={3} />;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">Error cargando datos. <button onClick={() => window.location.reload()} className="underline">Reintentar</button></p></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {" / "}
          <span className="text-gray-900 font-medium">Inflación</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">Inflación</h1>
          <div className="flex gap-2">
            <ShareButton title="Inflación — Qhawarina" text={`Nowcast de inflación ${data.nowcast.target_period}: ${data.nowcast.value > 0 ? '+' : ''}${data.nowcast.value.toFixed(3)}% — Qhawarina`} />
            <EmbedWidget path="/estadisticas/inflacion" title="Inflación — Nowcasting Qhawarina" height={600} />
          </div>
        </div>
        <p className="text-lg text-gray-600">Nowcast mensual - {data.nowcast.target_period}: {data.nowcast.value > 0 ? '+' : ''}{data.nowcast.value.toFixed(3)}%</p>
        <div className="mt-4"><LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} /></div>
        <DataFreshnessWarning generatedAt={data.metadata.generated_at} dataName="los datos de inflación" />

        {/* Navigation Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Time Series Chart */}
          <Link href="/estadisticas/inflacion/graficos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Evolución Temporal</h2>
                  <p className="text-sm text-gray-600 mt-1">Serie histórica mensual de inflación</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Category Breakdown */}
          <Link href="/estadisticas/inflacion/categorias">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏷️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Categorías</h2>
                  <p className="text-sm text-gray-600 mt-1">Core, alimentos, transables y más</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Regional Map */}
          <Link href="/estadisticas/inflacion/mapas">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🗺️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Distribución Regional</h2>
                  <p className="text-sm text-gray-600 mt-1">IPC por ciudades principales</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Methodology Link */}
        <div className="mt-8 text-center">
          <a href="/estadisticas/inflacion/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            📖 Ver metodología completa →
          </a>
        </div>
      </div>
    </div>
  );
}
