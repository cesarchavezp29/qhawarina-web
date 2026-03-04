'use client';

import { useState } from 'react';

interface Release {
  date: string;       // "YYYY-MM-DD" or "YYYY-MM" for monthly recurring
  label: string;
  source: string;
  type: 'official' | 'qhawarina' | 'bcrp';
  description: string;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'ad-hoc';
  link?: string;
}

const RELEASES_2026: Release[] = [
  // ---- January 2026 ----
  {
    date: '2026-01-02',
    label: 'Índice de Precios al Consumidor — Dic 2025',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    frequency: 'monthly',
    link: 'https://www.inei.gob.pe/estadisticas/indice-tematico/economia/',
  },
  {
    date: '2026-01-09',
    label: 'Nowcast Inflación actualizado',
    source: 'Qhawarina',
    type: 'qhawarina',
    description: 'Predicción mensual del DFM incorporando dato IPC de diciembre.',
    frequency: 'monthly',
  },
  {
    date: '2026-01-15',
    label: 'Reporte de Inflación — BCRP',
    source: 'BCRP',
    type: 'bcrp',
    description: 'Informe trimestral de inflación y proyecciones macroeconómicas del BCRP.',
    frequency: 'quarterly',
    link: 'https://www.bcrp.gob.pe/publicaciones/reporte-de-inflacion.html',
  },
  // ---- February 2026 ----
  {
    date: '2026-02-03',
    label: 'Índice de Precios al Consumidor — Ene 2026',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    frequency: 'monthly',
    link: 'https://www.inei.gob.pe/estadisticas/indice-tematico/economia/',
  },
  {
    date: '2026-02-10',
    label: 'Nowcast PBI Q4 2025',
    source: 'Qhawarina',
    type: 'qhawarina',
    description: 'Predicción del crecimiento del PBI del cuarto trimestre de 2025.',
    frequency: 'quarterly',
  },
  {
    date: '2026-02-13',
    label: 'PBI Q3 2025 — Dato oficial',
    source: 'INEI',
    type: 'official',
    description: 'Cuentas nacionales del tercer trimestre 2025. Publicación con 4 meses de rezago.',
    frequency: 'quarterly',
    link: 'https://www.inei.gob.pe/estadisticas/indice-tematico/economia/',
  },
  // ---- March 2026 ----
  {
    date: '2026-03-03',
    label: 'Índice de Precios al Consumidor — Feb 2026',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    frequency: 'monthly',
    link: 'https://www.inei.gob.pe/estadisticas/indice-tematico/economia/',
  },
  {
    date: '2026-03-10',
    label: 'Nowcast Inflación actualizado',
    source: 'Qhawarina',
    type: 'qhawarina',
    description: 'Predicción mensual del DFM incorporando dato IPC de febrero.',
    frequency: 'monthly',
  },
  {
    date: '2026-03-20',
    label: 'Decisión Tasa de Referencia — BCRP',
    source: 'BCRP',
    type: 'bcrp',
    description: 'Reunión del Directorio del BCRP. Decisión sobre tasa de política monetaria.',
    frequency: 'monthly',
    link: 'https://www.bcrp.gob.pe/politica-monetaria/programa-de-reuniones-del-directorio.html',
  },
  // ---- April 2026 ----
  {
    date: '2026-04-02',
    label: 'Índice de Precios al Consumidor — Mar 2026',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    frequency: 'monthly',
  },
  {
    date: '2026-04-15',
    label: 'PBI Q4 2025 — Dato oficial',
    source: 'INEI',
    type: 'official',
    description: 'Cuentas nacionales del cuarto trimestre 2025.',
    frequency: 'quarterly',
  },
  {
    date: '2026-04-17',
    label: 'Nowcast PBI Q1 2026',
    source: 'Qhawarina',
    type: 'qhawarina',
    description: 'Primera estimación del crecimiento del PBI del primer trimestre 2026.',
    frequency: 'quarterly',
  },
  {
    date: '2026-04-30',
    label: 'Informe Técnico Pobreza 2025',
    source: 'INEI',
    type: 'official',
    description: 'Publicación anual de tasas de pobreza monetaria nacional y departamental 2025.',
    frequency: 'annual',
    link: 'https://www.inei.gob.pe/estadisticas/indice-tematico/condiciones-de-vida-y-pobreza-356/',
  },
  // ---- May 2026 ----
  {
    date: '2026-05-04',
    label: 'Índice de Precios al Consumidor — Abr 2026',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    frequency: 'monthly',
  },
  {
    date: '2026-05-07',
    label: 'Nowcast Pobreza 2025 actualizado',
    source: 'Qhawarina',
    type: 'qhawarina',
    description: 'Revisión del nowcast de pobreza 2025 con dato oficial INEI.',
    frequency: 'annual',
  },
  {
    date: '2026-05-15',
    label: 'Reporte de Inflación — BCRP',
    source: 'BCRP',
    type: 'bcrp',
    description: 'Informe trimestral de inflación y proyecciones macroeconómicas.',
    frequency: 'quarterly',
    link: 'https://www.bcrp.gob.pe/publicaciones/reporte-de-inflacion.html',
  },
  // ---- June 2026 ----
  {
    date: '2026-06-02',
    label: 'Índice de Precios al Consumidor — May 2026',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    frequency: 'monthly',
  },
  {
    date: '2026-06-12',
    label: 'PBI Q1 2026 — Dato oficial',
    source: 'INEI',
    type: 'official',
    description: 'Cuentas nacionales del primer trimestre 2026.',
    frequency: 'quarterly',
  },
];

const TYPE_STYLES: Record<Release['type'], { bg: string; text: string; dot: string; label: string }> = {
  official: { bg: 'bg-blue-50', text: 'text-blue-800', dot: 'bg-blue-500', label: 'INEI / Oficial' },
  qhawarina: { bg: 'bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-500', label: 'Qhawarina' },
  bcrp: { bg: 'bg-purple-50', text: 'text-purple-800', dot: 'bg-purple-500', label: 'BCRP' },
};

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function groupByMonth(releases: Release[]) {
  const map = new Map<string, Release[]>();
  for (const r of releases) {
    const key = r.date.slice(0, 7); // "YYYY-MM"
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

export default function CalendarioPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [filter, setFilter] = useState<'all' | Release['type']>('all');

  const filtered = RELEASES_2026.filter(r => filter === 'all' || r.type === filter);
  const grouped = groupByMonth(filtered);
  const months = Array.from(grouped.keys()).sort();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {' / '}
          <span className="text-gray-900 font-medium">Calendario de Publicaciones</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Calendario de Publicaciones</h1>
        <p className="text-lg text-gray-600 mb-8">
          Fechas de publicación de estadísticas oficiales e indicadores Qhawarina para 2026.
        </p>

        {/* Legend + Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {([['all', 'Todos', 'bg-gray-200 text-gray-700'], ['official', 'INEI / Oficial', 'bg-blue-100 text-blue-800'], ['qhawarina', 'Qhawarina', 'bg-emerald-100 text-emerald-800'], ['bcrp', 'BCRP', 'bg-purple-100 text-purple-800']] as const).map(([key, label, cls]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border-2 ${filter === key ? `${cls} border-current` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-10">
          {months.map((monthKey) => {
            const [year, monthNum] = monthKey.split('-').map(Number);
            const monthName = MONTH_NAMES[monthNum - 1];
            const events = grouped.get(monthKey)!.sort((a, b) => a.date.localeCompare(b.date));

            return (
              <div key={monthKey}>
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span>
                  {monthName} {year}
                </h2>
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                  {events.map((release, i) => {
                    const styles = TYPE_STYLES[release.type];
                    const isPast = release.date < today;
                    const isToday = release.date === today;

                    return (
                      <div
                        key={i}
                        className={`relative bg-white rounded-lg border p-4 transition-shadow hover:shadow-md ${isToday ? 'border-blue-400 ring-1 ring-blue-300' : isPast ? 'border-gray-200 opacity-70' : 'border-gray-200'}`}
                      >
                        {/* Dot on timeline */}
                        <div className={`absolute -left-[21px] top-5 w-3 h-3 rounded-full border-2 border-white ${styles.dot}`}></div>

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs text-gray-500 font-mono">
                                {new Date(release.date + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.bg} ${styles.text}`}>
                                {styles.label}
                              </span>
                              {isToday && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-600 text-white">Hoy</span>
                              )}
                              {isPast && !isToday && (
                                <span className="text-xs text-gray-400">Publicado</span>
                              )}
                            </div>
                            <h3 className={`font-semibold ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                              {release.label}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">{release.description}</p>
                          </div>
                          {release.link && (
                            <a
                              href={release.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-sm text-blue-700 hover:underline"
                            >
                              Ver →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-xs text-gray-400 text-center">
          Las fechas de publicaciones oficiales son estimadas y pueden variar. Fuentes: INEI, BCRP. Fechas Qhawarina son objetivos internos.
        </p>
      </div>
    </div>
  );
}
