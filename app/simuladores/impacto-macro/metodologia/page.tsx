'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Legend, Label,
} from 'recharts';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import { TERRACOTTA, TEAL, AMBER, CARD_BG, CARD_BORDER } from '../components/macroData';
import CiteButton from '../../../components/CiteButton';

const BASE = '/simuladores/impacto-macro';

// ── IRF data (Cholesky VAR(1), 1pp rate shock, h=0..8) ────────────────────
// Source: full_audit_output.txt · bootstrap 2,000 draws, seed 42
const IRF_GDP = [
  { q: 'Q0', point: 0,      bandBase: 0,      bandWidth: 0     },
  { q: 'Q1', point: -0.055, bandBase: -1.331, bandWidth: 2.277 },
  { q: 'Q2', point: -0.194, bandBase: -0.974, bandWidth: 1.398 },
  { q: 'Q3', point: -0.195, bandBase: -0.698, bandWidth: 0.969 },
  { q: 'Q4', point: -0.172, bandBase: -0.523, bandWidth: 0.703 },
  { q: 'Q5', point: -0.138, bandBase: -0.393, bandWidth: 0.513 },
  { q: 'Q6', point: -0.104, bandBase: -0.281, bandWidth: 0.363 },
  { q: 'Q7', point: -0.076, bandBase: -0.207, bandWidth: 0.262 },
  { q: 'Q8', point: -0.054, bandBase: -0.151, bandWidth: 0.190 },
];

// CPI response to same rate shock (price puzzle at short horizons)
const IRF_CPI = [
  { q: 'Q0', point: 0     },
  { q: 'Q1', point: 0.380 },
  { q: 'Q2', point: 0.270 },
  { q: 'Q3', point: 0.206 },
  { q: 'Q4', point: 0.152 },
  { q: 'Q5', point: 0.109 },
  { q: 'Q6', point: 0.077 },
  { q: 'Q7', point: 0.054 },
  { q: 'Q8', point: 0.038 },
];

// Comparison: Cholesky vs LP (endogenous) — LP clipped at domain [-1.6, 1.0]
const IRF_COMPARE = [
  { q: 'Q0', chol: 0,      lp:  0.616, bandBase: 0,      bandWidth: 0     },
  { q: 'Q1', chol: -0.055, lp:  0.647, bandBase: -1.331, bandWidth: 2.277 },
  { q: 'Q2', chol: -0.194, lp:  0.393, bandBase: -0.974, bandWidth: 1.398 },
  { q: 'Q3', chol: -0.195, lp: -0.509, bandBase: -0.698, bandWidth: 0.969 },
  { q: 'Q4', chol: -0.172, lp: -1.334, bandBase: -0.523, bandWidth: 0.703 },
  { q: 'Q5', chol: -0.138, lp: -1.123, bandBase: -0.393, bandWidth: 0.513 },
  { q: 'Q6', chol: -0.104, lp: -1.754, bandBase: -0.281, bandWidth: 0.363 },
  { q: 'Q7', chol: -0.076, lp: -2.150, bandBase: -0.207, bandWidth: 0.262 },
  { q: 'Q8', chol: -0.054, lp: -1.074, bandBase: -0.151, bandWidth: 0.190 },
];

const GRID  = '#e7e5e4';
const TICK  = { fontSize: 10, fill: '#a8a29e' } as const;

function CustomTooltip({ active, payload, label, keys }: any) {
  if (!active || !payload) return null;
  const rows = (payload as any[]).filter(p => keys.includes(p.dataKey));
  if (!rows.length) return null;
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
      <p style={{ fontWeight: 600, color: '#44403c', marginBottom: 4 }}>{label}</p>
      {rows.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.stroke || p.fill || '#44403c', margin: 0 }}>
          {p.name}: {Number(p.value).toFixed(3)}pp
        </p>
      ))}
    </div>
  );
}

function IRFGDPChart({ isEn }: { isEn: boolean }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-stone-700">
        {isEn
          ? 'GDP response to a +100bps BCRP rate shock'
          : 'Respuesta del PBI a shock de +100pb en tasa BCRP'}
      </div>
      <div className="text-xs text-stone-400">
        {isEn
          ? 'Cholesky identification · VAR(1) · T=85 · 90% bootstrap CI (2,000 replications)'
          : 'Identificación Cholesky · VAR(1) · T=85 · IC 90% bootstrap (2,000 réplicas)'}
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}`, background: CARD_BG }}>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={IRF_GDP} margin={{ top: 12, right: 20, left: 10, bottom: 22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} strokeWidth={0.5} />
            <XAxis dataKey="q" tick={TICK} stroke="#a8a29e">
              <Label value={isEn ? 'Horizon (quarters)' : 'Horizonte (trimestres)'} offset={-10} position="insideBottom"
                style={{ fontSize: 10, fill: '#a8a29e' }} />
            </XAxis>
            <YAxis tick={TICK} stroke="#a8a29e" domain={[-1.5, 1.1]}
              tickFormatter={(v: number) => `${v.toFixed(1)}`}>
              <Label value={isEn ? 'GDP response (pp)' : 'Respuesta PBI (pp)'} angle={-90} position="insideLeft" offset={16}
                style={{ fontSize: 10, fill: '#a8a29e' }} />
            </YAxis>
            <Tooltip content={<CustomTooltip keys={['point']} />} />
            <ReferenceLine y={0} stroke="#78716c" strokeWidth={1} />
            <Area type="monotone" dataKey="bandBase" stackId="ci"
              fill="none" stroke="none" legendType="none" />
            <Area type="monotone" dataKey="bandWidth" stackId="ci"
              fill={TEAL} fillOpacity={0.18} stroke="none"
              name={isEn ? '90% CI' : 'IC 90%'} legendType="rect" />
            <Line type="monotone" dataKey="point" stroke={TEAL} strokeWidth={2.5}
              dot={{ r: 3, fill: TEAL, stroke: '#fff', strokeWidth: 1.5 }}
              name={isEn ? 'Point estimate' : 'Estimación puntual'} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-amber-700 rounded-lg px-3 py-2 border border-amber-200"
        style={{ background: '#fffbeb' }}>
        {isEn
          ? <>⚠️ 90% CI includes zero at <strong>all</strong> horizons h=0..8. Peak: −0.195pp at Q3. Consistent with literature (−0.20 to −0.30pp) but not individually significant.</>
          : <>⚠️ IC 90% incluye cero en <strong>todos</strong> los horizontes h=0..8. Pico: −0.195pp en Q3. Consistente con literatura (−0.20 a −0.30pp) pero no significativo individualmente.</>}
      </div>
    </div>
  );
}

function IRFCPIChart({ isEn }: { isEn: boolean }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-stone-700">
        {isEn
          ? 'CPI response to a +100bps BCRP rate shock'
          : 'Respuesta del IPC a shock de +100pb en tasa BCRP'}
      </div>
      <div className="text-xs text-stone-400">
        {isEn
          ? 'Cholesky VAR(1) · Point estimate only (no CI for CPI)'
          : 'Cholesky VAR(1) · Solo estimación puntual (sin IC para IPC)'}
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}`, background: CARD_BG }}>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={IRF_CPI} margin={{ top: 12, right: 20, left: 10, bottom: 22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} strokeWidth={0.5} />
            <XAxis dataKey="q" tick={TICK} stroke="#a8a29e">
              <Label value={isEn ? 'Horizon (quarters)' : 'Horizonte (trimestres)'} offset={-10} position="insideBottom"
                style={{ fontSize: 10, fill: '#a8a29e' }} />
            </XAxis>
            <YAxis tick={TICK} stroke="#a8a29e" domain={[-0.05, 0.50]}
              tickFormatter={(v: number) => `${v.toFixed(2)}`}>
              <Label value={isEn ? 'CPI response (pp)' : 'Respuesta IPC (pp)'} angle={-90} position="insideLeft" offset={16}
                style={{ fontSize: 10, fill: '#a8a29e' }} />
            </YAxis>
            <Tooltip content={<CustomTooltip keys={['point']} />} />
            <ReferenceLine y={0} stroke="#78716c" strokeWidth={1} />
            <Line type="monotone" dataKey="point" stroke={AMBER} strokeWidth={2.5}
              dot={{ r: 3, fill: AMBER, stroke: '#fff', strokeWidth: 1.5 }}
              name={isEn ? 'CPI response' : 'Respuesta IPC'} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-amber-700 rounded-lg px-3 py-2 border border-amber-200"
        style={{ background: '#fffbeb' }}>
        {isEn
          ? <>⚠️ <strong>Price puzzle:</strong> CPI rises following a rate hike in the short run. A classic phenomenon in recursive VARs — the BCRP raises rates when inflation is already rising. No CI computed for the CPI response.</>
          : <>⚠️ <strong>Price puzzle:</strong> el IPC sube ante un alza de tasa a corto plazo. Fenómeno clásico en VARs recursivos — el BCRP sube tasas cuando la inflación ya está subiendo. No se computa IC para la respuesta del IPC.</>}
      </div>
    </div>
  );
}

function IRFComparisonChart({ isEn }: { isEn: boolean }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-stone-700">
        {isEn
          ? 'Cholesky vs Local Projections — GDP response to 100bps hike'
          : 'Cholesky vs Proyecciones Locales — Respuesta del PBI a 100pb de alza'}
      </div>
      <div className="text-xs text-stone-400">
        {isEn
          ? 'LP without instrument shows endogeneity bias (positive response on impact). Grey lines: peak estimates from Peruvian literature. LP h=7: −2.15pp (partially outside visible range).'
          : 'LP sin instrumento muestra sesgo de endogeneidad (respuesta positiva al impacto). Líneas grises: estimaciones de pico de literatura peruana. LP h=7: −2.15pp (parcialmente fuera de rango visible).'}
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}`, background: CARD_BG }}>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={IRF_COMPARE} margin={{ top: 12, right: 80, left: 10, bottom: 22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} strokeWidth={0.5} />
            <XAxis dataKey="q" tick={TICK} stroke="#a8a29e">
              <Label value={isEn ? 'Horizon (quarters)' : 'Horizonte (trimestres)'} offset={-10} position="insideBottom"
                style={{ fontSize: 10, fill: '#a8a29e' }} />
            </XAxis>
            <YAxis tick={TICK} stroke="#a8a29e" domain={[-1.6, 1.1]} allowDataOverflow
              tickFormatter={(v: number) => `${v.toFixed(1)}`}>
              <Label value={isEn ? 'GDP response (pp)' : 'Respuesta PBI (pp)'} angle={-90} position="insideLeft" offset={16}
                style={{ fontSize: 10, fill: '#a8a29e' }} />
            </YAxis>
            <Tooltip content={<CustomTooltip keys={['chol', 'lp']} />} />
            <ReferenceLine y={0} stroke="#78716c" strokeWidth={1} />
            {/* Peruvian literature — peak estimates */}
            <ReferenceLine y={-0.28} stroke="#9ca3af" strokeDasharray="6 3" strokeWidth={1}
              label={{ value: 'P.R.2024 −0.28', position: 'right', fontSize: 9, fill: '#9ca3af' }} />
            <ReferenceLine y={-0.30} stroke="#9ca3af" strokeDasharray="4 2" strokeWidth={1}
              label={{ value: 'Cast.2016 −0.30', position: 'right', fontSize: 9, fill: '#9ca3af' }} />
            <ReferenceLine y={-0.25} stroke="#9ca3af" strokeDasharray="2 2" strokeWidth={1}
              label={{ value: 'Port.2022 −0.25', position: 'right', fontSize: 9, fill: '#9ca3af' }} />
            {/* Cholesky CI band */}
            <Area type="monotone" dataKey="bandBase" stackId="ci"
              fill="none" stroke="none" legendType="none" />
            <Area type="monotone" dataKey="bandWidth" stackId="ci"
              fill={TEAL} fillOpacity={0.14} stroke="none"
              name={isEn ? '90% CI Cholesky' : 'IC 90% Cholesky'} legendType="rect" />
            {/* Point estimates */}
            <Line type="monotone" dataKey="chol" stroke={TEAL} strokeWidth={2.5}
              dot={{ r: 2.5, fill: TEAL, stroke: '#fff', strokeWidth: 1 }}
              name={isEn ? 'Cholesky (preferred)' : 'Cholesky (preferido)'} />
            <Line type="monotone" dataKey="lp" stroke={AMBER} strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={{ r: 2, fill: AMBER }}
              name={isEn ? 'LP without instrument' : 'LP sin instrumento'} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-stone-500 leading-relaxed">
        {isEn
          ? 'LP shows +0.65pp on impact (h=1) — the BCRP raises rates when the economy is already growing, creating a spurious positive correlation. Cholesky controls for this by construction (recursive ordering). All three Peruvian literature estimates fall within the Cholesky 90% CI at the peak (h=3).'
          : 'El LP muestra +0.65pp al impacto (h=1) — el BCRP sube tasas cuando la economía ya está creciendo, creando correlación positiva espuria. El Cholesky controla esto por construcción (ordering recursivo). Las tres estimaciones de la literatura peruana caen dentro del IC 90% del Cholesky en el pico (h=3).'}
      </p>
    </div>
  );
}

// ── Static comparison tables ───────────────────────────────────────────────
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
      <button
        className="w-full flex justify-between items-center px-6 py-4 text-left"
        style={{ background: CARD_BG }}
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold text-stone-800">{title}</span>
        <span className="text-stone-400 text-lg">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-6 py-5 space-y-3 text-sm text-stone-600 leading-relaxed"
          style={{ background: '#fafaf9', borderTop: `1px solid ${CARD_BORDER}` }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Metodologia() {
  const isEn = useLocale() === 'en';

  const COMPARISON_TABLE = [
    { method: 'Cholesky VAR(1)',          est: '−0.195pp', ci: '[−0.70, +0.27]', ok: '✅ punto', why: isEn ? 'Timing assumptions (recursive)' : 'Supuestos de timing (recursivo)' },
    { method: isEn ? 'Sign restrictions'  : 'Restricciones de signo',   est: '−2.30pp',  ci: '[−52, −0.18]',   ok: '⚠️ ' + (isEn ? 'very wide' : 'muy amplio'), why: isEn ? 'Few restrictions identify poorly' : 'Pocas restricciones identifican mal' },
    { method: isEn ? 'Narrative SR (2022)' : 'SR narrativa (2022)',       est: '−3.57pp',  ci: '[−30, −0.29]',   ok: '⚠️ ' + (isEn ? 'wide' : 'amplio'),    why: isEn ? 'A single extreme monetary episode' : 'Un solo episodio monetario extremo' },
    { method: isEn ? 'Narrative SR (2020+2022)' : 'SR narrativa (2020+2022)',  est: '—',        ci: '—',              ok: '❌',            why: isEn ? 'Incompatible with COVID dummy' : 'Incompatible con dummy COVID' },
    { method: isEn ? 'LP without instrument' : 'LP sin instrumento',        est: '−0.541pp', ci: '[−0.96, −0.12]', ok: '⚠️ ' + (isEn ? 'endogenous' : 'endógeno'),  why: isEn ? 'No causal identification' : 'Sin identificación causal' },
    { method: isEn ? 'Proxy-SVAR (interbank)' : 'Proxy-SVAR (interbancaria)',est: '—',        ci: '—',              ok: '❌ F=4.7',      why: isEn ? 'Administered rate, weak instrument' : 'Tasa administrada, instrumento débil' },
    { method: isEn ? 'Proxy-SVAR (BCRP tone)' : 'Proxy-SVAR (tono BCRP)',    est: '—',        ci: '—',              ok: '❌ ' + (isEn ? 'exogeneity' : 'exogeneidad'),why: isEn ? 'Tone endogenous to the business cycle' : 'Tono endógeno al ciclo económico' },
  ];

  const LITERATURE = [
    { study: 'Pérez Rojo & Rodríguez (2024)', method: 'TVP-VAR-SV recursivo',   est: '−0.28pp' },
    { study: 'Castillo et al. (2016)',         method: 'SS-FAVAR',               est: '−0.30pp' },
    { study: 'Portilla et al. (2022)',         method: 'MI-TVP-VAR-SV',          est: '−0.25pp' },
    { study: isEn ? 'This study (Cholesky)' : 'Este estudio (Cholesky)',  method: 'VAR(1), T=85, FWL', est: '−0.20pp' },
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
          <span style={{ color: '#6b7280' }}>
            {isEn ? 'Methodology' : 'Metodología'}
          </span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn ? 'Methodology and audit' : 'Metodología y auditoría'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Methodology of macroeconomic elasticities for Peru: Cholesky VAR, OLS poverty, LP exchange rate (2004–2025)'
                : 'Metodología de elasticidades macroeconómicas para Perú: VAR Cholesky, MCO pobreza, LP tipo de cambio (2004–2025)'}
              isEn={isEn}
            />
          </div>
        </div>
        <p className="text-lg text-stone-500 font-light">
          {isEn
            ? 'How we estimate each elasticity. What works and what does not.'
            : 'Cómo estimamos cada elasticidad. Qué funciona y qué no.'}
        </p>
      </section>

      {/* ── TIER SUMMARY ───────────────────────────────────────────────────── */}
      <FadeSection className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ background: '#f0fdf4', border: `2px solid ${TEAL}` }}>
          <div className="text-xs font-bold text-green-800 uppercase tracking-wide mb-2">
            {isEn ? 'Level 1 — High confidence' : 'Nivel 1 — Alta confianza'}
          </div>
          <div className="font-black text-2xl" style={{ color: TEAL }}>GDP → {isEn ? 'Poverty' : 'Pobreza'}</div>
          <p className="text-xs text-green-700 mt-2">β=−0.656 · SE=0.115 · t=−5.69 · p&lt;0.0001 · R²=0.669 · N=18</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: '#fffbeb', border: `2px solid #fcd34d` }}>
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
            {isEn ? 'Level 2 — Point estimate' : 'Nivel 2 — Puntual'}
          </div>
          <div className="font-black text-2xl" style={{ color: '#d97706' }}>
            {isEn ? 'Rate → GDP' : 'Tasa → GDP'}
          </div>
          <p className="text-xs text-amber-700 mt-2">β=−0.195 · 90% CI [−0.698, +0.271] · {isEn ? 'includes zero' : 'incluye cero'} · T=85</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: '#f5f5f4', border: `2px solid #d6d3d1` }}>
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">
            {isEn ? 'Level 3 — Not identified' : 'Nivel 3 — No identificado'}
          </div>
          <div className="font-black text-2xl text-stone-400">SR / Proxy-SVAR</div>
          <p className="text-xs text-stone-500 mt-2">
            {isEn
              ? 'Attempted, not identified with available Peruvian data.'
              : 'Intentados, no identificados con datos disponibles de Perú.'}
          </p>
        </div>
      </FadeSection>

      {/* ── COMPARISON TABLE ────────────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h2 className="text-xl font-bold text-stone-900">
            {isEn
              ? 'Rate → GDP: 7 strategies compared'
              : 'Tasa → PBI: 7 estrategias comparadas'}
          </h2>
          <p className="text-sm text-stone-500">
            {isEn
              ? 'We tested 7 different ways to estimate the effect of the interest rate on GDP. Only recursive Cholesky identification produces robust results.'
              : 'Probamos 7 formas diferentes de estimar el efecto de la tasa de interés sobre el PBI. Solo la identificación recursiva (Cholesky) produce resultados robustos.'}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: `2px solid ${CARD_BORDER}` }}>
                  <th className="text-left py-2 px-3 text-stone-500 font-semibold">
                    {isEn ? 'Method' : 'Método'}
                  </th>
                  <th className="text-right py-2 px-3 text-stone-500 font-semibold">
                    {isEn ? 'Estimate' : 'Estimación'}
                  </th>
                  <th className="text-center py-2 px-3 text-stone-500 font-semibold">90% CI</th>
                  <th className="text-center py-2 px-3 text-stone-500 font-semibold">
                    {isEn ? 'Identified?' : 'Identificado?'}
                  </th>
                  <th className="text-left py-2 px-3 text-stone-500 font-semibold">
                    {isEn ? 'Why?' : '¿Por qué?'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_TABLE.map((row, i) => (
                  <tr
                    key={row.method}
                    style={{
                      borderBottom: `1px solid ${CARD_BORDER}`,
                      background: i === 0 ? '#fef3c7' : 'transparent',
                    }}
                  >
                    <td className="py-2 px-3 font-medium text-stone-700">{row.method}</td>
                    <td className="py-2 px-3 text-right font-bold" style={{ color: TERRACOTTA }}>{row.est}</td>
                    <td className="py-2 px-3 text-center text-stone-500">{row.ci}</td>
                    <td className="py-2 px-3 text-center">{row.ok}</td>
                    <td className="py-2 px-3 text-stone-500">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-400">
            {isEn
              ? 'Highlighted row = chosen method. More modern techniques (Proxy-SVAR, SR) do not work for Peru: the interbank rate is administered and there are few extreme monetary episodes.'
              : 'Fila resaltada = método elegido. Las técnicas más modernas (Proxy-SVAR, SR) no funcionan para Perú: la tasa interbancaria es administrada y hay pocos episodios monetarios extremos.'}
          </p>

          <div className="mt-4">
            <div className="text-sm font-semibold text-stone-700 mb-2">
              {isEn ? 'Comparison with Peruvian literature:' : 'Comparación con literatura peruana:'}
            </div>
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
                      key={row.study}
                      style={{
                        borderBottom: `1px solid ${CARD_BORDER}`,
                        background: i === LITERATURE.length - 1 ? '#fef3c7' : 'transparent',
                      }}
                    >
                      <td className="py-2 px-3 text-stone-700 font-medium">{row.study}</td>
                      <td className="py-2 px-3 text-stone-500">{row.method}</td>
                      <td className="py-2 px-3 text-right font-bold" style={{ color: TERRACOTTA }}>{row.est}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ── IRF CHARTS ──────────────────────────────────────────────────────── */}
      <FadeSection className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            {isEn
              ? 'Impulse Response Functions (IRFs)'
              : 'Funciones de Impulso-Respuesta (FIR)'}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {isEn
              ? 'Dynamic trajectory of the effect of a +100bps BCRP rate shock on GDP and CPI. Cholesky identification · VAR(1) · Order: [ToT, GDP, CPI, FX, Δrate]'
              : 'Trayectoria dinámica del efecto de un shock de +100pb en la tasa BCRP sobre el PBI y el IPC. Identificación Cholesky · VAR(1) · Orden: [ToT, PBI, IPC, TC, Δtasa]'}
          </p>
        </div>

        {/* GDP + CPI charts side by side on desktop */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl p-5 space-y-3"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <IRFGDPChart isEn={isEn} />
          </div>
          <div className="rounded-2xl p-5 space-y-3"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            <IRFCPIChart isEn={isEn} />
          </div>
        </div>

        {/* Comparison chart — full width */}
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <IRFComparisonChart isEn={isEn} />
        </div>
      </FadeSection>

      {/* ── ACCORDION SECTIONS ─────────────────────────────────────────────── */}
      <FadeSection className="space-y-3">
        <h2 className="text-xl font-bold text-stone-900">
          {isEn ? 'Details by elasticity' : 'Detalles por elasticidad'}
        </h2>

        <Accordion title={isEn ? 'A. Growth → Poverty (Level 1)' : 'A. Crecimiento → Pobreza (Nivel 1)'}>
          <p><strong>{isEn ? 'Specification:' : 'Especificación:'}</strong> {isEn ? 'OLS · ΔPoverty_t = α + β × GDPgrowth_t + ε_t' : 'MCO · ΔPobreza_t = α + β × PBIcrecimiento_t + ε_t'}</p>
          <p><strong>{isEn ? 'Data:' : 'Datos:'}</strong> ENAHO 2005–2024, {isEn ? 'excluding 2020–2021 (COVID). N=18 years.' : 'excluyendo 2020–2021 (COVID). N=18 años.'}</p>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse w-full mt-2">
              <thead>
                <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                  <th className="text-left py-1 px-2 text-stone-500">{isEn ? 'Parameter' : 'Parámetro'}</th>
                  <th className="text-right py-1 px-2 text-stone-500">{isEn ? 'Coefficient' : 'Coeficiente'}</th>
                  <th className="text-right py-1 px-2 text-stone-500">SE</th>
                  <th className="text-right py-1 px-2 text-stone-500">t-stat</th>
                  <th className="text-right py-1 px-2 text-stone-500">p-value</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                  <td className="py-1 px-2 text-stone-700">{isEn ? 'Intercept (α)' : 'Constante (α)'}</td>
                  <td className="text-right py-1 px-2">0.888</td>
                  <td className="text-right py-1 px-2">0.547</td>
                  <td className="text-right py-1 px-2">1.623</td>
                  <td className="text-right py-1 px-2">0.124</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 font-bold text-stone-700">β (GDP growth)</td>
                  <td className="text-right py-1 px-2 font-bold" style={{ color: TEAL }}>−0.656</td>
                  <td className="text-right py-1 px-2">0.115</td>
                  <td className="text-right py-1 px-2">−5.691</td>
                  <td className="text-right py-1 px-2 font-bold text-green-700">0.0000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p><strong>R²=0.669</strong> · 90% CI: [−0.847, −0.466] · RMSE=1.296pp</p>
          <p><strong>{isEn ? 'Stability:' : 'Estabilidad:'}</strong> 2005–2014 β=−0.461 · 2015–2024 β=−0.723 · {isEn ? 'No structural break detected.' : 'Sin quiebre estructural detectado.'}</p>
          <p><strong>{isEn ? 'Outliers:' : 'Atípicos:'}</strong> {isEn ? '2009 (Juntos transfers exceeded model, residual −3.55pp, 2.9×SD) · 2022 (K-recovery post-COVID, +2.49pp, 2.0×SD). Both interpretable.' : '2009 (transferencias Juntos superaron el modelo, residuo −3.55pp, 2.9×SD) · 2022 (recuperación en K post-COVID, +2.49pp, 2.0×SD). Ambos interpretables.'}</p>
        </Accordion>

        <Accordion title={isEn ? 'B. Rate → GDP: Cholesky VAR (Level 2)' : 'B. Tasa → PBI: VAR Cholesky (Nivel 2)'}>
          <p><strong>{isEn ? 'Specification:' : 'Especificación:'}</strong> VAR(1) · {isEn ? 'Cholesky order: [ToT, GDP, CPI, FX, Δrate] · T=85 quarters' : 'Orden Cholesky: [ToT, PBI, IPC, TC, Δtasa] · T=85 trimestres'}</p>
          <p><strong>{isEn ? 'COVID treatment:' : 'Tratamiento COVID:'}</strong> {isEn ? 'FWL partial-out — each variable is regressed on a dummy [1 if Q1/Q2 2020] and the residuals are used in the VAR.' : 'FWL partial-out — se regresa cada variable sobre una dummy [1 si Q1/Q2 2020] y se usan los residuales en el VAR.'}</p>
          <p><strong>{isEn ? 'Result:' : 'Resultado:'}</strong> β=−0.195pp {isEn ? 'per 100bps' : 'por 100pb'} · 90% CI bootstrap (2,000 {isEn ? 'replications' : 'réplicas'}, seed 42): [−0.698, +0.271] · {isEn ? 'Peak at h=3 quarters.' : 'Pico en h=3 trimestres.'}</p>
          <p><strong>R²_GDP=0.056</strong> — {isEn ? 'low, but expected given that the rate is only one of many variables affecting GDP.' : 'bajo, pero esperado dado que la tasa es solo una de muchas variables que afectan el PBI.'}</p>
          <p><strong>{isEn ? 'Dynamics:' : 'Dinámica:'}</strong> {isEn ? 'The effect dissipates smoothly: −0.055pp (Q1), −0.194pp (Q2), −0.195pp (Q3, peak), −0.104pp (Q6), −0.054pp (Q8). Decay consistent with the credit transmission mechanism.' : 'El efecto se disipa suavemente: −0.055pp (Q1), −0.194pp (Q2), −0.195pp (Q3, pico), −0.104pp (Q6), −0.054pp (Q8). Decaimiento consistente con mecanismo de transmisión crediticio.'}</p>
          <p>{isEn ? 'The point estimate is ' : 'El punto estimado es '}<strong>{isEn ? 'consistent with literature' : 'consistente con literatura'}</strong>{isEn ? ' but not statistically significant. Normal with T=85.' : ' pero no estadísticamente significativo. Normal con T=85.'}</p>
        </Accordion>

        <Accordion title={isEn ? 'C. Exchange Rate → Inflation (Level 2)' : 'C. Tipo de Cambio → Inflación (Nivel 2)'}>
          <p><strong>{isEn ? 'Specification:' : 'Especificación:'}</strong> LP OLS · {isEn ? 'ΔCPI(t+h) = α + β × ΔFX(t) + ε · h=1 quarter · HAC SE' : 'ΔIPC(t+h) = α + β × ΔTC(t) + ε · h=1 trimestre · SE HAC'}</p>
          <p><strong>{isEn ? 'Result:' : 'Resultado:'}</strong> β=+0.237pp {isEn ? 'per 10% depreciation · Significant (HAC SE).' : 'por 10% de depreciación · Significativo (SE HAC).'}</p>
          <p><strong>{isEn ? 'Limitation:' : 'Limitación:'}</strong> {isEn ? 'Short run only (h=1). The FX→GDP channel is not well identified due to reverse causality.' : 'Solo corto plazo (h=1). El canal TC→PBI no está bien identificado por causalidad inversa.'}</p>
        </Accordion>

        <Accordion title={isEn ? 'D. COVID-19 treatment' : 'D. Tratamiento de COVID-19'}>
          <p><strong>{isEn ? 'For the VAR:' : 'Para el VAR:'}</strong> {isEn ? 'FWL partial-out of Q1/Q2 2020. Each VAR variable is regressed on a dummy for those two quarters and the residuals are used.' : 'FWL partial-out de Q1/Q2 2020. Se regresa cada variable del VAR sobre una dummy para esos dos trimestres y se usan los residuales.'}</p>
          <p><strong>{isEn ? 'For the poverty regression:' : 'Para la regresión de pobreza:'}</strong> {isEn ? 'Years 2020 and 2021 are excluded entirely from the sample. ENAHO data for those years reflects atypical conditions that would contaminate the secular GDP→Poverty elasticity estimate.' : 'Se excluyen completamente los años 2020 y 2021 de la muestra. La ENAHO de esos años refleja condiciones atípicas que contaminarían la estimación de la elasticidad secular PBI→Pobreza.'}</p>
          <p>{isEn ? 'This asymmetric treatment is intentional: the VAR uses quarterly data where partial-out is more precise; the annual regression uses direct exclusion.' : 'Este tratamiento asimétrico es intencional: el VAR usa datos trimestrales donde el partial-out es más preciso; la regresión anual usa exclusión directa.'}</p>
        </Accordion>

        <Accordion title={isEn ? 'E. Data and reproducibility' : 'E. Datos y reproducibilidad'}>
          <p><strong>{isEn ? 'Main sources:' : 'Fuentes principales:'}</strong></p>
          <ul className="list-disc list-inside space-y-1 text-stone-500">
            <li>{isEn ? 'BCRP: real quarterly GDP (% change), reference rate (%pa), quarterly CPI, SOL/USD exchange rate, ToT' : 'BCRP: PBI trimestral real (var. %), tasa de referencia (%pa), IPC trimestral, tipo de cambio SOL/USD, ToT'}</li>
            <li>{isEn ? 'ENAHO: annual monetary poverty rate (INEI, Module 34)' : 'ENAHO: Tasa de pobreza monetaria anual (INEI, Módulo 34)'}</li>
            <li>{isEn ? 'Coverage: 2004-Q2 to 2025-Q3 (T=85 quarters) for VAR/LP; 2005–2024 for poverty regression' : 'Cobertura: 2004-Q2 a 2025-Q3 (T=85 trimestres) para VAR/LP; 2005–2024 para regresión de pobreza'}</li>
          </ul>
          <p><strong>{isEn ? 'Audit output:' : 'Output de auditoría:'}</strong> {isEn ? 'Full audit file available in the project GitHub repository.' : 'Archivo de auditoría completo disponible en el repositorio GitHub del proyecto.'}</p>
          <p><strong>{isEn ? 'Saved estimates:' : 'Estimaciones guardadas:'}</strong> var_elasticities.json (public/assets/data/)</p>
          <p><strong>{isEn ? 'Estimation date:' : 'Fecha de estimación:'}</strong> 2026-03-19</p>
        </Accordion>
      </FadeSection>

      {/* ── FULL DISCLAIMER ────────────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-6"
          style={{ background: '#fafaf9', border: `1px solid ${CARD_BORDER}` }}
        >
          <h3 className="font-semibold text-stone-700 mb-3">
            {isEn ? 'Full disclaimer' : 'Disclaimer completo'}
          </h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            {isEn
              ? <>These estimates reflect <strong>historical average relationships</strong> in the Peruvian economy between 2004 and 2025. They do not constitute predictions of the future or policy recommendations. Confidence intervals reflect statistical uncertainty within the specified model; real uncertainty is greater and includes: unmodeled structural changes, unprecedented shocks, unmodeled interactions between variables, and specification bias. Results should be interpreted as indicative orders of magnitude, not as precise estimates.</>
              : <>Estas estimaciones reflejan <strong>relaciones históricas promedio</strong> en la economía peruana entre 2004 y 2025. No constituyen predicciones del futuro ni recomendaciones de política. Los intervalos de confianza reflejan incertidumbre estadística dentro del modelo especificado; la incertidumbre real es mayor e incluye: cambios estructurales no capturados, shocks sin precedente histórico, interacciones no modeladas entre variables, y sesgo de especificación. Los resultados deben interpretarse como órdenes de magnitud orientativos, no como estimaciones exactas.</>}
          </p>
        </div>
      </FadeSection>

      {/* ── BACK TO TOP ────────────────────────────────────────────────────── */}
      <div className="text-center">
        <Link
          href={BASE}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: '#44403c' }}
        >
          {isEn ? '← Back to overview' : '← Volver al resumen'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
