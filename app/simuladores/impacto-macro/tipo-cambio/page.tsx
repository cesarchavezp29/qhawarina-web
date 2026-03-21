'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Label,
} from 'recharts';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, AMBER, CARD_BG, CARD_BORDER, BETA_FX, CI_FX_LO, CI_FX_HI,
} from '../components/macroData';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

const BASE = '/simuladores/impacto-macro';

const CHART_DATA = Array.from({ length: 41 }, (_, i) => ({
  fx: i,
  cpi: BETA_FX * (i / 10),
}));

export default function TipoDeCambio() {
  const isEn = useLocale() === 'en';
  const [fx, setFx] = useState(10);

  const cpiImpact = BETA_FX * (fx / 10);
  const ciLo      = CI_FX_LO * (fx / 10);
  const ciHi      = CI_FX_HI * (fx / 10);
  const fmtPP = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(3)}pp`;

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
            {isEn ? 'Exchange Rate' : 'Tipo de Cambio'}
          </span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn
              ? 'How much does inflation rise if the sol depreciates?'
              : '¿Cuánto sube la inflación si el sol se deprecia?'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Exchange rate pass-through to inflation in Peru: β=+0.237pp per 10% depreciation (LP OLS h=1, 2004–2025)'
                : 'Traslado cambiario a inflación en Perú: β=+0.237pp por 10% de depreciación (LP MCO h=1, 2004–2025)'}
              isEn={isEn}
            />
            <ShareButton
              title={isEn ? 'Exchange rate and inflation in Peru — Qhawarina' : 'Tipo de cambio e inflación en Perú — Qhawarina'}
              text={isEn
                ? 'How much does inflation rise if the sol depreciates? Short-run exchange rate pass-through to prices in Peru. https://qhawarina.pe/simuladores/impacto-macro/tipo-cambio'
                : '¿Cuánto sube la inflación si el sol se deprecia? Traslado cambiario a precios en el corto plazo para Perú. https://qhawarina.pe/simuladores/impacto-macro/tipo-cambio'}
            />
          </div>
        </div>
        <p className="text-lg text-stone-500 font-light">
          {isEn
            ? 'Exchange rate pass-through to prices in the short run.'
            : 'El traslado cambiario a precios en el corto plazo.'}
        </p>
        <div
          className="inline-block rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ background: '#d97706' }}
        >
          {isEn
            ? 'Level 2 — Significant · LP OLS h=1 HAC · β=+0.237'
            : 'Nivel 2 — Significativo · LP MCO h=1 HAC · β=+0.237'}
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
                {isEn ? 'Exchange rate depreciation (%)' : 'Depreciación cambiaria (%)'}
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                {isEn
                  ? 'SOL/USD from current level · reference: S/3.72 (Mar. 2026)'
                  : 'SOL/USD desde nivel actual · referencia: S/3.72 (mar. 2026)'}
              </p>
            </div>
            <input
              type="range" min="0" max="40" step="0.5" value={fx}
              onChange={e => setFx(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: TERRACOTTA }}
            />
            <div className="flex justify-between text-xs text-stone-400">
              <span>0%</span><span>40%</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="number" step="0.5" value={fx} min="0" max="40"
                onChange={e => setFx(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-xl border text-center font-bold text-lg"
                style={{ borderColor: CARD_BORDER, background: CARD_BG }}
              />
              <span className="text-sm text-stone-400">%</span>
            </div>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: '#fffbeb', border: `1px solid #fcd34d` }}
          >
            <div className="text-xs font-bold text-amber-800 mb-1 uppercase tracking-wide">
              {isEn ? 'Level 2 — Significant' : 'Nivel 2 — Significativo'}
            </div>
            <p className="text-xs text-amber-700">
              {isEn
                ? 'β=+0.237pp per 10% depreciation. Significant in LP h=1 (HAC SE). Source: LP OLS h=1, T=85, quarterly BCRP data.'
                : 'β=+0.237pp por cada 10% de depreciación. Significativo en LP h=1 (SE HAC). Fuente: LP MCO h=1, T=85, datos BCRP trimestrales.'}
            </p>
          </div>
        </div>

        {/* Impact */}
        <div className="lg:col-span-3 space-y-4">
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <h2 className="text-base font-bold text-stone-700">
              {isEn ? 'CPI impact at h=1 quarter (pp)' : 'Impacto IPC en h=1 trimestre (pp)'}
            </h2>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black" style={{ color: AMBER }}>
                {fmtPP(cpiImpact)}
              </span>
              <span className="text-stone-400 text-sm">
                {isEn ? 'quarterly CPI increase' : 'alza IPC trimestral'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: isEn ? 'Lower CI (90%)' : 'IC inferior (90%)', val: ciLo,      bold: false },
                { label: isEn ? 'Point estimate'  : 'Estimación puntual', val: cpiImpact, bold: true  },
                { label: isEn ? 'Upper CI (90%)' : 'IC superior (90%)', val: ciHi,      bold: false },
              ].map(({ label, val, bold }) => (
                <div
                  key={label}
                  className="rounded-xl p-3"
                  style={{
                    background: bold ? '#fef9eb' : '#fafaf9',
                    border: `1px solid ${bold ? '#fcd34d' : CARD_BORDER}`,
                  }}
                >
                  <div className="text-xs text-stone-400 mb-1">{label}</div>
                  <div
                    className={`text-lg ${bold ? 'font-black' : 'font-semibold'}`}
                    style={{ color: AMBER }}
                  >
                    {fmtPP(val)}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-stone-400 font-mono">
              {isEn ? 'ΔCPI' : 'ΔIPC'} = {BETA_FX} × ({fx.toFixed(1)} / 10) = {fmtPP(cpiImpact)}
              {'  ·  '}{isEn ? '90% CI' : 'IC 90%'}: [{fmtPP(ciLo)}, {fmtPP(ciHi)}]
            </div>
          </div>
        </div>
      </div>

      {/* ── CHART ──────────────────────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-6"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h3 className="text-base font-bold text-stone-700 mb-4">
            {isEn ? 'CPI Impact vs. Exchange Rate Depreciation' : 'Impacto IPC vs Depreciación TC'}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={CHART_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" strokeWidth={0.5} />
              <XAxis dataKey="fx" tick={{ fontSize: 10, fill: '#a8a29e' }} stroke="#a8a29e"
                tickFormatter={v => `${v}%`}>
                <Label
                  value={isEn ? 'Exchange rate depreciation (%)' : 'Depreciación TC (%)'}
                  offset={-12} position="insideBottom"
                  style={{ fontSize: 10, fill: '#a8a29e' }} />
              </XAxis>
              <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} stroke="#a8a29e"
                tickFormatter={v => `${v.toFixed(2)}pp`}>
                <Label
                  value={isEn ? 'ΔCPI (pp)' : 'ΔIPC (pp)'}
                  angle={-90} position="insideLeft" offset={15}
                  style={{ fontSize: 10, fill: '#a8a29e' }} />
              </YAxis>
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${CARD_BORDER}`, background: CARD_BG }}
                formatter={(v: any) => [`${Number(v).toFixed(3)}pp`, isEn ? 'CPI impact' : 'Impacto IPC']}
                labelFormatter={v => `${isEn ? 'Depreciation' : 'Depreciación'}: ${v}%`}
              />
              <Line type="monotone" dataKey="cpi" stroke={AMBER} strokeWidth={2} dot={false} />
              <ReferenceLine x={fx} stroke={TERRACOTTA} strokeDasharray="4 4"
                label={{ value: `${fx}%`, fontSize: 10, fill: TERRACOTTA }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </FadeSection>

      {/* ── CONTEXT ────────────────────────────────────────────────────────── */}
      <FadeSection className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 space-y-2"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <div className="font-bold text-stone-800 text-sm">
            {isEn ? 'Short run only' : 'Solo el corto plazo'}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {isEn
              ? <>This is the <strong>short-run</strong> pass-through (one quarter, h=1). Over longer horizons, the effect may accumulate. The BCRP actively intervenes in the foreign exchange market to smooth sharp fluctuations in the sol.</>
              : <>Este es el traslado de <strong>corto plazo</strong> (un trimestre, h=1). A plazos más largos, el efecto puede acumularse. El BCRP interviene activamente en el mercado cambiario para suavizar fluctuaciones bruscas del sol.</>}
          </p>
        </div>
        <div className="rounded-2xl p-5 space-y-2"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <div className="font-bold text-stone-800 text-sm">
            {isEn ? 'Why don\'t we estimate FX → Poverty?' : '¿Por qué no estimamos TC → Pobreza?'}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {isEn
              ? 'We do not estimate the exchange rate → GDP → Poverty channel because the FX→GDP relationship is not well identified in the data: causality runs in both directions (GDP moves the exchange rate, not only the other way around). The BCRP DSGE model estimates −0.12pp per 10%, used only as a reference.'
              : 'No estimamos el canal tipo de cambio → PBI → Pobreza porque la relación TC→PBI no está bien identificada en los datos: la causalidad es inversa (el PBI mueve el tipo de cambio, no solo al revés). El BCRP DSGE estima −0.12pp por 10%, usado solo como referencia.'}
          </p>
        </div>
      </FadeSection>

      {/* ── NEXT ───────────────────────────────────────────────────────────── */}
      <div className="text-right">
        <Link
          href={`${BASE}/escenarios`}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: TERRACOTTA }}
        >
          {isEn ? 'Next: Scenarios →' : 'Siguiente: Escenarios →'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
