'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import FadeSection from './components/FadeSection';
import SourceFooter from './components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER,
  DEPT_STATS, VALIDATION, getLimaShare,
} from './components/ntlData';

const NAV_CARDS = [
  {
    href: '/observatorio/luces-nocturnas/mapa',
    label: 'Mapa interactivo',
    desc: 'Explora la luminosidad nocturna por departamento, 1992–2024',
    color: TEAL,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <path d="M9 20.5L3 17V3.5L9 7m0 13.5V7m0 13.5l6-3.5M9 7l6 3.5m0 9.5V10.5m0 0L21 7V20.5l-6 3"/>
      </svg>
    ),
  },
  {
    href: '/observatorio/luces-nocturnas/nowcasting',
    label: 'NTL como indicador',
    desc: 'Correlación entre luces y actividad económica: qué funciona y qué no',
    color: TERRACOTTA,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <path d="M3 12h4l3-9 4 18 3-9h4"/>
      </svg>
    ),
  },
  {
    href: '/observatorio/luces-nocturnas/tendencias',
    label: 'Tendencias',
    desc: '¿Qué regiones están creciendo? ¿Cuáles se estancan?',
    color: '#6366f1',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    href: '/observatorio/luces-nocturnas/metodologia',
    label: 'Metodología',
    desc: 'Cómo las luces nocturnas miden la economía, sus límites y fuentes de datos',
    color: '#6b7280',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
  },
];

// Simple animated bar chart showing 1992 vs 2024 for top 8 depts
const COMPARE_DEPTS = ['15','04','20','08','11','13','21','06'];
const DEPT_LABELS: Record<string,string> = {
  '15':'Lima','04':'Arequipa','20':'Piura','08':'Cusco',
  '11':'Ica','13':'La Libertad','21':'Puno','06':'Cajamarca',
};

export default function LucesNocturasPage() {
  const [animated, setAnimated] = useState(false);
  const limaShare = getLimaShare(2023);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Top growers (5yr within VIIRS era)
  const topGrowers = [...DEPT_STATS]
    .filter(d => d.growth5yr !== null)
    .sort((a, b) => (b.growth5yr ?? 0) - (a.growth5yr ?? 0))
    .slice(0, 3);

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16" style={{ zIndex: 1 }}>

      {/* Hero */}
      <section className="space-y-4 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">Observatorio / Luces Nocturnas</p>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
          La economía peruana<br className="hidden sm:block" /> vista desde el espacio
        </h1>
        <p className="text-stone-500 max-w-2xl text-lg">
          Los satélites fotografían la Tierra cada noche. Las luces artificiales revelan
          dónde hay actividad económica antes que cualquier estadística oficial.
        </p>

        {/* Validation alert */}
        <div
          className="inline-flex items-start gap-3 rounded-xl px-4 py-3 text-sm max-w-2xl"
          style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
        >
          <span className="text-amber-600 mt-0.5 flex-shrink-0">⚠</span>
          <span className="text-amber-800">
            <strong>Resultado de validación:</strong> Las luces nocturnas NO predicen bien el PBI departamental
            en Perú (R²=0.16 niveles, R²=0.01 variación interna). Sirven como explorador descriptivo,
            no para nowcasting. Ver Metodología para detalles.
          </span>
        </div>
      </section>

      {/* Three stat cards */}
      <FadeSection className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { value: '1992–2024', label: '32 años de datos satelitales', sub: 'DMSP (1992-2013) + VIIRS (2014-2024)' },
          { value: '1,891', label: 'distritos', sub: 'Cobertura completa del territorio' },
          { value: 'Mensual', label: 'datos VIIRS disponibles', sub: 'Última actualización: Feb 2026' },
        ].map(card => (
          <div
            key={card.label}
            className="rounded-2xl p-6 space-y-1"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div className="text-3xl font-black text-stone-900">{card.value}</div>
            <div className="text-sm font-semibold text-stone-700">{card.label}</div>
            <div className="text-xs text-stone-400">{card.sub}</div>
          </div>
        ))}
      </FadeSection>

      {/* 1992 vs 2023 comparison bars */}
      <FadeSection className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-stone-900">32 años de crecimiento</h2>
          <p className="text-sm text-stone-500 mt-1">NTL por departamento: 1992 vs 2023 (escala relativa, excluyendo Lima)</p>
        </div>
        <div
          className="rounded-2xl p-6 space-y-3"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {COMPARE_DEPTS.filter(c => c !== '15').map(code => {
            const stat = DEPT_STATS.find(d => d.code === code);
            if (!stat) return null;
            const max1992 = Math.max(...COMPARE_DEPTS.filter(c=>c!=='15').map(c => {
              const s = DEPT_STATS.find(d=>d.code===c);
              const { DEPT_NTL } = require('./components/ntlData');
              return DEPT_NTL?.[c]?.['1992'] ?? 0;
            }));
            return null; // simplified below
          })}
          {/* Static version without dynamic require */}
          {[
            { code:'04', name:'Arequipa',   v92:98982,  v23:99837  },
            { code:'20', name:'Piura',      v92:106898, v23:179499 },
            { code:'08', name:'Cusco',      v92:79918,  v23:154285 },
            { code:'11', name:'Ica',        v92:71283,  v23:115386 },
            { code:'13', name:'La Libertad',v92:72042,  v23:131681 },
            { code:'06', name:'Cajamarca',  v92:18472,  v23:68231  },
            { code:'22', name:'San Martín', v92:6840,   v23:73680  },
            { code:'21', name:'Puno',       v92:24773,  v23:72032  },
          ].map(({ code, name, v92, v23 }) => {
            const maxVal = 250000;
            const w92 = Math.round(v92 / maxVal * 100);
            const w23 = Math.round(v23 / maxVal * 100);
            const growth = Math.round((v23 / v92 - 1) * 100);
            return (
              <div key={code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-700 w-28">{name}</span>
                  <span className="font-bold" style={{ color: growth > 100 ? TEAL : TERRACOTTA }}>
                    +{growth}%
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-300 w-8">1992</span>
                    <div className="flex-1 h-2 rounded bg-stone-100">
                      <div
                        className="h-full rounded transition-all duration-700"
                        style={{ width: animated ? `${w92}%` : '0%', background: '#94a3b8', opacity: 0.7 }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-300 w-8">2023</span>
                    <div className="flex-1 h-2 rounded bg-stone-100">
                      <div
                        className="h-full rounded transition-all duration-700"
                        style={{ width: animated ? `${w23}%` : '0%', background: TEAL, transitionDelay: '0.1s' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-stone-400 pt-2">Lima excluida (concentra {limaShare}% del total nacional y distorsionaría la escala)</p>
        </div>
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* Nav cards */}
      <FadeSection className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Explorar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NAV_CARDS.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl p-6 space-y-3 block transition-all hover:-translate-y-0.5"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div style={{ color: card.color }}>{card.icon}</div>
              <div className="font-bold text-stone-800">{card.label}</div>
              <p className="text-sm text-stone-500">{card.desc}</p>
              <div className="text-sm font-semibold" style={{ color: card.color }}>
                Explorar →
              </div>
            </Link>
          ))}
        </div>
      </FadeSection>

      {/* Quick insight */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-3"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h3 className="font-bold text-stone-900">Hallazgos rápidos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-2xl font-black" style={{ color: TEAL }}>
                +{topGrowers[0]?.growth5yr}%
              </div>
              <div className="font-semibold text-stone-700">{topGrowers[0]?.name}</div>
              <p className="text-xs text-stone-400">Mayor crecimiento de NTL 2018→2023</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black" style={{ color: TERRACOTTA }}>
                {limaShare}%
              </div>
              <div className="font-semibold text-stone-700">Lima</div>
              <p className="text-xs text-stone-400">Concentra el {limaShare}% de la luminosidad nacional (2023)</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-stone-900">
                {VALIDATION.r2_levels.toFixed(2)}
              </div>
              <div className="font-semibold text-stone-700">R² niveles</div>
              <p className="text-xs text-stone-400">Correlación NTL-electricidad — más débil de lo esperado</p>
            </div>
          </div>
        </div>
      </FadeSection>

      <SourceFooter />
    </div>
  );
}
