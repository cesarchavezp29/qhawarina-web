'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const PeruMap = dynamic(() => import('../components/PeruMap'), { ssr: false });
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

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
  historical_series?: Array<{
    year: number;
    official: number | null;
    nowcast: number | null;
    error: number | null;
  }>;
  backtest_metrics: { rmse: number; r2: number };
}

interface MapData {
  code: string;
  name: string;
  value: number;
}

export default function PovertyPage() {
  const [data, setData] = useState<PovertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  useEffect(() => {
    fetch('/assets/data/poverty_nowcast.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <LoadingSkeleton />;
  }

  // Prepare map data
  const mapData: MapData[] = data.departments.map(d => ({
    code: d.code,
    name: d.name,
    value: d.poverty_rate_2025_nowcast
  }));

  return (
    <div className="bg-gray-50">
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Nowcast de Pobreza Monetaria — {data.metadata.target_year}
          </h1>
          <p className="text-sm text-gray-600">
            Gradient Boosting Regressor | {data.metadata.departments} departamentos, {data.metadata.districts.toLocaleString()} distritos |
            RMSE: {data.backtest_metrics.rmse.toFixed(2)}pp | R²: {data.backtest_metrics.r2.toFixed(3)}
          </p>
        </div>

        {/* Barra de Estadísticas */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tasa Nacional</div>
            <div className="text-3xl font-semibold text-gray-900">{data.national.poverty_rate.toFixed(1)}%</div>
          </div>
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Más Alta</div>
            <div className="text-xl font-semibold text-gray-900">{data.departments[0].name}</div>
            <div className="text-sm text-gray-600">{data.departments[0].poverty_rate_2025_nowcast.toFixed(1)}%</div>
          </div>
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Más Baja</div>
            <div className="text-xl font-semibold text-gray-900">{data.departments[data.departments.length - 1].name}</div>
            <div className="text-sm text-gray-600">{data.departments[data.departments.length - 1].poverty_rate_2025_nowcast.toFixed(1)}%</div>
          </div>
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Modelo</div>
            <div className="text-xl font-semibold text-gray-900">GBR</div>
            <div className="text-sm text-gray-600">Desagreg. NTL</div>
          </div>
        </div>

        {/* Map + Table Layout */}
        <div className="grid grid-cols-3 gap-8">
          {/* Interactive Peru Map */}
          <div className="col-span-1 border border-gray-300 p-6 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Mapa Departamental
            </h3>
            <div className="bg-white border border-gray-200">
              <PeruMap
                data={mapData}
                indicator="poverty"
                onDepartmentHover={(dept) => setSelectedDept(dept?.code || null)}
                height={600}
              />
            </div>
            <div className="mt-4 text-xs text-gray-600">
              <p className="font-semibold mb-2">Leyenda (Tasa de Pobreza):</p>
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#ffffcc] border border-gray-300"></div>
                  <span>&lt; 10%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#ffeda0] border border-gray-300"></div>
                  <span>10-20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#fed976] border border-gray-300"></div>
                  <span>20-30%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#feb24c] border border-gray-300"></div>
                  <span>30-40%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#fd8d3c] border border-gray-300"></div>
                  <span>40-50%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#fc4e2a] border border-gray-300"></div>
                  <span>50-60%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#e31a1c] border border-gray-300"></div>
                  <span>60-70%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#bd0026] border border-gray-300"></div>
                  <span>&gt; 70%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Table */}
          <div className="col-span-2">
            <div className="border border-gray-300">
              <div className="bg-gray-50 border-b border-gray-300 px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Ranking Departamental
                </h3>
                <a
                  href="/assets/data/poverty_districts_full.csv"
                  download
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Descargar Dataset Completo (CSV)
                </a>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-300 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        2024 Obs.
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {data.metadata.target_year} Nowcast
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Cambio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {data.departments.map((dept, idx) => (
                      <tr
                        key={dept.code}
                        onMouseEnter={() => setSelectedDept(dept.code)}
                        onMouseLeave={() => setSelectedDept(null)}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedDept === dept.code ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {dept.name}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">
                          {dept.poverty_rate_2024.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right text-base font-semibold text-gray-900">
                          {dept.poverty_rate_2025_nowcast.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <span className={dept.change_pp < 0 ? 'text-green-700' : 'text-red-700'}>
                            {dept.change_pp > 0 ? '+' : ''}{dept.change_pp.toFixed(1)}pp
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Evolución Histórica */}
        {data.historical_series && data.historical_series.length > 0 && (
          <div className="border border-gray-300 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolución Nacional de la Pobreza Monetaria</h2>
            <Plot
              data={[
                // Official data
                {
                  x: data.historical_series.map(d => d.year),
                  y: data.historical_series.map(d => d.official),
                  name: 'Oficial (INEI)',
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#1E40AF', width: 3 },
                  marker: { size: 8 }
                },
                // Nowcast
                {
                  x: data.historical_series.map(d => d.year),
                  y: data.historical_series.map(d => d.nowcast),
                  name: 'Nowcast (GBR)',
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#059669', width: 3, dash: 'dash' },
                  marker: { size: 8, symbol: 'diamond' }
                }
              ]}
              layout={{
                autosize: true,
                height: 450,
                hovermode: 'x unified',
                xaxis: { title: 'Año', gridcolor: '#E5E7EB' },
                yaxis: { title: 'Tasa de Pobreza (%)', gridcolor: '#E5E7EB', zeroline: false },
                legend: { orientation: 'h', y: -0.15 },
                font: { family: 'Inter, sans-serif' },
                plot_bgcolor: '#FFFFFF',
                paper_bgcolor: '#FFFFFF'
              }}
              config={{
                responsive: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d']
              }}
              className="w-full"
              useResizeHandler
            />
          </div>
        )}

        {/* Nota Metodológica */}
        <div className="mt-8 border border-gray-300 p-6 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Metodología
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Modelo:</strong> Gradient Boosting Regressor entrenado en panel económico departamental
              (406 series, 26 departamentos, 2007-2024).
            </p>
            <p>
              <strong>Desagregación Distrital:</strong> Método dasimétrico con luces nocturnas (NTL).
              Distribución intra-departamental ponderada por intensidad NTL inversa (áreas más oscuras = mayor pobreza).
            </p>
            <p>
              <strong>Rendimiento:</strong> RMSE = {data.backtest_metrics.rmse.toFixed(2)}pp,
              R² = {data.backtest_metrics.r2.toFixed(3)},
              supera benchmark AR(1) (Rel.RMSE = 0.958).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-3 gap-8">
          <div className="h-96 bg-gray-100 border border-gray-300"></div>
          <div className="col-span-2 h-96 bg-gray-100 border border-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
