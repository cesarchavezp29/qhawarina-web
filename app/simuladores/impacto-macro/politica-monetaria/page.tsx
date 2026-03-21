'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER,
  BETA_POV, BETA_RATE, CI_RATE_LO, CI_RATE_HI,
} from '../components/macroData';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

// IRF point estimates h=1..8 (Cholesky VAR(1), 1pp rate shock)
const TIMELINE_DATA = [
  { q: 'Q1', gdp: -0.055, peak: false },
  { q: 'Q2', gdp: -0.194, peak: false },
  { q: 'Q3', gdp: -0.195, peak: true  },
  { q: 'Q4', gdp: -0.172, peak: false },
  { q: 'Q5', gdp: -0.138, peak: false },
  { q: 'Q6', gdp: -0.104, peak: false },
  { q: 'Q7', gdp: -0.076, peak: false },
  { q: 'Q8', gdp: -0.054, peak: false },
];

const BASE = '/simuladores/impacto-macro';

export default function PoliticaMonetaria() {
  const isEn = useLocale() === 'en';
  const [bp, setBp] = useState(100);

  const gdpPoint   = BETA_RATE * (bp / 100);
  const gdpCiLo    = CI_RATE_LO * (bp / 100);
  const gdpCiHi    = CI_RATE_HI * (bp / 100);
  const povPoint   = gdpPoint * BETA_POV;
  const povCiLo    = Math.min(BETA_POV * gdpCiLo, BETA_POV * gdpCiHi);
  const povCiHi    = Math.max(BETA_POV * gdpCiLo, BETA_POV * gdpCiHi);
  const ciInclZero = gdpCiLo <= 0 && gdpCiHi >= 0;

  const fmtPP  = (v: number, dp = 2) => `${v >= 0 ? '+' : ''}${v.toFixed(dp)}pp`;
  const fmtBP  = (v: number) => `${v >= 0 ? '+' : ''}${v}${isEn ? 'bps' : 'pb'}`;

  const LITERATURE = [
    { author: 'Pérez Rojo & Rodríguez (2024)', method: 'TVP-VAR-SV recursivo', est: '−0.28pp' },
    { author: 'Castillo et al. (2016)',         method: 'SS-FAVAR',             est: '−0.30pp' },
    { author: 'Portilla et al. (2022)',          method: 'MI-TVP-VAR-SV',       est: '−0.25pp' },
    { author: isEn ? 'Our Cholesky VAR(1)' : 'Nuestro Cholesky VAR(1)', method: 'VAR(1), T=85, FWL', est: '−0.20pp' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Link href={BASE} className="hover:text-stone-600 transition-colors">
            {isEn ? 'Macro Impact' : 'Impacto Macro'}
          </Link>
          <span>›</span>
          <span style={{ color: '#d97706' }}>
            {isEn ? 'BCRP Rate' : 'Tasa BCRP'}
          </span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn
              ? 'What happens when the BCRP moves the interest rate?'
              : '¿Qué pasa cuando el BCRP mueve la tasa?'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Monetary policy and GDP in Peru: Cholesky VAR β=−0.195pp per 100bps (2004–2025)'
                : 'Política monetaria y PBI en Perú: VAR Cholesky β=−0.195pp por 100pb (2004–2025)'}
              isEn={isEn}
            />
            <ShareButton
              title={isEn ? 'BCRP monetary policy — Qhawarina' : 'Política monetaria del BCRP — Qhawarina'}
              text={isEn
                ? 'From the interest rate change to the poverty impact, step by step: monetary policy simulator for Peru. https://qhawarina.pe/simuladores/impacto-macro/politica-monetaria'
                : 'Del cambio en tasa de interés al impacto en pobreza: simulador de política monetaria para Perú. https://qhawarina.pe/simuladores/impacto-macro/politica-monetaria'}
            />
          </div>
        </div>
        <p className="text-lg text-stone-500 font-light">
          {isEn
            ? 'From the interest rate change to the poverty impact, step by step.'
            : 'Del cambio en tasa de interés al impacto en pobreza, paso a paso.'}
        </p>
        <div
          className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ background: '#d97706' }}
        >
          {isEn
            ? 'Level 2 — Point estimate · 90% CI includes zero'
            : 'Nivel 2 — Estimación puntual · IC 90% incluye cero'}
        </div>
      </section>

      {/* ── STATISTICAL WARNING ────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 space-y-2"
        style={{ background: '#fffbeb', border: `2px solid #fcd34d` }}
      >
        <div className="font-semibold text-amber-900">
          {isEn ? '⚠️ Statistical warning' : '⚠️ Advertencia estadística'}
        </div>
        <p className="text-sm text-amber-800 leading-relaxed">
          {isEn
            ? <>The rate→GDP relationship is <strong>not statistically significant</strong> with the available data. 90% bootstrap CI: [{fmtPP(CI_RATE_LO)}, {fmtPP(CI_RATE_HI)}] per 100bps — includes zero at all horizons h=0..8 with T=85 quarters. The point estimate (−0.20pp) is consistent with the Peruvian literature (−0.20 to −0.30pp), but cannot be statistically distinguished from zero.</>
            : <>La relación tasa→PBI <strong>no es estadísticamente significativa</strong> con los datos disponibles. IC 90% bootstrap: [{fmtPP(CI_RATE_LO)}, {fmtPP(CI_RATE_HI)}] por 100pb — incluye cero a todos los horizontes h=0..8 con T=85 trimestres. La estimación puntual (−0.20pp) es consistente con la literatura peruana (−0.20 a −0.30pp), pero no puede distinguirse estadísticamente de cero.</>}
        </p>
      </div>

      {/* ── SIMULATOR ──────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-8">

        {/* Slider */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <div>
              <h2 className="text-base font-bold text-stone-800">
                {isEn ? 'Rate change (basis points)' : 'Cambio en tasa (puntos base)'}
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                {isEn
                  ? 'BCRP policy rate · reference: 4.25% (Mar. 2026)'
                  : 'Tasa de política del BCRP · referencia: 4.25% (mar. 2026)'}
              </p>
            </div>
            <input
              type="range" min="-300" max="300" step="25" value={bp}
              onChange={e => setBp(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: TERRACOTTA }}
            />
            <div className="flex justify-between text-xs text-stone-400">
              <span>−300{isEn ? 'bps' : 'pb'}</span><span>+300{isEn ? 'bps' : 'pb'}</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="number" step="25" value={bp} min="-300" max="300"
                onChange={e => setBp(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-xl border text-center font-bold text-lg"
                style={{ borderColor: CARD_BORDER, background: CARD_BG }}
              />
              <span className="text-sm text-stone-400">{isEn ? 'bps' : 'pb'}</span>
            </div>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: '#fffbeb', border: `1px solid #fcd34d` }}
          >
            <div className="text-xs font-bold text-amber-800 mb-1 uppercase tracking-wide">
              {isEn ? 'Level 2 — Point Estimate Only' : 'Nivel 2 — Solo Estimación Puntual'}
            </div>
            <p className="text-xs text-amber-700">
              {isEn
                ? 'Bootstrap 90% CI includes zero at all horizons h=0..8 (T=85, R²_GDP=0.056). Literature: −0.20 to −0.30pp. Results consistent but not individually significant.'
                : 'IC 90% bootstrap incluye cero en todos los horizontes h=0..8 (T=85, R²_PBI=0.056). Literatura: −0.20 a −0.30pp. Resultados consistentes pero no significativos individualmente.'}
            </p>
          </div>
        </div>

        {/* Two-step chain */}
        <div className="lg:col-span-3 space-y-4">

          {/* Step 1 */}
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: CARD_BG, border: `2px solid #fcd34d` }}
          >
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wide">
              {isEn ? 'Step 1: Rate → GDP' : 'Paso 1: Tasa → PBI'}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black" style={{ color: gdpPoint <= 0 ? '#dc2626' : TEAL }}>
                {fmtPP(gdpPoint)}
              </span>
              <span className="text-xs text-stone-400">{isEn ? 'GDP' : 'PBI'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: isEn ? 'Lower CI' : 'IC inf.', val: Math.min(gdpCiLo, gdpCiHi) },
                { label: isEn ? 'Point est.' : 'Est. puntual', val: gdpPoint, bold: true },
                { label: isEn ? 'Upper CI' : 'IC sup.', val: Math.max(gdpCiLo, gdpCiHi) },
              ].map(({ label, val, bold }) => (
                <div
                  key={label}
                  className="rounded-xl p-2"
                  style={{ background: bold ? '#fef3c7' : '#fffbeb', border: `1px solid #fcd34d` }}
                >
                  <div className="text-xs text-amber-600">{label}</div>
                  <div className={`font-${bold ? 'bold' : 'medium'} text-amber-900 text-sm`}>{fmtPP(val)}</div>
                </div>
              ))}
            </div>
            {ciInclZero && (
              <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
                {isEn
                  ? '↑ CI includes zero — cannot reject the null effect on GDP'
                  : '↑ IC incluye cero — no se puede rechazar el efecto nulo sobre el PBI'}
              </div>
            )}
          </div>

          <div className="text-center text-2xl text-stone-300">↓</div>

          {/* Step 2 */}
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: CARD_BG, border: `2px solid ${TEAL}40` }}
          >
            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: TEAL }}>
              {isEn ? 'Step 2: GDP → Poverty (chained)' : 'Paso 2: PBI → Pobreza (encadenado)'}
            </div>
            <p className="text-xs text-stone-400">
              {isEn
                ? `GDP ${fmtPP(gdpPoint)} × β_poverty (−0.656) = poverty impact — Step 1 uncertainty propagates fully`
                : `PBI ${fmtPP(gdpPoint)} × β_pobreza (−0.656) = impacto pobreza — incertidumbre del Paso 1 se propaga completa`}
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black" style={{ color: povPoint >= 0 ? '#dc2626' : TEAL }}>
                {fmtPP(povPoint)}
              </span>
              <span className="text-xs text-stone-400">{isEn ? 'poverty' : 'pobreza'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: isEn ? 'Lower CI' : 'IC inf.', val: povCiLo },
                { label: isEn ? 'Point est.' : 'Est. puntual', val: povPoint, bold: true },
                { label: isEn ? 'Upper CI' : 'IC sup.', val: povCiHi },
              ].map(({ label, val, bold }) => (
                <div
                  key={label}
                  className="rounded-xl p-2"
                  style={{ background: bold ? '#f5f5f4' : '#fafaf9', border: `1px solid ${CARD_BORDER}` }}
                >
                  <div className="text-xs text-stone-400">{label}</div>
                  <div className={`font-${bold ? 'bold' : 'medium'} text-stone-800 text-sm`}>{fmtPP(val)}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
              {isEn
                ? `Compounded uncertainty: the GDP CI (which includes zero) is inherited here. Range [${fmtPP(povCiLo)}, ${fmtPP(povCiHi)}].`
                : `Incertidumbre compuesta: el IC del PBI (que incluye cero) se hereda aquí. Rango [${fmtPP(povCiLo)}, ${fmtPP(povCiHi)}].`}
            </div>
          </div>
        </div>
      </div>

      {/* ── TIMELINE OF IMPACT ──────────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <div>
            <h3 className="font-semibold text-stone-800">
              {isEn ? 'When is the effect felt?' : '¿Cuándo se siente el efecto?'}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              {isEn
                ? 'Quarterly trajectory of GDP impact following a +100bps BCRP rate shock (point estimate)'
                : 'Trayectoria trimestral del impacto en PBI ante +100pb en tasa BCRP (estimación puntual)'}
            </p>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={TIMELINE_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
              barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" strokeWidth={0.5} vertical={false} />
              <XAxis dataKey="q" tick={{ fontSize: 11, fill: '#a8a29e' }} stroke="#a8a29e" />
              <YAxis
                tick={{ fontSize: 10, fill: '#a8a29e' }} stroke="#a8a29e"
                domain={[-0.25, 0.05]}
                tickFormatter={(v: number) => `${v.toFixed(2)}`}
                width={40}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${CARD_BORDER}`, background: CARD_BG }}
                formatter={(v: any) => [`${Number(v).toFixed(3)}pp`, isEn ? 'GDP response' : 'Respuesta PBI']}
                labelFormatter={(v: any) => `${isEn ? 'Horizon' : 'Horizonte'}: ${v}`}
              />
              <ReferenceLine y={0} stroke="#78716c" strokeWidth={1} />
              <Bar dataKey="gdp" radius={[4, 4, 0, 0]}>
                {TIMELINE_DATA.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={entry.peak ? TERRACOTTA : TEAL}
                    fillOpacity={entry.peak ? 1 : 0.65}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: TERRACOTTA }} />
              <span className="text-stone-600 font-semibold">
                {isEn ? 'Peak effect: Q3 (−0.195pp)' : 'Máximo efecto: Q3 (−0.195pp)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: TEAL, opacity: 0.65 }} />
              <span className="text-stone-500">
                {isEn ? 'Effect dissipates after ~6 quarters' : 'El efecto se disipa después de ~6 trimestres'}
              </span>
            </div>
          </div>

          <div className="rounded-lg px-3 py-2 text-xs text-amber-700 border border-amber-200"
            style={{ background: '#fffbeb' }}>
            <strong>{isEn ? 'Note:' : 'Nota:'}</strong>{' '}
            {isEn
              ? <>The 90% CI includes zero at all horizons. This visualization shows the <em>temporal dynamics of the point estimate</em>. See <Link href="/simuladores/impacto-macro/metodologia" className="underline">Methodology</Link> for full intervals and the Cholesky vs LP comparative analysis.</>
              : <>El IC 90% incluye cero en todos los horizontes. Esta visualización muestra la <em>dinámica temporal de la estimación puntual</em>. Ver <Link href="/simuladores/impacto-macro/metodologia" className="underline">Metodología</Link> para intervalos completos y el análisis comparativo Cholesky vs LP.</>}
          </div>
        </div>
      </FadeSection>

      {/* ── WHY SO MUCH UNCERTAINTY ────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h3 className="font-bold text-stone-800">
            {isEn ? 'Why so much uncertainty?' : '¿Por qué tanta incertidumbre?'}
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            {isEn
              ? 'With 85 quarters of data (2004–2025), the relationship between the interest rate and GDP does not reach statistical significance in our model. This is normal — the effects of monetary policy are difficult to isolate because the BCRP raises rates when the economy is already growing strongly (and vice versa). We tested 7 different identification strategies: only Cholesky recursive identification produces robust results.'
              : 'Con 85 trimestres de datos (2004–2025), la relación entre tasa de interés y PBI no alcanza significancia estadística en nuestro modelo. Esto es normal — los efectos de la política monetaria son difíciles de aislar porque el BCRP sube la tasa cuando la economía ya está creciendo fuerte (y viceversa). Probamos 7 estrategias de identificación distintas: solo la identificación recursiva de Cholesky produce resultados robustos.'}
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            {isEn
              ? <>Three independent studies for Peru find similar effects (−0.20 to −0.30pp), suggesting the point estimate is <strong>reasonable though imprecise</strong>.</>
              : <>Tres estudios independientes para Perú encuentran efectos similares (−0.20 a −0.30pp), lo que sugiere que la estimación puntual es <strong>razonable aunque imprecisa</strong>.</>}
          </p>

          {/* Literature table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                  <th className="text-left py-2 px-3 text-stone-500 font-semibold">
                    {isEn ? 'Study' : 'Estudio'}
                  </th>
                  <th className="text-left py-2 px-3 text-stone-500 font-semibold">
                    {isEn ? 'Method' : 'Método'}
                  </th>
                  <th className="text-right py-2 px-3 text-stone-500 font-semibold">
                    {isEn ? 'Estimate' : 'Estimación'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {LITERATURE.map((row, i) => (
                  <tr
                    key={row.author}
                    style={{
                      borderBottom: `1px solid ${CARD_BORDER}`,
                      background: i === LITERATURE.length - 1 ? '#fef3c7' : 'transparent',
                    }}
                  >
                    <td className="py-2 px-3 text-stone-700 font-medium">{row.author}</td>
                    <td className="py-2 px-3 text-stone-500">{row.method}</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: TERRACOTTA }}>{row.est}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-400">
            {isEn
              ? 'Highlighted row = our result (Cholesky VAR(1), T=85, FWL COVID Q1+Q2 2020).'
              : 'Fila resaltada = nuestro resultado (Cholesky VAR(1), T=85, FWL COVID Q1+Q2 2020).'}
          </p>
        </div>
      </FadeSection>

      {/* ── NEXT ───────────────────────────────────────────────────────────── */}
      <div className="text-right">
        <Link
          href={`${BASE}/tipo-cambio`}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: TERRACOTTA }}
        >
          {isEn ? 'Next: Exchange Rate →' : 'Siguiente: Tipo de Cambio →'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
