'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER,
  DEPT_NAMES, DEPT_NTL, DEPT_STATS, growthColor, TIMELINE_EVENTS,
} from '../components/ntlData';

const PALETTE = [
  TEAL, TERRACOTTA, '#6366f1', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7', '#84cc16',
];

const VIIRS_START = 2014;

export default function TendenciasPage() {
  const [era, setEra] = useState<'viirs' | 'all'>('viirs');
  const [selected, setSelected] = useState<string[]>(['15','04','08']);
  const [sortBy, setSortBy] = useState<'growth5yr' | 'growth30yr'>('growth5yr');

  const years = era === 'viirs'
    ? Array.from({ length: 11 }, (_, i) => 2014 + i)
    : Array.from({ length: 33 }, (_, i) => 1992 + i);

  // Build chart data
  const chartData = useMemo(() => {
    return years.map(year => {
      const row: Record<string, number | string> = { year: String(year) };
      for (const code of selected) {
        row[code] = DEPT_NTL[code]?.[String(year)] ?? 0;
      }
      // national total
      row['total'] = Object.values(DEPT_NTL).reduce((sum, s) => sum + (s[String(year)] ?? 0), 0);
      return row;
    });
  }, [years, selected]);

  // Growth ranking
  const ranked = useMemo(() => {
    return [...DEPT_STATS]
      .filter(d => d[sortBy] !== null)
      .sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));
  }, [sortBy]);

  const toggleDept = (code: string) => {
    setSelected(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : prev.length < 4 ? [...prev, code] : prev
    );
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16" style={{ zIndex: 1 }}>

      {/* Header */}
      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">Luces Nocturnas / Tendencias</p>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
          ¿Quién crece, quién se estanca?
        </h1>
        <p className="text-stone-500 max-w-2xl">
          Tendencias de luminosidad nocturna por departamento. Selecciona hasta 4 para comparar.
        </p>
      </section>

      {/* Line chart */}
      <FadeSection className="space-y-5">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setEra('viirs')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: era === 'viirs' ? TEAL : CARD_BG, color: era === 'viirs' ? 'white' : '#78716c', border: `1px solid ${CARD_BORDER}` }}
            >
              VIIRS 2014–2024
            </button>
            <button
              onClick={() => setEra('all')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: era === 'all' ? TEAL : CARD_BG, color: era === 'all' ? 'white' : '#78716c', border: `1px solid ${CARD_BORDER}` }}
            >
              Serie completa 1992–2024
            </button>
          </div>
          {era === 'all' && (
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#fffbeb', color: '#92400e' }}>
              ⚠ Incluye transición DMSP→VIIRS (2013–2014)
            </span>
          )}
        </div>

        {/* Department selector */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(DEPT_NAMES).map(([code, name]) => {
            const isSelected = selected.includes(code);
            const colorIdx = selected.indexOf(code);
            return (
              <button
                key={code}
                onClick={() => toggleDept(code)}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: isSelected ? PALETTE[colorIdx] : CARD_BG,
                  color: isSelected ? 'white' : '#78716c',
                  border: `1px solid ${isSelected ? PALETTE[colorIdx] : CARD_BORDER}`,
                }}
              >
                {name}
              </button>
            );
          })}
        </div>

        <div
          className="rounded-2xl p-4 sm:p-6"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                tickLine={false}
                interval={era === 'viirs' ? 1 : 3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip
                contentStyle={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, fontSize: 12 }}
                labelFormatter={(label) => `Año ${label}`}
              />
              {era === 'all' && (
                <ReferenceLine x="2013" stroke={TERRACOTTA} strokeDasharray="4 2" label={{ value: '⚠ sensor', fontSize: 9, fill: TERRACOTTA }} />
              )}
              {TIMELINE_EVENTS.filter(e => e.year >= (era === 'viirs' ? 2014 : 1992)).map(ev => (
                <ReferenceLine key={ev.year} x={String(ev.year)} stroke="#e7e5e4" strokeDasharray="2 2"/>
              ))}
              {selected.map((code, i) => (
                <Line
                  key={code}
                  type="monotone"
                  dataKey={code}
                  stroke={PALETTE[i]}
                  strokeWidth={2}
                  dot={false}
                  name={code}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Event annotations */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {TIMELINE_EVENTS.filter(e => e.year >= (era === 'viirs' ? 2014 : 1992)).map(ev => (
              <span key={ev.year} className="text-xs text-stone-400">
                <strong>{ev.year}:</strong> {ev.label}
              </span>
            ))}
          </div>
        </div>
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* Growth ranking */}
      <FadeSection className="space-y-5">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">Ranking de crecimiento</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('growth5yr')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: sortBy === 'growth5yr' ? TEAL : CARD_BG, color: sortBy === 'growth5yr' ? 'white' : '#78716c', border: `1px solid ${CARD_BORDER}` }}
            >
              5 años (2018→2023)
            </button>
            <button
              onClick={() => setSortBy('growth30yr')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: sortBy === 'growth30yr' ? TEAL : CARD_BG, color: sortBy === 'growth30yr' ? 'white' : '#78716c', border: `1px solid ${CARD_BORDER}` }}
            >
              30 años (1992→2023)
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {ranked.map((d, i) => {
            const val = d[sortBy] ?? 0;
            const maxVal = ranked[0]?.[sortBy] ?? 1;
            const barW = Math.max(2, Math.round(Math.abs(val) / Math.abs(maxVal ?? 1) * 100));
            return (
              <div
                key={d.code}
                className="flex items-center px-4 py-2.5 gap-3"
                style={{ borderBottom: i < ranked.length - 1 ? `1px solid ${CARD_BORDER}` : undefined }}
              >
                <span className="text-xs text-stone-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                <span className="text-sm font-medium text-stone-700 w-28 flex-shrink-0 truncate">{d.name}</span>
                <div className="flex-1 h-4 rounded bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{ width: `${barW}%`, background: growthColor(val) }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums w-14 text-right flex-shrink-0" style={{ color: growthColor(val) }}>
                  {val > 0 ? '+' : ''}{val}%
                </span>
              </div>
            );
          })}
        </div>

        {sortBy === 'growth30yr' && (
          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
            ⚠ Crecimiento 30 años mezcla sensores DMSP (pre-2014) y VIIRS (post-2014). Interpretar con cautela.
            Lima muestra caída negativa por corrección de saturación DMSP, no por caída económica real.
          </div>
        )}
      </FadeSection>

      {/* Insight boxes */}
      <FadeSection className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          {
            title: 'Amazonas: mayor crecimiento 5 años',
            body: 'La región amazónica muestra el mayor crecimiento de NTL 2018-2023 (+394%), impulsado por electrificación rural y expansión de centros urbanos como Chachapoyas y Bagua Grande.',
            color: TEAL,
          },
          {
            title: 'COVID-19 visible desde el espacio',
            body: 'En 2020, todos los departamentos muestran una caída o estancamiento en NTL. Los departamentos más urbanos (Lima, Arequipa, Piura) registraron la caída más pronunciada en abril-mayo 2020.',
            color: TERRACOTTA,
          },
        ].map(box => (
          <div
            key={box.title}
            className="rounded-2xl p-6 space-y-3"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <div className="font-bold text-stone-900">{box.title}</div>
            <p className="text-sm text-stone-600 leading-relaxed">{box.body}</p>
          </div>
        ))}
      </FadeSection>

      {/* Next */}
      <div className="flex justify-end pt-4">
        <Link
          href="/observatorio/luces-nocturnas/nowcasting"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: TERRACOTTA, color: 'white' }}
        >
          Ver validación →
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
