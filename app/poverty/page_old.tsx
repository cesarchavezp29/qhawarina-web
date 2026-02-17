'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HomeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface PovertyData {
  metadata: { target_year: number; departments: number; districts: number };
  national: { poverty_rate: number };
  departments: Array<{
    code: string;
    name: string;
    poverty_rate_2024: number;
    poverty_rate_2025_nowcast: number;
    change_pp: number;
  }>;
  backtest_metrics: { rmse: number; r2: number };
}

export default function PovertyPage() {
  const [data, setData] = useState<PovertyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets/data/poverty_nowcast.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <HomeIcon className="w-8 h-8 text-orange-600" />
            Pobreza Monetaria
          </h1>
          <p className="text-gray-500 mt-1">Estimaciones departamentales y distritales {data.metadata.target_year}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tasa Nacional</p>
              <p className="text-4xl font-bold text-orange-600">{data.national.poverty_rate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600 mt-1">{data.metadata.target_year}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Departamentos</p>
              <p className="text-lg font-semibold text-gray-900">{data.metadata.departments}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Distritos</p>
              <p className="text-lg font-semibold text-gray-900">{data.metadata.districts}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">RMSE</p>
              <p className="text-lg font-semibold text-gray-900">{data.backtest_metrics.rmse.toFixed(2)}pp</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Ranking Departamental</h2>
            <button
              onClick={() => {
                const csv = 'Departamento,2024,2025 Nowcast,Cambio\n' + data.departments.map(d =>
                  `${d.name},${d.poverty_rate_2024.toFixed(1)},${d.poverty_rate_2025_nowcast.toFixed(1)},${d.change_pp.toFixed(1)}`
                ).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'qhawarina_pobreza_departamentos.csv';
                a.click();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Descargar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    2024 Obs.
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {data.metadata.target_year} Nowcast
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cambio (pp)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.departments.map((dept, idx) => (
                  <tr key={dept.code} className={idx < 5 ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      {dept.poverty_rate_2024.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-orange-600">
                      {dept.poverty_rate_2025_nowcast.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={dept.change_pp < 0 ? 'text-green-600' : 'text-red-600'}>
                        {dept.change_pp > 0 ? '+' : ''}{dept.change_pp.toFixed(1)}pp
                        {dept.change_pp < 0 ? ' ↓' : ' ↑'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Nota:</strong> El mapa interactivo con drill-down a nivel distrital estará disponible próximamente.
              Requiere configuración de Mapbox GL JS. Los datos completos a nivel distrital pueden descargarse en formato CSV.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
