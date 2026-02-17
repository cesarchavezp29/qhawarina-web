'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LastUpdate from "../../components/stats/LastUpdate";

interface PovertyData {
  metadata: { target_year: number };
  departments: Array<{
    code: string;
    name: string;
    poverty_rate_2024: number;
    poverty_rate_2025_nowcast: number;
    change_pp: number;
  }>;
}

export default function PobrezaPage() {
  const [data, setData] = useState<PovertyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets/data/poverty_nowcast.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando datos...</p></div>;
  }

  const nationalAvg = data.departments.reduce((sum, d) => sum + d.poverty_rate_2025_nowcast, 0) / data.departments.length;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {" / "}
          <span className="text-gray-900 font-medium">Pobreza</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pobreza Monetaria</h1>
        <p className="text-lg text-gray-600">Nowcast anual - {data.metadata.target_year}: {nationalAvg.toFixed(1)}%</p>
        <div className="mt-4"><LastUpdate date="15-Feb-2026" /></div>

        {/* Navigation Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Series Chart */}
          <Link href="/estadisticas/pobreza/graficos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Evolución Temporal</h2>
                  <p className="text-sm text-gray-600 mt-1">Serie histórica anual de pobreza</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Regional Map */}
          <Link href="/estadisticas/pobreza/mapas">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🗺️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Distribución Regional</h2>
                  <p className="text-sm text-gray-600 mt-1">Nowcast departamental con NTL</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Methodology Link */}
        <div className="mt-8 text-center">
          <a href="/estadisticas/pobreza/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            📖 Ver metodología completa →
          </a>
        </div>
      </div>
    </div>
  );
}
