'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';

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

function povertyColor(rate: number): string {
  if (rate < 0.10) return 'bg-green-100 text-green-800';
  if (rate < 0.20) return 'bg-yellow-100 text-yellow-800';
  if (rate < 0.35) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [sortBy, setSortBy] = useState<'poverty_desc' | 'poverty_asc' | 'ubigeo'>('poverty_desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetch(`/assets/data/poverty_districts_full.csv?v=${new Date().toISOString().slice(0, 10)}`)
      .then(r => r.text())
      .then(text => { setRaw(parseCSV(text)); setLoading(false); })
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">{isEn ? 'Loading district data...' : 'Cargando datos distritales...'}</p>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">
        {isEn ? 'Error loading data.' : 'Error cargando datos.'}{' '}
        <button onClick={() => window.location.reload()} className="underline">
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">{isEn ? 'Statistics' : 'Estadísticas'}</a>
          {' / '}
          <a href="/estadisticas/pobreza" className="hover:text-blue-700">{isEn ? 'Poverty' : 'Pobreza'}</a>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Districts' : 'Distritos'}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEn ? 'Poverty at District Level' : 'Pobreza a Nivel Distrital'}
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          {isEn
            ? `Poverty proxy for ${raw.length.toLocaleString()} districts using satellite Nighttime Lights (NTL). Sub-departmental disaggregation via dasymetric mapping.`
            : `Proxy de pobreza para ${raw.length.toLocaleString()} distritos usando Nighttime Lights (NTL) satelital. Desagregación sub-departamental mediante dasymetric mapping.`}
        </p>
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-8 inline-block">
          ⚠️ {isEn ? 'Experimental estimates. NTL captures relative welfare, does not substitute ENAHO surveys.' : 'Estimaciones experimentales. NTL captura bienestar relativo, no sustituye encuestas ENAHO.'}
        </p>

        {/* KPIs */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">{isEn ? 'Average (selection)' : 'Promedio (selección)'}</p>
              <p className="text-2xl font-bold text-gray-900">{(avgRate * 100).toFixed(1)}%</p>
            </div>
            {maxDist && (
              <div className="bg-white rounded-lg border border-red-200 p-4">
                <p className="text-sm text-gray-500">{isEn ? 'Highest poverty' : 'Mayor pobreza'}</p>
                <p className="text-lg font-bold text-red-700">{(maxDist.poverty_rate_nowcast * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-400">Ubigeo {maxDist.district_ubigeo} · {DEPT_NAMES[maxDist.department_code]}</p>
              </div>
            )}
            {minDist && (
              <div className="bg-white rounded-lg border border-green-200 p-4">
                <p className="text-sm text-gray-500">{isEn ? 'Lowest poverty' : 'Menor pobreza'}</p>
                <p className="text-lg font-bold text-green-700">{(minDist.poverty_rate_nowcast * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-400">Ubigeo {minDist.district_ubigeo} · {DEPT_NAMES[minDist.department_code]}</p>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">
              {isEn ? 'Search ubigeo / department' : 'Buscar ubigeo / departamento'}
            </label>
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="150101, Lima..."
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">{isEn ? 'Department' : 'Departamento'}</label>
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
              className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:border-blue-500"
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
            <label className="block text-xs text-gray-500 mb-1">{isEn ? 'Sort by' : 'Ordenar por'}</label>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
              className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="poverty_desc">{isEn ? 'Highest poverty first' : 'Mayor pobreza primero'}</option>
              <option value="poverty_asc">{isEn ? 'Lowest poverty first' : 'Menor pobreza primero'}</option>
              <option value="ubigeo">Ubigeo (A–Z)</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 self-center">
            {filtered.length.toLocaleString()} {isEn ? 'districts' : 'distritos'}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubigeo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Department' : 'Departamento'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Year' : 'Año'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Poverty Nowcast' : 'Pobreza Nowcast'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Level' : 'Nivel'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    {isEn ? 'NTL Weight' : 'Peso NTL'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((d, i) => {
                  const pct = d.poverty_rate_nowcast * 100;
                  return (
                    <tr key={d.district_ubigeo + i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-700">{d.district_ubigeo}</td>
                      <td className="px-4 py-3 text-gray-700">{DEPT_NAMES[d.department_code] ?? d.department_code}</td>
                      <td className="px-4 py-3 text-gray-500">{d.year}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5 hidden sm:block">
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="font-medium text-gray-900 tabular-nums">{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${povertyColor(d.poverty_rate_nowcast)}`}>
                          {povertyLabel(d.poverty_rate_nowcast, isEn)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs hidden sm:table-cell">
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
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {isEn
                  ? `Showing ${((page - 1) * PAGE_SIZE) + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length.toLocaleString()}`
                  : `Mostrando ${((page - 1) * PAGE_SIZE) + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length.toLocaleString()}`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  ←
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50"
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isEn ? 'Download full CSV' : 'Descargar CSV completo'}
          </a>
          <a href="/estadisticas/pobreza/metodologia" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            📖 {isEn ? 'View methodology' : 'Ver metodología'}
          </a>
        </div>
      </div>
    </div>
  );
}
