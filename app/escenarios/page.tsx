"use client";

import { useState } from "react";
import { useLocale } from 'next-intl';

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

  // Poverty impact
  const povPoint = BETA_POV * gdp;
  const povCiLo  = CI90_LO  * gdp;
  const povCiHi  = CI90_HI  * gdp;
  const povLo    = Math.min(povCiLo, povCiHi);
  const povHi    = Math.max(povCiLo, povCiHi);

  // GDP CI (only relevant for rate presets)
  const gdpCiLo = CI_RATE_LO * (isBcrpHike ? 1 : isBcrpCut ? -1 : 0);
  const gdpCiHi = CI_RATE_HI * (isBcrpHike ? 1 : isBcrpCut ? -1 : 0);

  const fmt    = (v: number, dp = 2) => `${v >= 0 ? '+' : ''}${v.toFixed(dp)}`;
  const fmtPP  = (v: number, dp = 2) => `${fmt(v, dp)}pp`;
  const fmtPct = (v: number)         => `${fmt(v, 1)}%`;

  const presetData = PRESETS[preset];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {isEn ? 'Scenario Analysis' : 'Análisis de Escenarios'}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            {isEn
              ? 'GDP growth assumption → poverty impact, computed from an audited OLS regression (ENAHO 2005–2024, N=18, R²=0.669). Uncertainty intervals shown throughout.'
              : 'Supuesto de crecimiento del PBI → impacto en pobreza, calculado con una regresión MCO auditada (ENAHO 2005–2024, N=18, R²=0.669). Intervalos de incertidumbre mostrados en todo momento.'}
          </p>
        </div>

        {/* Confidence note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-900">
            <strong>{isEn ? 'What is estimated here:' : 'Qué se estima aquí:'}</strong>{' '}
            {isEn
              ? 'The GDP→Poverty elasticity (β=−0.656) is our Tier 1 high-confidence result. The rate→GDP elasticity (β=−0.195) is a Tier 2 point estimate — its 90% CI includes zero. Scenarios that go via rate→GDP→Poverty carry compounded uncertainty.'
              : 'La elasticidad PBI→Pobreza (β=−0.656) es nuestro resultado Nivel 1 de alta confianza. La elasticidad tasa→PBI (β=−0.195) es una estimación puntual Nivel 2 — su IC 90% incluye cero. Los escenarios que pasan por tasa→PBI→Pobreza tienen incertidumbre compuesta.'}
          </p>
        </div>

        {/* Preset buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {isEn ? 'Select a preset or enter custom GDP growth' : 'Selecciona un preset o ingresa crecimiento PBI personalizado'}
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.entries(PRESETS) as [Preset, typeof PRESETS[Preset]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handlePreset(key)}
                className="px-4 py-2 text-sm font-medium rounded border transition-colors"
                style={preset === key
                  ? { background: '#C65D3E', borderColor: '#C65D3E', color: '#fff' }
                  : { background: '#fff', borderColor: '#D1D5DB', color: '#374151' }}
              >
                {isEn ? val.label_en : val.label_es}
              </button>
            ))}
          </div>

          {isCustom && (
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
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
                  className="w-24 px-3 py-2 border border-gray-300 rounded text-sm text-center font-bold"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          )}

          {!isCustom && (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
              <strong>{isEn ? 'Preset note: ' : 'Nota del preset: '}</strong>
              {isEn ? presetData.note_en : presetData.note_es}
              {' '}{isEn ? 'GDP assumption:' : 'Supuesto PBI:'}{' '}
              <span className="font-semibold">{fmtPct(gdp)}</span>
            </div>
          )}
        </div>

        {/* Rate→GDP chain (only for rate presets) */}
        {isRatePreset && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5 mb-6">
            <h3 className="font-semibold text-amber-900 mb-2">
              {isEn ? '⚠️ Rate → GDP (Tier 2 — CI includes zero)' : '⚠️ Tasa → PBI (Nivel 2 — IC incluye cero)'}
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              {[
                { label: isEn ? 'GDP CI low' : 'PBI IC inf.', val: Math.min(gdpCiLo, gdpCiHi) },
                { label: isEn ? 'GDP point est.' : 'PBI est. puntual', val: gdp, bold: true },
                { label: isEn ? 'GDP CI high' : 'PBI IC sup.', val: Math.max(gdpCiLo, gdpCiHi) },
              ].map(({ label, val, bold }) => (
                <div key={label} className={`rounded p-2 ${bold ? 'bg-amber-100 border border-amber-400' : 'bg-white border border-amber-200'}`}>
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
        )}

        {/* Poverty impact */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isEn ? 'Poverty Impact' : 'Impacto en Pobreza'}
          </h2>

          <div className="flex items-baseline gap-3 mb-4">
            <span className={`text-5xl font-bold ${povPoint > 0 ? 'text-red-600' : 'text-green-700'}`}>
              {fmtPP(povPoint)}
            </span>
            <span className="text-lg text-gray-500">
              {povPoint > 0
                ? (isEn ? 'increase in poverty rate' : 'aumento en tasa de pobreza')
                : (isEn ? 'reduction in poverty rate' : 'reducción en tasa de pobreza')}
            </span>
          </div>

          {/* CI bar */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">
              {isEn ? '90% confidence interval on poverty impact' : 'Intervalo de confianza 90% sobre impacto en pobreza'}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: isEn ? 'CI low (90%)' : 'IC inferior (90%)', val: povLo, color: 'text-gray-600' },
                { label: isEn ? 'Point estimate' : 'Estimación puntual', val: povPoint, color: povPoint > 0 ? 'text-red-700' : 'text-green-700', bold: true, bg: 'bg-gray-100 border-gray-400' },
                { label: isEn ? 'CI high (90%)' : 'IC superior (90%)', val: povHi, color: 'text-gray-600' },
              ].map(({ label, val, color, bold, bg }) => (
                <div key={label} className={`rounded-lg p-4 border ${bg ?? 'bg-gray-50 border-gray-200'}`}>
                  <div className="text-xs text-gray-500 mb-1">{label}</div>
                  <div className={`text-2xl font-${bold ? 'bold' : 'semibold'} ${color}`}>{fmtPP(val)}</div>
                </div>
              ))}
            </div>
            {/* Visual bar */}
            <div className="mt-3 bg-gray-100 rounded-full h-2 relative">
              <div className="text-xs text-gray-400 text-center mt-1">
                [{fmtPP(povLo)} — {fmtPP(povHi)}]
              </div>
            </div>
          </div>

          {/* Chain formula */}
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
            <div className="font-semibold text-gray-900 mb-2">
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
                ΔPobreza = {BETA_POV} × {fmtPct(gdp)} = <strong className={povPoint > 0 ? 'text-red-600' : 'text-green-700'}>{fmtPP(povPoint, 3)}</strong>
              </div>
              <div className="text-xs text-gray-500">
                IC 90%: [{BETA_POV} ± 1.645×0.115] × {fmtPct(gdp)} = [{fmtPP(povLo)}, {fmtPP(povHi)}]
              </div>
            </div>
          </div>
        </div>

        {/* Methodology footer */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-sm text-gray-600">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isEn ? 'Confidence Tiers' : 'Niveles de Confianza'}
          </h3>
          <div className="space-y-2">
            <div className="flex gap-2 items-start">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap">Nivel 1</span>
              <span>{isEn ? 'GDP→Poverty β=−0.656: significant (p<0.0001), stable, N=18.' : 'PBI→Pobreza β=−0.656: significativo (p<0.0001), estable, N=18.'}</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap">Nivel 2</span>
              <span>{isEn ? 'Rate→GDP β=−0.195: 90% CI includes zero, point estimate literature-consistent.' : 'Tasa→PBI β=−0.195: IC 90% incluye cero, estimación puntual consistente con la literatura.'}</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap">Nivel 3</span>
              <span>{isEn ? 'Narrative SR, Proxy-SVAR: attempted, not identified with available data.' : 'SR narrativa, Proxy-SVAR: intentados, no identificados con los datos disponibles.'}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {isEn
              ? 'Full audit: D:/Nexus/nexus/estimation/full_audit_output.txt · Estimated 2026-03-19'
              : 'Auditoría completa: D:/Nexus/nexus/estimation/full_audit_output.txt · Estimado 2026-03-19'}
          </p>
        </div>
      </div>
    </div>
  );
}
