'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";
import { useLocale } from 'next-intl';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DeptPoverty {
  code: string;
  name: string;
  poverty_rate_2024: number;
  poverty_rate_2025_nowcast: number;
  change_pp: number;
}

interface DistrictPoverty {
  ubigeo: string;
  department_code: string;
  poverty_rate_nowcast: number;
  ntl_weight: number;
}

interface PovertyData {
  metadata: { target_year: number; model: string };
  national: { poverty_rate: number };
  departments: DeptPoverty[];
  districts: DistrictPoverty[];
}

type ViewLevel = 'department' | 'district';

export default function PobrezaMapasPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<PovertyData | null>(null);
  const [deptGeojson, setDeptGeojson] = useState<object | null>(null);
  const [distGeojson, setDistGeojson] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<ViewLevel>('department');
  const [loadingDist, setLoadingDist] = useState(false);
  const [sortCol, setSortCol] = useState<'poverty_rate_2025_nowcast' | 'change_pp'>('poverty_rate_2025_nowcast');

  useEffect(() => {
    Promise.all([
      fetch(`/assets/data/poverty_nowcast.json?v=${new Date().toISOString().split('T')[0]}`).then(r => { if (!r.ok) throw new Error(`poverty_nowcast.json: ${r.status}`); return r.json(); }),
      fetch('/assets/data/peru_departamentos.geojson').then(r => { if (!r.ok) throw new Error(`peru_departamentos.geojson: ${r.status}`); return r.json(); }),
    ]).then(([d, gj]) => {
      setData(d);
      setDeptGeojson(gj);
      setLoading(false);
    }).catch(e => {
      console.error('Error loading poverty data:', e);
      setError(e.message);
      setLoading(false);
    });
  }, []);

  const loadDistrictGeo = () => {
    if (distGeojson) return;
    setLoadingDist(true);
    fetch('/assets/geo/peru_distrital.geojson')
      .then(r => r.json())
      .then(gj => { setDistGeojson(gj); setLoadingDist(false); });
  };

  const handleLevelChange = (l: ViewLevel) => {
    setLevel(l);
    if (l === 'district') loadDistrictGeo();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{isEn ? 'Loading poverty data...' : 'Cargando datos de pobreza...'}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-600 font-medium">{isEn ? 'Error loading poverty data' : 'Error cargando datos de pobreza'}</p>
        {error && <p className="text-sm text-gray-500 font-mono">{error}</p>}
        <p className="text-sm text-gray-400">
          {isEn ? 'Check the browser console for more details.' : 'Revisa la consola del navegador para más detalles.'}
        </p>
      </div>
    );
  }

  const sorted = [...data.departments].sort((a, b) =>
    sortCol === 'poverty_rate_2025_nowcast'
      ? b.poverty_rate_2025_nowcast - a.poverty_rate_2025_nowcast
      : a.change_pp - b.change_pp
  );

  const top3 = [...data.departments].sort((a, b) => b.poverty_rate_2025_nowcast - a.poverty_rate_2025_nowcast).slice(0, 3);
  const bot3 = [...data.departments].sort((a, b) => a.poverty_rate_2025_nowcast - b.poverty_rate_2025_nowcast).slice(0, 3);
  const mostImproved = [...data.departments].sort((a, b) => a.change_pp - b.change_pp)[0];

  const districtMap = new Map(data.districts.map(d => [d.ubigeo, d.poverty_rate_nowcast]));

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">{isEn ? 'Statistics' : 'Estadísticas'}</a>
          {' / '}
          <a href="/estadisticas/pobreza" className="hover:text-blue-700">{isEn ? 'Poverty' : 'Pobreza'}</a>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Maps' : 'Mapas'}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEn ? 'Regional Distribution — Poverty' : 'Distribución Regional — Pobreza'}
        </h1>
        <p className="text-lg text-gray-600 mb-1">
          {isEn
            ? `Nowcast ${data.metadata.target_year} by department · model ${data.metadata.model}`
            : `Nowcast ${data.metadata.target_year} por departamento · modelo ${data.metadata.model}`}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {isEn ? 'National:' : 'Nacional:'}{' '}
          <strong className="text-red-700">{data.national.poverty_rate.toFixed(1)}%</strong>
          {' · '}{isEn ? 'Source: INEI ENAHO, satellite NTL disaggregation' : 'Fuente: INEI ENAHO, desagregación NTL satélital'}
        </p>
        <div className="mt-2 mb-8"><LastUpdate date="18-Feb-2026" /></div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {isEn ? 'National Rate' : 'Tasa Nacional'}
            </div>
            <div className="text-3xl font-bold text-red-700">{data.national.poverty_rate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">Nowcast {data.metadata.target_year}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {isEn ? 'Highest Poverty' : 'Mayor Pobreza'}
            </div>
            <div className="text-xl font-bold text-red-800">{top3[0].poverty_rate_2025_nowcast.toFixed(1)}%</div>
            <div className="text-xs text-gray-700 mt-1">{top3[0].name}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {isEn ? 'Lowest Poverty' : 'Menor Pobreza'}
            </div>
            <div className="text-xl font-bold text-green-700">{bot3[0].poverty_rate_2025_nowcast.toFixed(1)}%</div>
            <div className="text-xs text-gray-700 mt-1">{bot3[0].name}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {isEn ? 'Most Improved' : 'Mayor Mejora'}
            </div>
            <div className="text-xl font-bold text-green-600">{mostImproved.change_pp.toFixed(1)} pp</div>
            <div className="text-xs text-gray-700 mt-1">{mostImproved.name}</div>
          </div>
        </div>

        {/* Level Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => handleLevelChange('department')}
              className={`px-6 py-2.5 text-sm font-medium border rounded-l-lg transition-colors ${
                level === 'department'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isEn ? 'Departmental (25)' : 'Departamental (25)'}
            </button>
            <button
              onClick={() => handleLevelChange('district')}
              className={`px-6 py-2.5 text-sm font-medium border-t border-b border-r rounded-r-lg transition-colors ${
                level === 'district'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isEn ? 'District (1,891)' : 'Distrital (1,891)'} {loadingDist && '⏳'}
            </button>
          </div>
        </div>

        {/* Choropleth Map — Departmental */}
        {level === 'department' && deptGeojson && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isEn
                ? `Poverty Rate by Department — ${data.metadata.target_year}`
                : `Tasa de Pobreza por Departamento — ${data.metadata.target_year}`}
            </h2>
            <Plot
              data={[{
                type: 'choropleth' as const,
                geojson: deptGeojson as any,
                locations: data.departments.map(d => d.code),
                z: data.departments.map(d => d.poverty_rate_2025_nowcast),
                featureidkey: 'properties.FIRST_IDDP',
                colorscale: [
                  [0,    '#ffffcc'],
                  [0.15, '#ffeda0'],
                  [0.30, '#fed976'],
                  [0.45, '#feb24c'],
                  [0.60, '#fd8d3c'],
                  [0.75, '#fc4e2a'],
                  [0.88, '#e31a1c'],
                  [1,    '#800026'],
                ],
                zmin: 0,
                zmax: 50,
                colorbar: {
                  title: { text: isEn ? 'Poverty (%)' : 'Pobreza (%)', side: 'right' as const },
                  thickness: 15,
                  len: 0.8,
                  ticksuffix: '%',
                },
                text: data.departments.map(d =>
                  `${d.name}<br>${isEn ? 'Nowcast:' : 'Nowcast:'} ${d.poverty_rate_2025_nowcast.toFixed(1)}%<br>2024: ${d.poverty_rate_2024.toFixed(1)}%<br>${isEn ? 'Change:' : 'Cambio:'} ${d.change_pp > 0 ? '+' : ''}${d.change_pp.toFixed(1)} pp`
                ),
                hovertemplate: '%{text}<extra></extra>',
                marker: { line: { color: '#ffffff', width: 0.8 } },
              } as any]}
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
              {isEn
                ? 'Yellow = lower poverty · Dark red = higher poverty. Scale: 0–50%. Hover for details.'
                : 'Amarillo = menor pobreza · Rojo oscuro = mayor pobreza. Escala: 0–50%. Hover para ver detalles.'}
            </p>
          </div>
        )}

        {/* Choropleth Map — District */}
        {level === 'district' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isEn
                ? `Poverty Rate by District — ${data.metadata.target_year}`
                : `Tasa de Pobreza por Distrito — ${data.metadata.target_year}`}
            </h2>
            {loadingDist && (
              <div className="h-48 flex items-center justify-center text-gray-500">
                {isEn ? 'Loading district map (1.8 MB)...' : 'Cargando mapa distrital (1.8 MB)...'}
              </div>
            )}
            {!loadingDist && distGeojson && (() => {
              const gj = distGeojson as any;
              const validDists = gj.features
                .map((f: any) => f.properties.IDDIST)
                .filter((id: string) => districtMap.has(id));
              const zValues = validDists.map((id: string) => districtMap.get(id)!);
              return (
                <Plot
                  data={[{
                    type: 'choropleth' as const,
                    geojson: distGeojson as any,
                    locations: validDists,
                    z: zValues,
                    featureidkey: 'properties.IDDIST',
                    colorscale: [
                      [0,    '#ffffcc'],
                      [0.15, '#ffeda0'],
                      [0.30, '#fed976'],
                      [0.45, '#feb24c'],
                      [0.60, '#fd8d3c'],
                      [0.75, '#fc4e2a'],
                      [0.88, '#e31a1c'],
                      [1,    '#800026'],
                    ],
                    zmin: 0,
                    zmax: 80,
                    colorbar: {
                      title: { text: isEn ? 'Poverty (%)' : 'Pobreza (%)', side: 'right' as const },
                      thickness: 15,
                      len: 0.8,
                      ticksuffix: '%',
                    },
                    text: validDists.map((id: string) => {
                      const rate = districtMap.get(id)!;
                      return `Ubigeo: ${id}<br>${isEn ? 'Poverty:' : 'Pobreza:'} ${rate.toFixed(1)}%`;
                    }),
                    hovertemplate: '%{text}<extra></extra>',
                    marker: { line: { color: '#ffffff', width: 0.3 } },
                  } as any]}
                  layout={{
                    height: 600,
                    margin: { l: 0, r: 0, t: 10, b: 10 },
                    geo: {
                      fitbounds: 'geojson' as const,
                      visible: false,
                      projection: { type: 'mercator' as const },
                    },
                    paper_bgcolor: '#ffffff',
                  }}
                  config={{ displayModeBar: true, responsive: true }}
                  style={{ width: '100%' }}
                />
              );
            })()}
            <p className="text-xs text-gray-500 mt-3">
              {isEn ? '1,891 districts. Disaggregation via nighttime lights (NTL). Districts without data appear in grey.' : '1,891 distritos. Desagregación via luces nocturnas (NTL). Distritos sin datos aparecen en gris.'}
              <a href="/assets/data/poverty_districts_full.csv" download className="ml-2 text-blue-600 hover:underline">
                {isEn ? 'Download full CSV' : 'Descargar CSV completo'}
              </a>
            </p>
          </div>
        )}

        {/* Change Map */}
        {level === 'department' && deptGeojson && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isEn
                ? `Change in Poverty — 2024 → ${data.metadata.target_year} (pp)`
                : `Cambio en Pobreza — 2024 → ${data.metadata.target_year} (pp)`}
            </h2>
            <Plot
              data={[{
                type: 'choropleth' as const,
                geojson: deptGeojson as any,
                locations: data.departments.map(d => d.code),
                z: data.departments.map(d => d.change_pp),
                featureidkey: 'properties.FIRST_IDDP',
                colorscale: [
                  [0,   '#1a9850'],
                  [0.3, '#91cf60'],
                  [0.5, '#ffffbf'],
                  [0.7, '#fc8d59'],
                  [1,   '#d73027'],
                ],
                zmid: 0,
                zmin: -10,
                zmax: 5,
                colorbar: {
                  title: { text: isEn ? 'Change (pp)' : 'Cambio (pp)', side: 'right' as const },
                  thickness: 15,
                  len: 0.8,
                },
                text: data.departments.map(d =>
                  `${d.name}<br>${d.change_pp > 0 ? '+' : ''}${d.change_pp.toFixed(1)} pp`
                ),
                hovertemplate: '%{text}<extra></extra>',
                marker: { line: { color: '#ffffff', width: 0.8 } },
              } as any]}
              layout={{
                height: 460,
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
              {isEn
                ? 'Green = poverty reduction · Red = increase. Compared to official INEI 2024 rates.'
                : 'Verde = reducción de pobreza · Rojo = aumento. Comparado con tasa oficial INEI 2024.'}
            </p>
          </div>
        )}

        {/* Department Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {isEn ? 'Departmental Ranking' : 'Ranking Departamental'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{isEn ? 'Sort:' : 'Ordenar:'}</span>
              <button onClick={() => setSortCol('poverty_rate_2025_nowcast')}
                className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${sortCol === 'poverty_rate_2025_nowcast' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {isEn ? 'Rate' : 'Tasa'}
              </button>
              <button onClick={() => setSortCol('change_pp')}
                className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${sortCol === 'change_pp' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {isEn ? 'Change' : 'Cambio'}
              </button>
              <a href="/assets/data/poverty_districts_full.csv" download
                className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 rounded border border-gray-300 text-xs hover:bg-gray-200">
                {isEn ? 'District CSV' : 'CSV Distrital'}
              </a>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {isEn ? 'Department' : 'Departamento'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isEn ? '2024 Official' : '2024 Oficial'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {data.metadata.target_year} Nowcast
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isEn ? 'Change (pp)' : 'Cambio (pp)'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {isEn ? 'Bar' : 'Barra'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sorted.map((dept, idx) => (
                  <tr key={dept.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-xs text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{dept.name}</td>
                    <td className="px-4 py-3 text-right text-gray-600 text-xs">{dept.poverty_rate_2024.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{dept.poverty_rate_2025_nowcast.toFixed(1)}%</td>
                    <td className={`px-4 py-3 text-right font-medium text-xs ${dept.change_pp < 0 ? 'text-green-700' : dept.change_pp > 1 ? 'text-red-600' : 'text-yellow-700'}`}>
                      {dept.change_pp > 0 ? '+' : ''}{dept.change_pp.toFixed(1)} pp
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.min(dept.poverty_rate_2025_nowcast / 50 * 100, 100)}%`,
                              backgroundColor: dept.poverty_rate_2025_nowcast > 35 ? '#e31a1c'
                                : dept.poverty_rate_2025_nowcast > 20 ? '#fd8d3c'
                                : '#fed976'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-blue-900 mb-3">
            {isEn ? 'Methodology' : 'Metodología'}
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>{isEn ? 'Model:' : 'Modelo:'}</strong>{' '}
              {isEn
                ? `${data.metadata.model} trained on ENAHO 2012–2024 data using departmental panel indicators (credit, electricity, tax revenue, tourism, NTL). Method: annual change prediction + poverty lag as anchor.`
                : `${data.metadata.model} entrenado sobre datos ENAHO 2012–2024 usando indicadores de panel departamental (crédito, electricidad, recaudación, turismo, NTL). Método: predicción de cambio anual + rezago de pobreza como ancla.`}
            </p>
            <p>
              <strong>{isEn ? 'District disaggregation:' : 'Desagregación distrital:'}</strong>{' '}
              {isEn
                ? 'Departmental rate distributed to 1,891 districts using nighttime lights (NTL VIIRS) as inverse proxy for wealth (higher NTL = lower relative poverty).'
                : 'Tasa departamental distribuida a 1,891 distritos usando luces nocturnas (NTL VIIRS) como proxy invertido de riqueza (mayor NTL = menor pobreza relativa).'}
            </p>
            <p>
              <strong>{isEn ? 'Change vs 2024:' : 'Cambio vs 2024:'}</strong>{' '}
              {isEn
                ? 'Compared to official INEI ENAHO 2024 rates (published Jul 2025). The 2025 nowcast will be updated with 2025 ENAHO data when available.'
                : 'Comparado con tasas oficiales INEI ENAHO 2024 (publicadas Jul 2025). El nowcast 2025 se actualizará con datos ENAHO 2025 cuando estén disponibles.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
