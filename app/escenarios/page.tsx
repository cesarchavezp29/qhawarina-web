"use client";

import { useState } from "react";
import { useLocale } from 'next-intl';
import FadeSection from '../simuladores/impacto-macro/components/FadeSection';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER,
} from '../simuladores/impacto-macro/components/macroData';

// Audited elasticities — full_audit_output.txt, 2026-03-19
const BETA_POV   = -0.656;   // pp poverty per 1pp annual GDP growth (OLS, ENAHO, N=18, R²=0.669)
const CI90_LO    = -0.847;   // 90% CI lower bound on poverty β
const CI90_HI    = -0.466;   // 90% CI upper bound on poverty β
const BETA_RATE  = -0.195;   // pp GDP per 100bp rate hike (Cholesky VAR, T=85)
const CI_RATE_LO = -0.698;   // 90% bootstrap CI low (includes zero)
const CI_RATE_HI =  0.271;   // 90% bootstrap CI high (includes zero)

type Preset = 'custom' | 'bcrp_hike' | 'bcrp_cut' | 'mild_recession' | 'strong_growth';

const PRESETS: Record<Preset, { gdp: number; label_es: string; label_en: string; note_es: string; note_en: string }> = {
  custom:        { gdp: 3.0,   label_es: 'Personalizado',          label_en: 'Custom',               note_es: 'Ingresa tu propio supuesto de crecimiento.', note_en: 'Enter your own growth assumption.' },
  bcrp_hike:     { gdp: -0.195, label_es: 'BCRP +100pb (alza)',     label_en: 'BCRP +100bp (hike)',    note_es: 'Cholesky VAR(1): tasa→PBI −0.195pp. IC 90% [−0.698, +0.271] incluye cero.', note_en: 'Cholesky VAR(1): rate→GDP −0.195pp. 90% CI [−0.698, +0.271] includes zero.' },
  bcrp_cut:      { gdp:  0.195, label_es: 'BCRP −100pb (recorte)',  label_en: 'BCRP −100bp (cut)',     note_es: 'Simétrico al alza: PBI +0.195pp (mismo IC incluye cero).', note_en: 'Symmetric to hike: GDP +0.195pp (same CI includes zero).' },
  mild_recession: { gdp: -1.5, label_es: 'Desaceleración (−1.5pp)', label_en: 'Slowdown (−1.5pp)',    note_es: 'PBI cae 1.5pp respecto al baseline (supuesto externo).', note_en: 'GDP falls 1.5pp from baseline (external assumption).' },
  strong_growth:  { gdp:  5.5, label_es: 'Crecimiento fuerte (+5.5%)', label_en: 'Strong growth (+5.5%)', note_es: 'Supuesto de aceleración (e.g., boom de commodities).', note_en: 'Acceleration assumption (e.g., commodity boom).' },
};

export default function EscenariosPage() {
  const isEn = useLocale() === 'en';
  const [preset, setPreset] = useState<Preset>('bcrp_hike');
  const [gdp, setGdp]       = useState<number>(PRESETS['bcrp_hike'].gdp);

  const handlePreset = (p: Preset) => {
    setPreset(p);
    setGdp(PRESETS[p].gdp);
  };

  const isCustom = preset === 'custom';
  const isBcrpHike = preset === 'bcrp_hike';
  const isBcrpCut  = preset === 'bcrp_cut';
  const isRatePreset = isBcrpHike || isBcrpCut;

  // GDP CI (rate presets only — flips sign for cut)
  const gdpCiLo = CI_RATE_LO * (isBcrpHike ? 1 : isBcrpCut ? -1 : 0);
  const gdpCiHi = CI_RATE_HI * (isBcrpHike ? 1 : isBcrpCut ? -1 : 0);

  // Poverty impact
  const povPoint = BETA_POV * gdp;

  // For rate presets: propagate the full GDP CI through β_poverty.
  // β is negative, so GDP_CI_high → most negative poverty change, GDP_CI_low → most positive.
  // For non-rate presets: GDP is a fixed assumption; CI comes from β uncertainty only.
  const povLo = isRatePreset
    ? Math.min(BETA_POV * gdpCiLo, BETA_POV * gdpCiHi)
    : Math.min(CI90_LO * gdp, CI90_HI * gdp);
  const povHi = isRatePreset
    ? Math.max(BETA_POV * gdpCiLo, BETA_POV * gdpCiHi)
    : Math.max(CI90_LO * gdp, CI90_HI * gdp);

  const fmt    = (v: number, dp = 2) => `${v >= 0 ? '+' : ''}${v.toFixed(dp)}`;
  const fmtPP  = (v: number, dp = 2) => `${fmt(v, dp)}pp`;
  const fmtPct = (v: number)         => `${fmt(v, 1)}%`;

  const presetData = PRESETS[preset];

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-10" style={{ zIndex: 1 }}>

      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div
          className="inline-block rounded-full px-4 py-1.5 text-xs font-medium text-stone-500 tracking-wide"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {isEn
            ? 'Scenario Analysis · ENAHO 2005–2024 · OLS + Cholesky VAR(1)'
            : 'Análisis de Escenarios · ENAHO 2005–2024 · MCO + VAR(1) Cholesky'}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 leading-tight tracking-tight">
          {isEn ? 'Scenario Analysis' : 'Análisis de Escenarios'}
        </h1>
        <p className="text-xl text-stone-500 font-light max-w-2xl leading-relaxed">
          {isEn
            ? 'GDP growth assumption → poverty impact, computed from an audited OLS regression (ENAHO 2005–2024, N=18, R²=0.669). Uncertainty intervals shown throughout.'
            : 'Supuesto de crecimiento del PBI → impacto en pobreza, calculado con una regresión MCO auditada (ENAHO 2005–2024, N=18, R²=0.669). Intervalos de incertidumbre mostrados en todo momento.'}
        </p>
      </section>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* ── CONFIDENCE NOTE ───────────────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-5"
          style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}
        >
          <p className="text-sm text-amber-900">
            <strong>{isEn ? 'What is estimated here:' : 'Qué se estima aquí:'}</strong>{' '}
            {isEn
              ? 'The GDP→Poverty elasticity (β=−0.656) is our Tier 1 high-confidence result. The rate→GDP elasticity (β=−0.195) is a Tier 2 point estimate — its 90% CI includes zero. Scenarios that go via rate→GDP→Poverty carry compounded uncertainty.'
              : 'La elasticidad PBI→Pobreza (β=−0.656) es nuestro resultado Nivel 1 de alta confianza. La elasticidad tasa→PBI (β=−0.195) es una estimación puntual Nivel 2 — su IC 90% incluye cero. Los escenarios que pasan por tasa→PBI→Pobreza tienen incertidumbre compuesta.'}
          </p>
        </div>
      </FadeSection>

      {/* ── PRESET BUTTONS ────────────────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
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
            <div
              className="mt-2 p-3 rounded-xl text-xs text-stone-500"
              style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
            >
              <strong>{isEn ? 'Preset note: ' : 'Nota del preset: '}</strong>
              {isEn ? presetData.note_en : presetData.note_es}
              {' '}{isEn ? 'GDP assumption:' : 'Supuesto PBI:'}{' '}
              <span className="font-semibold">{fmtPct(gdp)}</span>
            </div>
          )}
        </div>
      </FadeSection>

      {/* ── RATE→GDP CHAIN (rate presets only) ────────────────────────────────── */}
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
                ? `90% bootstrap CI [${fmtPP(CI_RATE_LO)}, ${fmtPP(CI_RATE_HI)}] per 100bp — crosses zero. Point estimate consistent with literature (−0.20 to −0.30pp) but not individually significant at T=85.`
                : `IC 90% bootstrap [${fmtPP(CI_RATE_LO)}, ${fmtPP(CI_RATE_HI)}] por 100pb — cruza cero. Estimación puntual consistente con literatura (−0.20 a −0.30pp) pero no significativa individualmente con T=85.`}
            </p>
          </div>
        </FadeSection>
      )}

      {/* ── POVERTY IMPACT ────────────────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <h2 className="text-2xl font-bold text-stone-900">
            {isEn ? 'Poverty Impact' : 'Impacto en Pobreza'}
          </h2>

          <div className="flex items-baseline gap-3">
            <span
              className="text-5xl font-black"
              style={{ color: povPoint > 0 ? '#dc2626' : TEAL }}
            >
              {fmtPP(povPoint)}
            </span>
            <span className="text-lg text-stone-500">
              {povPoint > 0
                ? (isEn ? 'increase in poverty rate' : 'aumento en tasa de pobreza')
                : (isEn ? 'reduction in poverty rate' : 'reducción en tasa de pobreza')}
            </span>
          </div>

          {/* CI grid */}
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
                <div
                  key={label}
                  className="rounded-xl p-4"
                  style={{
                    background: highlight ? 'rgba(0,0,0,0.04)' : CARD_BG,
                    border: `1px solid ${highlight ? 'rgba(120,113,108,0.35)' : CARD_BORDER}`,
                  }}
                >
                  <div className="text-xs text-stone-400 mb-1">{label}</div>
                  <div
                    className={`text-2xl font-${highlight ? 'black' : 'semibold'}`}
                    style={{ color: highlight ? (povPoint > 0 ? '#dc2626' : TEAL) : '#78716c' }}
                  >
                    {fmtPP(val)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-stone-400 text-center">
              [{fmtPP(povLo)} — {fmtPP(povHi)}]
            </div>
          </div>

          {/* Chain formula */}
          <div
            className="rounded-xl p-4 text-sm text-stone-600 space-y-1"
            style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
          >
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
              <div className="text-xs text-stone-400">
                {isRatePreset
                  ? `IC 90%: ${BETA_POV} × GDP_CI[${fmtPP(Math.min(gdpCiLo,gdpCiHi))}, ${fmtPP(Math.max(gdpCiLo,gdpCiHi))}] = [${fmtPP(povLo)}, ${fmtPP(povHi)}]`
                  : `IC 90%: [${BETA_POV} ± 1.645×0.115] × ${fmtPct(gdp)} = [${fmtPP(povLo)}, ${fmtPP(povHi)}]`}
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ── CONFIDENCE TIERS ──────────────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h3 className="font-semibold text-stone-800">
            {isEn ? 'Confidence Tiers' : 'Niveles de Confianza'}
          </h3>
          <div className="space-y-2 text-sm text-stone-600">
            <div className="flex gap-2 items-start">
              <span className="rounded-full px-3 py-0.5 text-xs font-medium whitespace-nowrap" style={{ background: '#dcfce7', color: '#166534' }}>Nivel 1</span>
              <span>{isEn ? 'GDP→Poverty β=−0.656: significant (p<0.0001), stable, N=18.' : 'PBI→Pobreza β=−0.656: significativo (p<0.0001), estable, N=18.'}</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="rounded-full px-3 py-0.5 text-xs font-medium whitespace-nowrap" style={{ background: '#fef9c3', color: '#854d0e' }}>Nivel 2</span>
              <span>{isEn ? 'Rate→GDP β=−0.195: 90% CI includes zero, point estimate literature-consistent.' : 'Tasa→PBI β=−0.195: IC 90% incluye cero, estimación puntual consistente con la literatura.'}</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="rounded-full px-3 py-0.5 text-xs font-medium whitespace-nowrap" style={{ background: 'rgba(0,0,0,0.06)', color: '#57534e' }}>Nivel 3</span>
              <span>{isEn ? 'Narrative SR, Proxy-SVAR: attempted, not identified with available data.' : 'SR narrativa, Proxy-SVAR: intentados, no identificados con los datos disponibles.'}</span>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ── DATA BADGE ────────────────────────────────────────────────────────── */}
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
