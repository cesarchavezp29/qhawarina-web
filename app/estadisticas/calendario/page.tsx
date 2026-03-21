'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import CiteButton from '../../components/CiteButton';
import ShareButton from '../../components/ShareButton';

interface Release {
  date: string;
  label: string;
  label_en?: string;
  source: string;
  type: 'official' | 'qhawarina' | 'bcrp';
  description: string;
  description_en?: string;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'ad-hoc';
  link?: string;
}

const RELEASES_2026: Release[] = [
  // ---- January 2026 ----
  {
    date: '2026-01-02',
    label: 'Índice de Precios al Consumidor — Dic 2025',
    label_en: 'Consumer Price Index — Dec 2025',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    description_en: 'Monthly and annual cumulative percentage change of the Lima Metro CPI.',
    frequency: 'monthly',
    link: 'https://www.inei.gob.pe/estadisticas/indice-tematico/economia/',
  },
  {
    date: '2026-01-09',
    label: 'Nowcast Inflación actualizado',
    label_en: 'Updated Inflation Nowcast',
    source: 'Qhawarina',
    type: 'qhawarina',
    description: 'Predicción mensual del DFM incorporando dato IPC de diciembre.',
    description_en: 'Monthly DFM prediction incorporating December CPI data.',
    frequency: 'monthly',
  },
  {
    date: '2026-01-15',
    label: 'Reporte de Inflación — BCRP',
    label_en: 'Inflation Report — BCRP',
    source: 'BCRP',
    type: 'bcrp',
    description: 'Informe trimestral de inflación y proyecciones macroeconómicas del BCRP.',
    description_en: 'Quarterly BCRP inflation report and macroeconomic projections.',
    frequency: 'quarterly',
    link: 'https://www.bcrp.gob.pe/publicaciones/reporte-de-inflacion.html',
  },
  // ---- February 2026 ----
  {
    date: '2026-02-03',
    label: 'Índice de Precios al Consumidor — Ene 2026',
    label_en: 'Consumer Price Index — Jan 2026',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    description_en: 'Monthly and annual cumulative percentage change of the Lima Metro CPI.',
    frequency: 'monthly',
    link: 'https://www.inei.gob.pe/estadisticas/indice-tematico/economia/',
  },
  {
    date: '2026-02-10',
    label: 'Nowcast PBI Q4 2025',
    label_en: 'GDP Nowcast Q4 2025',
    source: 'Qhawarina',
    type: 'qhawarina',
    description: 'Predicción del crecimiento del PBI del cuarto trimestre de 2025.',
    description_en: 'GDP growth prediction for the fourth quarter of 2025.',
    frequency: 'quarterly',
  },
  {
    date: '2026-02-13',
    label: 'PBI Q3 2025 — Dato oficial',
    label_en: 'GDP Q3 2025 — Official release',
    source: 'INEI',
    type: 'official',
    description: 'Cuentas nacionales del tercer trimestre 2025. Publicación con 4 meses de rezago.',
    description_en: 'National accounts for Q3 2025. Published with 4-month lag.',
    frequency: 'quarterly',
    link: 'https://www.inei.gob.pe/estadisticas/indice-tematico/economia/',
  },
  // ---- March 2026 ----
  {
    date: '2026-03-03',
    label: 'Índice de Precios al Consumidor — Feb 2026',
    label_en: 'Consumer Price Index — Feb 2026',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    description_en: 'Monthly and annual cumulative percentage change of the Lima Metro CPI.',
    frequency: 'monthly',
    link: 'https://www.inei.gob.pe/estadisticas/indice-tematico/economia/',
  },
  {
    date: '2026-03-10',
    label: 'Nowcast Inflación actualizado',
    label_en: 'Updated Inflation Nowcast',
    source: 'Qhawarina',
    type: 'qhawarina',
    description: 'Predicción mensual del DFM incorporando dato IPC de febrero.',
    description_en: 'Monthly DFM prediction incorporating February CPI data.',
    frequency: 'monthly',
  },
  {
    date: '2026-03-20',
    label: 'Decisión Tasa de Referencia — BCRP',
    label_en: 'Reference Rate Decision — BCRP',
    source: 'BCRP',
    type: 'bcrp',
    description: 'Reunión del Directorio del BCRP. Decisión sobre tasa de política monetaria.',
    description_en: 'BCRP Board meeting. Decision on monetary policy rate.',
    frequency: 'monthly',
    link: 'https://www.bcrp.gob.pe/politica-monetaria/programa-de-reuniones-del-directorio.html',
  },
  // ---- April 2026 ----
  {
    date: '2026-04-02',
    label: 'Índice de Precios al Consumidor — Mar 2026',
    label_en: 'Consumer Price Index — Mar 2026',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    description_en: 'Monthly and annual cumulative percentage change of the Lima Metro CPI.',
    frequency: 'monthly',
  },
  {
    date: '2026-04-15',
    label: 'PBI Q4 2025 — Dato oficial',
    label_en: 'GDP Q4 2025 — Official release',
    source: 'INEI',
    type: 'official',
    description: 'Cuentas nacionales del cuarto trimestre 2025.',
    description_en: 'National accounts for Q4 2025.',
    frequency: 'quarterly',
  },
  {
    date: '2026-04-17',
    label: 'Nowcast PBI Q1 2026',
    label_en: 'GDP Nowcast Q1 2026',
    source: 'Qhawarina',
    type: 'qhawarina',
    description: 'Primera estimación del crecimiento del PBI del primer trimestre 2026.',
    description_en: 'First estimate of GDP growth for Q1 2026.',
    frequency: 'quarterly',
  },
  {
    date: '2026-04-30',
    label: 'Informe Técnico Pobreza 2025',
    label_en: 'Poverty Technical Report 2025',
    source: 'INEI',
    type: 'official',
    description: 'Publicación anual de tasas de pobreza monetaria nacional y departamental 2025.',
    description_en: 'Annual release of national and departmental monetary poverty rates 2025.',
    frequency: 'annual',
    link: 'https://www.inei.gob.pe/estadisticas/indice-tematico/condiciones-de-vida-y-pobreza-356/',
  },
  // ---- May 2026 ----
  {
    date: '2026-05-04',
    label: 'Índice de Precios al Consumidor — Abr 2026',
    label_en: 'Consumer Price Index — Apr 2026',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    description_en: 'Monthly and annual cumulative percentage change of the Lima Metro CPI.',
    frequency: 'monthly',
  },
  {
    date: '2026-05-07',
    label: 'Nowcast Pobreza 2025 actualizado',
    label_en: 'Updated Poverty Nowcast 2025',
    source: 'Qhawarina',
    type: 'qhawarina',
    description: 'Revisión del nowcast de pobreza 2025 con dato oficial INEI.',
    description_en: 'Revision of the 2025 poverty nowcast with INEI official data.',
    frequency: 'annual',
  },
  {
    date: '2026-05-15',
    label: 'Reporte de Inflación — BCRP',
    label_en: 'Inflation Report — BCRP',
    source: 'BCRP',
    type: 'bcrp',
    description: 'Informe trimestral de inflación y proyecciones macroeconómicas.',
    description_en: 'Quarterly inflation report and macroeconomic projections.',
    frequency: 'quarterly',
    link: 'https://www.bcrp.gob.pe/publicaciones/reporte-de-inflacion.html',
  },
  // ---- June 2026 ----
  {
    date: '2026-06-02',
    label: 'Índice de Precios al Consumidor — May 2026',
    label_en: 'Consumer Price Index — May 2026',
    source: 'INEI',
    type: 'official',
    description: 'Variación porcentual mensual y acumulada anual del IPC de Lima Metropolitana.',
    description_en: 'Monthly and annual cumulative percentage change of the Lima Metro CPI.',
    frequency: 'monthly',
  },
  {
    date: '2026-06-12',
    label: 'PBI Q1 2026 — Dato oficial',
    label_en: 'GDP Q1 2026 — Official release',
    source: 'INEI',
    type: 'official',
    description: 'Cuentas nacionales del primer trimestre 2026.',
    description_en: 'National accounts for Q1 2026.',
    frequency: 'quarterly',
  },
];

const MONTH_NAMES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MONTH_NAMES_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const TYPE_STYLES: Record<Release['type'], { bg: string; text: string; dot: string; label_es: string; label_en: string }> = {
  official: { bg: 'bg-blue-50', text: 'text-blue-800', dot: 'bg-blue-500', label_es: 'INEI / Oficial', label_en: 'INEI / Official' },
  qhawarina: { bg: 'bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-500', label_es: 'Qhawarina', label_en: 'Qhawarina' },
  bcrp: { bg: 'bg-purple-50', text: 'text-purple-800', dot: 'bg-purple-500', label_es: 'BCRP', label_en: 'BCRP' },
};

function groupByMonth(releases: Release[]) {
  const map = new Map<string, Release[]>();
  for (const r of releases) {
    const key = r.date.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

export default function CalendarioPage() {
  const isEn = useLocale() === 'en';
  const today = new Date().toISOString().slice(0, 10);
  const [filter, setFilter] = useState<'all' | Release['type']>('all');

  const filtered = RELEASES_2026.filter(r => filter === 'all' || r.type === filter);
  const grouped = groupByMonth(filtered);
  const months = Array.from(grouped.keys()).sort();

  const MONTH_NAMES = isEn ? MONTH_NAMES_EN : MONTH_NAMES_ES;
  const dateLocale = isEn ? 'en-US' : 'es-PE';

  const filterButtons = [
    { key: 'all' as const, label: isEn ? 'All' : 'Todos', cls: 'bg-gray-200 text-gray-700' },
    { key: 'official' as const, label: isEn ? 'INEI / Official' : 'INEI / Oficial', cls: 'bg-blue-100 text-blue-800' },
    { key: 'qhawarina' as const, label: 'Qhawarina', cls: 'bg-emerald-100 text-emerald-800' },
    { key: 'bcrp' as const, label: 'BCRP', cls: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "#FAF8F4", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")` }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/estadisticas" className="hover:text-[#C65D3E]">
            {isEn ? 'Statistics' : 'Estadísticas'}
          </Link>
          {' / '}
          <span className="text-gray-900 font-medium">
            {isEn ? 'Publications Calendar' : 'Calendario de Publicaciones'}
          </span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">
            {isEn ? 'Publications Calendar' : 'Calendario de Publicaciones'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'Economic Data Calendar' : 'Calendario de Datos Económicos'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Publications Calendar — Qhawarina' : 'Calendario de Publicaciones — Qhawarina'}
              text={isEn
                ? '📅 Peru economic data release calendar 2026 | Qhawarina\nhttps://qhawarina.pe/estadisticas/calendario'
                : '📅 Calendario de publicaciones económicas Perú 2026 | Qhawarina\nhttps://qhawarina.pe/estadisticas/calendario'}
            />
          </div>
        </div>
        <p className="text-lg text-gray-600 mb-8">
          {isEn
            ? 'Release dates for official statistics and Qhawarina indicators for 2026.'
            : 'Fechas de publicación de estadísticas oficiales e indicadores Qhawarina para 2026.'}
        </p>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filterButtons.map(({ key, label, cls }) => (
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
                    const label = isEn ? (release.label_en ?? release.label) : release.label;
                    const description = isEn ? (release.description_en ?? release.description) : release.description;

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
                                {new Date(release.date + 'T12:00:00').toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' })}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.bg} ${styles.text}`}>
                                {isEn ? styles.label_en : styles.label_es}
                              </span>
                              {isToday && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-600 text-white">
                                  {isEn ? 'Today' : 'Hoy'}
                                </span>
                              )}
                              {isPast && !isToday && (
                                <span className="text-xs text-gray-400">
                                  {isEn ? 'Published' : 'Publicado'}
                                </span>
                              )}
                            </div>
                            <h3 className={`font-semibold ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                              {label}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                          </div>
                          {release.link && (
                            <a
                              href={release.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-sm text-[#C65D3E] hover:underline"
                            >
                              {isEn ? 'View →' : 'Ver →'}
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
          {isEn
            ? 'Official release dates are estimates and may vary. Sources: INEI, BCRP. Qhawarina dates are internal targets.'
            : 'Las fechas de publicaciones oficiales son estimadas y pueden variar. Fuentes: INEI, BCRP. Fechas Qhawarina son objetivos internos.'}
        </p>
      </div>
    </div>
  );
}
