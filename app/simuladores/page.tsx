'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Label,
} from 'recharts';
import {
  CHART_COLORS,
  CHART_DEFAULTS,
  tooltipContentStyle,
  axisTickStyle,
} from '../lib/chartTheme';

// ── Audited elasticities (full_audit_output.txt, 2026-03-19) ───────────────
// GDP→Poverty: OLS ENAHO 2005-2024 excl 2020-2021, N=18, R²=0.669, t=-5.69
// Rate→GDP:    Cholesky VAR(1) T=85 FWL, CI includes zero at all h=0..8
// FX→CPI:      LP OLS h=1 HAC, significant
const BETA_POV   = -0.656;   // pp poverty per 1pp GDP growth
const CI90_LO    = -0.847;   // 90% CI lower bound on β
const CI90_HI    = -0.466;   // 90% CI upper bound on β
const ALPHA_POV  =  0.888;   // intercept
const BETA_RATE  = -0.195;   // pp GDP per 100bp rate hike (Cholesky VAR)
const CI_RATE_LO = -0.698;   // 90% bootstrap CI low
const CI_RATE_HI =  0.271;   // 90% bootstrap CI high
const BETA_FX    =  0.237;   // pp CPI per 10% FX depreciation (LP h=1)

// Regression data: 18 years used in poverty elasticity OLS
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

// Regression + CI lines (x from -1.5 to 10.5)
const X_RANGE = Array.from({ length: 49 }, (_, i) => -1.5 + i * 0.25);
const REG_LINE  = X_RANGE.map(x => ({ x, central: ALPHA_POV + BETA_POV  * x }));
const CI_UPPER  = X_RANGE.map(x => ({ x, upper:   ALPHA_POV + CI90_HI   * x }));
const CI_LOWER  = X_RANGE.map(x => ({ x, lower:   ALPHA_POV + CI90_LO   * x }));

export default function SimuladoresPage() {
  const isEn = useLocale() === 'en';
  const [tab, setTab] = useState<'pobreza' | 'monetaria' | 'fx'>('pobreza');

  const TABS = isEn ? [
    { key: 'pobreza'   as const, label: 'Growth → Poverty' },
    { key: 'monetaria' as const, label: 'Monetary Policy' },
    { key: 'fx'        as const, label: 'FX → Inflation' },
  ] : [
    { key: 'pobreza'   as const, label: 'Crecimiento → Pobreza' },
    { key: 'monetaria' as const, label: 'Política Monetaria' },
    { key: 'fx'        as const, label: 'TC → Inflación' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
            {isEn ? 'Simulators' : 'Simuladores'}
          </h1>
          <p className="text-sm text-gray-600">
            {isEn
              ? 'Elasticity estimates from audited econometric models. Confidence intervals shown where available.'
              : 'Estimaciones de elasticidades de modelos econométricos auditados. Se muestran intervalos de confianza donde corresponde.'}
          </p>
        </div>

        {/* Salario Mínimo featured card */}
        <a
          href="/simuladores/salario-minimo"
          className="flex items-start gap-4 p-5 mb-6 border rounded-sm transition-colors hover:border-[#C65D3E] group"
          style={{ background: '#fff', borderColor: '#E8E4DF' }}
        >
          <span className="text-2xl mt-0.5">💼</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold" style={{ color: '#2D3142' }}>
                {isEn ? 'Minimum Wage Simulator' : 'Simulador de Salario Mínimo'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#f0faf8', color: '#2A9D8F', border: '1px solid #2A9D8F' }}>
                {isEn ? 'New' : 'Nuevo'}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#8D99AE' }}>
              {isEn
                ? '9 natural experiments (Lima Metro, 2003–2022). DiD panel, Lee bounds, lighthouse effect.'
                : '9 experimentos naturales (Lima Metro, 2003–2022). Panel DiD, cotas de Lee, efecto faro.'}
            </p>
          </div>
          <span className="text-sm font-medium group-hover:translate-x-1 transition-transform" style={{ color: '#C65D3E' }}>→</span>
        </a>

        {/* Tab nav */}
        <div className="flex border-b border-gray-300 mb-8">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={tab === key
                ? { borderColor: CHART_COLORS.terra, color: CHART_COLORS.terra }
                : { borderColor: 'transparent', color: CHART_COLORS.ink3 }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'pobreza'   && <PobrezaElasticidad isEn={isEn} />}
        {tab === 'monetaria' && <PoliticaMonetaria  isEn={isEn} />}
        {tab === 'fx'        && <TCInflacion        isEn={isEn} />}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 1 — GDP Growth → Poverty Impact
// ══════════════════════════════════════════════════════════════════════════
function PobrezaElasticidad({ isEn }: { isEn: boolean }) {
  const [gdp, setGdp] = useState(3.0);

  const impact  = BETA_POV  * gdp;
  const ciLo    = CI90_LO   * gdp;
  const ciHi    = CI90_HI   * gdp;

  const fmt = (v: number, dp = 2) => `${v >= 0 ? '+' : ''}${v.toFixed(dp)}`;
  const fmtPP = (v: number) => `${fmt(v)}pp`;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-gray-300 p-6">
          <h2 className="text-base font-semibold mb-1">
            {isEn ? 'GDP Growth Assumption' : 'Supuesto de Crecimiento del PBI'}
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            {isEn ? 'Annual real GDP growth (%)' : 'Crecimiento anual real del PBI (%)'}
          </p>
          <input
            type="range" min="-6" max="9" step="0.1" value={gdp}
            onChange={e => setGdp(Number(e.target.value))}
            className="w-full mb-2 accent-[#C65D3E]"
          />
          <div className="flex justify-between text-xs text-gray-400 mb-3">
            <span>−6%</span><span>+9%</span>
          </div>
          <input
            type="number" step="0.1" value={gdp}
            min="-6" max="9"
            onChange={e => setGdp(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-center font-bold text-lg"
          />
          <div className="text-center text-xs text-gray-400 mt-1">%</div>
        </div>

        <div className="bg-green-50 border border-green-300 p-4 rounded">
          <div className="text-xs font-semibold text-green-800 mb-1 uppercase tracking-wide">
            {isEn ? 'Tier 1 — High Confidence' : 'Nivel 1 — Alta Confianza'}
          </div>
          <p className="text-xs text-green-700">
            {isEn
              ? 'β=−0.656, R²=0.669, N=18, p<0.0001. Stable across sub-periods.'
              : 'β=−0.656, R²=0.669, N=18, p<0.0001. Estable entre sub-períodos.'}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {isEn
              ? 'Source: OLS on ENAHO 2005–2024, excl. 2020–2021.'
              : 'Fuente: MCO sobre ENAHO 2005–2024, excl. 2020–2021.'}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-2 space-y-5">
        {/* Impact display */}
        <div className="bg-white border border-gray-300 p-6">
          <h2 className="text-base font-semibold mb-4">
            {isEn ? 'Poverty Impact (Δ percentage points)' : 'Impacto en Pobreza (Δ puntos porcentuales)'}
          </h2>
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`text-4xl font-bold ${impact > 0 ? 'text-red-600' : 'text-green-700'}`}>
              {fmtPP(impact)}
            </span>
            <span className="text-sm text-gray-500">
              {isEn ? 'point estimate' : 'estimación puntual'}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            {isEn ? '90% CI:' : 'IC 90%:'}{' '}
            <span className="font-medium">[{fmtPP(Math.min(ciLo, ciHi))}, {fmtPP(Math.max(ciLo, ciHi))}]</span>
            {' '}—{' '}
            {impact < 0
              ? (isEn ? 'Poverty reduction' : 'Reducción de pobreza')
              : impact > 0
              ? (isEn ? 'Poverty increase' : 'Aumento de pobreza')
              : (isEn ? 'No change' : 'Sin cambio')}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: isEn ? 'CI low (90%)' : 'IC inferior (90%)', val: Math.min(ciLo, ciHi), color: 'text-gray-600' },
              { label: isEn ? 'Point estimate' : 'Estimación puntual', val: impact, color: impact > 0 ? 'text-red-600' : 'text-green-700', bold: true },
              { label: isEn ? 'CI high (90%)' : 'IC superior (90%)', val: Math.max(ciLo, ciHi), color: 'text-gray-600' },
            ].map(({ label, val, color, bold }) => (
              <div key={label} className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className={`text-xl font-${bold ? 'bold' : 'semibold'} ${color}`}>{fmtPP(val)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            ΔPobreza = {ALPHA_POV.toFixed(3)} + ({BETA_POV}) × {gdp.toFixed(1)} = {fmtPP(ALPHA_POV + impact)}
          </div>
        </div>

        {/* Scatter plot */}
        <div className="bg-white border border-gray-300 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            {isEn ? 'Regression Data (N=18)' : 'Datos de la Regresión (N=18)'}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            {isEn
              ? 'Annual GDP growth (%) vs. change in poverty rate (pp). 2005–2024, excluding 2020–2021.'
              : 'Crecimiento anual PBI (%) vs. variación tasa de pobreza (pp). 2005–2024, excl. 2020–2021.'}
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis
                dataKey="x" type="number" domain={[-2, 10.5]}
                tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                tickFormatter={v => `${v}%`}
              >
                <Label value={isEn ? 'GDP growth (%)' : 'Crecimiento PBI (%)'} offset={-10} position="insideBottom"
                  style={{ fontSize: CHART_DEFAULTS.axisFontSize, fill: CHART_COLORS.ink3 }} />
              </XAxis>
              <YAxis
                type="number" domain={[-8, 3]}
                tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                tickFormatter={v => `${v}pp`}
              >
                <Label value={isEn ? 'Δ Poverty (pp)' : 'Δ Pobreza (pp)'} angle={-90} position="insideLeft" offset={15}
                  style={{ fontSize: CHART_DEFAULTS.axisFontSize, fill: CHART_COLORS.ink3 }} />
              </YAxis>
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(val: any) => [`${Number(val).toFixed(2)}pp`, '']}
                labelFormatter={(_, payload) => {
                  const pt = payload?.[0]?.payload;
                  return pt?.year ? `${pt.year} | PBI: ${pt.gdp?.toFixed(1)}%` : '';
                }}
              />
              {/* CI band upper */}
              <Line data={CI_UPPER} dataKey="upper" dot={false} stroke={CHART_COLORS.terra}
                strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5} name="CI 90% sup" legendType="none" />
              {/* CI band lower */}
              <Line data={CI_LOWER} dataKey="lower" dot={false} stroke={CHART_COLORS.terra}
                strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5} name="CI 90% inf" legendType="none" />
              {/* Regression line */}
              <Line data={REG_LINE} dataKey="central" dot={false} stroke={CHART_COLORS.terra}
                strokeWidth={2} name={isEn ? 'Regression line' : 'Línea de regresión'} legendType="none" />
              {/* User's selected point */}
              <Scatter
                data={[{ x: gdp, scatter: ALPHA_POV + BETA_POV * gdp }]}
                dataKey="scatter" fill={CHART_COLORS.terra} r={8} name="scatter" />
              {/* Data points */}
              <Scatter
                data={SCATTER_DATA.map(d => ({ x: d.gdp, scatter: d.dpov, year: d.year, gdp: d.gdp }))}
                dataKey="scatter" fill={CHART_COLORS.teal} r={4} opacity={0.8} name="scatter" />
              <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {isEn
              ? 'Teal dots = observed data. Terra dot = your assumption. Dashed lines = 90% CI on β.'
              : 'Puntos verdes = datos observados. Punto terra = tu supuesto. Líneas punteadas = IC 90% sobre β.'}
          </p>
        </div>

        <div className="p-3 text-xs rounded" style={{ background: CHART_COLORS.surface, borderLeft: `3px solid ${CHART_COLORS.terra}`, color: CHART_COLORS.ink3 }}>
          <strong>{isEn ? 'Note: ' : 'Nota: '}</strong>
          {isEn
            ? 'β=−0.656pp per 1pp GDP growth. Stable: 2005–2014 β=−0.461, 2015–2024 β=−0.723. Outliers: 2009 (Juntos social transfers outperformed model), 2022 (K-shaped post-COVID recovery). No structural break.'
            : 'β=−0.656pp por cada 1pp de crecimiento del PBI. Estable: 2005–2014 β=−0.461, 2015–2024 β=−0.723. Atípicos: 2009 (transferencias Juntos superaron el modelo), 2022 (recuperación post-COVID en K). Sin quiebre estructural.'}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 2 — Monetary Policy (Rate → GDP → Poverty)
// ══════════════════════════════════════════════════════════════════════════
function PoliticaMonetaria({ isEn }: { isEn: boolean }) {
  const [bp, setBp] = useState(100);

  const gdpImpact    = BETA_RATE * (bp / 100);
  const gdpCiLo      = CI_RATE_LO * (bp / 100);
  const gdpCiHi      = CI_RATE_HI * (bp / 100);
  const povImpact    = gdpImpact * BETA_POV;   // chained: + = poverty rises
  const povCiLoG     = gdpCiHi * BETA_POV;    // CI from GDP CI (sign flips)
  const povCiHiG     = gdpCiLo * BETA_POV;

  const fmt = (v: number, dp = 3) => `${v >= 0 ? '+' : ''}${v.toFixed(dp)}`;
  const fmtPP = (v: number, dp = 3) => `${fmt(v, dp)}pp`;
  const ciInclZero = gdpCiLo <= 0 && gdpCiHi >= 0;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-gray-300 p-6">
          <h2 className="text-base font-semibold mb-1">
            {isEn ? 'Rate Change (bp)' : 'Cambio en Tasa (pb)'}
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            {isEn ? 'BCRP policy rate change in basis points' : 'Cambio en tasa de política del BCRP en puntos base'}
          </p>
          <input
            type="range" min="-300" max="300" step="25" value={bp}
            onChange={e => setBp(Number(e.target.value))}
            className="w-full mb-2 accent-[#C65D3E]"
          />
          <div className="flex justify-between text-xs text-gray-400 mb-3">
            <span>−300bp</span><span>+300bp</span>
          </div>
          <input
            type="number" step="25" value={bp} min="-300" max="300"
            onChange={e => setBp(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-center font-bold text-lg"
          />
          <div className="text-center text-xs text-gray-400 mt-1">bp</div>
        </div>

        <div className="bg-amber-50 border border-amber-300 p-4 rounded">
          <div className="text-xs font-semibold text-amber-800 mb-1 uppercase tracking-wide">
            {isEn ? 'Tier 2 — Point Estimate Only' : 'Nivel 2 — Solo Estimación Puntual'}
          </div>
          <p className="text-xs text-amber-700">
            {isEn
              ? '90% bootstrap CI includes zero at all horizons h=0..8 (T=85, R²_GDP=0.056).'
              : 'IC 90% bootstrap incluye cero en todos los horizontes h=0..8 (T=85, R²_PBI=0.056).'}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {isEn
              ? 'Literature range: −0.20 to −0.30pp per 100bp. Results consistent but not individually significant.'
              : 'Rango literatura: −0.20 a −0.30pp por 100pb. Resultados consistentes pero no significativos individualmente.'}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-2 space-y-5">
        {/* CI warning — always visible */}
        <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded">
          <div className="font-semibold text-amber-900 text-sm mb-1">
            ⚠️ {isEn ? 'Statistical Caveat' : 'Advertencia Estadística'}
          </div>
          <p className="text-sm text-amber-800">
            {isEn
              ? `90% CI for rate→GDP includes zero: [${fmtPP(CI_RATE_LO, 2)}, ${fmtPP(CI_RATE_HI, 2)}] per 100bp. Point estimate −0.195pp is consistent with the literature (−0.20 to −0.30) but cannot be distinguished from zero with T=85 quarterly observations.`
              : `IC 90% para tasa→PBI incluye cero: [${fmtPP(CI_RATE_LO, 2)}, ${fmtPP(CI_RATE_HI, 2)}] por 100pb. Estimación puntual −0.195pp es consistente con la literatura (−0.20 a −0.30) pero no puede distinguirse de cero con T=85 observaciones trimestrales.`}
          </p>
        </div>

        {/* Step 1: Rate → GDP */}
        <div className="bg-white border border-gray-300 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {isEn ? 'Step 1: Rate → GDP Impact' : 'Paso 1: Tasa → Impacto en PBI'}
          </h3>
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`text-3xl font-bold ${gdpImpact <= 0 ? 'text-red-600' : 'text-green-700'}`}>
              {fmtPP(gdpImpact)}
            </span>
            <span className="text-sm text-gray-400">PBI</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center mb-3">
            {[
              { label: isEn ? 'CI low' : 'IC inf.', val: Math.min(gdpCiLo, gdpCiHi) },
              { label: isEn ? 'Point est.' : 'Est. puntual', val: gdpImpact, bold: true },
              { label: isEn ? 'CI high' : 'IC sup.', val: Math.max(gdpCiLo, gdpCiHi) },
            ].map(({ label, val, bold }) => (
              <div key={label} className={`rounded p-2 border ${bold ? 'bg-gray-100 border-gray-400' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className={`font-${bold ? 'bold' : 'medium'} text-gray-800`}>{fmtPP(val)}</div>
              </div>
            ))}
          </div>
          {ciInclZero && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              {isEn ? '↑ CI includes zero — cannot reject null of no GDP effect' : '↑ IC incluye cero — no se puede rechazar efecto nulo sobre PBI'}
            </div>
          )}
        </div>

        {/* Step 2: GDP → Poverty (chained) */}
        <div className="bg-white border border-gray-300 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {isEn ? 'Step 2: Chained Effect on Poverty' : 'Paso 2: Efecto Encadenado sobre Pobreza'}
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            {isEn
              ? `GDP ${fmtPP(gdpImpact)} × β_poverty(−0.656) = poverty impact (GDP uncertainty carries through)`
              : `PBI ${fmtPP(gdpImpact)} × β_pobreza(−0.656) = impacto pobreza (incertidumbre del PBI se propaga)`}
          </p>
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`text-3xl font-bold ${povImpact >= 0 ? 'text-red-600' : 'text-green-700'}`}>
              {fmtPP(povImpact)}
            </span>
            <span className="text-sm text-gray-400">{isEn ? 'poverty' : 'pobreza'}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: isEn ? 'CI low' : 'IC inf.', val: Math.min(povCiLoG, povCiHiG) },
              { label: isEn ? 'Point est.' : 'Est. puntual', val: povImpact, bold: true },
              { label: isEn ? 'CI high' : 'IC sup.', val: Math.max(povCiLoG, povCiHiG) },
            ].map(({ label, val, bold }) => (
              <div key={label} className={`rounded p-2 border ${bold ? 'bg-gray-100 border-gray-400' : 'bg-gray-50 border-gray-200'}`}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className={`font-${bold ? 'bold' : 'medium'} text-gray-800`}>{fmtPP(val)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            {isEn
              ? 'Compound uncertainty: CI propagated from GDP step. The chained poverty effect inherits the zero-inclusive CI.'
              : 'Incertidumbre compuesta: IC propagado desde el paso del PBI. El efecto encadenado hereda el IC que incluye cero.'}
          </div>
        </div>

        <div className="p-3 text-xs rounded" style={{ background: CHART_COLORS.surface, borderLeft: `3px solid ${CHART_DEFAULTS.gridStroke}`, color: CHART_COLORS.ink3 }}>
          <strong>{isEn ? 'Methodology: ' : 'Metodología: '}</strong>
          {isEn
            ? `Rate→GDP: Cholesky IRF from VAR(1), T=85, FWL COVID Q1+Q2 2020. Peak at h=3 quarters. 90% CI from 2,000 residual bootstrap replications. Rate→Poverty: chained via GDP→Poverty OLS elasticity β=−0.656 (ENAHO 2005–2024 excl. COVID, N=18).`
            : `Tasa→PBI: FRI Cholesky de VAR(1), T=85, FWL COVID T1+T2 2020. Pico en h=3 trimestres. IC 90% de 2,000 réplicas bootstrap residual. Tasa→Pobreza: encadenado vía elasticidad MCO PBI→Pobreza β=−0.656 (ENAHO 2005–2024 excl. COVID, N=18).`}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 3 — FX Depreciation → CPI
// ══════════════════════════════════════════════════════════════════════════
function TCInflacion({ isEn }: { isEn: boolean }) {
  const [fx, setFx] = useState(10);

  const cpiImpact = BETA_FX * (fx / 10);
  const fmtPP = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(3)}pp`;

  // Illustrative chart: CPI impact across FX depreciation values 0-40%
  const chartData = Array.from({ length: 41 }, (_, i) => ({
    fx: i,
    cpi: BETA_FX * (i / 10),
    userFx: i === Math.round(fx) ? BETA_FX * (i / 10) : null,
  }));

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-gray-300 p-6">
          <h2 className="text-base font-semibold mb-1">
            {isEn ? 'FX Depreciation (%)' : 'Depreciación Cambiaria (%)'}
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            {isEn ? 'SOL/USD depreciation from current level' : 'Depreciación SOL/USD desde nivel actual'}
          </p>
          <input
            type="range" min="0" max="40" step="0.5" value={fx}
            onChange={e => setFx(Number(e.target.value))}
            className="w-full mb-2 accent-[#C65D3E]"
          />
          <div className="flex justify-between text-xs text-gray-400 mb-3">
            <span>0%</span><span>40%</span>
          </div>
          <input
            type="number" step="0.5" value={fx} min="0" max="40"
            onChange={e => setFx(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-center font-bold text-lg"
          />
          <div className="text-center text-xs text-gray-400 mt-1">%</div>
        </div>

        <div className="bg-green-50 border border-green-300 p-4 rounded">
          <div className="text-xs font-semibold text-green-800 mb-1 uppercase tracking-wide">
            {isEn ? 'Tier 2 — Significant' : 'Nivel 2 — Significativo'}
          </div>
          <p className="text-xs text-green-700">
            {isEn
              ? 'β=+0.237pp per 10% depreciation. Significant at LP h=1 (HAC SE).'
              : 'β=+0.237pp por cada 10% de depreciación. Significativo en PL h=1 (SE HAC).'}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {isEn ? 'Source: LP OLS h=1, T=85, BCRP quarterly data.' : 'Fuente: PL MCO h=1, T=85, datos BCRP trimestrales.'}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-2 space-y-5">
        {/* Impact */}
        <div className="bg-white border border-gray-300 p-6">
          <h2 className="text-base font-semibold mb-4">
            {isEn ? 'CPI Impact at h=1 quarter (pp)' : 'Impacto IPC en h=1 trimestre (pp)'}
          </h2>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-bold text-amber-600">{fmtPP(cpiImpact)}</span>
            <span className="text-sm text-gray-500">
              {isEn ? 'quarterly CPI increase' : 'alza IPC trimestral'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">
                {isEn ? 'FX depreciation' : 'Depreciación TC'}
              </div>
              <div className="text-xl font-bold text-gray-800">{fx > 0 ? '+' : ''}{fx.toFixed(1)}%</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">
                {isEn ? 'CPI impact (h=1)' : 'Impacto IPC (h=1)'}
              </div>
              <div className="text-xl font-bold text-amber-700">{fmtPP(cpiImpact)}</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {isEn
              ? `Formula: ΔCPI = ${BETA_FX} × (${fx.toFixed(1)} / 10) = ${fmtPP(cpiImpact)}`
              : `Fórmula: ΔIPC = ${BETA_FX} × (${fx.toFixed(1)} / 10) = ${fmtPP(cpiImpact)}`}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white border border-gray-300 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {isEn ? 'CPI Impact vs FX Depreciation' : 'Impacto IPC vs Depreciación TC'}
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis dataKey="fx" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} tickFormatter={v => `${v}%`}>
                <Label value={isEn ? 'FX Depreciation (%)' : 'Depreciación TC (%)'} offset={-10} position="insideBottom"
                  style={{ fontSize: CHART_DEFAULTS.axisFontSize, fill: CHART_COLORS.ink3 }} />
              </XAxis>
              <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} tickFormatter={v => `${v.toFixed(2)}pp`}>
                <Label value={isEn ? 'ΔCPI (pp)' : 'ΔIPC (pp)'} angle={-90} position="insideLeft" offset={15}
                  style={{ fontSize: CHART_DEFAULTS.axisFontSize, fill: CHART_COLORS.ink3 }} />
              </YAxis>
              <Tooltip contentStyle={tooltipContentStyle}
                formatter={(v: any) => [`${Number(v).toFixed(3)}pp`, isEn ? 'CPI impact' : 'Impacto IPC']}
                labelFormatter={v => `${isEn ? 'Depreciation' : 'Depreciación'}: ${v}%`}
              />
              <Line type="monotone" dataKey="cpi" stroke={CHART_COLORS.amber} strokeWidth={2}
                dot={false} name="cpi" />
              <ReferenceLine x={fx} stroke={CHART_COLORS.terra} strokeDasharray="4 4"
                label={{ value: `${fx}%`, fontSize: CHART_DEFAULTS.axisFontSize, fill: CHART_COLORS.terra }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 text-xs rounded" style={{ background: CHART_COLORS.surface, borderLeft: `3px solid ${CHART_DEFAULTS.gridStroke}`, color: CHART_COLORS.ink3 }}>
          <strong>{isEn ? 'Note: ' : 'Nota: '}</strong>
          {isEn
            ? 'This measures the pass-through to CPI at one quarter lag. Longer-run pass-through may differ. No poverty channel estimated for FX (FX→GDP is not well-identified in the data; BCRP DSGE estimate −0.12pp per 10% is used for reference only).'
            : 'Mide el traslado al IPC con un trimestre de rezago. El traslado de más largo plazo puede diferir. No se estima canal de pobreza para TC (TC→PBI no está bien identificado en los datos; estimación BCRP DSGE −0.12pp por 10% se usa solo como referencia).'}
        </div>
      </div>
    </div>
  );
}
