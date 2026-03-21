'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import LastUpdate from "../../../components/stats/LastUpdate";
import PageSkeleton from '../../../components/PageSkeleton';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';
import { useLocale } from 'next-intl';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DeptPoverty {
  code: string;
  name: string;
  poverty_rate_2024: number;
  poverty_rate_2025_proyeccion: number;
  change_pp: number;
}

interface PovertyData {
  metadata: { target_year: number; model_type: string; generated_at: string };
  national: { poverty_rate: number };
  departments: DeptPoverty[];
}

export default function PobrezaMapasPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<PovertyData | null>(null);
  const [deptGeojson, setDeptGeojson] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<'poverty_rate_2025_proyeccion' | 'change_pp'>('poverty_rate_2025_proyeccion');

  useEffect(() => {
    Promise.all([
      fetch(`/assets/data/poverty_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`).then(r => { if (!r.ok) throw new Error(`poverty_nowcast.json: ${r.status}`); return r.json(); }),
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

  if (loading) return <PageSkeleton cards={2} />;

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
    sortCol === 'poverty_rate_2025_proyeccion'
      ? b.poverty_rate_2025_proyeccion - a.poverty_rate_2025_proyeccion
      : a.change_pp - b.change_pp
  );

  const top3 = [...data.departments].sort((a, b) => b.poverty_rate_2025_proyeccion - a.poverty_rate_2025_proyeccion).slice(0, 3);
  const bot3 = [...data.departments].sort((a, b) => a.poverty_rate_2025_proyeccion - b.poverty_rate_2025_proyeccion).slice(0, 3);
  const mostImproved = [...data.departments].sort((a, b) => a.change_pp - b.change_pp)[0];

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.045'%3EQHAWARINA%3C/text%3E%3C/svg%3E")` }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <Link href="/estadisticas/pobreza" className="hover:underline">{isEn ? 'Poverty' : 'Pobreza'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Maps' : 'Mapas'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">
            {isEn ? 'Regional Distribution — Poverty' : 'Distribución Regional — Pobreza'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'Regional Poverty Distribution' : 'Distribución Regional — Pobreza'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Regional Poverty — Qhawarina' : 'Pobreza Regional — Qhawarina'}
              text={isEn
                ? '🗺️ Peru regional poverty distribution map | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza/mapas'
                : '🗺️ Mapa de distribución regional de pobreza en Perú | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza/mapas'}
            />
          </div>
        </div>
        <p className="text-lg text-gray-600 mb-1">
          {isEn
            ? `Nowcast ${data.metadata.target_year} by department · model ${data.metadata.model_type}`
            : `Nowcast ${data.metadata.target_year} por departamento · modelo ${data.metadata.model_type}`}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {isEn ? 'National:' : 'Nacional:'}{' '}
          <strong style={{ color: '#C65D3E' }}>{data.national.poverty_rate.toFixed(1)}%</strong>
          {' \u00b7 '}{isEn ? 'Source: INEI ENAHO, Qhawarina nowcast model' : 'Fuente: INEI ENAHO, modelo nowcast Qhawarina'}
        </p>
        <div className="mt-2 mb-8"><LastUpdate date={(() => {
          const raw = data.metadata.generated_at ?? '';
          try { return new Date(raw).toLocaleDateString(isEn ? 'en-GB' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' }); }
          catch { return raw.slice(0, 10); }
        })()} /></div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl p-5" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {isEn ? 'National Rate' : 'Tasa Nacional'}
            </div>
            <div className="text-3xl font-bold" style={{ color: '#C65D3E' }}>{data.national.poverty_rate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">Nowcast {data.metadata.target_year}</div>
          </div>
          <div className="rounded-xl p-5" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {isEn ? 'Highest Poverty' : 'Mayor Pobreza'}
            </div>
            <div className="text-xl font-bold text-red-800">{top3[0].poverty_rate_2025_proyeccion.toFixed(1)}%</div>
            <div className="text-xs text-gray-700 mt-1">{top3[0].name}</div>
          </div>
          <div className="rounded-xl p-5" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {isEn ? 'Lowest Poverty' : 'Menor Pobreza'}
            </div>
            <div className="text-xl font-bold text-green-700">{bot3[0].poverty_rate_2025_proyeccion.toFixed(1)}%</div>
            <div className="text-xs text-gray-700 mt-1">{bot3[0].name}</div>
          </div>
          <div className="rounded-xl p-5" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              {isEn ? 'Most Improved' : 'Mayor Mejora'}
            </div>
            <div className="text-xl font-bold text-green-600">{mostImproved.change_pp.toFixed(1)} pp</div>
            <div className="text-xs text-gray-700 mt-1">{mostImproved.name}</div>
          </div>
        </div>

        {/* Choropleth Map — Departmental */}
        {deptGeojson && (
          <div className="rounded-xl p-6 mb-6" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
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
                z: data.departments.map(d => d.poverty_rate_2025_proyeccion),
                featureidkey: 'properties.FIRST_IDDP',
                colorscale: [
                  [0,    '#FAF8F4'],
                  [0.15, '#D4956A'],
                  [0.30, '#C65D3E'],
                  [0.50, '#9B2226'],
                  [0.70, '#7B1316'],
                  [0.85, '#5B0E10'],
                  [1,    '#3B0000'],
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
                  `${d.name}<br>${isEn ? 'Nowcast:' : 'Nowcast:'} ${d.poverty_rate_2025_proyeccion.toFixed(1)}%<br>2024: ${d.poverty_rate_2024.toFixed(1)}%<br>${isEn ? 'Change:' : 'Cambio:'} ${d.change_pp > 0 ? '+' : ''}${d.change_pp.toFixed(1)} pp`
                ),
                hovertemplate: '%{text}<extra></extra>',
                marker: { line: { color: '#ffffff', width: 0.8 } },
              } as any]}
              layout={{
                height: 520,
                margin: { l: 0, r: 0, t: 10, b: 10 },
                geo: {
                  fitbounds: 'geojson' as const,
                  visible: true,
                  showland: true,
                  landcolor: '#E2DDD8',
                  showocean: true,
                  oceancolor: '#C4D8EC',
                  showlakes: true,
                  lakecolor: '#C4D8EC',
                  showcoastlines: true,
                  coastlinecolor: '#8FA5B5',
                  coastlinewidth: 1,
                  showcountries: true,
                  countrycolor: '#8FA5B5',
                  countrywidth: 1,
                  projection: { type: 'mercator' as const },
                  bgcolor: 'rgba(0,0,0,0)',
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
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

        {/* Change Map */}
        {deptGeojson && (
          <div className="rounded-xl p-6 mb-6" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
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
                  [0,   '#1A5C55'],
                  [0.3, '#2A9D8F'],
                  [0.5, '#FAF8F4'],
                  [0.7, '#C65D3E'],
                  [1,   '#9B2226'],
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
                  visible: true,
                  showland: true,
                  landcolor: '#E2DDD8',
                  showocean: true,
                  oceancolor: '#C4D8EC',
                  showlakes: true,
                  lakecolor: '#C4D8EC',
                  showcoastlines: true,
                  coastlinecolor: '#8FA5B5',
                  coastlinewidth: 1,
                  showcountries: true,
                  countrycolor: '#8FA5B5',
                  countrywidth: 1,
                  projection: { type: 'mercator' as const },
                  bgcolor: 'rgba(0,0,0,0)',
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
            />
            <p className="text-xs text-gray-500 mt-3">
              {isEn
                ? 'Green = poverty reduction \u00b7 Red = increase. Compared to official INEI 2024 rates.'
                : 'Verde = reducci\u00f3n de pobreza \u00b7 Rojo = aumento. Comparado con tasa oficial INEI 2024.'}
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-3">
              {isEn
                ? 'Large changes (>5 pp) may reflect genuine improvements or model uncertainty. Interpret with caution.'
                : 'Los cambios grandes (>5 pp) pueden reflejar tanto mejoras reales como incertidumbre del modelo. Interpretar con cautela.'}
            </p>
          </div>
        )}

        {/* Department Table */}
        <div className="rounded-xl p-6 mb-6" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {isEn ? 'Departmental Ranking' : 'Ranking Departamental'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{isEn ? 'Sort:' : 'Ordenar:'}</span>
              {(['poverty_rate_2025_proyeccion', 'change_pp'] as const).map(col => (
                <button key={col} onClick={() => setSortCol(col)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: sortCol === col ? '#C65D3E' : 'transparent',
                    color: sortCol === col ? 'white' : '#6b7280',
                    border: `2px solid ${sortCol === col ? '#C65D3E' : '#d6d3d1'}`,
                  }}>
                  {col === 'poverty_rate_2025_proyeccion' ? (isEn ? 'Rate' : 'Tasa') : (isEn ? 'Change' : 'Cambio')}
                </button>
              ))}
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
                    {isEn ? 'Bar (max 50%)' : 'Barra (m\u00e1x 50%)'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sorted.map((dept, idx) => (
                  <tr key={dept.code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-xs text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{dept.name}</td>
                    <td className="px-4 py-3 text-right text-gray-600 text-xs">{dept.poverty_rate_2024.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{dept.poverty_rate_2025_proyeccion.toFixed(1)}%</td>
                    <td className={`px-4 py-3 text-right font-medium text-xs ${dept.change_pp < 0 ? 'text-green-700' : dept.change_pp > 1 ? 'text-red-600' : 'text-yellow-700'}`}>
                      {dept.change_pp > 0 ? '+' : ''}{dept.change_pp.toFixed(1)} pp
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <div className="relative w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.min(dept.poverty_rate_2025_proyeccion / 50 * 100, 100)}%`,
                              backgroundColor: dept.poverty_rate_2025_proyeccion > 35 ? '#e31a1c'
                                : dept.poverty_rate_2025_proyeccion > 20 ? '#fd8d3c'
                                : '#fed976'
                            }}
                          />
                          {/* Reference mark at 50% = full width */}
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-400" style={{ opacity: 0.5 }} />
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
        <div className="rounded-xl p-5 mb-6" style={{ background: '#FFFCF7', borderLeft: '3px solid #C65D3E', border: '1px solid #E8E4DF' }}>
          <h3 className="text-base font-semibold text-blue-900 mb-3">
            {isEn ? 'Methodology' : 'Metodología'}
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>{isEn ? 'Model:' : 'Modelo:'}</strong>{' '}
              {isEn
                ? `${data.metadata.model_type} trained on ENAHO 2004–2024 data using departmental panel indicators (monthly GDP, tax revenue, current spending, capital spending, credit, electricity, mining, pensions, inflation). Method: annual change prediction + poverty lag as anchor.`
                : `${data.metadata.model_type} entrenado sobre datos ENAHO 2004–2024 usando indicadores de panel departamental (PBI mensual, recaudaci\u00f3n, gasto corriente, gasto de capital, cr\u00e9dito, electricidad, miner\u00eda, pensiones, inflaci\u00f3n). M\u00e9todo: predicci\u00f3n de cambio anual + rezago de pobreza como ancla.`}
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
