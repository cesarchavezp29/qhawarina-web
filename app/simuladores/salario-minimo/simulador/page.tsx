'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import { TERRACOTTA, TEAL, CARD_BG, CARD_BORDER, DEPTS_KAITZ } from '../components/mwData';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

// ── Simulator-specific helpers ─────────────────────────────────────────────────
const LIMA_FORMAL_POP = 1_700_000;
const MW_2022 = 1025;

const LIMA_PERC: [number, number][] = [
  [0,0],[158,1],[480,5],[800,10],[930,15],[1016,20],[1100,25],
  [1200,30],[1500,40],[1700,50],[2000,60],[2500,70],[2800,75],
  [3000,80],[3712,85],[4519,90],[6000,95],[11256,99],[999999,100],
];

function pctAtOrBelow(w: number) {
  for (let i = 1; i < LIMA_PERC.length; i++) {
    if (w <= LIMA_PERC[i][0]) {
      const f = (w - LIMA_PERC[i-1][0]) / (LIMA_PERC[i][0] - LIMA_PERC[i-1][0]);
      return LIMA_PERC[i-1][1] + f * (LIMA_PERC[i][1] - LIMA_PERC[i-1][1]);
    }
  }
  return 100;
}
function workersAffected(v: number) {
  return Math.max(0, (pctAtOrBelow(v) - pctAtOrBelow(MW_2022)) / 100 * LIMA_FORMAL_POP);
}
function sliderKaitz(v: number) { return v / 1863; }
function kaitzRisk(k: number, isEn: boolean): { label: string; color: string; bg: string; pulse: boolean } {
  if (k < 0.57) return { label: isEn ? 'Studied range'               : 'Rango estudiado',            color: '#16a34a', bg: '#f0fdf4', pulse: false };
  if (k < 0.62) return { label: isEn ? 'Outside studied range'       : 'Fuera del rango estudiado',  color: '#d97706', bg: '#fffbeb', pulse: false };
  if (k < 0.70) return { label: isEn ? 'No direct evidence'          : 'Sin evidencia directa',      color: '#dc2626', bg: '#fef2f2', pulse: true  };
  return              { label: isEn ? 'Uncharted territory'          : 'Territorio desconocido',       color: '#7f1d1d', bg: '#fef2f2', pulse: true  };
}
function deptsAbove(k: number) {
  return DEPTS_KAITZ.filter(d => d.kaitz * (k / 0.57) > 0.60).length;
}
const thermPos = (k: number) => Math.min(Math.max((k - 0.30) / (0.95 - 0.30) * 100, 0), 100);
const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');

// ── Animated number hook ───────────────────────────────────────────────────────
function useAnimatedNumber(target: number, ms = 350) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const s = prev.current, d = target - s;
    if (!d) return;
    const t0 = performance.now(); let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1), e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(s + d * e));
      if (p < 1) raf = requestAnimationFrame(tick); else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}

export default function SimuladorPage() {
  const isEn = useLocale() === 'en';
  const [sliderValue, setSliderValue] = useState(1130);

  const affected  = useMemo(() => workersAffected(sliderValue), [sliderValue]);
  const sliderK   = useMemo(() => sliderKaitz(sliderValue),     [sliderValue]);
  const risk      = useMemo(() => kaitzRisk(sliderK, isEn),     [sliderK, isEn]);
  const animAff   = useAnimatedNumber(Math.round(affected));
  const animK     = useAnimatedNumber(Math.round(sliderK * 100));
  const animDepts = useAnimatedNumber(deptsAbove(sliderK));

  const SCENARIOS = [
    { label: '2016',                                    sm: 850,  kaitz: 0.567 },
    { label: '2018',                                    sm: 930,  kaitz: 0.556 },
    { label: '2022',                                    sm: 1025, kaitz: 0.569 },
    { label: isEn ? 'Current 2025' : 'Actual 2025',    sm: 1130, kaitz: 0.607 },
    { label: 'S/1,200',                                 sm: 1200, kaitz: 0.644 },
    { label: 'S/1,300',                                 sm: 1300, kaitz: 0.698 },
  ];

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16" style={{ zIndex: 1 }}>

      {/* Header */}
      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">
          {isEn ? 'Minimum Wage / Simulator' : 'Salario Mínimo / Simulador'}
        </p>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn ? 'Simulate a new increase' : 'Simula un nuevo aumento'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Minimum wage exposure simulator for Peru (EPE Lima 2023 wage distribution, Kaitz index)'
                : 'Simulador de exposición al salario mínimo en Perú (distribución salarial EPE Lima 2023, índice Kaitz)'}
              isEn={isEn}
            />
            <ShareButton
              title={isEn ? 'Minimum wage simulator — Qhawarina' : 'Simulador de salario mínimo — Qhawarina'}
              text={isEn
                ? 'What would happen if the minimum wage rises further? Simulate the impact on workers and the Kaitz index. https://qhawarina.pe/simuladores/salario-minimo/simulador'
                : '¿Qué pasaría si el salario mínimo sube más? Simula el impacto en trabajadores y el índice de Kaitz. https://qhawarina.pe/simuladores/salario-minimo/simulador'}
            />
          </div>
        </div>
        <p className="text-stone-500 max-w-2xl">
          {isEn ? 'What would happen if the minimum wage rises further?' : '¿Qué pasaría si el SM sube más?'}
        </p>
        <div
          className="inline-block rounded-xl px-4 py-2 text-xs font-medium text-stone-600"
          style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
        >
          {isEn
            ? 'Descriptive scenarios based on the observed wage distribution. Not causal predictions.'
            : 'Escenarios descriptivos basados en la distribución salarial observada. No predicciones causales.'}
        </div>
      </section>

      {/* ── SLIDER + DASHBOARD ────────────────────────────────────────────────── */}
      <FadeSection className="space-y-6">
        <div
          className="rounded-3xl p-6 sm:p-8 space-y-8"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          {/* Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-stone-400">S/1,025 ({isEn ? 'MW 2022' : 'SM 2022'})</span>
              <span className="text-2xl font-black text-stone-800 tabular-nums">
                S/{sliderValue.toLocaleString('es-PE')}
              </span>
              <span className="text-xs text-stone-400">S/1,500</span>
            </div>
            <div className="relative">
              <input
                type="range" min={1025} max={1500} step={5} value={sliderValue}
                onChange={e => setSliderValue(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{
                  accentColor: TERRACOTTA,
                  height: '6px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  borderRadius: '999px',
                  background: `linear-gradient(to right,${TERRACOTTA} ${(sliderValue - 1025) / (1500 - 1025) * 100}%,#e7e4e0 ${(sliderValue - 1025) / (1500 - 1025) * 100}%)`,
                }}
              />
              {/* Tick marks */}
              <div className="flex justify-between mt-1.5 px-0">
                {[
                  { v: 1025, l: '2022' },
                  { v: 1130, l: isEn ? 'Current' : 'Vigente' },
                  { v: 1200, l: 'S/1,200' },
                  { v: 1300, l: 'S/1,300' },
                  { v: 1500, l: 'S/1,500' },
                ].map(t => (
                  <button
                    key={t.v}
                    onClick={() => setSliderValue(t.v)}
                    className="flex flex-col items-center gap-0.5 cursor-pointer"
                  >
                    <span className="w-px h-2 block" style={{ background: sliderValue === t.v ? TERRACOTTA : '#d6d3d1' }}/>
                    <span className="text-[10px] font-medium" style={{ color: sliderValue === t.v ? TERRACOTTA : '#a8a29e' }}>
                      {t.l}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dashboard cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Workers */}
            <div
              className="rounded-2xl p-5 text-center space-y-1"
              style={{ background: risk.bg, border: `1px solid ${risk.color}22` }}
            >
              <div className="text-4xl font-black tabular-nums" style={{ color: TERRACOTTA }}>
                {fmt(animAff)}
              </div>
              <div className="text-sm font-medium text-stone-600">
                {isEn ? 'additional workers' : 'trabajadores adicionales'}
              </div>
              <div className="text-xs text-stone-400">
                {isEn ? 'vs. MW 2022 · Metro Lima' : 'vs. SM 2022 · Lima Metro'}
              </div>
            </div>

            {/* Kaitz gauge */}
            <div
              className="rounded-2xl p-5 text-center space-y-2"
              style={{
                background: risk.bg,
                border: `1px solid ${risk.color}22`,
                boxShadow: risk.pulse ? `0 0 0 4px ${risk.color}22,0 0 0 8px ${risk.color}11` : undefined,
                transition: 'box-shadow 0.4s ease',
              }}
            >
              <div className="text-sm font-medium text-stone-600">
                {isEn ? 'Kaitz Index' : 'Índice de Kaitz'}
              </div>
              <div className="flex justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e7e4e0" strokeWidth="10"/>
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke={risk.color} strokeWidth="10"
                    strokeDasharray={`${Math.min(sliderK / 0.95, 1) * 251.3} 251.3`}
                    strokeDashoffset="62.8" strokeLinecap="round" transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 0.35s ease' }}
                  />
                  <text x="50" y="45" textAnchor="middle" fontSize="20" fontWeight="900" fill={risk.color}
                    style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {animK}%
                  </text>
                  <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#a8a29e">Kaitz</text>
                </svg>
              </div>
              <div className="text-xs font-bold" style={{ color: risk.color }}>{risk.label}</div>
            </div>

            {/* Departments */}
            <div
              className="rounded-2xl p-5 text-center space-y-1"
              style={{ background: risk.bg, border: `1px solid ${risk.color}22` }}
            >
              <div className="text-4xl font-black tabular-nums" style={{ color: risk.color }}>
                {animDepts}
              </div>
              <div className="text-sm font-medium text-stone-600">
                {isEn
                  ? 'of 25 departments in risk zone (Kaitz >0.60)'
                  : 'de 25 departamentos en zona de riesgo (Kaitz >0.60)'}
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed rounded-xl px-4 py-3"
            style={{ background: 'rgba(0,0,0,0.025)' }}>
            {isEn
              ? `Affected workers are those earning between S/${MW_2022.toLocaleString()} and S/${sliderValue.toLocaleString()}. Distribution: EPE Lima 2023. The simulator measures mechanical exposure, not the causal effect of the MW.`
              : `Los trabajadores afectados son quienes ganan entre S/${MW_2022.toLocaleString()} y S/${sliderValue.toLocaleString()}. Distribución: EPE Lima 2023. El simulador mide exposición mecánica, no predice el efecto causal del SM.`}
          </p>
        </div>
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* ── THERMOMETER ───────────────────────────────────────────────────────── */}
      <FadeSection className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            {isEn ? 'How far does our evidence reach?' : '¿Hasta dónde llegan nuestros datos?'}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {isEn
              ? 'The Kaitz index as a risk thermometer — synchronized with the simulator'
              : 'El índice de Kaitz como termómetro de riesgo — sincronizado con el simulador'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thermometer */}
          <div
            className="rounded-3xl p-7 space-y-6"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="space-y-1">
              {/* Label above marker */}
              <div className="relative h-6">
                <div
                  className="absolute transition-all duration-200 whitespace-nowrap text-xs font-black"
                  style={{
                    left: `calc(${thermPos(sliderK)}% - 8px)`,
                    top: '-16px',
                    color: risk.color,
                    transform: thermPos(sliderK) > 80 ? 'translateX(-80%)' : thermPos(sliderK) < 20 ? 'none' : 'translateX(-40%)',
                  }}
                >
                  S/{sliderValue.toLocaleString()}
                </div>
                {/* Triangle marker */}
                <div
                  className="absolute transition-all duration-200"
                  style={{ left: `calc(${thermPos(sliderK)}% - 8px)` }}
                >
                  <div className="w-0 h-0" style={{
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: `12px solid ${risk.color}`,
                  }}/>
                </div>
              </div>

              {/* Gradient bar */}
              <div
                className="h-10 rounded-2xl overflow-hidden relative"
                style={{
                  background: 'linear-gradient(to right,#52c288,#86efac,#fbbf24,#f97316,#ef4444,#b91c1c)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {/* Studied zone overlay */}
                <div
                  className="absolute top-0 h-full"
                  style={{
                    left: 0,
                    width: `${thermPos(0.57)}%`,
                    background: 'rgba(255,255,255,0.15)',
                    borderRight: '2px dashed rgba(255,255,255,0.6)',
                  }}
                />
              </div>

              {/* Scale labels */}
              <div className="flex justify-between text-xs text-stone-300 px-0.5">
                <span>0.30</span><span>0.45</span><span>0.57</span><span>0.70</span><span>0.95</span>
              </div>
            </div>

            {/* Zone labels */}
            <div className="relative h-12">
              <div className="absolute text-center" style={{ left: 0, width: `${thermPos(0.57)}%`, fontSize: 11 }}>
                <div className="font-semibold text-green-700">
                  {isEn ? 'Direct evidence' : 'Evidencia directa'}
                </div>
                <div className="text-green-500 text-[10px]">Kaitz &lt; 0.57</div>
              </div>
              <div className="absolute text-center" style={{ left: `${thermPos(0.57)}%`, width: `${thermPos(0.65) - thermPos(0.57)}%`, fontSize: 11 }}>
                <div className="font-semibold text-amber-700">
                  {isEn ? 'No own data' : 'Sin datos propios'}
                </div>
                <div className="text-amber-500 text-[10px]">0.57–0.65</div>
              </div>
              <div className="absolute text-center" style={{ left: `${thermPos(0.65)}%`, right: 0, fontSize: 11 }}>
                <div className="font-semibold text-red-700">
                  {isEn ? 'Unexplored territory' : 'Territorio inexplorado'}
                </div>
                <div className="text-red-400 text-[10px]">Kaitz &gt; 0.65</div>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              {isEn
                ? 'The marker moves with the simulator. Drag the slider to see how the proposed MW moves away from the studied evidence zone (2016–2022).'
                : 'El marcador se mueve con el simulador. Arrastra el slider para ver cómo el SM propuesto se aleja de la zona de evidencia estudiada (2016–2022).'}
            </p>
          </div>

          {/* Scenarios table */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${CARD_BORDER}`, background: 'rgba(0,0,0,0.025)' }}>
                  <th className="text-left px-5 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">
                    {isEn ? 'Scenario' : 'Escenario'}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">
                    {isEn ? 'MW' : 'SM'}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">Kaitz</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">
                    {isEn ? 'Zone' : 'Zona'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {SCENARIOS.map(s => {
                  const r = kaitzRisk(s.kaitz, isEn);
                  return (
                    <tr key={s.label} style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                      <td className="px-5 py-3.5 font-medium text-stone-700">{s.label}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-stone-500">S/{s.sm.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-black tabular-nums" style={{ color: r.color }}>
                          {(s.kaitz * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: r.bg, color: r.color }}
                        >
                          {r.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3.5 text-xs text-stone-400" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              {isEn
                ? 'Kaitz = MW / formal wage median (S/1,863 in 2023). International evidence: Kaitz >0.65 associated with higher unemployment risk (Belman & Wolfson, 2014; Manning, 2021).'
                : 'Kaitz = SM / mediana salarial formal (S/1,863 en 2023). Evidencia internacional: Kaitz >0.65 asociado con mayor riesgo de desempleo (Belman & Wolfson, 2014; Manning, 2021).'}
            </div>
          </div>
        </div>
      </FadeSection>

      {/* Disclaimer */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-2"
          style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
        >
          <div className="font-bold text-amber-900 text-sm">
            {isEn ? 'About this simulator' : 'Sobre este simulador'}
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {isEn ? (
              <>
                This simulator measures mechanical exposure (how many workers earn below the proposed MW),
                not the causal effect of the increase. Based on the EPE Lima 2023 wage distribution,
                extrapolated nationally. For the effects observed in past increases, see the{' '}
                <Link href="/simuladores/salario-minimo/evidencia" className="underline font-semibold">
                  Evidence
                </Link>{' '}
                section.
              </>
            ) : (
              <>
                Este simulador mide exposición mecánica (cuántos trabajadores ganan por debajo del SM
                propuesto), no el efecto causal del aumento. Basado en la distribución salarial de
                EPE Lima 2023, extrapolada a nivel nacional. Para los efectos observados en aumentos
                pasados, ver la sección de{' '}
                <Link href="/simuladores/salario-minimo/evidencia" className="underline font-semibold">
                  Evidencia
                </Link>.
              </>
            )}
          </p>
        </div>
      </FadeSection>

      {/* Next section */}
      <div className="flex justify-end pt-4">
        <Link
          href="/simuladores/salario-minimo/metodologia"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: TEAL, color: 'white' }}
        >
          {isEn ? 'Next: Methodology →' : 'Siguiente: Metodología →'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
