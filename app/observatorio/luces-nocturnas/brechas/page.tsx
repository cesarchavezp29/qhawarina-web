'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, AreaChart, Area,
} from 'recharts';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER,
  DEPT_NAMES, DEPT_NTL, DEPT_STATS,
} from '../components/ntlData';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

const YEARS = Array.from({ length: 33 }, (_, i) => String(1992 + i));
const DEPT_CODES = Object.keys(DEPT_NAMES);

// ── Computed series ───────────────────────────────────────────────────────────
function useBrecharData() {
  return useMemo(() => {
    // Total NTL per year
    const yearTotals: Record<string, number> = {};
    for (const yr of YEARS) {
      yearTotals[yr] = DEPT_CODES.reduce((s, c) => s + (DEPT_NTL[c]?.[yr] ?? 0), 0);
    }

    // Lima share + convergence (CV of log NTL) per year
    const timeSeries = YEARS.map(yr => {
      const total = yearTotals[yr];
      const lima = DEPT_NTL['15']?.[yr] ?? 0;
      const limaShare = total > 0 ? (lima / total) * 100 : 0;

      const logVals = DEPT_CODES.map(c => Math.log((DEPT_NTL[c]?.[yr] ?? 0) + 1));
      const mean = logVals.reduce((a, b) => a + b, 0) / logVals.length;
      const std = Math.sqrt(logVals.reduce((a, b) => a + (b - mean) ** 2, 0) / logVals.length);
      const cv = mean > 0 ? std / mean : 0;

      return { year: Number(yr), limaShare: Math.round(limaShare * 10) / 10, cv: Math.round(cv * 1000) / 1000 };
    });

    // Rankings 1992 vs 2023 (excluding Lima to show rest-of-Peru story)
    const byGrowth = DEPT_CODES
      .filter(c => c !== '15' && c !== '07') // exclude Lima + Callao
      .map(c => {
        const v92 = DEPT_NTL[c]?.['1992'] ?? 0;
        const v23 = DEPT_NTL[c]?.['2023'] ?? 0;
        const growth = v92 > 0 ? Math.round((v23 / v92 - 1) * 100) : 0;
        // Share of non-Lima total in 2023
        const nonLimaTotal2023 = DEPT_CODES.filter(x => x !== '15').reduce(
          (s, x) => s + (DEPT_NTL[x]?.['2023'] ?? 0), 0,
        );
        const share2023 = nonLimaTotal2023 > 0
          ? Math.round((v23 / nonLimaTotal2023) * 1000) / 10
          : 0;
        return { code: c, name: DEPT_NAMES[c], v92, v23, growth, share2023 };
      })
      .sort((a, b) => b.growth - a.growth);

    // COVID: YoY change 2019→2020
    const covidImpact = DEPT_CODES
      .map(c => {
        const v19 = DEPT_NTL[c]?.['2019'] ?? 0;
        const v20 = DEPT_NTL[c]?.['2020'] ?? 0;
        return {
          code: c,
          name: DEPT_NAMES[c],
          change: v19 > 0 ? Math.round(((v20 - v19) / v19) * 1000) / 10 : 0,
        };
      })
      .sort((a, b) => a.change - b.change);

    return { timeSeries, byGrowth, covidImpact, yearTotals };
  }, []);
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ShareTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="font-bold text-stone-700">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}
          {p.dataKey === 'limaShare' ? '%' : ''}
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BrechasPage() {
  const isEn = useLocale() === 'en';

  const { timeSeries, byGrowth, covidImpact } = useBrecharData();
  const [rankSort, setRankSort] = useState<'growth' | 'share'>('growth');

  const latest = timeSeries[timeSeries.length - 1];
  const earliest = timeSeries[0];
  const limaChange = Math.round((latest.limaShare - earliest.limaShare) * 10) / 10;
  const cvChange = Math.round((latest.cv - earliest.cv) * 1000) / 1000;
  const topGrower = byGrowth[0];
  const bottomGrower = byGrowth[byGrowth.length - 1];

  const rankedDepts = rankSort === 'growth'
    ? byGrowth
    : [...byGrowth].sort((a, b) => b.share2023 - a.share2023);

  const maxGrowth = byGrowth[0]?.growth ?? 1;
  const maxShare = Math.max(...byGrowth.map(d => d.share2023));

  // COVID: worst hit and least affected
  const covidWorst = covidImpact.slice(0, 5);
  const covidBest = covidImpact.slice(-5).reverse();

  const statCards = [
    {
      value: `${latest.limaShare}%`,
      label: isEn ? 'Lima share of national total' : 'Lima del total nacional',
      sub: isEn
        ? `Was ${earliest.limaShare}% in 1992 — change of ${limaChange > 0 ? '+' : ''}${limaChange} pp`
        : `Era ${earliest.limaShare}% en 1992 — cambio de ${limaChange > 0 ? '+' : ''}${limaChange} pp`,
      color: TERRACOTTA,
    },
    {
      value: `+${topGrower?.growth}%`,
      label: isEn
        ? `${topGrower?.name}: highest growth`
        : `${topGrower?.name}: mayor crecimiento`,
      sub: isEn ? 'NTL 1992→2023 — excl. Lima and Callao' : 'NTL 1992→2023 — excl. Lima y Callao',
      color: TEAL,
    },
    {
      value: cvChange < 0
        ? (isEn ? '↓ convergence' : '↓ convergencia')
        : (isEn ? '↑ divergence'  : '↑ divergencia'),
      label: isEn ? 'Trend 1992→2023' : 'Tendencia 1992→2023',
      sub: isEn
        ? `Coeff. of variation: ${earliest.cv.toFixed(2)} → ${latest.cv.toFixed(2)}`
        : `Coef. de variación: ${earliest.cv.toFixed(2)} → ${latest.cv.toFixed(2)}`,
      color: cvChange < 0 ? TEAL : TERRACOTTA,
    },
  ];

  const policyRows = isEn
    ? [
        { dot: TEAL,      text: 'Interior regions DO grow: San Martín, Cusco, Apurímac and Ayacucho multiplied their NTL — a signal of electrification, urbanization and commercial activity.' },
        { dot: TEAL,      text: 'The gap is closing slowly: the coefficient of variation has fallen since the 1990s, indicating convergence — albeit very gradual.' },
        { dot: '#f59e0b', text: 'Lima still dominates: more than 50% of the country\'s entire nocturnal activity is concentrated in a single department — decentralization is not visible from space.' },
        { dot: TERRACOTTA, text: 'Mining regions are the major blind spot: Moquegua, Pasco and Ancash have high GDP but low NTL — satellites systematically underestimate their economic activity.' },
        { dot: TERRACOTTA, text: 'COVID hit hardest where it shines brightest: Lima, Cusco (tourism) and Loreto (Amazonian urban center) recorded the steepest drops. Rural areas proved more resilient.' },
      ]
    : [
        { dot: TEAL,      text: 'Las regiones del interior SÍ crecen: San Martín, Cusco, Apurímac y Ayacucho multiplicaron su NTL — señal de electrificación, urbanización y actividad comercial.' },
        { dot: TEAL,      text: 'La brecha se cierra lentamente: el coeficiente de variación cae desde los 90s, indicando convergencia aunque muy gradual.' },
        { dot: '#f59e0b', text: 'Lima sigue dominando: más del 50% de toda la actividad nocturna del país se concentra en un solo departamento — la descentralización no se ve desde el espacio.' },
        { dot: TERRACOTTA, text: 'Las regiones mineras son el gran punto ciego: Moquegua, Pasco y Ancash tienen PBI alto pero NTL bajo — los satélites subestiman sistemáticamente su actividad.' },
        { dot: TERRACOTTA, text: 'El COVID golpeó más donde más brilla: Lima, Cusco (turismo) y Loreto (urbano amazónico) tuvieron las mayores caídas. El campo fue más resiliente.' },
      ];

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16" style={{ zIndex: 1 }}>

      {/* Hero lede */}
      <section className="space-y-4 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">
          {isEn ? 'Night Lights / Regional Gaps' : 'Luces Nocturnas / Brechas Regionales'}
        </p>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn
              ? <>Lima and the rest of Peru:<br className="hidden sm:block" />three decades of luminous inequality</>
              : <>Lima y el resto del Perú:<br className="hidden sm:block" />tres décadas de desigualdad luminosa</>
            }
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={
                isEn
                  ? 'Regional night-time light gaps in Peru: Lima vs. interior (1992–2023)'
                  : 'Brechas regionales de luminosidad nocturna en Perú: Lima vs. interior (1992–2023)'
              }
              isEn={isEn}
            />
            <ShareButton
              title={isEn ? 'Regional light gaps — Qhawarina' : 'Brechas regionales de luminosidad — Qhawarina'}
              text={
                isEn
                  ? 'Lima and the rest of Peru: three decades of luminous inequality measured from space. https://qhawarina.pe/observatorio/luces-nocturnas/brechas'
                  : 'Lima y el resto del Perú: tres décadas de desigualdad luminosa medida desde el espacio. https://qhawarina.pe/observatorio/luces-nocturnas/brechas'
              }
            />
          </div>
        </div>
        <p className="text-stone-500 max-w-2xl text-lg">
          {isEn
            ? 'Satellites reveal with precision what official statistics take years to confirm: which regions grow, which stagnate, and whether the country is converging or polarizing.'
            : 'Los satélites muestran con precisión lo que las estadísticas demoran años en confirmar: qué regiones crecen, cuáles se estancan, y si el país converge o se polariza.'}
        </p>
      </section>

      {/* Stat cards */}
      <FadeSection className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(card => (
          <div
            key={card.label}
            className="rounded-2xl p-6 space-y-1"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div className="text-3xl font-black" style={{ color: card.color }}>{card.value}</div>
            <div className="text-sm font-semibold text-stone-700">{card.label}</div>
            <div className="text-xs text-stone-400">{card.sub}</div>
          </div>
        ))}
      </FadeSection>

      {/* Lima share over time */}
      <FadeSection className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            {isEn ? 'Is Lima gaining or losing weight?' : '¿Lima pierde o gana peso?'}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {isEn
              ? "Lima's share of the country's total night-time luminosity, 1992–2023. A decline means other regions are growing faster."
              : 'Participación de Lima en la luminosidad nocturna total del país, 1992–2023. Una caída indica que otras regiones crecen más rápido.'}
          </p>
        </div>
        <div
          className="rounded-2xl p-6"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="limaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TERRACOTTA} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={TERRACOTTA} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => String(v).slice(2)}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={v => `${v}%`}
                width={38}
              />
              <Tooltip content={<ShareTooltip />} />
              <ReferenceLine x={2013} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'DMSP→VIIRS', fontSize: 9, fill: '#94a3b8' }}/>
              <ReferenceLine x={2020} stroke={TERRACOTTA} strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'COVID', fontSize: 9, fill: TERRACOTTA }}/>
              <Area
                type="monotone"
                dataKey="limaShare"
                name="Lima %"
                stroke={TERRACOTTA}
                strokeWidth={2}
                fill="url(#limaGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-stone-400 mt-2">
            {isEn
              ? 'The DMSP→VIIRS sensor transition (2013) may introduce an artificial break. Comparisons within each era are more reliable.'
              : 'La transición de sensor DMSP→VIIRS (2013) puede generar un quiebre artificial. Comparaciones dentro de cada era son más fiables.'}
          </p>
        </div>
      </FadeSection>

      {/* Convergence */}
      <FadeSection className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            {isEn ? 'Are regions converging?' : '¿Las regiones convergen?'}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {isEn
              ? 'Coefficient of variation of log(NTL) across departments — when it falls, regions are moving closer together in terms of nocturnal activity levels.'
              : 'Coeficiente de variación del log(NTL) entre departamentos — si baja, las regiones se acercan entre sí en nivel de actividad nocturna.'}
          </p>
        </div>
        <div
          className="rounded-2xl p-6"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => String(v).slice(2)}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#a8a29e' }}
                tickLine={false}
                axisLine={false}
                width={38}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<ShareTooltip />} />
              <ReferenceLine x={2013} stroke="#94a3b8" strokeDasharray="3 3"/>
              <ReferenceLine x={2020} stroke={TERRACOTTA} strokeDasharray="3 3" strokeOpacity={0.5}/>
              <Line
                type="monotone"
                dataKey="cv"
                name={isEn ? 'CV inequality' : 'CV desigualdad'}
                stroke={TEAL}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div
            className="mt-4 rounded-xl px-4 py-3 text-xs"
            style={{ background: cvChange < 0 ? '#f0fdf4' : '#fff7ed', border: `1px solid ${cvChange < 0 ? '#86efac' : '#fed7aa'}` }}
          >
            {cvChange < 0
              ? (isEn
                  ? `✓ Regions are converging: the coefficient of variation fell from ${earliest.cv.toFixed(2)} to ${latest.cv.toFixed(2)} between 1992 and 2023. The interior of the country is growing faster than Lima in relative terms.`
                  : `✓ Las regiones convergen: el coef. de variación bajó de ${earliest.cv.toFixed(2)} a ${latest.cv.toFixed(2)} entre 1992 y 2023. El interior del país crece más rápido que Lima en términos relativos.`)
              : (isEn
                  ? `⚠ Regions are diverging: the coefficient of variation rose from ${earliest.cv.toFixed(2)} to ${latest.cv.toFixed(2)}. The gap between luminous and dark departments is widening.`
                  : `⚠ Las regiones divergen: el coef. de variación subió de ${earliest.cv.toFixed(2)} a ${latest.cv.toFixed(2)}. La brecha entre departamentos luminosos y oscuros aumenta.`)
            }
          </div>
        </div>
      </FadeSection>

      {/* Rankings table */}
      <FadeSection className="space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {isEn ? 'Who rises and who falls behind?' : '¿Quién sube y quién se queda atrás?'}
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              {isEn ? 'Departments excl. Lima and Callao, 1992–2023' : 'Departamentos excl. Lima y Callao, 1992–2023'}
            </p>
          </div>
          <div className="flex gap-2">
            {(['growth', 'share'] as const).map(s => (
              <button
                key={s}
                onClick={() => setRankSort(s)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: rankSort === s ? TEAL : CARD_BG,
                  color: rankSort === s ? 'white' : '#78716c',
                  border: `1px solid ${rankSort === s ? TEAL : CARD_BORDER}`,
                }}
              >
                {s === 'growth'
                  ? (isEn ? 'By growth' : 'Por crecimiento')
                  : (isEn ? 'By weight 2023' : 'Por peso 2023')}
              </button>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${CARD_BORDER}` }}
        >
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: `1px solid ${CARD_BORDER}` }}>
                <th className="px-4 py-3 text-left font-semibold text-stone-500">#</th>
                <th className="px-4 py-3 text-left font-semibold text-stone-500">
                  {isEn ? 'Department' : 'Departamento'}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-stone-500 hidden sm:table-cell">
                  {rankSort === 'growth'
                    ? (isEn ? 'NTL growth 1992→2023' : 'Crecimiento NTL 1992→2023')
                    : (isEn ? 'Share of total excl. Lima (2023)' : 'Peso en total excl. Lima (2023)')}
                </th>
                <th className="px-4 py-3 text-right font-semibold text-stone-500">
                  {rankSort === 'growth' ? '+%' : (isEn ? '% of total' : '% del total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedDepts.map((d, i) => {
                const val = rankSort === 'growth' ? d.growth : d.share2023;
                const maxVal = rankSort === 'growth' ? maxGrowth : maxShare;
                const pct = Math.round((val / maxVal) * 100);
                const isTop = i < 5;
                const isBottom = i >= rankedDepts.length - 5 && rankSort === 'growth';
                return (
                  <tr
                    key={d.code}
                    style={{ borderBottom: i < rankedDepts.length - 1 ? `1px solid ${CARD_BORDER}` : undefined }}
                  >
                    <td className="px-4 py-2.5 text-stone-400 font-mono">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-stone-700">{d.name}</td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded bg-stone-100 max-w-32">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${pct}%`,
                              background: isBottom ? TERRACOTTA : isTop ? TEAL : '#94a3b8',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold tabular-nums"
                      style={{ color: isBottom && rankSort === 'growth' ? TERRACOTTA : isTop ? TEAL : '#78716c' }}
                    >
                      {rankSort === 'growth' ? `+${val}%` : `${val}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          className="rounded-xl px-4 py-3 text-xs"
          style={{ background: '#f0fdf4', border: '1px solid #86efac' }}
        >
          <strong className="text-green-800">
            {isEn ? 'Fastest-growing regions:' : 'Regiones que más crecieron:'}
          </strong>
          <span className="text-green-700">
            {isEn
              ? ` ${byGrowth.slice(0, 4).map(d => d.name).join(', ')} — tripled or quadrupled their luminosity since 1992, driven by urban expansion, agro-exports and road connectivity.`
              : ` ${byGrowth.slice(0, 4).map(d => d.name).join(', ')} — triplicaron o cuadruplicaron su luminosidad desde 1992, impulsados por expansión urbana, agro-exportación y conectividad vial.`}
          </span>
        </div>
        {bottomGrower && (
          <div
            className="rounded-xl px-4 py-3 text-xs"
            style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}
          >
            <strong className="text-orange-800">
              {isEn ? 'Lagging regions:' : 'Regiones rezagadas:'}
            </strong>
            <span className="text-orange-700">
              {isEn
                ? ` ${byGrowth.slice(-4).map(d => d.name).join(', ')} — minimal NTL growth over three decades. In some cases this reflects economic stagnation; in others, underground mining that generates no light.`
                : ` ${byGrowth.slice(-4).map(d => d.name).join(', ')} — crecimiento NTL mínimo en tres décadas. En algunos casos refleja estancamiento económico; en otros, minería subterránea que no genera luz.`}
            </span>
          </div>
        )}
      </FadeSection>

      {/* COVID shock */}
      <FadeSection className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            {isEn ? 'COVID, seen from space' : 'El COVID, visto desde el espacio'}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {isEn
              ? 'Change in luminosity 2019→2020. The most urbanized and tourism-dependent departments recorded the steepest drops.'
              : 'Cambio en luminosidad 2019→2020. Los departamentos más urbanizados y turísticos registraron las mayores caídas.'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <div className="text-sm font-semibold text-stone-700">
              {isEn ? 'Most affected (largest drop)' : 'Más afectados (mayor caída)'}
            </div>
            {covidWorst.map(d => (
              <div key={d.code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-600">{d.name}</span>
                  <span className="font-bold tabular-nums" style={{ color: TERRACOTTA }}>{d.change}%</span>
                </div>
                <div className="h-1.5 rounded bg-stone-100">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${Math.min(100, Math.abs(d.change) / 30 * 100)}%`,
                      background: TERRACOTTA,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <div className="text-sm font-semibold text-stone-700">
              {isEn ? 'Least affected (most resilient)' : 'Menos afectados (más resilientes)'}
            </div>
            {covidBest.map(d => (
              <div key={d.code} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-600">{d.name}</span>
                  <span className="font-bold tabular-nums" style={{ color: d.change >= 0 ? TEAL : '#78716c' }}>
                    {d.change >= 0 ? '+' : ''}{d.change}%
                  </span>
                </div>
                <div className="h-1.5 rounded bg-stone-100">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${Math.min(100, Math.abs(d.change) / 30 * 100)}%`,
                      background: d.change >= 0 ? TEAL : '#94a3b8',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-stone-400">
          {isEn
            ? 'NTL captures the COVID impact in real time — official GDP data took up to 6 months to confirm what satellites were already showing in 2020.'
            : 'NTL capta el impacto del COVID en tiempo real — los datos de PBI oficial tardaron hasta 6 meses en confirmar lo que los satélites ya mostraban en 2020.'}
        </p>
      </FadeSection>

      {/* Policy takeaway */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h2 className="text-xl font-bold text-stone-900">
            {isEn
              ? 'What the lights tell a policymaker'
              : 'Lo que dicen las luces a un hacedor de política'}
          </h2>
          <div className="space-y-3">
            {policyRows.map((row, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: row.dot }}/>
                <span className="text-stone-600 leading-relaxed">{row.text}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      <div className="flex justify-between pt-4">
        <Link
          href="/observatorio/luces-nocturnas/tendencias"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: CARD_BG, color: TEAL, border: `2px solid ${TEAL}` }}
        >
          {isEn ? '← See trends' : '← Ver tendencias'}
        </Link>
        <Link
          href="/observatorio/luces-nocturnas/metodologia"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: CARD_BG, color: '#6b7280', border: `2px solid #d1d5db` }}
        >
          {isEn ? 'Methodology →' : 'Metodología →'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
