'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Label,
} from 'recharts';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER,
  BETA_POV, ALPHA_POV, RMSE, N_OBS, X_MEAN, SXX, X_MIN_OBS, X_MAX_OBS,
  SCATTER_DATA, REG_LINE, PI_UPPER, PI_LOWER,
} from '../components/macroData';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

const BASE = '/simuladores/impacto-macro';

export default function CrecimientoPobreza() {
  const isEn = useLocale() === 'en';
  const [gdp, setGdp] = useState(3.0);

  const impact      = BETA_POV * gdp;
  const sePred      = RMSE * Math.sqrt(1 / N_OBS + Math.pow(gdp - X_MEAN, 2) / SXX);
  const ciLo        = impact - 1.645 * sePred;
  const ciHi        = impact + 1.645 * sePred;
  const outOfSample = gdp < X_MIN_OBS || gdp > X_MAX_OBS;

  const fmtPP  = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}pp`;
  const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Link href={BASE} className="hover:text-stone-600 transition-colors">
            {isEn ? 'Macro Impact' : 'Impacto Macro'}
          </Link>
          <span>›</span>
          <span style={{ color: TEAL }}>{isEn ? 'Poverty' : 'Pobreza'}</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
              {isEn
                ? 'How much does poverty change when GDP grows?'
                : '¿Cuánto cambia la pobreza cuando crece el PBI?'}
            </h1>
            <p className="text-lg text-stone-500 mt-2 font-light">
              {isEn
                ? 'Our most robust estimate: each percentage point of growth reduces poverty by 0.66 percentage points.'
                : 'Nuestra estimación más robusta: cada punto de crecimiento reduce la pobreza en 0.66 puntos porcentuales.'}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Growth-poverty elasticity in Peru: β=−0.656 (OLS, ENAHO 2005–2024)'
                : 'Elasticidad crecimiento-pobreza en Perú: β=−0.656 (MCO, ENAHO 2005–2024)'}
              isEn={isEn}
            />
            <ShareButton
              title={isEn ? 'Growth and poverty in Peru — Qhawarina' : 'Crecimiento y pobreza en Perú — Qhawarina'}
              text={isEn
                ? 'Each percentage point of GDP growth reduces poverty by 0.66pp. Robust estimate for Peru 2005–2024. https://qhawarina.pe/simuladores/impacto-macro/crecimiento-pobreza'
                : 'Cada punto de crecimiento del PBI reduce la pobreza en 0.66pp. Estimación robusta para Perú 2005–2024. https://qhawarina.pe/simuladores/impacto-macro/crecimiento-pobreza'}
            />
          </div>
        </div>
        <div
          className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ background: TEAL }}
        >
          {isEn
            ? 'Level 1 — High confidence · β=−0.656 · R²=0.669 · p<0.0001'
            : 'Nivel 1 — Alta confianza · β=−0.656 · R²=0.669 · p<0.0001'}
        </div>
      </section>

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
                {isEn ? 'GDP growth assumption' : 'Supuesto de crecimiento del PBI'}
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                {isEn ? 'Real annual growth (%)' : 'Crecimiento anual real (%)'}
              </p>
            </div>
            <input
              type="range" min="-6" max="9" step="0.1" value={gdp}
              onChange={e => setGdp(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: TERRACOTTA }}
            />
            <div className="flex justify-between text-xs text-stone-400">
              <span>−6%</span><span>+9%</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="number" step="0.1" value={gdp} min="-6" max="9"
                onChange={e => setGdp(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-xl border text-center font-bold text-lg"
                style={{ borderColor: CARD_BORDER, background: CARD_BG }}
              />
              <span className="text-sm text-stone-400">%</span>
            </div>
            <div className="text-xs text-stone-400 text-center">
              {isEn ? 'Sample range: −1% to 10.5%' : 'Rango muestral: −1% a 10.5%'}
            </div>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: '#f0fdf4', border: `1px solid #86efac` }}
          >
            <div className="text-xs font-bold text-green-800 mb-1 uppercase tracking-wide">
              {isEn ? 'Level 1 — High Confidence' : 'Nivel 1 — Alta Confianza'}
            </div>
            <p className="text-xs text-green-700">
              β=−0.656, R²=0.669, N=18, p&lt;0.0001.
              {isEn
                ? ' Stable across sub-periods: 2005–2014 β=−0.46 · 2015–2024 β=−0.72.'
                : ' Estable entre sub-períodos: 2005–2014 β=−0.46 · 2015–2024 β=−0.72.'}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {isEn ? 'Source: OLS on ENAHO 2005–2024, excl. 2020–2021.' : 'Fuente: MCO sobre ENAHO 2005–2024, excl. 2020–2021.'}
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <h2 className="text-base font-bold text-stone-700">
              {isEn
                ? 'Poverty impact (Δ percentage points)'
                : 'Impacto en pobreza (Δ puntos porcentuales)'}
            </h2>

            <div className="flex items-baseline gap-3">
              <span
                className="text-5xl font-black"
                style={{ color: impact > 0 ? '#dc2626' : TEAL }}
              >
                {fmtPP(impact)}
              </span>
              <span className="text-stone-400 text-sm">
                {impact < 0
                  ? (isEn ? 'reduction' : 'reducción')
                  : impact > 0
                    ? (isEn ? 'increase' : 'aumento')
                    : (isEn ? 'no change' : 'sin cambio')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: isEn ? 'Lower CI (90%)' : 'IC inferior (90%)', val: Math.min(ciLo, ciHi), bold: false },
                { label: isEn ? 'Point estimate'  : 'Estimación puntual', val: impact, bold: true  },
                { label: isEn ? 'Upper CI (90%)' : 'IC superior (90%)', val: Math.max(ciLo, ciHi), bold: false },
              ].map(({ label, val, bold }) => (
                <div
                  key={label}
                  className="rounded-xl p-3"
                  style={{
                    background: bold ? '#f5f5f4' : '#fafaf9',
                    border: `1px solid ${bold ? '#d6d3d1' : CARD_BORDER}`,
                  }}
                >
                  <div className="text-xs text-stone-400 mb-1">{label}</div>
                  <div
                    className={`text-lg ${bold ? 'font-black' : 'font-semibold'}`}
                    style={{ color: val > 0 ? '#dc2626' : val < 0 ? TEAL : '#44403c' }}
                  >
                    {fmtPP(val)}
                  </div>
                </div>
              ))}
            </div>

            {outOfSample && (
              <div
                className="rounded-xl p-3 text-xs"
                style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' }}
              >
                {isEn
                  ? `⚠️ GDP ${fmtPct(gdp)} is outside the observed sample range (${X_MIN_OBS}% to ${X_MAX_OBS}%). Out-of-sample extrapolation — intervals are wider and reliability decreases.`
                  : `⚠️ PBI ${fmtPct(gdp)} está fuera del rango muestral observado (${X_MIN_OBS}% a ${X_MAX_OBS}%). Extrapolación fuera de muestra — los intervalos son más amplios y la confiabilidad disminuye.`}
              </div>
            )}

            <div className="text-xs text-stone-400 text-center font-mono">
              {isEn ? 'ΔPoverty' : 'ΔPobreza'} = {BETA_POV} × {gdp.toFixed(1)} = {fmtPP(impact)}
              {'  ·  '}
              {isEn
                ? '90% CI uses prediction interval (widens when extrapolating)'
                : 'IC 90% usa intervalo de predicción (se amplía al extrapolar)'}
            </div>
          </div>
        </div>
      </div>

      {/* ── SCATTER CHART ──────────────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-6"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h3 className="text-base font-bold text-stone-700 mb-1">
            {isEn ? 'Regression data (N=18)' : 'Datos de la regresión (N=18)'}
          </h3>
          <p className="text-xs text-stone-400 mb-4">
            {isEn
              ? 'Annual GDP growth (%) vs. change in poverty rate (pp). ENAHO 2005–2024, excluding 2020–2021. Dashed lines = 90% prediction interval.'
              : 'Crecimiento anual del PBI (%) vs. variación de la tasa de pobreza (pp). ENAHO 2005–2024, excluyendo 2020–2021. Líneas punteadas = intervalo de predicción 90%.'}
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart margin={{ top: 10, right: 20, left: 10, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" strokeWidth={0.5} />
              <XAxis
                dataKey="x" type="number" domain={[-2, 10.5]}
                tick={{ fontSize: 10, fill: '#a8a29e' }} stroke="#a8a29e"
                tickFormatter={v => `${v}%`}
              >
                <Label value={isEn ? 'GDP growth (%)' : 'Crecimiento PBI (%)'} offset={-12} position="insideBottom"
                  style={{ fontSize: 10, fill: '#a8a29e' }} />
              </XAxis>
              <YAxis
                type="number" domain={[-8, 3]}
                ticks={[-8, -6, -4, -2, 0, 2]}
                tick={{ fontSize: 10, fill: '#a8a29e' }} stroke="#a8a29e"
                tickFormatter={v => `${v}pp`}
              >
                <Label value={isEn ? 'Δ Poverty (pp)' : 'Δ Pobreza (pp)'} angle={-90} position="insideLeft" offset={15}
                  style={{ fontSize: 10, fill: '#a8a29e' }} />
              </YAxis>
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${CARD_BORDER}`, background: CARD_BG }}
                formatter={(val: any) => [`${Number(val).toFixed(2)}pp`, '']}
                labelFormatter={(_, payload) => {
                  const pt = payload?.[0]?.payload;
                  return pt?.year ? `${pt.year} · ${isEn ? 'GDP' : 'PBI'}: ${pt.gdp?.toFixed(1)}%` : '';
                }}
              />
              <Line data={PI_UPPER} dataKey="upper" dot={false} stroke={TERRACOTTA}
                strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5} legendType="none" />
              <Line data={PI_LOWER} dataKey="lower" dot={false} stroke={TERRACOTTA}
                strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5} legendType="none" />
              <Line data={REG_LINE} dataKey="central" dot={false} stroke={TERRACOTTA}
                strokeWidth={2} legendType="none" />
              <Scatter
                data={[{ x: gdp, scatter: ALPHA_POV + BETA_POV * gdp }]}
                dataKey="scatter" fill={TERRACOTTA} r={9} />
              <Scatter
                data={SCATTER_DATA.map(d => ({ x: d.gdp, scatter: d.dpov, year: d.year, gdp: d.gdp }))}
                dataKey="scatter" fill={TEAL} r={4} opacity={0.8} />
              <ReferenceLine y={0} stroke="#a8a29e" strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-stone-400 mt-2 text-center">
            {isEn
              ? 'Teal dots = observed data · Terra dot = your assumption · Dashed lines = 90% prediction CI'
              : 'Puntos teal = datos observados · Punto terra = tu supuesto · Líneas punteadas = IC predicción 90%'}
          </p>
        </div>
      </FadeSection>

      {/* ── CONTEXT CARDS ──────────────────────────────────────────────────── */}
      <FadeSection className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 space-y-2"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <div className="font-bold text-stone-800 text-sm">
            {isEn ? 'Is this relationship stable?' : '¿Es estable esta relación?'}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {isEn
              ? <>Yes. Sub-periods: <strong>2005–2014 β=−0.46</strong> · <strong>2015–2024 β=−0.72</strong>. No structural break detected. The elasticity has become somewhat stronger in the recent period.</>
              : <>Sí. Sub-períodos: <strong>2005–2014 β=−0.46</strong> · <strong>2015–2024 β=−0.72</strong>. No hay quiebre estructural detectado. La elasticidad se ha vuelto algo más fuerte en el período reciente.</>}
          </p>
        </div>
        <div className="rounded-2xl p-5 space-y-2"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <div className="font-bold text-stone-800 text-sm">
            {isEn ? 'What does it not capture?' : '¿Qué no captura?'}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {isEn
              ? 'Direct transfers (Juntos, Pensión 65) that reduce poverty independently of GDP. Distributive changes such as the K-recovery post-COVID. Regional sectoral factors.'
              : 'Transferencias directas (Juntos, Pensión 65) que reducen pobreza independientemente del PBI. Cambios distributivos como la recuperación en K post-COVID. Factores sectoriales regionales.'}
          </p>
        </div>
        <div className="rounded-2xl p-5 space-y-2"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <div className="font-bold text-stone-800 text-sm">
            {isEn ? 'Source' : 'Fuente'}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {isEn
              ? 'OLS on ENAHO 2005–2024, excluding 2020–2021 (COVID). N=18 years. R²=0.669, SE=0.115, t=−5.69, p<0.0001. Outliers: 2009 (Juntos), 2022 (K-recovery).'
              : 'MCO sobre ENAHO 2005–2024, excluyendo 2020–2021 (COVID). N=18 años. R²=0.669, SE=0.115, t=−5.69, p<0.0001. Atípicos: 2009 (Juntos), 2022 (recuperación en K).'}
          </p>
        </div>
      </FadeSection>

      {/* ── NEXT ───────────────────────────────────────────────────────────── */}
      <div className="text-right">
        <Link
          href={`${BASE}/politica-monetaria`}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: TERRACOTTA }}
        >
          {isEn ? 'Next: Monetary Policy →' : 'Siguiente: Política Monetaria →'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
