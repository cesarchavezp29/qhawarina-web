'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import FadeSection from './components/FadeSection';
import SourceFooter from './components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER, EVENTS,
} from './components/mwData';
import CiteButton from '../../components/CiteButton';
import ShareButton from '../../components/ShareButton';

const BASE = '/simuladores/salario-minimo';

const NAV_CARDS = [
  {
    href: `${BASE}/distribucion`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="16" width="6" height="10" rx="1" fill={TERRACOTTA} opacity="0.7"/>
        <rect x="11" y="10" width="6" height="16" rx="1" fill={TERRACOTTA} opacity="0.85"/>
        <rect x="20" y="5"  width="6" height="21" rx="1" fill={TERRACOTTA}/>
      </svg>
    ),
    title: 'Distribución salarial',
    desc: 'Cómo se mueve la distribución de salarios formales con cada aumento',
    color: TERRACOTTA,
  },
  {
    href: `${BASE}/evidencia`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="12" cy="12" r="8" stroke={TERRACOTTA} strokeWidth="2.5" fill="none"/>
        <line x1="18" y1="18" x2="26" y2="26" stroke={TERRACOTTA} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="8" y1="12" x2="16" y2="12" stroke={TERRACOTTA} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <line x1="12" y1="8" x2="12" y2="16" stroke={TERRACOTTA} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
    title: 'Evidencia',
    desc: '¿Cuántos empleos desaparecen? ¿Cuántos reaparecen? ¿A dónde van?',
    color: TERRACOTTA,
  },
  {
    href: `${BASE}/kaitz`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3 L24 8 L22 22 L14 26 L6 22 L4 8 Z" stroke={TEAL} strokeWidth="2" fill={TEAL} opacity="0.15"/>
        <path d="M14 3 L24 8 L22 22 L14 26 L6 22 L4 8 Z" stroke={TEAL} strokeWidth="2" fill="none"/>
        <circle cx="14" cy="14" r="2.5" fill={TEAL}/>
      </svg>
    ),
    title: 'Mapa regional',
    desc: '¿Dónde muerde más el salario mínimo? Índice de Kaitz por departamento',
    color: TEAL,
  },
  {
    href: `${BASE}/simulador`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <line x1="4" y1="14" x2="24" y2="14" stroke="#d6d3d1" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="16" cy="14" r="4" fill={TERRACOTTA}/>
        <line x1="4" y1="8"  x2="24" y2="8"  stroke="#d6d3d1" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <circle cx="10" cy="8"  r="3" fill="#d6d3d1"/>
        <line x1="4" y1="20" x2="24" y2="20" stroke="#d6d3d1" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <circle cx="20" cy="20" r="3" fill={TEAL}/>
      </svg>
    ),
    title: 'Simulador',
    desc: '¿Qué pasaría si el SM sube a S/1,200? S/1,300? Escenarios basados en datos',
    color: TERRACOTTA,
  },
  {
    href: `${BASE}/metodologia`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="2" width="18" height="24" rx="2" stroke="#94a3b8" strokeWidth="2" fill="none"/>
        <line x1="9" y1="9"  x2="19" y2="9"  stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9" y1="13" x2="19" y2="13" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9" y1="17" x2="15" y2="17" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Metodología',
    desc: 'Cómo lo medimos. Qué funciona y qué no. Datos y limitaciones',
    color: '#6b7280',
  },
];

export default function SalarioMinimoLanding() {
  const isEn = useLocale() === 'en';
  const [heroBars, setHeroBars] = useState([0, 0, 0]);

  useEffect(() => {
    const ratios = [0.696, 0.829, 0.830];
    const timers = ratios.map((r, i) =>
      setTimeout(() => setHeroBars(prev => {
        const n = [...prev]; n[i] = r; return n;
      }), (i + 1) * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20" style={{ zIndex: 1 }}>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-8 pt-4">
        <div
          className="inline-block rounded-full px-4 py-1.5 text-xs font-medium text-stone-500 tracking-wide"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {isEn ? 'Distributional analysis · ENAHO 2015–2023 · INEI Peru' : 'Análisis distribucional · ENAHO 2015–2023 · INEI Perú'}
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 leading-tight tracking-tight">
            {isEn
              ? <>What happens when<br className="hidden sm:block"/> the minimum wage rises?</>
              : <>¿Qué pasa cuando sube<br className="hidden sm:block"/> el salario mínimo?</>}
          </h1>
          <p className="text-xl sm:text-2xl text-stone-500 font-light max-w-2xl mx-auto">
            {isEn
              ? 'Peru raised the MW three times between 2016 and 2022. We analyze what happened to wages and employment.'
              : 'Perú aumentó el SM tres veces entre 2016 y 2022. Analizamos qué pasó con los salarios y el empleo.'}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            <CiteButton indicator={isEn ? 'Minimum Wage Simulator' : 'Simulador de Salario Mínimo'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Minimum Wage — Qhawarina' : 'Salario Mínimo — Qhawarina'}
              text={isEn
                ? '🔬 Minimum wage impact simulator for Peru | Qhawarina\nhttps://qhawarina.pe/simuladores/salario-minimo'
                : '🔬 Simulador del impacto del salario mínimo en Perú | Qhawarina\nhttps://qhawarina.pe/simuladores/salario-minimo'}
            />
          </div>
        </div>

        {/* Animated bars */}
        <div
          className="inline-flex flex-col items-center gap-5 rounded-3xl px-8 py-7 max-w-sm mx-auto"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <div className="text-sm font-semibold text-stone-500 tracking-wide">
            {isEn ? 'of displaced jobs that reappear' : 'de empleos desplazados que reaparecen'}
          </div>
          <div className="w-full space-y-2">
            {EVENTS.map((e, i) => (
              <div key={e.id} className="flex items-center gap-3">
                <div className="text-xs font-bold text-stone-400 w-8 text-right">{e.label}</div>
                <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{ background: '#f0ece6' }}>
                  <div
                    className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                    style={{
                      width: `${heroBars[i] * 100}%`,
                      background: `linear-gradient(90deg,${TERRACOTTA}cc,${TERRACOTTA})`,
                    }}
                  >
                    {heroBars[i] > 0.1 && (
                      <span className="text-white text-sm font-black">{Math.round(heroBars[i] * 100)}%</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-stone-400">
            {isEn ? '70–83% reappear · Verified with falsification test' : '70–83% reaparecen · Verificado con test de falsificación'}
          </div>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-stone-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: TEAL }}/>
          {isEn
            ? 'Based on ~10,000 formal workers per year · ENAHO Module 500 2015–2023'
            : 'Basado en ~10,000 trabajadores formales por año · ENAHO Módulo 500 2015–2023'}
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* ── TWO HEADLINE CARDS ────────────────────────────────────────────────── */}
      <FadeSection className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: redistribution */}
        <div className="rounded-3xl p-8 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="text-xs font-bold tracking-widest uppercase text-stone-400">
            {isEn ? 'Wage redistribution' : 'Redistribución salarial'}
          </div>
          <div className="text-7xl font-black leading-none" style={{ color: TERRACOTTA }}>70–83%</div>
          <p className="text-base font-medium text-stone-700 leading-snug">
            {isEn
              ? 'of displaced formal jobs reappear above the new wage floor'
              : 'de los empleos formales desplazados reaparecen por encima del nuevo piso salarial'}
          </p>
          <div className="h-24 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[{ ev: '2016', r: 0.696 }, { ev: '2018', r: 0.829 }, { ev: '2022', r: 0.830 }]}
                margin={{ top: 4, right: 4, bottom: 4, left: 4 }} barCategoryGap="28%"
              >
                <XAxis dataKey="ev" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false}/>
                <Tooltip
                  formatter={(v: unknown) => [`${(Number(v) * 100).toFixed(1)}%`, 'Ratio']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${CARD_BORDER}`, background: CARD_BG }}
                />
                <Bar dataKey="r" radius={[5, 5, 0, 0]} isAnimationActive={false}>
                  <Cell fill={TERRACOTTA} fillOpacity={0.6}/>
                  <Cell fill={TERRACOTTA} fillOpacity={0.75}/>
                  <Cell fill={TERRACOTTA} fillOpacity={0.9}/>
                </Bar>
                <ReferenceLine y={1} stroke="#e7e4e0" strokeDasharray="3 2"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            {isEn
              ? 'Falsification test: ratios 7× smaller at fictional thresholds · Replicated in EPE Lima (0.73–1.03)'
              : 'Test de falsificación: ratios 7× menores en umbrales ficticios · Replicado en EPE Lima (0.73–1.03)'}
          </p>
        </div>

        {/* Card: self-employment */}
        <div className="rounded-3xl p-8 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="text-xs font-bold tracking-widest uppercase text-stone-400">
            {isEn ? 'Informal self-employment' : 'Autoempleo informal'}
          </div>
          <div className="text-7xl font-black leading-none" style={{ color: TEAL }}>+15–21pp</div>
          <p className="text-base font-medium text-stone-700 leading-snug">
            {isEn
              ? 'self-employment in the affected wage zone — workers change status, they do not disappear'
              : 'de autoempleo en la zona salarial afectada — los trabajadores cambian de modalidad, no desaparecen'}
          </p>
          <div className="h-24 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { ev: '2016', pre: 38.0, post: 57.1 },
                  { ev: '2018', pre: 35.5, post: 55.5 },
                  { ev: '2022', pre: 33.1, post: 47.8 },
                ]}
                margin={{ top: 4, right: 4, bottom: 4, left: 4 }} barCategoryGap="20%"
              >
                <XAxis dataKey="ev" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false}/>
                <Tooltip
                  formatter={(v: unknown) => [`${v}%`, '']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${CARD_BORDER}`, background: CARD_BG }}
                />
                <Bar dataKey="pre"  name="Antes"    fill="#d6d3d1" radius={[4, 4, 0, 0]} isAnimationActive={false}/>
                <Bar dataKey="post" name="Después"  fill={TEAL} fillOpacity={0.85} radius={[4, 4, 0, 0]} isAnimationActive={false}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            {isEn
              ? 'Gray: % self-employed before · Teal: after · Affected zone [0.85×MW_old, MW_new)'
              : 'Gris: % autoempleados antes · Teal: después · Zona afectada [0.85×SM_ant, SM_nuevo)'}
          </p>
        </div>
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* ── NAVIGATION CARDS ──────────────────────────────────────────────────── */}
      <FadeSection className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-stone-900">
            {isEn ? 'Explore in detail' : 'Explora en detalle'}
          </h2>
          <p className="text-stone-500 text-sm">
            {isEn ? 'Five sections. Each one digs into a different angle.' : 'Cinco secciones. Cada una profundiza en un ángulo distinto.'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_CARDS.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl p-6 space-y-3 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: CARD_BG,
                border: `1px solid ${CARD_BORDER}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div>{card.icon}</div>
              <div>
                <div className="font-bold text-stone-800 group-hover:text-stone-900 transition-colors">
                  {card.title}
                </div>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">{card.desc}</p>
              </div>
              <div className="text-xs font-semibold flex items-center gap-1" style={{ color: card.color }}>
                {isEn ? 'View section' : 'Ver sección'} <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </FadeSection>

      {/* ── BADGE ─────────────────────────────────────────────────────────────── */}
      <div className="text-center">
        <span
          className="inline-block rounded-full px-5 py-2 text-xs font-medium text-stone-400 tracking-wide"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
        >
          ENAHO 2015–2023 · EPE Lima · ~10,000 {isEn ? 'formal workers/year' : 'trabajadores formales/año'}
        </span>
      </div>

      <SourceFooter />
    </div>
  );
}
