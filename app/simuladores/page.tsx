'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ComposedChart, Scatter, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Label, Cell,
} from 'recharts';
import {
  CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle,
} from '../lib/chartTheme';
import FadeSection from './impacto-macro/components/FadeSection';
import SourceFooter from './impacto-macro/components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER,
  BETA_POV, BETA_RATE, CI_RATE_LO, CI_RATE_HI,
} from './impacto-macro/components/macroData';
import { EVENTS } from './salario-minimo/components/mwData';
import CiteButton from '../components/CiteButton';
import ShareButton from '../components/ShareButton';

// ── CI on β_poverty (from OLS, N=18, SE=0.115) ────────────────────────────────
const CI90_POV_LO = -0.847;
const CI90_POV_HI = -0.466;

// ── Additional macro constants (for interactive simulators) ───────────────────
const ALPHA_POV  =  0.888;
const BETA_FX    =  0.237;
const RMSE       =  1.2958;
const N_OBS      =  18;
const X_MEAN     =  4.645;
const SXX        =  126.18;
const X_MIN_OBS  = -1.0;
const X_MAX_OBS  =  10.5;

const SCATTER_DATA = [
  { year: 2005, gdp:  6.282, dpov: -2.700 },
  { year: 2006, gdp:  7.555, dpov: -5.000 },
  { year: 2007, gdp:  8.470, dpov: -6.300 },
  { year: 2008, gdp:  9.185, dpov: -5.000 },
  { year: 2009, gdp:  1.123, dpov: -3.400 },
  { year: 2010, gdp:  8.283, dpov: -4.500 },
  { year: 2011, gdp:  6.380, dpov: -3.500 },
  { year: 2012, gdp:  6.145, dpov: -2.300 },
  { year: 2013, gdp:  5.827, dpov: -1.700 },
  { year: 2014, gdp:  2.453, dpov: -0.400 },
  { year: 2015, gdp:  3.223, dpov: -1.700 },
  { year: 2016, gdp:  3.975, dpov: -1.100 },
  { year: 2017, gdp:  2.515, dpov:  0.000 },
  { year: 2018, gdp:  3.957, dpov: -1.600 },
  { year: 2019, gdp:  2.250, dpov: -0.600 },
  { year: 2022, gdp:  2.857, dpov:  1.500 },
  { year: 2023, gdp: -0.345, dpov:  1.500 },
  { year: 2024, gdp:  3.473, dpov: -2.100 },
];

const X_RANGE   = Array.from({ length: 49 }, (_, i) => -1.5 + i * 0.25);
const REG_LINE  = X_RANGE.map(x => ({ x, central: ALPHA_POV + BETA_POV * x }));
const CI_UPPER  = X_RANGE.map(x => ({ x, upper: ALPHA_POV + BETA_POV * x + 1.645 * RMSE * Math.sqrt(1/N_OBS + Math.pow(x - X_MEAN, 2)/SXX) }));
const CI_LOWER  = X_RANGE.map(x => ({ x, lower: ALPHA_POV + BETA_POV * x - 1.645 * RMSE * Math.sqrt(1/N_OBS + Math.pow(x - X_MEAN, 2)/SXX) }));

type Tab = 'macro' | 'mw' | 'escenarios';

type Preset = 'custom' | 'bcrp_hike' | 'bcrp_cut' | 'mild_recession' | 'strong_growth';
const PRESETS: Record<Preset, { gdp: number; label_es: string; label_en: string; note_es: string; note_en: string }> = {
  custom:         { gdp: 3.0,    label_es: 'Personalizado',           label_en: 'Custom',               note_es: 'Ingresa tu propio supuesto de crecimiento.', note_en: 'Enter your own growth assumption.' },
  bcrp_hike:      { gdp: -0.195, label_es: 'BCRP +100pb (alza)',      label_en: 'BCRP +100bp (hike)',   note_es: 'Cholesky VAR(1): tasa→PBI −0.195pp. IC 90% [−0.698, +0.271] incluye cero.', note_en: 'Cholesky VAR(1): rate→GDP −0.195pp. 90% CI [−0.698, +0.271] includes zero.' },
  bcrp_cut:       { gdp:  0.195, label_es: 'BCRP −100pb (recorte)',   label_en: 'BCRP −100bp (cut)',    note_es: 'Simétrico al alza: PBI +0.195pp (mismo IC incluye cero).', note_en: 'Symmetric to hike: GDP +0.195pp (same CI includes zero).' },
  mild_recession: { gdp: -1.5,   label_es: 'Desaceleración (−1.5pp)', label_en: 'Slowdown (−1.5pp)',   note_es: 'PBI cae 1.5pp respecto al baseline (supuesto externo).', note_en: 'GDP falls 1.5pp from baseline (external assumption).' },
  strong_growth:  { gdp:  5.5,   label_es: 'Crecimiento fuerte (+5.5%)', label_en: 'Strong growth (+5.5%)', note_es: 'Supuesto de aceleración (e.g., boom de commodities).', note_en: 'Acceleration assumption (e.g., commodity boom).' },
};

// ── Macro nav cards ────────────────────────────────────────────────────────────
const MACRO_BASE = '/simuladores/impacto-macro';
const getMacroCards = (isEn: boolean) => [
  {
    href: `${MACRO_BASE}/crecimiento-pobreza`,
    icon: '📉',
    title: isEn ? 'Poverty Simulator' : 'Simulador de Pobreza',
    desc: isEn ? 'How much does poverty rise or fall if GDP grows X%?' : '¿Cuánto sube o baja la pobreza si el PBI crece X%?',
    badge: isEn ? 'Tier 1 — High confidence' : 'Nivel 1 — Alta confianza',
    badgeColor: TEAL,
  },
  {
    href: `${MACRO_BASE}/politica-monetaria`,
    icon: '🏦',
    title: isEn ? 'Monetary Policy' : 'Política Monetaria',
    desc: isEn ? 'What happens to GDP and poverty if the BCRP raises rates?' : '¿Qué pasa con el PBI y la pobreza si el BCRP sube la tasa?',
    badge: isEn ? 'Tier 2 — Point estimate' : 'Nivel 2 — Estimación puntual',
    badgeColor: '#d97706',
  },
  {
    href: `${MACRO_BASE}/tipo-cambio`,
    icon: '💱',
    title: isEn ? 'Exchange Rate' : 'Tipo de Cambio',
    desc: isEn ? 'How much does inflation rise if the sol depreciates?' : '¿Cuánto sube la inflación si el sol se deprecia?',
    badge: isEn ? 'Tier 2 — Significant' : 'Nivel 2 — Significativo',
    badgeColor: '#d97706',
  },
  {
    href: `${MACRO_BASE}/metodologia`,
    icon: '📋',
    title: isEn ? 'Methodology' : 'Metodología',
    desc: isEn ? 'VAR, regressions, 10 strategies compared, full audit.' : 'VAR, regresiones, 10 estrategias comparadas, auditoría completa.',
    badge: isEn ? 'For researchers' : 'Para investigadores',
    badgeColor: '#6b7280',
  },
];

// ── MW nav cards ───────────────────────────────────────────────────────────────
const MW_BASE = '/simuladores/salario-minimo';
const getMwCards = (isEn: boolean) => [
  {
    href: `${MW_BASE}/distribucion`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="16" width="6" height="10" rx="1" fill={TERRACOTTA} opacity="0.7"/>
        <rect x="11" y="10" width="6" height="16" rx="1" fill={TERRACOTTA} opacity="0.85"/>
        <rect x="20" y="5"  width="6" height="21" rx="1" fill={TERRACOTTA}/>
      </svg>
    ),
    title: isEn ? 'Wage distribution' : 'Distribución salarial',
    desc: isEn ? 'How the formal wage distribution shifts with each increase' : 'Cómo se mueve la distribución de salarios formales con cada aumento',
    color: TERRACOTTA,
  },
  {
    href: `${MW_BASE}/evidencia`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="12" cy="12" r="8" stroke={TERRACOTTA} strokeWidth="2.5" fill="none"/>
        <line x1="18" y1="18" x2="26" y2="26" stroke={TERRACOTTA} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="8" y1="12" x2="16" y2="12" stroke={TERRACOTTA} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <line x1="12" y1="8" x2="12" y2="16" stroke={TERRACOTTA} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
    title: isEn ? 'Evidence' : 'Evidencia',
    desc: isEn ? 'How many jobs disappear? How many come back? Where do they go?' : '¿Cuántos empleos desaparecen? ¿Cuántos reaparecen? ¿A dónde van?',
    color: TERRACOTTA,
  },
  {
    href: `${MW_BASE}/kaitz`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3 L24 8 L22 22 L14 26 L6 22 L4 8 Z" stroke={TEAL} strokeWidth="2" fill={TEAL} opacity="0.15"/>
        <path d="M14 3 L24 8 L22 22 L14 26 L6 22 L4 8 Z" stroke={TEAL} strokeWidth="2" fill="none"/>
        <circle cx="14" cy="14" r="2.5" fill={TEAL}/>
      </svg>
    ),
    title: isEn ? 'Regional map' : 'Mapa regional',
    desc: isEn ? 'Where does the minimum wage bite hardest? Kaitz index by department.' : '¿Dónde muerde más el salario mínimo? Índice de Kaitz por departamento.',
    color: TEAL,
  },
  {
    href: `${MW_BASE}/simulador`,
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
    title: isEn ? 'Simulator' : 'Simulador',
    desc: isEn ? 'What if MW rises to S/1,200? S/1,300? Data-driven scenarios.' : '¿Qué pasaría si el SM sube a S/1,200? S/1,300? Escenarios basados en datos.',
    color: TERRACOTTA,
  },
  {
    href: `${MW_BASE}/metodologia`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="2" width="18" height="24" rx="2" stroke="#94a3b8" strokeWidth="2" fill="none"/>
        <line x1="9" y1="9"  x2="19" y2="9"  stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9" y1="13" x2="19" y2="13" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9" y1="17" x2="15" y2="17" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: isEn ? 'Methodology' : 'Metodología',
    desc: isEn ? 'How we measure it. What works and what does not. Data and limitations.' : 'Cómo lo medimos. Qué funciona y qué no. Datos y limitaciones.',
    color: '#6b7280',
  },
];

// ── Paper download button ──────────────────────────────────────────────────────
function PaperDownload({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  return (
    <a
      href={href}
      download
      className="flex items-center gap-4 rounded-2xl px-6 py-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TERRACOTTA}15` }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TERRACOTTA} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <polyline points="9 15 12 18 15 15"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-sm font-semibold text-stone-800">{title}</div>
        <div className="text-xs text-stone-400 mt-0.5">{subtitle}</div>
      </div>
      <div className="text-sm font-semibold flex-shrink-0" style={{ color: TERRACOTTA }}>↓ PDF</div>
    </a>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERACTIVE SIMULATORS (embedded inside Impacto Macro tab)
// ══════════════════════════════════════════════════════════════════════════════
function SimPobreza({ isEn }: { isEn: boolean }) {
  const [gdp, setGdp] = useState(3.0);
  const impact    = BETA_POV * gdp;
  const sePred    = RMSE * Math.sqrt(1/N_OBS + Math.pow(gdp - X_MEAN, 2) / SXX);
  const ciLo      = impact - 1.645 * sePred;
  const ciHi      = impact + 1.645 * sePred;
  const outOfSample = gdp < X_MIN_OBS || gdp > X_MAX_OBS;
  const fmtPP = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}pp`;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="rounded-2xl p-6 space-y-3" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <h3 className="text-sm font-semibold text-stone-700">
            {isEn ? 'GDP Growth Assumption' : 'Supuesto de Crecimiento del PBI'}
          </h3>
          <input type="range" min="-6" max="9" step="0.1" value={gdp}
            onChange={e => setGdp(Number(e.target.value))}
            className="w-full accent-[#C65D3E]" />
          <div className="flex justify-between text-xs text-stone-400"><span>−6%</span><span>+9%</span></div>
          <input type="number" step="0.1" value={gdp} min="-6" max="9"
            onChange={e => setGdp(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-xl text-center font-bold text-lg"
            style={{ borderColor: CARD_BORDER, background: CARD_BG }} />
          <div className="text-center text-xs text-stone-400">%</div>
        </div>
        <div className="rounded-2xl p-4 space-y-1" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <div className="text-xs font-bold uppercase tracking-wide text-green-800">
            {isEn ? 'Tier 1 — High Confidence' : 'Nivel 1 — Alta Confianza'}
          </div>
          <p className="text-xs text-green-700">β=−0.656, R²=0.669, N=18, p&lt;0.0001</p>
          <p className="text-xs text-green-600">{isEn ? 'Source: OLS ENAHO 2005–2024, excl. 2020–2021' : 'Fuente: MCO ENAHO 2005–2024, excl. 2020–2021'}</p>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <h3 className="text-sm font-semibold text-stone-700">
            {isEn ? 'Poverty Impact (Δ pp)' : 'Impacto en Pobreza (Δ pp)'}
          </h3>
          <div className="flex items-baseline gap-3">
            <span className={`text-4xl font-black ${impact > 0 ? 'text-red-600' : 'text-emerald-700'}`}>{fmtPP(impact)}</span>
            <span className="text-sm text-stone-400">{isEn ? 'point estimate' : 'estimación puntual'}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: isEn ? 'CI low (90%)' : 'IC inf. (90%)', val: Math.min(ciLo, ciHi) },
              { label: isEn ? 'Point est.' : 'Est. puntual', val: impact, bold: true },
              { label: isEn ? 'CI high (90%)' : 'IC sup. (90%)', val: Math.max(ciLo, ciHi) },
            ].map(({ label, val, bold }) => (
              <div key={label} className="rounded-xl p-3"
                style={{ background: bold ? 'rgba(0,0,0,0.04)' : CARD_BG, border: `1px solid ${bold ? 'rgba(120,113,108,0.35)' : CARD_BORDER}` }}>
                <div className="text-xs text-stone-400 mb-1">{label}</div>
                <div className={`text-lg font-${bold ? 'black' : 'semibold'}`}
                  style={{ color: bold ? (impact > 0 ? '#dc2626' : '#059669') : '#78716c' }}>{fmtPP(val)}</div>
              </div>
            ))}
          </div>
          {outOfSample && (
            <div className="rounded-xl p-2 text-xs text-amber-800" style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}>
              ⚠️ {isEn ? `GDP ${gdp.toFixed(1)}% is outside observed sample (${X_MIN_OBS}%–${X_MAX_OBS}%). Out-of-sample extrapolation.` : `PBI ${gdp.toFixed(1)}% está fuera del rango muestral (${X_MIN_OBS}%–${X_MAX_OBS}%). Extrapolación fuera de muestra.`}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <p className="text-xs text-stone-400 mb-3">
            {isEn ? 'GDP growth (%) vs Δ poverty rate (pp) · 2005–2024 excl. 2020–2021' : 'Crecimiento PBI (%) vs Δ tasa pobreza (pp) · 2005–2024 excl. 2020–2021'}
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis dataKey="x" type="number" domain={[-2, 10.5]} tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} tickFormatter={v => `${v}%`}>
                <Label value={isEn ? 'GDP growth (%)' : 'Crecimiento PBI (%)'} offset={-10} position="insideBottom" style={{ fontSize: 11, fill: '#78716c' }} />
              </XAxis>
              <YAxis type="number" domain={[-8, 3]} ticks={[-8, -6, -4, -2, 0, 2]} tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} tickFormatter={v => `${v}pp`}>
                <Label value={isEn ? 'Δ Poverty (pp)' : 'Δ Pobreza (pp)'} angle={-90} position="insideLeft" offset={15} style={{ fontSize: 11, fill: '#78716c' }} />
              </YAxis>
              <Tooltip contentStyle={tooltipContentStyle}
                formatter={(val: any) => [`${Number(val).toFixed(2)}pp`, '']}
                labelFormatter={(_, payload) => { const pt = payload?.[0]?.payload; return pt?.year ? `${pt.year} | PBI: ${pt.gdp?.toFixed(1)}%` : ''; }} />
              <Line data={CI_UPPER} dataKey="upper" dot={false} stroke={TERRACOTTA} strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5} legendType="none" />
              <Line data={CI_LOWER} dataKey="lower" dot={false} stroke={TERRACOTTA} strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5} legendType="none" />
              <Line data={REG_LINE} dataKey="central" dot={false} stroke={TERRACOTTA} strokeWidth={2} legendType="none" />
              <Scatter data={[{ x: gdp, scatter: ALPHA_POV + BETA_POV * gdp }]} dataKey="scatter" fill={TERRACOTTA} r={8} name="scatter" />
              <Scatter data={SCATTER_DATA.map(d => ({ x: d.gdp, scatter: d.dpov, year: d.year, gdp: d.gdp }))} dataKey="scatter" fill={TEAL} r={4} opacity={0.8} name="data" />
              <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-stone-400 mt-1 text-center">
            {isEn ? 'Teal = observed · Terra = your assumption · Dashed = 90% CI' : 'Verde = observado · Terra = tu supuesto · Punteado = IC 90%'}
          </p>
        </div>
      </div>
    </div>
  );
}

function SimMonetaria({ isEn }: { isEn: boolean }) {
  const [bp, setBp] = useState(100);
  const gdpImpact = BETA_RATE * (bp / 100);
  const gdpCiLo   = CI_RATE_LO * (bp / 100);
  const gdpCiHi   = CI_RATE_HI * (bp / 100);
  const povImpact = gdpImpact * BETA_POV;
  const povCiLoG  = gdpCiHi * BETA_POV;
  const povCiHiG  = gdpCiLo * BETA_POV;
  const ciInclZero = gdpCiLo <= 0 && gdpCiHi >= 0;
  const fmtPP = (v: number, dp = 3) => `${v >= 0 ? '+' : ''}${v.toFixed(dp)}pp`;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="rounded-2xl p-6 space-y-3" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <h3 className="text-sm font-semibold text-stone-700">{isEn ? 'Rate Change (bp)' : 'Cambio en Tasa (pb)'}</h3>
          <input type="range" min="-300" max="300" step="25" value={bp}
            onChange={e => setBp(Number(e.target.value))} className="w-full accent-[#C65D3E]" />
          <div className="flex justify-between text-xs text-stone-400"><span>−300bp</span><span>+300bp</span></div>
          <input type="number" step="25" value={bp} min="-300" max="300"
            onChange={e => setBp(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-xl text-center font-bold text-lg"
            style={{ borderColor: CARD_BORDER, background: CARD_BG }} />
          <div className="text-center text-xs text-stone-400">bp</div>
        </div>
        <div className="rounded-2xl p-4 space-y-1" style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}>
          <div className="text-xs font-bold uppercase tracking-wide text-amber-800">{isEn ? 'Tier 2 — Point Estimate' : 'Nivel 2 — Est. Puntual'}</div>
          <p className="text-xs text-amber-700">{isEn ? '90% CI includes zero at all horizons h=0..8 (T=85)' : 'IC 90% incluye cero en todos los horizontes h=0..8 (T=85)'}</p>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl p-4 space-y-1" style={{ background: '#fffbeb', border: '2px solid #fbbf24' }}>
          <div className="font-semibold text-amber-900 text-sm">⚠️ {isEn ? 'Statistical Caveat' : 'Advertencia Estadística'}</div>
          <p className="text-xs text-amber-800">{isEn ? `90% CI [${fmtPP(CI_RATE_LO, 2)}, ${fmtPP(CI_RATE_HI, 2)}] per 100bp includes zero. Point est. −0.195pp consistent with literature but not individually significant.` : `IC 90% [${fmtPP(CI_RATE_LO, 2)}, ${fmtPP(CI_RATE_HI, 2)}] por 100pb incluye cero. Est. puntual −0.195pp consistente con literatura pero no significativa individualmente.`}</p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <h3 className="text-sm font-semibold text-stone-700 mb-3">{isEn ? 'Step 1: Rate → GDP' : 'Paso 1: Tasa → PBI'}</h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span className={`text-3xl font-black ${gdpImpact <= 0 ? 'text-red-600' : 'text-emerald-700'}`}>{fmtPP(gdpImpact)}</span>
            <span className="text-sm text-stone-400">PBI</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: isEn ? 'CI low' : 'IC inf.', val: Math.min(gdpCiLo, gdpCiHi) },
              { label: isEn ? 'Point est.' : 'Est. puntual', val: gdpImpact, bold: true },
              { label: isEn ? 'CI high' : 'IC sup.', val: Math.max(gdpCiLo, gdpCiHi) },
            ].map(({ label, val, bold }) => (
              <div key={label} className="rounded-xl p-2" style={{ background: bold ? 'rgba(0,0,0,0.04)' : CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs text-stone-400">{label}</div>
                <div className={`font-${bold ? 'bold' : 'medium'} text-stone-800 text-sm`}>{fmtPP(val)}</div>
              </div>
            ))}
          </div>
          {ciInclZero && <p className="text-xs text-amber-700 mt-2">{isEn ? '↑ CI includes zero' : '↑ IC incluye cero'}</p>}
        </div>

        <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <h3 className="text-sm font-semibold text-stone-700 mb-3">{isEn ? 'Step 2: Chained Effect on Poverty' : 'Paso 2: Efecto Encadenado sobre Pobreza'}</h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span className={`text-3xl font-black ${povImpact >= 0 ? 'text-red-600' : 'text-emerald-700'}`}>{fmtPP(povImpact)}</span>
            <span className="text-sm text-stone-400">{isEn ? 'poverty' : 'pobreza'}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: isEn ? 'CI low' : 'IC inf.', val: Math.min(povCiLoG, povCiHiG) },
              { label: isEn ? 'Point est.' : 'Est. puntual', val: povImpact, bold: true },
              { label: isEn ? 'CI high' : 'IC sup.', val: Math.max(povCiLoG, povCiHiG) },
            ].map(({ label, val, bold }) => (
              <div key={label} className="rounded-xl p-2" style={{ background: bold ? 'rgba(0,0,0,0.04)' : CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-xs text-stone-400">{label}</div>
                <div className={`font-${bold ? 'bold' : 'medium'} text-stone-800 text-sm`}>{fmtPP(val)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimFX({ isEn }: { isEn: boolean }) {
  const [fx, setFx] = useState(10);
  const cpiImpact = BETA_FX * (fx / 10);
  const fmtPP = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(3)}pp`;
  const chartData = Array.from({ length: 41 }, (_, i) => ({ fx: i, cpi: BETA_FX * (i / 10) }));

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="rounded-2xl p-6 space-y-3" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <h3 className="text-sm font-semibold text-stone-700">{isEn ? 'FX Depreciation (%)' : 'Depreciación Cambiaria (%)'}</h3>
          <input type="range" min="0" max="40" step="0.5" value={fx}
            onChange={e => setFx(Number(e.target.value))} className="w-full accent-[#C65D3E]" />
          <div className="flex justify-between text-xs text-stone-400"><span>0%</span><span>40%</span></div>
          <input type="number" step="0.5" value={fx} min="0" max="40"
            onChange={e => setFx(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-xl text-center font-bold text-lg"
            style={{ borderColor: CARD_BORDER, background: CARD_BG }} />
          <div className="text-center text-xs text-stone-400">%</div>
        </div>
        <div className="rounded-2xl p-4 space-y-1" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <div className="text-xs font-bold uppercase tracking-wide text-green-800">{isEn ? 'Tier 2 — Significant' : 'Nivel 2 — Significativo'}</div>
          <p className="text-xs text-green-700">β=+0.237pp {isEn ? 'per 10% depreciation · LP h=1 HAC' : 'por 10% depreciación · PL h=1 HAC'}</p>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <h3 className="text-sm font-semibold text-stone-700">{isEn ? 'CPI Impact at h=1 quarter (pp)' : 'Impacto IPC en h=1 trimestre (pp)'}</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-amber-600">{fmtPP(cpiImpact)}</span>
            <span className="text-sm text-stone-400">{isEn ? 'quarterly CPI increase' : 'alza IPC trimestral'}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl p-3" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="text-xs text-stone-400 mb-1">{isEn ? 'FX depreciation' : 'Depreciación TC'}</div>
              <div className="text-xl font-bold text-stone-800">{fx > 0 ? '+' : ''}{fx.toFixed(1)}%</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div className="text-xs text-stone-400 mb-1">{isEn ? 'CPI impact (h=1)' : 'Impacto IPC (h=1)'}</div>
              <div className="text-xl font-bold text-amber-700">{fmtPP(cpiImpact)}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis dataKey="fx" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} tickFormatter={v => `${v}%`}>
                <Label value={isEn ? 'FX Depreciation (%)' : 'Depreciación TC (%)'} offset={-10} position="insideBottom" style={{ fontSize: 11, fill: '#78716c' }} />
              </XAxis>
              <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} tickFormatter={v => `${v.toFixed(2)}pp`}>
                <Label value={isEn ? 'ΔCPI (pp)' : 'ΔIPC (pp)'} angle={-90} position="insideLeft" offset={15} style={{ fontSize: 11, fill: '#78716c' }} />
              </YAxis>
              <Tooltip contentStyle={tooltipContentStyle}
                formatter={(v: any) => [`${Number(v).toFixed(3)}pp`, isEn ? 'CPI impact' : 'Impacto IPC']}
                labelFormatter={v => `${isEn ? 'Depreciation' : 'Depreciación'}: ${v}%`} />
              <Line type="monotone" dataKey="cpi" stroke={CHART_COLORS.amber} strokeWidth={2} dot={false} />
              <ReferenceLine x={fx} stroke={TERRACOTTA} strokeDasharray="4 4"
                label={{ value: `${fx}%`, fontSize: 11, fill: TERRACOTTA }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — IMPACTO MACRO
// ══════════════════════════════════════════════════════════════════════════════
type MacroSim = 'pobreza' | 'monetaria' | 'fx';

function TabMacro({ isEn }: { isEn: boolean }) {
  const cards = getMacroCards(isEn);
  const [sim, setSim] = useState<MacroSim>('pobreza');

  const SIM_TABS: { key: MacroSim; label_es: string; label_en: string }[] = [
    { key: 'pobreza',   label_es: 'Crecimiento → Pobreza', label_en: 'Growth → Poverty' },
    { key: 'monetaria', label_es: 'Política Monetaria',    label_en: 'Monetary Policy'  },
    { key: 'fx',        label_es: 'TC → Inflación',        label_en: 'FX → Inflation'   },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-8 pt-2">
        <div
          className="inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: '#78716c' }}
        >
          {isEn
            ? 'BCRP quarterly data 2004–2025 · ENAHO 2005–2024 · Audited estimates'
            : 'BCRP datos trimestrales 2004–2025 · ENAHO 2005–2024 · Estimaciones auditadas'}
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight tracking-tight">
            {isEn
              ? <>How do economic shocks<br className="hidden sm:block" /> affect poverty?</>
              : <>¿Cómo afectan los shocks<br className="hidden sm:block" /> económicos a la pobreza?</>}
          </h2>
          <p className="text-lg text-stone-500 font-light max-w-2xl mx-auto">
            {isEn
              ? 'We estimate how much poverty changes when GDP grows, when the BCRP moves rates, or when the sol depreciates. With confidence intervals throughout.'
              : 'Estimamos cuánto cambia la pobreza cuando crece el PBI, cuando el BCRP mueve la tasa, o cuando el sol se deprecia. Con intervalos de confianza en todo momento.'}
          </p>
        </div>

        {/* 3 headline stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          <div className="rounded-2xl p-6 space-y-2"
            style={{ background: CARD_BG, border: `2px solid ${TEAL}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: TEAL }}>
              {isEn ? 'Growth → Poverty' : 'Crecimiento → Pobreza'}
            </div>
            <div className="text-4xl font-black" style={{ color: TEAL }}>−0.656</div>
            <p className="text-sm text-stone-600 leading-snug">
              {isEn ? 'For each 1% more growth, poverty falls 0.66pp' : 'Por cada 1% más de crecimiento, la pobreza cae 0.66pp'}
            </p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white" style={{ background: TEAL }}>
              {isEn ? 'High confidence' : 'Alta confianza'}
            </span>
          </div>
          <div className="rounded-2xl p-6 space-y-2"
            style={{ background: CARD_BG, border: `2px solid #d97706`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#d97706' }}>
              {isEn ? 'BCRP Rate → GDP' : 'Tasa BCRP → PBI'}
            </div>
            <div className="text-4xl font-black" style={{ color: '#d97706' }}>−0.20pp</div>
            <p className="text-sm text-stone-600 leading-snug">
              {isEn ? '100bp hike reduces GDP by ~0.20pp' : '100pb de alza reducen el PBI en ~0.20pp'}
            </p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white" style={{ background: '#d97706' }}>
              {isEn ? 'CI includes zero' : 'IC incluye cero'}
            </span>
          </div>
          <div className="rounded-2xl p-6 space-y-2"
            style={{ background: CARD_BG, border: `2px solid #d97706`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#d97706' }}>
              {isEn ? 'Depreciation → Inflation' : 'Depreciación → Inflación'}
            </div>
            <div className="text-4xl font-black" style={{ color: '#d97706' }}>+0.24pp</div>
            <p className="text-sm text-stone-600 leading-snug">
              {isEn ? '10% sol depreciation raises inflation 0.24pp' : '10% de depreciación del sol sube la inflación 0.24pp'}
            </p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white" style={{ background: '#d97706' }}>
              {isEn ? 'Significant' : 'Significativo'}
            </span>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* Nav cards */}
      <FadeSection className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-stone-900">
            {isEn ? 'Explore in detail' : 'Explora en detalle'}
          </h3>
          <p className="text-stone-500 text-sm">
            {isEn ? 'Four sections. Each one digs into a different angle.' : 'Cuatro secciones. Cada una profundiza en un ángulo distinto.'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl p-6 space-y-3 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="text-3xl">{card.icon}</div>
              <div>
                <div className="font-bold text-stone-800 group-hover:text-stone-900 transition-colors">{card.title}</div>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">{card.desc}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white" style={{ background: card.badgeColor }}>
                {card.badge}
              </span>
            </Link>
          ))}
        </div>
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* Paper download */}
      <FadeSection className="space-y-4">
        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">
          {isEn ? 'Working paper' : 'Documento de trabajo'}
        </h3>
        <PaperDownload
          href="/assets/papers/macro_transmission_peru.pdf"
          title={isEn ? 'Macro Transmission in Peru — Working Paper' : 'Transmisión Macroeconómica en Perú — Documento de Trabajo'}
          subtitle={isEn
            ? 'VAR(1) Cholesky, Local Projections, OLS ENAHO 2005–2024 · 2026-03-19'
            : 'VAR(1) Cholesky, Proyecciones Locales, MCO ENAHO 2005–2024 · 2026-03-19'}
        />
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* ── INTERACTIVE SIMULATORS ─────────────────────────────────────────── */}
      <FadeSection className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-stone-900">
            {isEn ? 'Live Simulators' : 'Simuladores Interactivos'}
          </h3>
          <p className="text-stone-500 text-sm">
            {isEn ? 'Adjust the sliders and see the estimated impact in real time.' : 'Ajusta los sliders y ve el impacto estimado en tiempo real.'}
          </p>
        </div>

        {/* Sub-tab nav */}
        <div className="flex border-b mb-2" style={{ borderColor: CARD_BORDER }}>
          {SIM_TABS.map(({ key, label_es, label_en }) => (
            <button
              key={key}
              onClick={() => setSim(key)}
              className="px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors"
              style={sim === key
                ? { borderColor: TERRACOTTA, color: TERRACOTTA }
                : { borderColor: 'transparent', color: '#78716c' }}
            >
              {isEn ? label_en : label_es}
            </button>
          ))}
        </div>

        {sim === 'pobreza'   && <SimPobreza   isEn={isEn} />}
        {sim === 'monetaria' && <SimMonetaria isEn={isEn} />}
        {sim === 'fx'        && <SimFX        isEn={isEn} />}
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* Caveat */}
      <FadeSection>
        <div className="rounded-2xl p-6 space-y-2" style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}>
          <div className="font-semibold text-amber-900">
            ⚠️ {isEn ? 'What these tools are — and what they are not' : 'Qué son estas herramientas — y qué no son'}
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            {isEn
              ? 'These tools estimate historical average relationships between macroeconomic variables in the Peruvian economy. They are not forecasts of the future. Confidence intervals reflect the statistical uncertainty of each estimate — real uncertainty is greater. Interpret results as orders of magnitude, not exact predictions.'
              : 'Estas herramientas estiman relaciones históricas promedio entre variables macroeconómicas en la economía peruana. No son predicciones del futuro. Los intervalos de confianza reflejan la incertidumbre estadística de cada estimación — la incertidumbre real es mayor. Interpreta los resultados como órdenes de magnitud, no como pronósticos exactos.'}
          </p>
        </div>
      </FadeSection>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — SALARIO MÍNIMO
// ══════════════════════════════════════════════════════════════════════════════
function TabMW({ isEn }: { isEn: boolean }) {
  const cards = getMwCards(isEn);
  const [heroBars, setHeroBars] = useState([0, 0, 0]);

  useEffect(() => {
    const ratios = [0.696, 0.829, 0.830];
    const timers = ratios.map((r, i) =>
      setTimeout(() => setHeroBars(prev => { const n = [...prev]; n[i] = r; return n; }), (i + 1) * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-8 pt-2">
        <div
          className="inline-block rounded-full px-4 py-1.5 text-xs font-medium text-stone-500 tracking-wide"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {isEn
            ? 'Distributional analysis · ENAHO 2015–2023 · INEI Peru'
            : 'Análisis distribucional · ENAHO 2015–2023 · INEI Perú'}
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight tracking-tight">
            {isEn
              ? <>What happens when<br className="hidden sm:block"/> the minimum wage rises?</>
              : <>¿Qué pasa cuando sube<br className="hidden sm:block"/> el salario mínimo?</>}
          </h2>
          <p className="text-lg sm:text-xl text-stone-500 font-light max-w-2xl mx-auto">
            {isEn
              ? 'Peru raised the MW three times between 2016 and 2022. We analyze what happened to wages and employment.'
              : 'Perú aumentó el SM tres veces entre 2016 y 2022. Analizamos qué pasó con los salarios y el empleo.'}
          </p>
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
            ? '~10,000 formal workers per year · ENAHO Module 500 2015–2023'
            : '~10,000 trabajadores formales por año · ENAHO Módulo 500 2015–2023'}
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* Two headline cards */}
      <FadeSection className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  formatter={(v: unknown) => [`${(Number(v) * 100).toFixed(1)}%`, isEn ? 'Ratio' : 'Ratio']}
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
                <Bar dataKey="pre"  name={isEn ? 'Before' : 'Antes'}   fill="#d6d3d1" radius={[4, 4, 0, 0]} isAnimationActive={false}/>
                <Bar dataKey="post" name={isEn ? 'After' : 'Después'}  fill={TEAL} fillOpacity={0.85} radius={[4, 4, 0, 0]} isAnimationActive={false}/>
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

      {/* Nav cards */}
      <FadeSection className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-stone-900">
            {isEn ? 'Explore in detail' : 'Explora en detalle'}
          </h3>
          <p className="text-stone-500 text-sm">
            {isEn ? 'Five sections. Each one digs into a different angle.' : 'Cinco secciones. Cada una profundiza en un ángulo distinto.'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl p-6 space-y-3 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div>{card.icon}</div>
              <div>
                <div className="font-bold text-stone-800 group-hover:text-stone-900 transition-colors">{card.title}</div>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">{card.desc}</p>
              </div>
              <div className="text-xs font-semibold flex items-center gap-1" style={{ color: card.color }}>
                {isEn ? 'View section' : 'Ver sección'} <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* Paper download */}
      <FadeSection className="space-y-4">
        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">
          {isEn ? 'Working paper' : 'Documento de trabajo'}
        </h3>
        <PaperDownload
          href="/assets/papers/mw_paper.pdf"
          title={isEn ? 'Minimum Wage Effects in Peru — Working Paper' : 'Efectos del Salario Mínimo en Perú — Documento de Trabajo'}
          subtitle={isEn
            ? 'DiD panel, Lee bounds, lighthouse effect · ENAHO 2015–2023 · 9 natural experiments'
            : 'Panel DiD, cotas de Lee, efecto faro · ENAHO 2015–2023 · 9 experimentos naturales'}
        />
      </FadeSection>

      <div className="text-center">
        <span
          className="inline-block rounded-full px-5 py-2 text-xs font-medium tracking-wide"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}`, color: '#78716c' }}
        >
          ENAHO 2015–2023 · EPE Lima · ~10,000 {isEn ? 'formal workers/year' : 'trabajadores formales/año'}
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — ESCENARIOS
// ══════════════════════════════════════════════════════════════════════════════
function TabEscenarios({ isEn }: { isEn: boolean }) {
  const [preset, setPreset] = useState<Preset>('bcrp_hike');
  const [gdp, setGdp]       = useState<number>(PRESETS['bcrp_hike'].gdp);

  const handlePreset = (p: Preset) => { setPreset(p); setGdp(PRESETS[p].gdp); };

  const isCustom    = preset === 'custom';
  const isBcrpHike  = preset === 'bcrp_hike';
  const isBcrpCut   = preset === 'bcrp_cut';
  const isRatePreset = isBcrpHike || isBcrpCut;

  const gdpCiLo = CI_RATE_LO * (isBcrpHike ? 1 : isBcrpCut ? -1 : 0);
  const gdpCiHi = CI_RATE_HI * (isBcrpHike ? 1 : isBcrpCut ? -1 : 0);

  const povPoint = BETA_POV * gdp;
  const povLo = isRatePreset
    ? Math.min(BETA_POV * gdpCiLo, BETA_POV * gdpCiHi)
    : Math.min(CI90_POV_LO * gdp, CI90_POV_HI * gdp);
  const povHi = isRatePreset
    ? Math.max(BETA_POV * gdpCiLo, BETA_POV * gdpCiHi)
    : Math.max(CI90_POV_LO * gdp, CI90_POV_HI * gdp);

  const fmt    = (v: number, dp = 2) => `${v >= 0 ? '+' : ''}${v.toFixed(dp)}`;
  const fmtPP  = (v: number, dp = 2) => `${fmt(v, dp)}pp`;
  const fmtPct = (v: number)         => `${fmt(v, 1)}%`;

  const presetData = PRESETS[preset];

  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="space-y-4 pt-2">
        <div
          className="inline-block rounded-full px-4 py-1.5 text-xs font-medium text-stone-500 tracking-wide"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {isEn
            ? 'Scenario Analysis · ENAHO 2005–2024 · OLS + Cholesky VAR(1)'
            : 'Análisis de Escenarios · ENAHO 2005–2024 · MCO + VAR(1) Cholesky'}
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight tracking-tight">
          {isEn ? 'Scenario Analysis' : 'Análisis de Escenarios'}
        </h2>
        <p className="text-lg text-stone-500 font-light max-w-2xl leading-relaxed">
          {isEn
            ? 'GDP growth assumption → poverty impact, computed from an audited OLS regression (ENAHO 2005–2024, N=18, R²=0.669). Uncertainty intervals shown throughout.'
            : 'Supuesto de crecimiento del PBI → impacto en pobreza, calculado con una regresión MCO auditada (ENAHO 2005–2024, N=18, R²=0.669). Intervalos de incertidumbre mostrados en todo momento.'}
        </p>
      </section>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* Confidence note */}
      <FadeSection>
        <div className="rounded-2xl p-5" style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}>
          <p className="text-sm text-amber-900">
            <strong>{isEn ? 'What is estimated here: ' : 'Qué se estima aquí: '}</strong>
            {isEn
              ? 'The GDP→Poverty elasticity (β=−0.656) is our Tier 1 high-confidence result. The rate→GDP elasticity (β=−0.195) is a Tier 2 point estimate — its 90% CI includes zero. Scenarios that go via rate→GDP→Poverty carry compounded uncertainty.'
              : 'La elasticidad PBI→Pobreza (β=−0.656) es nuestro resultado Nivel 1 de alta confianza. La elasticidad tasa→PBI (β=−0.195) es una estimación puntual Nivel 2 — su IC 90% incluye cero. Los escenarios que pasan por tasa→PBI→Pobreza tienen incertidumbre compuesta.'}
          </p>
        </div>
      </FadeSection>

      {/* Preset buttons */}
      <FadeSection>
        <div className="rounded-2xl p-6 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <label className="block text-sm font-semibold text-stone-700">
            {isEn ? 'Select a preset or enter custom GDP growth' : 'Selecciona un preset o ingresa crecimiento PBI personalizado'}
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(PRESETS) as [Preset, typeof PRESETS[Preset]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handlePreset(key)}
                className="px-4 py-2 text-sm font-medium rounded-full border transition-colors"
                style={preset === key
                  ? { background: TERRACOTTA, borderColor: TERRACOTTA, color: '#fff' }
                  : { background: CARD_BG, borderColor: CARD_BORDER, color: '#44403c' }}
              >
                {isEn ? val.label_en : val.label_es}
              </button>
            ))}
          </div>
          {isCustom && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-stone-500 mb-1">
                {isEn ? 'GDP growth assumption (%)' : 'Supuesto de crecimiento PBI (%)'}
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="range" min="-8" max="9" step="0.1" value={gdp}
                  onChange={e => setGdp(Number(e.target.value))}
                  className="flex-1 accent-[#C65D3E]"
                />
                <input
                  type="number" step="0.1" value={gdp} min="-8" max="9"
                  onChange={e => setGdp(Number(e.target.value))}
                  className="w-24 px-3 py-2 border rounded-xl text-sm text-center font-bold"
                  style={{ borderColor: CARD_BORDER, background: CARD_BG }}
                />
                <span className="text-sm text-stone-400">%</span>
              </div>
            </div>
          )}
          {!isCustom && (
            <div className="mt-2 p-3 rounded-xl text-xs text-stone-500"
              style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}>
              <strong>{isEn ? 'Preset note: ' : 'Nota del preset: '}</strong>
              {isEn ? presetData.note_en : presetData.note_es}
              {' '}{isEn ? 'GDP assumption:' : 'Supuesto PBI:'}{' '}
              <span className="font-semibold">{fmtPct(gdp)}</span>
            </div>
          )}
        </div>
      </FadeSection>

      {/* Rate→GDP chain */}
      {isRatePreset && (
        <FadeSection>
          <div className="rounded-2xl p-5 space-y-3" style={{ background: '#fffbeb', border: '2px solid #fcd34d' }}>
            <h3 className="font-semibold text-amber-900">
              {isEn ? '⚠️ Rate → GDP (Tier 2 — CI includes zero)' : '⚠️ Tasa → PBI (Nivel 2 — IC incluye cero)'}
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: isEn ? 'GDP CI low' : 'PBI IC inf.', val: Math.min(gdpCiLo, gdpCiHi) },
                { label: isEn ? 'GDP point est.' : 'PBI est. puntual', val: gdp, bold: true },
                { label: isEn ? 'GDP CI high' : 'PBI IC sup.', val: Math.max(gdpCiLo, gdpCiHi) },
              ].map(({ label, val, bold }) => (
                <div key={label} className={`rounded-xl p-2 ${bold ? 'border-2 border-amber-400 bg-amber-100' : 'border border-amber-200 bg-white'}`}>
                  <div className="text-xs text-amber-700">{label}</div>
                  <div className={`font-${bold ? 'bold' : 'medium'} text-amber-900`}>{fmtPP(val)}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-700">
              {isEn
                ? `90% bootstrap CI [${fmtPP(CI_RATE_LO)}, ${fmtPP(CI_RATE_HI)}] per 100bp — crosses zero.`
                : `IC 90% bootstrap [${fmtPP(CI_RATE_LO)}, ${fmtPP(CI_RATE_HI)}] por 100pb — cruza cero.`}
            </p>
          </div>
        </FadeSection>
      )}

      {/* Poverty impact */}
      <FadeSection>
        <div className="rounded-2xl p-6 space-y-5"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 className="text-2xl font-bold text-stone-900">
            {isEn ? 'Poverty Impact' : 'Impacto en Pobreza'}
          </h3>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black" style={{ color: povPoint > 0 ? '#dc2626' : TEAL }}>
              {fmtPP(povPoint)}
            </span>
            <span className="text-lg text-stone-500">
              {povPoint > 0
                ? (isEn ? 'increase in poverty rate' : 'aumento en tasa de pobreza')
                : (isEn ? 'reduction in poverty rate' : 'reducción en tasa de pobreza')}
            </span>
          </div>
          <div>
            <div className="text-xs text-stone-400 mb-2">
              {isEn ? '90% confidence interval on poverty impact' : 'Intervalo de confianza 90% sobre impacto en pobreza'}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: isEn ? 'CI low (90%)' : 'IC inferior (90%)', val: povLo, highlight: false },
                { label: isEn ? 'Point estimate' : 'Estimación puntual', val: povPoint, highlight: true },
                { label: isEn ? 'CI high (90%)' : 'IC superior (90%)', val: povHi, highlight: false },
              ].map(({ label, val, highlight }) => (
                <div key={label} className="rounded-xl p-4"
                  style={{
                    background: highlight ? 'rgba(0,0,0,0.04)' : CARD_BG,
                    border: `1px solid ${highlight ? 'rgba(120,113,108,0.35)' : CARD_BORDER}`,
                  }}>
                  <div className="text-xs text-stone-400 mb-1">{label}</div>
                  <div className={`text-2xl font-${highlight ? 'black' : 'semibold'}`}
                    style={{ color: highlight ? (povPoint > 0 ? '#dc2626' : TEAL) : '#78716c' }}>
                    {fmtPP(val)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-stone-400 text-center">
              [{fmtPP(povLo)} — {fmtPP(povHi)}]
            </div>
          </div>
          <div className="rounded-xl p-4 text-sm text-stone-600 space-y-1"
            style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}>
            <div className="font-semibold text-stone-800 mb-2">
              {isEn ? 'Computation:' : 'Cálculo:'}
            </div>
            <div className="font-mono text-sm space-y-1">
              {isRatePreset && (
                <div>
                  {isEn ? 'Rate shock' : 'Shock tasa'} → ΔPBI = −0.195 × (±100bp/100) = <strong>{fmtPP(gdp, 3)}</strong>
                  {' '}<span className="text-amber-600">{isEn ? '(CI includes zero)' : '(IC incluye cero)'}</span>
                </div>
              )}
              <div>
                ΔPobreza = {BETA_POV} × {fmtPct(gdp)} = <strong style={{ color: povPoint > 0 ? '#dc2626' : TEAL }}>{fmtPP(povPoint, 3)}</strong>
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* Confidence tiers */}
      <FadeSection>
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <h3 className="font-semibold text-stone-800">
            {isEn ? 'Confidence Tiers' : 'Niveles de Confianza'}
          </h3>
          <div className="space-y-2 text-sm text-stone-600">
            <div className="flex gap-2 items-start">
              <span className="rounded-full px-3 py-0.5 text-xs font-medium whitespace-nowrap" style={{ background: '#dcfce7', color: '#166534' }}>
                {isEn ? 'Tier 1' : 'Nivel 1'}
              </span>
              <span>{isEn ? 'GDP→Poverty β=−0.656: significant (p<0.0001), stable, N=18.' : 'PBI→Pobreza β=−0.656: significativo (p<0.0001), estable, N=18.'}</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="rounded-full px-3 py-0.5 text-xs font-medium whitespace-nowrap" style={{ background: '#fef9c3', color: '#854d0e' }}>
                {isEn ? 'Tier 2' : 'Nivel 2'}
              </span>
              <span>{isEn ? 'Rate→GDP β=−0.195: 90% CI includes zero, literature-consistent.' : 'Tasa→PBI β=−0.195: IC 90% incluye cero, consistente con literatura.'}</span>
            </div>
          </div>
        </div>
      </FadeSection>

      <div className="text-center">
        <span
          className="inline-block rounded-full px-5 py-2 text-xs font-medium text-stone-400 tracking-wide"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
        >
          {isEn
            ? 'ENAHO 2005–2024 · OLS N=18 R²=0.669 · Cholesky VAR(1) T=85 · Estimated 2026-03-19'
            : 'ENAHO 2005–2024 · MCO N=18 R²=0.669 · VAR(1) Cholesky T=85 · Estimado 2026-03-19'}
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function SimuladoresPage() {
  const isEn = useLocale() === 'en';
  const [tab, setTab] = useState<Tab>('macro');

  const TABS: { key: Tab; label_es: string; label_en: string }[] = [
    { key: 'macro',     label_es: 'Impacto Macro',  label_en: 'Macro Impact'   },
    { key: 'mw',        label_es: 'Salario Mínimo', label_en: 'Minimum Wage'   },
    { key: 'escenarios',label_es: 'Escenarios',     label_en: 'Scenarios'      },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12" style={{ zIndex: 1 }}>

        {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
        <header className="space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-stone-900 leading-tight tracking-tight">
                {isEn ? 'Impact Simulators' : 'Simuladores de Impacto'}
              </h1>
              <p className="text-lg text-stone-500 font-light mt-2">
                {isEn
                  ? 'Audited econometric models. Macroeconomic and labour market analysis.'
                  : 'Modelos econométricos auditados. Análisis macroeconómico y de mercado laboral.'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0 pt-1">
              <CiteButton
                indicator={isEn ? 'Economic Simulators — Qhawarina' : 'Simuladores Económicos — Qhawarina'}
                isEn={isEn}
              />
              <ShareButton
                title={isEn ? 'Impact Simulators — Qhawarina' : 'Simuladores de Impacto — Qhawarina'}
                text={isEn
                  ? '🔬 Audited econometric simulators for Peru | Qhawarina\nhttps://qhawarina.pe/simuladores'
                  : '🔬 Simuladores econométricos auditados para Perú | Qhawarina\nhttps://qhawarina.pe/simuladores'}
              />
            </div>
          </div>

          {/* Tab nav */}
          <div
            className="flex rounded-2xl overflow-hidden p-1 gap-1"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            {TABS.map(({ key, label_es, label_en }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200"
                style={tab === key
                  ? { background: TERRACOTTA, color: '#fff', boxShadow: '0 2px 8px rgba(198,93,62,0.3)' }
                  : { background: 'transparent', color: '#78716c' }}
              >
                {isEn ? label_en : label_es}
              </button>
            ))}
          </div>
        </header>

        {/* ── TAB CONTENT ─────────────────────────────────────────────────────── */}
        {tab === 'macro'      && <TabMacro      isEn={isEn} />}
        {tab === 'mw'         && <TabMW         isEn={isEn} />}
        {tab === 'escenarios' && <TabEscenarios isEn={isEn} />}

        <SourceFooter />
      </div>
    </div>
  );
}
