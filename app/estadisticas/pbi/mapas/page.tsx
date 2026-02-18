'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DepartmentNowcast {
  dept_code: string;
  department: string;
  gdp_yoy: number;
  adj_pp: number;
  ntl_share: number;
  gdp_contribution: number;
  composite_yoy: number | null;
}

interface RegionalGDPData {
  metadata: {
    method: string;
    target_period: string;
    national_gdp_yoy: number;
    n_departments: number;
    ntl_months: number;
    indicator_months: number;
    alpha: number;
    note: string;
  };
  departmental_nowcasts: DepartmentNowcast[];
}

export default function PBIMapasPage() {
  const [data, setData] = useState<RegionalGDPData | null>(null);
  const [geojson, setGeojson] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'gdp_yoy' | 'ntl_share'>('gdp_yoy');

  useEffect(() => {
    Promise.all([
      fetch('/assets/data/gdp_regional_nowcast.json').then(r => r.json()),
      fetch('/assets/data/peru_departamentos.geojson').then(r => r.json()),
    ]).then(([d, gj]) => {
      setData(d);
      setGeojson(gj);
      setLoading(false);
    }).catch(e => { console.error('Error loading data:', e); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando datos y mapa...</p>
      </div>
    );
  }

  if (!data || data.departmental_nowcasts.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mapas Regionales - PBI</h1>
          <p className="text-lg text-gray-600">No hay datos disponibles.</p>
        </div>
      </div>
    );
  }

  const { metadata, departmental_nowcasts } = data;

  // Sorted table data
  const sorted = [...departmental_nowcasts].sort((a, b) =>
    sortBy === 'gdp_yoy' ? b.gdp_yoy - a.gdp_yoy : b.ntl_share - a.ntl_share
  );

  // For color coding
  const getGrowthColor = (v: number) => {
    if (v >= 4) return 'text-green-700 font-semibold';
    if (v >= 2) return 'text-green-600';
    if (v >= 0) return 'text-yellow-600';
    return 'text-red-600 font-semibold';
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {" / "}
          <a href="/estadisticas/pbi" className="hover:text-blue-700">PBI</a>
          {" / "}
          <span className="text-gray-900 font-medium">Mapas</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mapas Regionales — PBI</h1>
        <p className="text-lg text-gray-600 mb-1">
          Nowcast de crecimiento del PBI por departamento · {metadata.target_period}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Nacional: <strong className="text-blue-700">{metadata.national_gdp_yoy.toFixed(2)}%</strong>
          {' · '}Indicadores: crédito, electricidad, recaudación tributaria (últimos {metadata.indicator_months} meses)
        </p>
        <div className="mt-2 mb-8"><LastUpdate date="18-Feb-2026" /></div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">PBI Nacional</div>
            <div className="text-3xl font-bold text-blue-700">{metadata.national_gdp_yoy.toFixed(2)}%</div>
            <div className="text-xs text-gray-500 mt-1">{metadata.target_period}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Mayor Crecimiento</div>
            {(() => {
              const top = departmental_nowcasts.reduce((a, b) => a.gdp_yoy > b.gdp_yoy ? a : b);
              return <>
                <div className="text-lg font-bold text-green-700">{top.gdp_yoy.toFixed(2)}%</div>
                <div className="text-xs text-gray-700 mt-1">{top.department}</div>
              </>;
            })()}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Menor Crecimiento</div>
            {(() => {
              const bot = departmental_nowcasts.reduce((a, b) => a.gdp_yoy < b.gdp_yoy ? a : b);
              return <>
                <div className={`text-lg font-bold ${bot.gdp_yoy < 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                  {bot.gdp_yoy.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-700 mt-1">{bot.department}</div>
              </>;
            })()}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Mayor Peso Económico</div>
            {(() => {
              const top = departmental_nowcasts.reduce((a, b) => a.ntl_share > b.ntl_share ? a : b);
              return <>
                <div className="text-lg font-bold text-gray-900">{(top.ntl_share * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-700 mt-1">{top.department}</div>
              </>;
            })()}
          </div>
        </div>

        {/* Choropleth Map */}
        {geojson && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mapa Coroplético — Crecimiento PBI por Departamento</h2>
            <Plot
              data={[
                {
                  type: 'choropleth' as const,
                  geojson: geojson as any,
                  locations: departmental_nowcasts.map(d => d.dept_code),
                  z: departmental_nowcasts.map(d => d.gdp_yoy),
                  featureidkey: 'properties.FIRST_IDDP',
                  colorscale: [
                    [0, '#dc2626'],
                    [0.3, '#f97316'],
                    [0.5, '#fbbf24'],
                    [0.65, '#84cc16'],
                    [1, '#16a34a'],
                  ],
                  zmin: -2,
                  zmax: 6,
                  colorbar: {
                    title: { text: 'PBI YoY (%)', side: 'right' as const },
                    thickness: 15,
                    len: 0.8,
                    ticksuffix: '%',
                  },
                  text: departmental_nowcasts.map(d =>
                    `${d.department}<br>${d.gdp_yoy.toFixed(2)}% YoY`
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
              Verde = mayor crecimiento · Rojo = menor crecimiento. Escala: -2% a +6%. Datos: {metadata.target_period}.
            </p>
          </div>
        )}

        {/* Departmental Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Nowcasts por Departamento</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Ordenar por:</span>
              <button
                onClick={() => setSortBy('gdp_yoy')}
                className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                  sortBy === 'gdp_yoy' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Crecimiento
              </button>
              <button
                onClick={() => setSortBy('ntl_share')}
                className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
                  sortBy === 'ntl_share' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Peso Económico
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">PBI YoY</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ajuste vs Nac.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Indicadores YoY</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Peso NTL</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Contribución</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sorted.map((dept, idx) => (
                  <tr key={dept.dept_code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{dept.department}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-right ${getGrowthColor(dept.gdp_yoy)}`}>
                      {dept.gdp_yoy > 0 ? '+' : ''}{dept.gdp_yoy.toFixed(2)}%
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-right text-xs ${dept.adj_pp >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {dept.adj_pp > 0 ? '+' : ''}{dept.adj_pp.toFixed(2)} pp
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600 text-xs">
                      {dept.composite_yoy !== null ? `${dept.composite_yoy.toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">
                      {(dept.ntl_share * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">
                      {dept.gdp_contribution > 0 ? '+' : ''}{dept.gdp_contribution.toFixed(3)} pp
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="px-4 py-3 font-bold text-blue-900">Nacional</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-900">+{metadata.national_gdp_yoy.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs">—</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs">—</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-900">100%</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-900">+{metadata.national_gdp_yoy.toFixed(3)} pp</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-blue-900 mb-3">Metodología</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Nowcast departamental:</strong> Nowcast nacional ({metadata.national_gdp_yoy.toFixed(2)}%)
              ajustado por desviación de indicadores de alta frecuencia. Para cada departamento se calcula
              un índice compuesto del crecimiento YoY de crédito, consumo eléctrico y recaudación tributaria
              (últimos {metadata.indicator_months} meses). La desviación respecto al promedio nacional (ponderado por NTL)
              se escala a ±{(metadata.alpha * 100).toFixed(0)}% de pass-through.
            </p>
            <p>
              <strong>Peso económico (NTL):</strong> Luces nocturnas satelitales (VIIRS/DMSP) promediadas
              sobre 12 meses. Proxy de actividad económica con correlación &gt;0.85 con PBI regional (INEI).
            </p>
            <p>
              <strong>Limitación:</strong> No es una estimación oficial. El modelo captura tendencias
              relativas entre departamentos, no valores absolutos precisos. Error típico ±1.5 pp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
