'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import LastUpdate from '../../../components/stats/LastUpdate';
import { useLocale } from 'next-intl';
import PageSkeleton from '../../../components/PageSkeleton';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

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
  const isEn = useLocale() === 'en';
  const [data, setData]       = useState<RegionalGDPData | null>(null);
  const [geojson, setGeojson] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sortBy, setSortBy]   = useState<'gdp_yoy' | 'ntl_share'>('gdp_yoy');

  useEffect(() => {
    Promise.all([
      fetch(`/assets/data/gdp_regional_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`).then(r => r.json()),
      fetch('/assets/data/peru_departamentos.geojson').then(r => r.json()),
    ]).then(([d, gj]) => {
      setData(d); setGeojson(gj); setLoading(false);
    }).catch(e => { console.error(e); setError(true); setLoading(false); });
  }, []);

  if (loading) return <PageSkeleton cards={2} />;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="max-w-md text-center">
        <p className="text-red-500 font-medium mb-2">{isEn ? 'Error loading map data.' : 'Error cargando datos del mapa.'}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: '#C65D3E', color: '#C65D3E' }}>
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </div>
    </div>
  );

  if (!data || data.departmental_nowcasts.length === 0) return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
          {isEn ? 'Regional Maps — GDP' : 'Mapas Regionales — PBI'}
        </h1>
        <p className="text-gray-600">{isEn ? 'No data available.' : 'No hay datos disponibles.'}</p>
      </div>
    </div>
  );

  const { metadata, departmental_nowcasts } = data;
  const sorted = [...departmental_nowcasts].sort((a, b) =>
    sortBy === 'gdp_yoy' ? b.gdp_yoy - a.gdp_yoy : b.ntl_share - a.ntl_share
  );

  const getValueColor = (v: number) =>
    v >= 3 ? '#2A9D8F' : v >= 1 ? '#7FBFB5' : v >= 0 ? '#D4956A' : '#9B2226';

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <Link href="/estadisticas/pbi" className="hover:underline">{isEn ? 'GDP' : 'PBI'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Maps' : 'Mapas'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Regional Maps — GDP' : 'Mapas Regionales — PBI'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'Regional GDP Distribution' : 'Distribución Regional — PBI'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Regional GDP — Qhawarina' : 'PBI Regional — Qhawarina'}
              text={isEn
                ? '🗺️ Peru regional GDP distribution map | Qhawarina\nhttps://qhawarina.pe/estadisticas/pbi/mapas'
                : '🗺️ Mapa de distribución regional del PBI en Perú | Qhawarina\nhttps://qhawarina.pe/estadisticas/pbi/mapas'}
            />
          </div>
        </div>
        <p className="text-base text-gray-600 mb-1">
          {isEn
            ? `GDP growth nowcast by department · ${metadata.target_period}`
            : `Nowcast de crecimiento del PBI por departamento · ${metadata.target_period}`}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {isEn ? 'National:' : 'Nacional:'}{' '}
          <strong style={{ color: '#C65D3E' }}>{metadata.national_gdp_yoy.toFixed(2)}%</strong>
          {' · '}
          {isEn
            ? `Indicators: credit, electricity, tax revenue (last ${metadata.indicator_months} months)`
            : `Indicadores: crédito, electricidad, recaudación tributaria (últimos ${metadata.indicator_months} meses)`}
        </p>
        <div className="mb-6"><LastUpdate date="18-Feb-2026" /></div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: isEn ? 'National GDP' : 'PBI Nacional',
              value: `${metadata.national_gdp_yoy > 0 ? '+' : ''}${metadata.national_gdp_yoy.toFixed(2)}%`,
              sub: metadata.target_period,
              color: '#C65D3E',
            },
            (() => {
              const top = departmental_nowcasts.reduce((a, b) => a.gdp_yoy > b.gdp_yoy ? a : b);
              return { label: isEn ? 'Highest Growth' : 'Mayor Crecimiento', value: `+${top.gdp_yoy.toFixed(2)}%`, sub: top.department, color: '#2A9D8F' };
            })(),
            (() => {
              const bot = departmental_nowcasts.reduce((a, b) => a.gdp_yoy < b.gdp_yoy ? a : b);
              return { label: isEn ? 'Lowest Growth' : 'Menor Crecimiento', value: `${bot.gdp_yoy > 0 ? '+' : ''}${bot.gdp_yoy.toFixed(2)}%`, sub: bot.department, color: bot.gdp_yoy < 0 ? '#9B2226' : '#D4956A' };
            })(),
            (() => {
              const top = departmental_nowcasts.reduce((a, b) => a.ntl_share > b.ntl_share ? a : b);
              return { label: isEn ? 'Largest Share' : 'Mayor Peso Econ.', value: `${(top.ntl_share * 100).toFixed(1)}%`, sub: top.department, color: '#8B7355' };
            })(),
          ].map((card, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Choropleth map — Plotly (no Recharts equivalent for geo choropleth) */}
        {geojson && (
          <div className="rounded-xl border p-5 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#1a1a1a' }}>
              {isEn ? 'GDP Growth by Department' : 'Crecimiento PBI por Departamento'}
            </h2>
            <Plot
              data={[{
                type: 'choropleth' as const,
                geojson: geojson as any,
                locations: departmental_nowcasts.map(d => d.dept_code),
                z: departmental_nowcasts.map(d => d.gdp_yoy),
                featureidkey: 'properties.FIRST_IDDP',
                colorscale: [
                  [0,    '#9B2226'],
                  [0.15, '#D4956A'],
                  [0.25, '#FAF8F4'],
                  [0.45, '#7FBFB5'],
                  [0.65, '#2A9D8F'],
                  [1,    '#1A5C55'],
                ],
                zmin: -2,
                zmax: 6,
                colorbar: {
                  title: { text: isEn ? 'GDP YoY (%)' : 'PBI YoY (%)', side: 'right' as const },
                  thickness: 14,
                  len: 0.75,
                  ticksuffix: '%',
                  tickfont: { size: 10, color: '#8D99AE' },
                  titlefont: { size: 10, color: '#8D99AE' },
                },
                text: departmental_nowcasts.map(d => `${d.department}<br>${d.gdp_yoy.toFixed(2)}% YoY`),
                hovertemplate: '%{text}<extra></extra>',
                marker: { line: { color: '#FAF8F4', width: 0.8 } },
              } as any]}
              layout={{
                height: 500,
                margin: { l: 0, r: 0, t: 0, b: 0 },
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
            <p className="text-xs mt-2 text-gray-500">
              {isEn
                ? `Teal = above average · Red = below average. Scale: −2% to +6%. Period: ${metadata.target_period}.`
                : `Teal = sobre el promedio · Rojo = bajo el promedio. Escala: −2% a +6%. Período: ${metadata.target_period}.`}
            </p>
          </div>
        )}

        {/* Departmental table */}
        <div className="rounded-xl border p-5 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: '#1a1a1a' }}>
              {isEn ? 'Nowcasts by Department' : 'Nowcasts por Departamento'}
            </h2>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-xs text-gray-500">{isEn ? 'Sort:' : 'Ordenar:'}</span>
              {(['gdp_yoy', 'ntl_share'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: sortBy === s ? '#C65D3E' : 'transparent',
                    color: sortBy === s ? 'white' : '#6b7280',
                    border: `2px solid ${sortBy === s ? '#C65D3E' : '#d6d3d1'}`,
                  }}
                >
                  {s === 'gdp_yoy' ? (isEn ? 'Growth' : 'Crecimiento') : (isEn ? 'Econ. Share' : 'Peso Econ.')}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #C65D3E' }}>
                  {[
                    isEn ? 'Department' : 'Departamento',
                    isEn ? 'GDP YoY' : 'PBI YoY',
                    isEn ? 'Adj. vs Nat.' : 'Ajuste vs Nac.',
                    isEn ? 'Indicators YoY' : 'Indicadores YoY',
                    isEn ? 'NTL Share' : 'Peso NTL',
                    isEn ? 'Contribution' : 'Contribución',
                  ].map((h, i) => (
                    <th key={i} className={`py-2 px-3 text-xs font-semibold text-gray-500 uppercase ${i === 0 ? 'text-left' : 'text-right'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((dept, idx) => (
                  <tr key={dept.dept_code} style={{ background: idx % 2 === 0 ? '#FFFCF7' : '#FAF8F4' }}>
                    <td className="py-2 px-3 font-medium text-gray-900 whitespace-nowrap">{dept.department}</td>
                    <td className="py-2 px-3 text-right font-semibold whitespace-nowrap" style={{ color: getValueColor(dept.gdp_yoy) }}>
                      {dept.gdp_yoy > 0 ? '+' : ''}{dept.gdp_yoy.toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-right text-xs whitespace-nowrap" style={{ color: dept.adj_pp >= 0 ? '#2A9D8F' : '#9B2226' }}>
                      {dept.adj_pp > 0 ? '+' : ''}{dept.adj_pp.toFixed(2)} pp
                    </td>
                    <td className="py-2 px-3 text-right text-xs text-gray-500 whitespace-nowrap">
                      {dept.composite_yoy !== null ? `${dept.composite_yoy.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-xs text-gray-600 whitespace-nowrap">
                      {(dept.ntl_share * 100).toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-right text-xs text-gray-600 whitespace-nowrap">
                      {dept.gdp_contribution > 0 ? '+' : ''}{dept.gdp_contribution.toFixed(3)} pp
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#C65D3E0D', borderTop: '2px solid #E8E4DF' }}>
                  <td className="py-2 px-3 font-bold" style={{ color: '#C65D3E' }}>{isEn ? 'National' : 'Nacional'}</td>
                  <td className="py-2 px-3 text-right font-bold" style={{ color: '#C65D3E' }}>+{metadata.national_gdp_yoy.toFixed(2)}%</td>
                  <td className="py-2 px-3 text-right text-xs text-gray-400">—</td>
                  <td className="py-2 px-3 text-right text-xs text-gray-400">—</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-700">100%</td>
                  <td className="py-2 px-3 text-right font-bold text-gray-700">+{metadata.national_gdp_yoy.toFixed(3)} pp</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology — MW callout style */}
        <div className="rounded-xl p-5" style={{ background: '#FFFCF7', borderLeft: '3px solid #C65D3E', border: '1px solid #E8E4DF' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#C65D3E' }}>
            {isEn ? 'Methodology' : 'Metodología'}
          </h3>
          <div className="text-xs text-gray-700 space-y-2">
            <p>
              <strong>{isEn ? 'Departmental nowcast:' : 'Nowcast departamental:'}</strong>{' '}
              {isEn
                ? `National nowcast (${metadata.national_gdp_yoy.toFixed(2)}%) adjusted by high-frequency indicator deviations. Composite index of credit, electricity, and tax revenue YoY growth (last ${metadata.indicator_months} months). Pass-through: ±${(metadata.alpha * 100).toFixed(0)}%.`
                : `Nowcast nacional (${metadata.national_gdp_yoy.toFixed(2)}%) ajustado por desviación de indicadores de alta frecuencia. Índice compuesto del crecimiento YoY de crédito, electricidad y recaudación (últimos ${metadata.indicator_months} meses). Pass-through: ±${(metadata.alpha * 100).toFixed(0)}%.`}
            </p>
            <p>
              <strong>{isEn ? 'Economic share (NTL):' : 'Peso económico (NTL):'}</strong>{' '}
              {isEn
                ? 'Satellite nighttime lights (VIIRS/DMSP) averaged over 12 months. Proxy for economic activity with >0.85 correlation with regional GDP (INEI).'
                : 'Luces nocturnas satelitales (VIIRS/DMSP) promediadas en 12 meses. Proxy de actividad económica con correlación >0.85 con PBI regional (INEI).'}
            </p>
            <p className="text-gray-500">
              <strong>{isEn ? 'Limitation:' : 'Limitación:'}</strong>{' '}
              {isEn
                ? 'Not an official estimate. Captures relative trends between departments. Typical error ±1.5 pp.'
                : 'No es una estimación oficial. Captura tendencias relativas entre departamentos. Error típico ±1.5 pp.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
