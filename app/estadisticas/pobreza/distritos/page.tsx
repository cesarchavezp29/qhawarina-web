'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import PageSkeleton from '../../../components/PageSkeleton';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface District {
  district_ubigeo: string;
  department_code: string;
  year: number;
  ntl_weight: number;
  ntl_sum: number;
  poverty_rate_nowcast: number;
}

const DEPT_NAMES: Record<string, string> = {
  '01': 'Amazonas', '02': 'Áncash', '03': 'Apurímac', '04': 'Arequipa',
  '05': 'Ayacucho', '06': 'Cajamarca', '07': 'Callao', '08': 'Cusco',
  '09': 'Huancavelica', '10': 'Huánuco', '11': 'Ica', '12': 'Junín',
  '13': 'La Libertad', '14': 'Lambayeque', '15': 'Lima', '16': 'Loreto',
  '17': 'Madre de Dios', '18': 'Moquegua', '19': 'Pasco', '20': 'Piura',
  '21': 'Puno', '22': 'San Martín', '23': 'Tacna', '24': 'Tumbes', '25': 'Ucayali',
};

const MW = {
  ink: '#2D3142',
  ink3: '#8D99AE',
  terra: '#C65D3E',
  teal: '#2A9D8F',
  bg: '#FAF8F4',
  card: '#FFFCF7',
  border: '#E8E4DF',
  surface: '#F5F2EE',
};

function parseCSV(text: string): District[] {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const vals = line.split(',');
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] ?? '').trim(); });
    return {
      district_ubigeo: obj.district_ubigeo,
      department_code: String(parseInt(obj.department_code, 10)).padStart(2, '0'),
      year: parseInt(obj.year),
      ntl_weight: parseFloat(obj.ntl_weight),
      ntl_sum: parseFloat(obj.ntl_sum),
      poverty_rate_nowcast: parseFloat(obj.poverty_rate_nowcast),
    };
  }).filter(d => !isNaN(d.poverty_rate_nowcast));
}

function povertyBadgeStyle(rate: number): { background: string; color: string } {
  if (rate < 0.10) return { background: '#D1FAE5', color: '#065F46' };
  if (rate < 0.20) return { background: '#FEF3C7', color: '#92400E' };
  if (rate < 0.35) return { background: '#FFEDD5', color: '#9A3412' };
  return { background: '#FEE2E2', color: '#991B1B' };
}

function povertyBarColor(rate: number): string {
  if (rate < 0.10) return MW.teal;
  if (rate < 0.20) return '#F59E0B';
  if (rate < 0.35) return '#F97316';
  return MW.terra;
}

function povertyLabel(rate: number, isEn: boolean): string {
  if (rate < 0.10) return isEn ? 'Low' : 'Baja';
  if (rate < 0.20) return isEn ? 'Medium-low' : 'Media-baja';
  if (rate < 0.35) return isEn ? 'Medium-high' : 'Media-alta';
  return isEn ? 'High' : 'Alta';
}

export default function DistritosPage() {
  const isEn = useLocale() === 'en';
  const [raw, setRaw] = useState<District[]>([]);
  const [geojson, setGeojson] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [sortBy, setSortBy] = useState<'poverty_desc' | 'poverty_asc' | 'ubigeo'>('poverty_desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    Promise.all([
      fetch(`/assets/data/poverty_districts_full.csv?v=${new Date().toISOString().slice(0, 10)}`).then(r => r.text()),
      fetch('/assets/data/peru_distritos.geojson').then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([text, gj]) => {
        setRaw(parseCSV(text));
        setGeojson(gj);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let data = raw;
    if (deptFilter) data = data.filter(d => d.department_code === deptFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        d.district_ubigeo.includes(q) ||
        (DEPT_NAMES[d.department_code] ?? '').toLowerCase().includes(q)
      );
    }
    return [...data].sort((a, b) => {
      if (sortBy === 'poverty_desc') return b.poverty_rate_nowcast - a.poverty_rate_nowcast;
      if (sortBy === 'poverty_asc') return a.poverty_rate_nowcast - b.poverty_rate_nowcast;
      return a.district_ubigeo.localeCompare(b.district_ubigeo);
    });
  }, [raw, search, deptFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avgRate = filtered.length ? filtered.reduce((s, d) => s + d.poverty_rate_nowcast, 0) / filtered.length : 0;
  const maxDist = filtered.reduce((a, b) => b.poverty_rate_nowcast > a.poverty_rate_nowcast ? b : a, filtered[0]);
  const minDist = filtered.reduce((a, b) => b.poverty_rate_nowcast < a.poverty_rate_nowcast ? b : a, filtered[0]);

  const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.045'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

  if (loading) return <PageSkeleton cards={2} />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MW.bg }}>
      <p style={{ color: MW.terra }}>
        {isEn ? 'Error loading data.' : 'Error cargando datos.'}{' '}
        <button onClick={() => window.location.reload()} className="underline">
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: MW.bg, backgroundImage: WATERMARK }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-4" style={{ color: MW.ink3 }}>
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <Link href="/estadisticas/pobreza" className="hover:underline">{isEn ? 'Poverty' : 'Pobreza'}</Link>
          {' / '}
          <span style={{ color: MW.ink }} className="font-medium">{isEn ? 'Districts' : 'Distritos'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold" style={{ color: MW.ink }}>
            {isEn ? 'Poverty at District Level' : 'Pobreza a Nivel Distrital'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'Poverty — District Level' : 'Pobreza a Nivel Distrital'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Poverty at District Level — Qhawarina' : 'Pobreza Distrital — Qhawarina'}
              text={isEn
                ? '🗺️ Peru poverty rates at district level (1,891 districts) | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza/distritos'
                : '🗺️ Tasas de pobreza a nivel distrital en Perú (1,891 distritos) | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza/distritos'}
            />
          </div>
        </div>
        <p className="text-lg mb-2" style={{ color: MW.ink3 }}>
          {isEn
            ? `Poverty proxy for ${raw.length.toLocaleString()} districts using satellite Nighttime Lights (NTL). Sub-departmental disaggregation via dasymetric mapping.`
            : `Proxy de pobreza para ${raw.length.toLocaleString()} distritos usando Nighttime Lights (NTL) satelital. Desagregación sub-departamental mediante dasymetric mapping.`}
        </p>
        <div className="inline-block px-4 py-2 rounded-lg mb-8 text-sm font-medium" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
          ⚠️ {isEn ? 'Experimental estimates. NTL captures relative welfare, does not substitute ENAHO surveys.' : 'Estimaciones experimentales. NTL captura bienestar relativo, no sustituye encuestas ENAHO.'}
        </div>

        {/* KPIs */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border p-4" style={{ background: MW.card, borderColor: MW.border }}>
              <p className="text-sm mb-1" style={{ color: MW.ink3 }}>{isEn ? 'Average (selection)' : 'Promedio (selección)'}</p>
              <p className="text-2xl font-bold" style={{ color: MW.ink }}>{(avgRate * 100).toFixed(1)}%</p>
            </div>
            {maxDist && (
              <div className="rounded-lg border p-4" style={{ background: MW.card, borderColor: '#FECACA' }}>
                <p className="text-sm mb-1" style={{ color: MW.ink3 }}>{isEn ? 'Highest poverty' : 'Mayor pobreza'}</p>
                <p className="text-lg font-bold" style={{ color: MW.terra }}>{(maxDist.poverty_rate_nowcast * 100).toFixed(1)}%</p>
                <p className="text-xs mt-1" style={{ color: MW.ink3 }}>Ubigeo {maxDist.district_ubigeo} · {DEPT_NAMES[maxDist.department_code]}</p>
              </div>
            )}
            {minDist && (
              <div className="rounded-lg border p-4" style={{ background: MW.card, borderColor: '#A7F3D0' }}>
                <p className="text-sm mb-1" style={{ color: MW.ink3 }}>{isEn ? 'Lowest poverty' : 'Menor pobreza'}</p>
                <p className="text-lg font-bold" style={{ color: MW.teal }}>{(minDist.poverty_rate_nowcast * 100).toFixed(1)}%</p>
                <p className="text-xs mt-1" style={{ color: MW.ink3 }}>Ubigeo {minDist.district_ubigeo} · {DEPT_NAMES[minDist.department_code]}</p>
              </div>
            )}
          </div>
        )}

        {/* Choropleth Map */}
        <div className="rounded-xl border mb-8" style={{ background: MW.card, borderColor: MW.border }}>
          <div className="px-6 pt-5 pb-2">
            <h2 className="text-lg font-semibold" style={{ color: MW.ink }}>
              {isEn ? 'District Poverty Map — 2025 Nowcast' : 'Mapa de Pobreza Distrital — Nowcast 2025'}
            </h2>
          </div>
          {geojson ? (
            <Plot
              data={[{
                type: 'choropleth' as const,
                geojson: geojson as any,
                locations: raw.map(d => d.district_ubigeo),
                z: raw.map(d => d.poverty_rate_nowcast * 100),
                featureidkey: 'properties.ubigeo',
                colorscale: [
                  [0,    '#FAF8F4'],
                  [0.15, '#D4956A'],
                  [0.30, '#C65D3E'],
                  [0.55, '#9B2226'],
                  [1,    '#3B0000'],
                ],
                zmin: 0,
                zmax: 65,
                colorbar: {
                  title: { text: isEn ? 'Poverty (%)' : 'Pobreza (%)', side: 'right' as const },
                  thickness: 14,
                  len: 0.75,
                  ticksuffix: '%',
                },
                text: raw.map(d =>
                  `Ubigeo: ${d.district_ubigeo}<br>${DEPT_NAMES[d.department_code] ?? d.department_code}<br>${isEn ? 'Poverty:' : 'Pobreza:'} ${(d.poverty_rate_nowcast * 100).toFixed(1)}%`
                ),
                hovertemplate: '%{text}<extra></extra>',
                marker: { line: { color: '#ffffff', width: 0.4 } },
              } as any]}
              layout={{
                height: 560,
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
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium mb-1" style={{ color: MW.ink }}>
                {isEn ? 'District shapefile not found' : 'Shapefile distrital no encontrado'}
              </p>
              <p className="text-xs" style={{ color: MW.ink3 }}>
                {isEn
                  ? 'Place peru_distritos.geojson in /public/assets/data/ with ubigeo property to enable the map.'
                  : 'Coloca peru_distritos.geojson en /public/assets/data/ con propiedad ubigeo para habilitar el mapa.'}
              </p>
            </div>
          )}
          <p className="px-6 pb-4 text-xs" style={{ color: MW.ink3 }}>
            {isEn
              ? 'Experimental NTL-based disaggregation. Hover for district details.'
              : 'Desagregación experimental basada en NTL. Hover para detalles.'}
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-lg border p-4 mb-6 flex flex-wrap gap-3 items-end" style={{ background: MW.card, borderColor: MW.border }}>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs mb-1" style={{ color: MW.ink3 }}>
              {isEn ? 'Search ubigeo / department' : 'Buscar ubigeo / departamento'}
            </label>
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: MW.ink3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="150101, Lima..."
                className="w-full pl-8 pr-3 py-2 rounded-md text-sm focus:outline-none"
                style={{ border: `1px solid ${MW.border}`, color: MW.ink, background: MW.bg }}
              />
            </div>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs mb-1" style={{ color: MW.ink3 }}>{isEn ? 'Department' : 'Departamento'}</label>
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
              className="w-full rounded-md text-sm px-3 py-2 focus:outline-none"
              style={{ border: `1px solid ${MW.border}`, color: MW.ink, background: MW.bg }}
            >
              <option value="">{isEn ? `All (${raw.length})` : `Todos (${raw.length})`}</option>
              {Object.entries(DEPT_NAMES).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => {
                const count = raw.filter(d => d.department_code === code).length;
                if (count === 0) return null;
                return <option key={code} value={code}>{name} ({count})</option>;
              })}
            </select>
          </div>

          <div className="min-w-[180px]">
            <label className="block text-xs mb-1" style={{ color: MW.ink3 }}>{isEn ? 'Sort by' : 'Ordenar por'}</label>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
              className="w-full rounded-md text-sm px-3 py-2 focus:outline-none"
              style={{ border: `1px solid ${MW.border}`, color: MW.ink, background: MW.bg }}
            >
              <option value="poverty_desc">{isEn ? 'Highest poverty first' : 'Mayor pobreza primero'}</option>
              <option value="poverty_asc">{isEn ? 'Lowest poverty first' : 'Menor pobreza primero'}</option>
              <option value="ubigeo">Ubigeo (A–Z)</option>
            </select>
          </div>

          <div className="text-sm self-center" style={{ color: MW.ink3 }}>
            {filtered.length.toLocaleString()} {isEn ? 'districts' : 'distritos'}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden" style={{ background: MW.card, borderColor: MW.border }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: MW.surface, borderBottom: `1px solid ${MW.border}` }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: MW.ink3 }}>Ubigeo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: MW.ink3 }}>
                    {isEn ? 'Department' : 'Departamento'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: MW.ink3 }}>
                    {isEn ? 'Year' : 'Año'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: MW.ink3 }}>
                    {isEn ? 'Poverty Nowcast' : 'Pobreza Nowcast'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: MW.ink3 }}>
                    {isEn ? 'Level' : 'Nivel'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: MW.ink3 }}>
                    {isEn ? 'NTL Weight' : 'Peso NTL'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((d, i) => {
                  const pct = d.poverty_rate_nowcast * 100;
                  return (
                    <tr key={d.district_ubigeo + i} style={{ borderBottom: `1px solid ${MW.border}` }}>
                      <td className="px-4 py-3 font-mono" style={{ color: MW.ink }}>{d.district_ubigeo}</td>
                      <td className="px-4 py-3" style={{ color: MW.ink }}>{DEPT_NAMES[d.department_code] ?? d.department_code}</td>
                      <td className="px-4 py-3" style={{ color: MW.ink3 }}>{d.year}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 rounded-full h-1.5 hidden sm:block" style={{ background: MW.border }}>
                            <div
                              className="h-1.5 rounded-full"
                              style={{ width: `${Math.min(pct, 100)}%`, background: povertyBarColor(d.poverty_rate_nowcast) }}
                            />
                          </div>
                          <span className="font-medium tabular-nums" style={{ color: MW.ink }}>{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={povertyBadgeStyle(d.poverty_rate_nowcast)}>
                          {povertyLabel(d.poverty_rate_nowcast, isEn)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs hidden sm:table-cell" style={{ color: MW.ink3 }}>
                        {(d.ntl_weight * 100).toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${MW.border}` }}>
              <p className="text-sm" style={{ color: MW.ink3 }}>
                {isEn
                  ? `Showing ${((page - 1) * PAGE_SIZE) + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length.toLocaleString()}`
                  : `Mostrando ${((page - 1) * PAGE_SIZE) + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length.toLocaleString()}`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded text-sm disabled:opacity-40"
                  style={{ border: `1px solid ${MW.border}`, color: MW.ink, background: MW.bg }}
                >
                  ←
                </button>
                <span className="px-3 py-1 text-sm" style={{ color: MW.ink }}>{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded text-sm disabled:opacity-40"
                  style={{ border: `1px solid ${MW.border}`, color: MW.ink, background: MW.bg }}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Download + Methodology */}
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/assets/data/poverty_districts_full.csv"
            download="poverty_districts_full.csv"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: MW.terra }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isEn ? 'Download full CSV' : 'Descargar CSV completo'}
          </a>
          <a
            href="/estadisticas/pobreza/metodologia"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ border: `1px solid ${MW.border}`, color: MW.ink, background: MW.card }}
          >
            📖 {isEn ? 'View methodology' : 'Ver metodología'}
          </a>
        </div>
      </div>
    </div>
  );
}
