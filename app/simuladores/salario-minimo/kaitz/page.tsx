'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER,
  DEPTS_KAITZ, kaitzMap, kaitzColor, GEO_URL,
  type DeptKaitz,
} from '../components/mwData';

export default function KaitzPage() {
  const [hoveredDept, setHoveredDept] = useState<DeptKaitz | null>(null);

  return (
    <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16" style={{ zIndex: 1 }}>

      {/* Header */}
      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">Salario Mínimo / Kaitz</p>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
          ¿Dónde muerde más el salario mínimo?
        </h1>
        <p className="text-stone-500 max-w-2xl">
          Índice de Kaitz = SM / mediana salarial formal por departamento.
          Verde = bajo riesgo · Rojo = alto riesgo.
        </p>
      </section>

      {/* ── MAP + RANKING ──────────────────────────────────────────────────────── */}
      <FadeSection className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Map */}
          <div
            className="lg:col-span-2 hidden sm:block rounded-2xl overflow-hidden relative"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            {/* Hover tooltip */}
            {hoveredDept && (
              <div
                className="absolute top-4 left-4 z-20 rounded-xl px-4 py-3 pointer-events-none"
                style={{
                  background: CARD_BG,
                  border: `1px solid ${CARD_BORDER}`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  maxWidth: 220,
                }}
              >
                <div className="font-bold text-stone-800 text-sm">{hoveredDept.name}</div>
                <div className="text-3xl font-black mt-0.5 tabular-nums" style={{ color: kaitzColor(hoveredDept.kaitz) }}>
                  {hoveredDept.kaitz.toFixed(2)}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  SM = {(hoveredDept.kaitz * 100).toFixed(0)}% del salario mediano
                </div>
                {hoveredDept.note && (
                  <div className="text-xs text-amber-700 rounded-lg px-2 py-1.5 mt-2" style={{ background: '#fffbeb' }}>
                    {hoveredDept.note}
                  </div>
                )}
              </div>
            )}

            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [-75.5, -10], scale: 1600 }}
              style={{ width: '100%', height: 'auto' }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }: { geographies: unknown[] }) =>
                  (geographies as { rsmKey: string; properties?: Record<string, unknown> }[]).map(geo => {
                    const rawCode = geo.properties?.FIRST_IDDP;
                    const code    = rawCode ? String(rawCode).padStart(2, '0') : null;
                    const dept    = code ? kaitzMap[code] : null;
                    const fill    = dept ? kaitzColor(dept.kaitz) : '#e7e4e0';
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke="white"
                        strokeWidth={0.7}
                        style={{
                          default:  { fill, outline: 'none', cursor: 'pointer' },
                          hover:    { fill, opacity: 0.72, outline: 'none', cursor: 'pointer' },
                          pressed:  { fill, outline: 'none' },
                        }}
                        onMouseEnter={() => dept && setHoveredDept(dept)}
                        onMouseLeave={() => setHoveredDept(null)}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>

            {/* Gradient legend */}
            <div className="px-5 pb-4 pt-1">
              <div className="h-3 rounded-full" style={{
                background: 'linear-gradient(to right,#52c288,#86efac,#fbbf24,#f97316,#ef4444,#b91c1c)',
              }}/>
              <div className="flex justify-between text-xs text-stone-300 mt-1.5">
                <span>0.45 — Bajo</span><span>0.55</span><span>0.65</span><span>0.75+ — Alto</span>
              </div>
            </div>
          </div>

          {/* Rankings */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-stone-500 mb-3">Más expuestos al SM</div>
            {[...DEPTS_KAITZ].sort((a, b) => b.kaitz - a.kaitz).slice(0, 10).map(d => (
              <div
                key={d.code}
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: kaitzColor(d.kaitz) }}
                >
                  {(d.kaitz * 100).toFixed(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-stone-700 text-sm truncate">{d.name}</div>
                  {d.note && (
                    <div className="text-xs text-amber-600 leading-tight mt-0.5 truncate">
                      {d.note.split(':')[0]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile fallback: full list */}
        <div className="sm:hidden space-y-2">
          <div className="text-sm font-semibold text-stone-500 mb-3">Kaitz por departamento</div>
          {[...DEPTS_KAITZ].sort((a, b) => b.kaitz - a.kaitz).map(d => (
            <div
              key={d.code}
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: kaitzColor(d.kaitz) }}
              >
                {(d.kaitz * 100).toFixed(0)}
              </div>
              <div className="font-semibold text-stone-700 text-sm">{d.name}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-stone-400">
          Ica: agro-exportadores con salarios mensuales bajos pese a jornada completa —
          el sector más expuesto al SM en Perú.
        </p>
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* ── WHAT KAITZ MEANS ──────────────────────────────────────────────────── */}
      <FadeSection className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-bold text-stone-900">¿Qué significa el Kaitz?</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Un Kaitz de <strong>0.57</strong> significa que el salario mínimo es el 57% del salario
            mediano formal. Cuando está por debajo de 0.50, el SM no es vinculante para la mayoría.
            Por encima de 0.65, la evidencia internacional sugiere mayor riesgo de desempleo.
          </p>
          <div className="space-y-2 text-sm">
            {[
              { range: '&lt; 0.50', label: 'SM no vinculante para la mayoría', color: '#52c288' },
              { range: '0.50–0.57', label: 'Rango estudiado en este análisis', color: '#fbbf24' },
              { range: '0.57–0.65', label: 'Sin evidencia propia — extrapolación', color: '#f97316' },
              { range: '&gt; 0.65',  label: 'Mayor riesgo según literatura internacional', color: '#ef4444' },
            ].map(z => (
              <div key={z.range} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: z.color }}/>
                <span className="font-mono text-xs text-stone-500 w-20 flex-shrink-0"
                  dangerouslySetInnerHTML={{ __html: z.range }}/>
                <span className="text-stone-600">{z.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <h3 className="font-bold text-stone-900">Kaitz nacional 2016–2022</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            El índice de Kaitz nacional se mantuvo estable entre <strong>0.52 y 0.57</strong> durante
            el período estudiado, a pesar de tres aumentos del SM. Esto ocurre porque los salarios
            formales también crecieron al mismo ritmo que el SM.
          </p>
          <div className="space-y-1.5">
            {[
              { year: '2016', sm: 850,  kaitz: 0.567 },
              { year: '2018', sm: 930,  kaitz: 0.556 },
              { year: '2022', sm: 1025, kaitz: 0.569 },
              { year: '2025', sm: 1130, kaitz: 0.607 },
            ].map(r => (
              <div key={r.year} className="flex items-center gap-3">
                <span className="text-xs text-stone-400 w-8">{r.year}</span>
                <div className="flex-1 h-5 rounded bg-stone-100 overflow-hidden relative">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${(r.kaitz / 0.7) * 100}%`,
                      background: kaitzColor(r.kaitz),
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums w-10" style={{ color: kaitzColor(r.kaitz) }}>
                  {(r.kaitz * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-stone-300">S/{r.sm}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400">
            El aumento a S/1,130 en 2025 eleva el Kaitz a ~0.61 — por primera vez fuera del
            rango histórico estudiado.
          </p>
        </div>
      </FadeSection>

      {/* Caveat */}
      <FadeSection>
        <div
          className="rounded-2xl px-6 py-5 space-y-2"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
        >
          <div className="font-semibold text-stone-700 text-sm">Nota sobre Ica</div>
          <p className="text-xs text-stone-500 leading-relaxed">
            El Kaitz de Ica (0.93) refleja la estructura del sector agro-exportador: contratos
            temporales con salarios diarios o semanales bajos que, anualizados/mensualmente,
            quedan cerca del SM. No indica que el 93% de los trabajadores gane el SM.
          </p>
        </div>
      </FadeSection>

      {/* Next section */}
      <div className="flex justify-end pt-4">
        <Link
          href="/simuladores/salario-minimo/simulador"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: TEAL, color: 'white' }}
        >
          Siguiente: Simulador →
        </Link>
      </div>

      <SourceFooter />
    </main>
  );
}
