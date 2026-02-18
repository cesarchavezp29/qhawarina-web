'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DeptInflation {
  dept_code: string;
  department: string;
  ipc_monthly: number;
  ipc_monthly_3ma: number;
  ipc_12m_approx: number;
  food_share: number;
}

interface RegionalInflationData {
  metadata: {
    target_date: string;
    n_departments: number;
    components: {
      food_ipc_monthly: number;
      core_ipc_monthly: number;
      lima_headline_monthly: number;
    };
    food_share_source: string;
    note: string;
  };
  departmental_nowcasts: DeptInflation[];
}

export default function InflacionMapasPage() {
  const [data, setData] = useState<RegionalInflationData | null>(null);
  const [geojson, setGeojson] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'ipc_monthly' | 'food_share'>('ipc_monthly');

  useEffect(() => {
    Promise.all([
      fetch('/assets/data/inflation_regional_nowcast.json').then(r => r.json()),
      fetch('/assets/data/peru_departamentos.geojson').then(r => r.json()),
    ]).then(([d, gj]) => {
      setData(d);
      setGeojson(gj);
      setLoading(false);
    }).catch(e => { console.error(e); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando mapa de inflación...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">Mapas Regionales — Inflación</h1>
          <p className="text-gray-600 mt-4">No hay datos disponibles.</p>
        </div>
      </div>
    );
  }

  const { metadata, departmental_nowcasts } = data;
  const sorted = [...departmental_nowcasts].sort((a, b) =>
    sortBy === 'ipc_monthly' ? b.ipc_monthly - a.ipc_monthly : b.food_share - a.food_share
  );

  const top = departmental_nowcasts.reduce((a, b) => a.ipc_monthly > b.ipc_monthly ? a : b);
  const bot = departmental_nowcasts.reduce((a, b) => a.ipc_monthly < b.ipc_monthly ? a : b);
  const spread = (top.ipc_monthly - bot.ipc_monthly) * 100; // in basis points

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {" / "}
          <a href="/estadisticas/inflacion" className="hover:text-blue-700">Inflación</a>
          {" / "}
          <span className="text-gray-900 font-medium">Mapas</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Distribución Regional — Inflación</h1>
        <p className="text-lg text-gray-600 mb-1">
          Variación mensual estimada por departamento · {metadata.target_date}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Lima: <strong className="text-blue-700">{(metadata.components.lima_headline_monthly * 100).toFixed(3)}%</strong>
          {' · '}Alimentos: <strong>{(metadata.components.food_ipc_monthly * 100).toFixed(3)}%</strong>
          {' · '}Core: <strong>{(metadata.components.core_ipc_monthly * 100).toFixed(3)}%</strong>
        </p>
        <div className="mt-2 mb-8"><LastUpdate date="18-Feb-2026" /></div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Lima (Referencia)</div>
            <div className="text-2xl font-bold text-blue-700">
              {(metadata.components.lima_headline_monthly * 100).toFixed(3)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">var. mensual · {metadata.target_date}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Mayor Inflación</div>
            <div className="text-xl font-bold text-red-600">{(top.ipc_monthly * 100).toFixed(3)}%</div>
            <div className="text-xs text-gray-700 mt-1">{top.department}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Menor Inflación</div>
            <div className="text-xl font-bold text-green-700">{(bot.ipc_monthly * 100).toFixed(3)}%</div>
            <div className="text-xs text-gray-700 mt-1">{bot.department}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Brecha Máx–Mín</div>
            <div className="text-xl font-bold text-gray-900">{spread.toFixed(1)} pb</div>
            <div className="text-xs text-gray-500 mt-1">puntos básicos mensuales</div>
          </div>
        </div>

        {/* Choropleth Map */}
        {geojson && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Mapa Coroplético — Inflación Mensual por Departamento
            </h2>
            <Plot
              data={[
                {
                  type: 'choropleth' as const,
                  geojson: geojson as any,
                  locations: departmental_nowcasts.map(d => d.dept_code),
                  z: departmental_nowcasts.map(d => d.ipc_monthly * 100), // basis points
                  featureidkey: 'properties.FIRST_IDDP',
                  colorscale: [
                    [0,   '#16a34a'],
                    [0.4, '#84cc16'],
                    [0.6, '#fbbf24'],
                    [0.8, '#f97316'],
                    [1,   '#dc2626'],
                  ],
                  zmin: 5,   // 0.05% monthly
                  zmax: 15,  // 0.15% monthly
                  colorbar: {
                    title: { text: 'IPC mensual (pb)', side: 'right' as const },
                    thickness: 15,
                    len: 0.8,
                    ticksuffix: ' pb',
                  },
                  text: departmental_nowcasts.map(d =>
                    `${d.department}<br>${(d.ipc_monthly * 100).toFixed(2)} pb/mes<br>Canasta alim.: ${(d.food_share * 100).toFixed(0)}%`
                  ),
                  hovertemplate: '%{text}<extra></extra>',
                  marker: { line: { color: '#ffffff', width: 0.8 } },
                } as any,
              ]}
              layout={{
                height: 520,
                margin: { l: 0, r: 0, t: 10, b: 10 },
                geo: {
                  fitbounds: 'geojson' as const,
                  visible: false,
                  projection: { type: 'mercator' as const },
                },
                paper_bgcolor: '#ffffff',
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
            />
            <p className="text-xs text-gray-500 mt-3">
              Rojo = mayor inflación (mayor peso de alimentos en canasta) · Verde = menor inflación.
              Escala: 5–15 pb mensuales. Datos: {metadata.target_date}.
            </p>
          </div>
        )}

        {/* Components explanation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Componentes — {metadata.target_date}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-sm font-medium text-orange-800 mb-2">IPC Alimentos y Bebidas</div>
              <div className="text-3xl font-bold text-orange-700">
                {(metadata.components.food_ipc_monthly * 100).toFixed(3)} pb
              </div>
              <div className="text-xs text-orange-600 mt-1">PN01383PM (BCRP)</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-2">IPC Core (sin alim. y energía)</div>
              <div className="text-3xl font-bold text-blue-700">
                {(metadata.components.core_ipc_monthly * 100).toFixed(3)} pb
              </div>
              <div className="text-xs text-blue-600 mt-1">PN38706PM (BCRP)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-2">Lima Metropolitana</div>
              <div className="text-3xl font-bold text-gray-900">
                {(metadata.components.lima_headline_monthly * 100).toFixed(3)} pb
              </div>
              <div className="text-xs text-gray-500 mt-1">PN01271PM (BCRP)</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Inflación por Departamento</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Ordenar por:</span>
              <button onClick={() => setSortBy('ipc_monthly')}
                className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${sortBy === 'ipc_monthly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                Inflación
              </button>
              <button onClick={() => setSortBy('food_share')}
                className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${sortBy === 'food_share' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                Peso Alimentos
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">IPC Mensual</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Promedio 3M</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">12M Aprox.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Peso Alimentos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sorted.map((dept, idx) => (
                  <tr key={dept.dept_code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{dept.department}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                      {(dept.ipc_monthly * 100).toFixed(3)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600 text-xs">
                      {(dept.ipc_monthly_3ma * 100).toFixed(3)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600 text-xs">
                      ~{dept.ipc_12m_approx.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-orange-400 h-1.5 rounded-full"
                            style={{ width: `${dept.food_share * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{(dept.food_share * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="px-4 py-3 font-bold text-blue-900">Lima (oficial BCRP)</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-900">
                    {(metadata.components.lima_headline_monthly * 100).toFixed(3)}%
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700 text-xs">—</td>
                  <td className="px-4 py-3 text-right text-blue-700 text-xs">—</td>
                  <td className="px-4 py-3 text-right text-blue-700 text-xs">30%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-amber-900 mb-3">Metodología y Limitaciones</h3>
          <div className="text-sm text-amber-800 space-y-2">
            <p>
              <strong>Fórmula:</strong> IPC_regional = α_alim × IPC_alimentos + (1 – α_alim) × IPC_core.
              Donde α_alim es la participación de alimentos en la canasta de consumo departamental
              según la Encuesta Nacional de Hogares 2023 (ENAHO–INEI).
            </p>
            <p>
              <strong>Fuente de componentes:</strong> IPC alimentos y bebidas (PN01383PM) e IPC sin
              alimentos ni energía (PN38706PM) publicados mensualmente por el BCRP.
            </p>
            <p>
              <strong>Limitación importante:</strong> El INEI sólo publica IPC oficial para Lima
              Metropolitana y 25 ciudades principales. Esta estimación es un ejercicio econométrico
              basado en la heterogeneidad de canastas de consumo — no reemplaza datos oficiales.
              El error estimado es ±3 pb mensuales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
