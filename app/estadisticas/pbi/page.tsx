'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LastUpdate from "../../components/stats/LastUpdate";

interface GDPData {
  metadata: { generated_at: string };
  recent_quarters: Array<{ quarter: string; official: number | null; nowcast: number | null }>;
  nowcast: { target_period: string; value: number };
}

export default function PBIPage() {
  const [data, setData] = useState<GDPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/assets/data/gdp_nowcast.json?v=${new Date().toISOString().split('T')[0]}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando datos...</p></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {" / "}
          <span className="text-gray-900 font-medium">PBI</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Producto Bruto Interno</h1>
        <p className="text-lg text-gray-600">Nowcast trimestral - {data.nowcast.target_period}: {data.nowcast.value > 0 ? '+' : ''}{data.nowcast.value.toFixed(2)}%</p>
        <div className="mt-4"><LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} /></div>

        {/* Navigation Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Time Series Chart */}
          <Link href="/estadisticas/pbi/graficos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Evolución Temporal</h2>
                  <p className="text-sm text-gray-600 mt-1">Serie histórica trimestral del PBI</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Sectoral Breakdown */}
          <Link href="/estadisticas/pbi/sectores">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏭</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Sectores Económicos</h2>
                  <p className="text-sm text-gray-600 mt-1">Desagregación por sector productivo</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Regional Map */}
          <Link href="/estadisticas/pbi/mapas">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🗺️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Distribución Regional</h2>
                  <p className="text-sm text-gray-600 mt-1">Desagregación departamental con NTL</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Methodology Link */}
        <div className="mt-8 text-center">
          <a href="/estadisticas/pbi/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            📖 Ver metodología completa →
          </a>
        </div>
      </div>
    </div>
  );
}
