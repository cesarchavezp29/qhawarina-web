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

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

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
    components: { food_ipc_monthly: number; core_ipc_monthly: number; lima_headline_monthly: number };
    food_share_source: string;
    note: string;
  };
  departmental_nowcasts: DeptInflation[];
}

export default function InflacionMapasPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<RegionalInflationData | null>(null);
  const [geojson, setGeojson] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sortBy, setSortBy] = useState<'ipc_monthly' | 'food_share'>('ipc_monthly');

  useEffect(() => {
    Promise.all([
      fetch(`/assets/data/inflation_regional_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`).then(r => r.json()),
      fetch('/assets/data/peru_departamentos.geojson').then(r => r.json()),
    ]).then(([d, gj]) => { setData(d); setGeojson(gj); setLoading(false); })
      .catch(e => { console.error(e); setError(true); setLoading(false); });
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

  if (!data) return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>{isEn ? 'Regional Maps — Inflation' : 'Mapas Regionales — Inflación'}</h1>
        <p className="text-gray-500 mt-4">{isEn ? 'No data available.' : 'No hay datos disponibles.'}</p>
      </div>
    </div>
  );

  const { metadata, departmental_nowcasts } = data;
  const sorted = [...departmental_nowcasts].sort((a, b) =>
    sortBy === 'ipc_monthly' ? b.ipc_monthly - a.ipc_monthly : b.food_share - a.food_share
  );
  const top = departmental_nowcasts.reduce((a, b) => a.ipc_monthly > b.ipc_monthly ? a : b);
  const bot = departmental_nowcasts.reduce((a, b) => a.ipc_monthly < b.ipc_monthly ? a : b);
  const spread = (top.ipc_monthly - bot.ipc_monthly) * 100;

  const statCards = [
    { label: isEn ? 'Lima (Reference)' : 'Lima (Referencia)', value: `${(metadata.components.lima_headline_monthly * 100).toFixed(3)}%`, sub: `${isEn ? 'monthly' : 'mensual'} · ${metadata.target_date}`, color: '#C65D3E' },
    { label: isEn ? 'Highest Inflation' : 'Mayor Inflación', value: `${(top.ipc_monthly * 100).toFixed(3)}%`, sub: top.department, color: '#C65D3E' },
    { label: isEn ? 'Lowest Inflation' : 'Menor Inflación', value: `${(bot.ipc_monthly * 100).toFixed(3)}%`, sub: bot.department, color: '#2A9D8F' },
    { label: isEn ? 'Max–Min Gap' : 'Brecha Máx–Mín', value: `${spread.toFixed(1)} pb`, sub: isEn ? 'monthly basis points' : 'puntos básicos mensuales', color: '#2D3142' },
  ];

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <Link href="/estadisticas/inflacion" className="hover:underline">{isEn ? 'Inflation' : 'Inflación'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Maps' : 'Mapas'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Regional Distribution — Inflation' : 'Distribución Regional — Inflación'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'Regional Inflation Distribution' : 'Distribución Regional — Inflación'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Regional Inflation — Qhawarina' : 'Inflación Regional — Qhawarina'}
              text={isEn
                ? `🗺️ Peru regional inflation map · ${metadata.target_date} | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion/mapas`
                : `🗺️ Mapa regional de inflación Perú · ${metadata.target_date} | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion/mapas`}
            />
          </div>
        </div>
        <p className="text-base text-gray-600 mb-1">
          {isEn ? `Estimated monthly change by department · ${metadata.target_date}` : `Variación mensual estimada por departamento · ${metadata.target_date}`}
        </p>
        <div className="mb-6"><LastUpdate date={new Date(metadata.target_date + 'T12:00:00').toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} /></div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map(card => (
            <div key={card.label} className="rounded-xl p-5" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
              <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Choropleth */}
        {geojson && (
          <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#1a1a1a' }}>
              {isEn ? 'Choropleth — Monthly Inflation by Department' : 'Mapa Coroplético — Inflación Mensual por Departamento'}
            </h2>
            <Plot
              data={[{
                type: 'choropleth' as const,
                geojson: geojson as any,
                locations: departmental_nowcasts.map(d => d.dept_code),
                z: departmental_nowcasts.map(d => d.ipc_monthly * 100),
                featureidkey: 'properties.FIRST_IDDP',
                colorscale: [
                  [0,    '#1A5C55'],
                  [0.2,  '#2A9D8F'],
                  [0.4,  '#7FBFB5'],
                  [0.55, '#FAF8F4'],
                  [0.7,  '#D4956A'],
                  [0.85, '#C65D3E'],
                  [1,    '#9B2226'],
                ],
                zmin: 5,
                zmax: 15,
                colorbar: {
                  title: { text: isEn ? 'Monthly CPI (bp)' : 'IPC mensual (pb)', side: 'right' as const },
                  thickness: 15, len: 0.8, ticksuffix: ' pb',
                },
                text: departmental_nowcasts.map(d =>
                  `${d.department}<br>${(d.ipc_monthly * 100).toFixed(2)} ${isEn ? 'bp/mo' : 'pb/mes'}<br>${isEn ? 'Food basket:' : 'Canasta alim.:'} ${(d.food_share * 100).toFixed(0)}%`
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
            <p className="text-xs mt-3" style={{ color: '#6b7280' }}>
              {isEn
                ? `Teal = lower inflation · Terracotta/red = higher inflation. Scale: 5–15 bp monthly. Data: ${metadata.target_date}.`
                : `Teal = menor inflación · Terracota/rojo = mayor inflación. Escala: 5–15 pb mensuales. Datos: ${metadata.target_date}.`}
            </p>
          </div>
        )}

        {/* Components */}
        <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: '#1a1a1a' }}>
            {isEn ? `Components — ${metadata.target_date}` : `Componentes — ${metadata.target_date}`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: isEn ? 'Food & Beverages CPI' : 'IPC Alimentos y Bebidas', value: `${(metadata.components.food_ipc_monthly * 100).toFixed(3)} pb`, src: 'PN01383PM (BCRP)', color: '#8B7355' },
              { label: isEn ? 'Core CPI (ex-food & energy)' : 'IPC Core (sin alim. y energía)', value: `${(metadata.components.core_ipc_monthly * 100).toFixed(3)} pb`, src: 'PN38706PM (BCRP)', color: '#C65D3E' },
              { label: isEn ? 'Lima Metropolitan' : 'Lima Metropolitana', value: `${(metadata.components.lima_headline_monthly * 100).toFixed(3)} pb`, src: 'PN01271PM (BCRP)', color: '#2D3142' },
            ].map(c => (
              <div key={c.label} className="rounded-xl p-4 text-center" style={{ background: '#FAF8F4', border: '1px solid #E8E4DF' }}>
                <p className="text-xs font-medium text-gray-600 mb-2">{c.label}</p>
                <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.src}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#E8E4DF' }}>
            <h2 className="text-base font-semibold" style={{ color: '#1a1a1a' }}>
              {isEn ? 'Inflation by Department' : 'Inflación por Departamento'}
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 text-xs">{isEn ? 'Sort:' : 'Ordenar:'}</span>
              {(['ipc_monthly', 'food_share'] as const).map(col => (
                <button key={col} onClick={() => setSortBy(col)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: sortBy === col ? '#C65D3E' : 'transparent',
                    color: sortBy === col ? 'white' : '#6b7280',
                    border: `2px solid ${sortBy === col ? '#C65D3E' : '#d6d3d1'}`,
                  }}>
                  {col === 'ipc_monthly' ? (isEn ? 'Inflation' : 'Inflación') : (isEn ? 'Food Share' : 'Peso Alimentos')}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-500 border-b" style={{ borderColor: '#E8E4DF', background: '#FAF8F4' }}>
                  <th className="px-4 py-3 text-left">{isEn ? 'Department' : 'Departamento'}</th>
                  <th className="px-4 py-3 text-right">{isEn ? 'Monthly CPI' : 'IPC Mensual'}</th>
                  <th className="px-4 py-3 text-right">{isEn ? '3M Avg' : 'Prom. 3M'}</th>
                  <th className="px-4 py-3 text-right">{isEn ? '12M Approx.' : '12M Aprox.'}</th>
                  <th className="px-4 py-3 text-right">{isEn ? 'Food Share' : 'Peso Alim.'}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((dept, idx) => (
                  <tr key={dept.dept_code} style={{ background: idx % 2 === 0 ? '#FFFCF7' : '#FAF8F4' }} className="border-b" >
                    <td className="px-4 py-2.5 font-medium" style={{ color: '#1a1a1a', borderColor: '#E8E4DF' }}>{dept.department}</td>
                    <td className="px-4 py-2.5 text-right font-semibold" style={{ color: '#C65D3E' }}>{(dept.ipc_monthly * 100).toFixed(3)}%</td>
                    <td className="px-4 py-2.5 text-right text-gray-600 text-xs">{(dept.ipc_monthly_3ma * 100).toFixed(3)}%</td>
                    <td className="px-4 py-2.5 text-right text-gray-600 text-xs">~{dept.ipc_12m_approx.toFixed(2)}%</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 rounded-full h-1.5" style={{ background: '#E8E4DF' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${dept.food_share * 100}%`, background: '#8B7355' }} />
                        </div>
                        <span className="text-xs text-gray-600">{(dept.food_share * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#C65D3E10', borderTop: '2px solid #C65D3E' }}>
                  <td className="px-4 py-2.5 font-bold" style={{ color: '#C65D3E' }}>Lima ({isEn ? 'official BCRP' : 'oficial BCRP'})</td>
                  <td className="px-4 py-2.5 text-right font-bold" style={{ color: '#C65D3E' }}>{(metadata.components.lima_headline_monthly * 100).toFixed(3)}%</td>
                  <td className="px-4 py-2.5 text-right text-xs" style={{ color: '#C65D3E' }}>—</td>
                  <td className="px-4 py-2.5 text-right text-xs" style={{ color: '#C65D3E' }}>—</td>
                  <td className="px-4 py-2.5 text-right text-xs" style={{ color: '#C65D3E' }}>30%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology */}
        <div className="rounded-xl p-5 mb-8" style={{ background: '#FFFCF7', borderLeft: '3px solid #C65D3E', border: '1px solid #E8E4DF' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#C65D3E' }}>
            {isEn ? 'Methodology and Limitations' : 'Metodología y Limitaciones'}
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-700">
            <li><strong>{isEn ? 'Formula:' : 'Fórmula:'}</strong>{' '}{isEn ? 'CPI_regional = α_food × CPI_food + (1 – α_food) × CPI_core, where α_food is food share from ENAHO 2023.' : 'IPC_regional = α_alim × IPC_alimentos + (1 – α_alim) × IPC_core, donde α_alim es la participación de alimentos según ENAHO 2023.'}</li>
            <li><strong>{isEn ? 'Limitation:' : 'Limitación:'}</strong>{' '}{isEn ? 'INEI only publishes official CPI for Lima and 25 cities. This is an econometric estimate — not official data. Error ≈ ±3 bp monthly.' : 'El INEI solo publica IPC oficial para Lima y 25 ciudades. Esta es una estimación econométrica — no son datos oficiales. Error ≈ ±3 pb mensuales.'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
