'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import FadeSection from './components/FadeSection';
import SourceFooter from './components/SourceFooter';
import { TERRACOTTA, TEAL, CARD_BG, CARD_BORDER } from './components/macroData';
import CiteButton from '../../components/CiteButton';
import ShareButton from '../../components/ShareButton';

const BASE = '/simuladores/impacto-macro';

const NAV_CARDS = [
  {
    href: `${BASE}/crecimiento-pobreza`,
    icon: '📉',
    title: 'Simulador de Pobreza',
    desc: '¿Cuánto sube o baja la pobreza si el PBI crece X%?',
    badge: 'Nivel 1 — Alta confianza',
    badgeColor: TEAL,
  },
  {
    href: `${BASE}/politica-monetaria`,
    icon: '🏦',
    title: 'Política Monetaria',
    desc: '¿Qué pasa con el PBI y la pobreza si el BCRP sube la tasa?',
    badge: 'Nivel 2 — Estimación puntual',
    badgeColor: '#d97706',
  },
  {
    href: `${BASE}/tipo-cambio`,
    icon: '💱',
    title: 'Tipo de Cambio',
    desc: '¿Cuánto sube la inflación si el sol se deprecia?',
    badge: 'Nivel 2 — Significativo',
    badgeColor: '#d97706',
  },
  {
    href: `${BASE}/escenarios`,
    icon: '🗺️',
    title: 'Escenarios',
    desc: 'Simula crisis, booms, o diseña tu propio escenario macroeconómico',
    badge: 'Simula escenarios de crecimiento y su impacto en pobreza',
    badgeColor: '#6b7280',
  },
  {
    href: `${BASE}/metodologia`,
    icon: '📋',
    title: 'Metodología',
    desc: 'Cómo estimamos. VAR, regresiones, 10 estrategias comparadas, auditoría completa.',
    badge: 'Para investigadores',
    badgeColor: '#6b7280',
  },
];

export default function ImpactoMacroLanding() {
  const isEn = useLocale() === 'en';
  const NAV_CARDS_I18N = [
    {
      href: `${BASE}/crecimiento-pobreza`,
      icon: '📉',
      title: isEn ? 'Poverty Simulator' : 'Simulador de Pobreza',
      desc: isEn ? 'How much does poverty rise or fall if GDP grows X%?' : '¿Cuánto sube o baja la pobreza si el PBI crece X%?',
      badge: isEn ? 'Tier 1 — High confidence' : 'Nivel 1 — Alta confianza',
      badgeColor: TEAL,
    },
    {
      href: `${BASE}/politica-monetaria`,
      icon: '🏦',
      title: isEn ? 'Monetary Policy' : 'Política Monetaria',
      desc: isEn ? 'What happens to GDP and poverty if the BCRP raises rates?' : '¿Qué pasa con el PBI y la pobreza si el BCRP sube la tasa?',
      badge: isEn ? 'Tier 2 — Point estimate' : 'Nivel 2 — Estimación puntual',
      badgeColor: '#d97706',
    },
    {
      href: `${BASE}/tipo-cambio`,
      icon: '💱',
      title: isEn ? 'Exchange Rate' : 'Tipo de Cambio',
      desc: isEn ? 'How much does inflation rise if the sol depreciates?' : '¿Cuánto sube la inflación si el sol se deprecia?',
      badge: isEn ? 'Tier 2 — Significant' : 'Nivel 2 — Significativo',
      badgeColor: '#d97706',
    },
    {
      href: `${BASE}/escenarios`,
      icon: '🗺️',
      title: isEn ? 'Scenarios' : 'Escenarios',
      desc: isEn ? 'Simulate crises, booms, or design your own macro scenario.' : 'Simula crisis, booms, o diseña tu propio escenario macroeconómico.',
      badge: isEn ? 'Simulate growth scenarios and their poverty impact' : 'Simula escenarios de crecimiento y su impacto en pobreza',
      badgeColor: '#6b7280',
    },
    {
      href: `${BASE}/metodologia`,
      icon: '📋',
      title: isEn ? 'Methodology' : 'Metodología',
      desc: isEn ? 'How we estimate. VAR, regressions, 10 strategies compared, full audit.' : 'Cómo estimamos. VAR, regresiones, 10 estrategias comparadas, auditoría completa.',
      badge: isEn ? 'For researchers' : 'Para investigadores',
      badgeColor: '#6b7280',
    },
  ];
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-8 pt-4">
        <div
          className="inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: '#78716c' }}
        >
          {isEn ? 'BCRP quarterly data 2004–2025 · ENAHO 2005–2024 · Audited estimates' : 'BCRP datos trimestrales 2004–2025 · ENAHO 2005–2024 · Estimaciones auditadas'}
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 leading-tight tracking-tight">
            {isEn
              ? <>How do economic shocks<br className="hidden sm:block" /> affect poverty?</>
              : <>¿Cómo afectan los shocks<br className="hidden sm:block" /> económicos a la pobreza?</>}
          </h1>
          <p className="text-xl text-stone-500 font-light max-w-2xl mx-auto">
            {isEn
              ? 'We estimate how much poverty changes when GDP grows, when the BCRP moves rates, or when the sol depreciates. With confidence intervals throughout.'
              : 'Estimamos cuánto cambia la pobreza cuando crece el PBI, cuando el BCRP mueve la tasa, o cuando el sol se deprecia. Con intervalos de confianza en todo momento.'}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            <CiteButton indicator={isEn ? 'Macro Impact Simulator' : 'Simulador de Impacto Macroeconómico'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Macro Impact — Qhawarina' : 'Impacto Macro — Qhawarina'}
              text={isEn
                ? '🔬 Macro impact simulator for Peru | Qhawarina\nhttps://qhawarina.pe/simuladores/impacto-macro'
                : '🔬 Simulador de impacto macroeconómico en Perú | Qhawarina\nhttps://qhawarina.pe/simuladores/impacto-macro'}
            />
          </div>
        </div>

        {/* 3 headline cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          {/* Card 1 — Tier 1 */}
          <div
            className="rounded-2xl p-6 space-y-2"
            style={{ background: CARD_BG, border: `2px solid ${TEAL}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: TEAL }}>
              {isEn ? 'Growth → Poverty' : 'Crecimiento → Pobreza'}
            </div>
            <div className="text-4xl font-black" style={{ color: TEAL }}>−0.656</div>
            <p className="text-sm text-stone-600 leading-snug">
              {isEn ? 'For each 1% more growth, poverty falls 0.66pp' : 'Por cada 1% más de crecimiento, la pobreza cae 0.66pp'}
            </p>
            <div className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white" style={{ background: TEAL }}>
              {isEn ? 'High confidence' : 'Alta confianza'}
            </div>
          </div>

          {/* Card 2 — Tier 2 */}
          <div
            className="rounded-2xl p-6 space-y-2"
            style={{ background: CARD_BG, border: `2px solid #d97706`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#d97706' }}>
              {isEn ? 'BCRP Rate → GDP' : 'Tasa BCRP → PBI'}
            </div>
            <div className="text-4xl font-black" style={{ color: '#d97706' }}>−0.20pp</div>
            <p className="text-sm text-stone-600 leading-snug">
              {isEn ? '100bp hike reduces GDP by ~0.20pp' : '100pb de alza reducen el PBI en ~0.20pp'}
            </p>
            <div className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white" style={{ background: '#d97706' }}>
              {isEn ? 'CI includes zero' : 'IC incluye cero'}
            </div>
          </div>

          {/* Card 3 — Tier 2 */}
          <div
            className="rounded-2xl p-6 space-y-2"
            style={{ background: CARD_BG, border: `2px solid #d97706`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#d97706' }}>
              {isEn ? 'Depreciation → Inflation' : 'Depreciación → Inflación'}
            </div>
            <div className="text-4xl font-black" style={{ color: '#d97706' }}>+0.24pp</div>
            <p className="text-sm text-stone-600 leading-snug">
              {isEn ? '10% sol depreciation raises inflation 0.24pp' : '10% de depreciación del sol sube la inflación 0.24pp'}
            </p>
            <div className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white" style={{ background: '#d97706' }}>
              {isEn ? 'Significant' : 'Significativo'}
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

      {/* ── NAV CARDS ──────────────────────────────────────────────────────── */}
      <FadeSection className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-stone-900">
            {isEn ? 'Explore in detail' : 'Explora en detalle'}
          </h2>
          <p className="text-stone-500 text-sm">
            {isEn ? 'Five sections. Each one digs into a different angle.' : 'Cinco secciones. Cada una profundiza en un ángulo distinto.'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_CARDS_I18N.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl p-6 space-y-3 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: CARD_BG,
                border: `1px solid ${CARD_BORDER}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div className="text-3xl">{card.icon}</div>
              <div>
                <div className="font-bold text-stone-800 group-hover:text-stone-900 transition-colors">
                  {card.title}
                </div>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">{card.desc}</p>
              </div>
              <div
                className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white"
                style={{ background: card.badgeColor }}
              >
                {card.badge}
              </div>
            </Link>
          ))}
        </div>
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

      {/* ── WHAT THIS IS NOT ───────────────────────────────────────────────── */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-2"
          style={{ background: '#fffbeb', border: `1px solid #fcd34d` }}
        >
          <div className="font-semibold text-amber-900">
            ⚠️ {isEn ? 'What these tools are — and what they are not' : 'Qué son estas herramientas — y qué no son'}
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            {isEn
              ? <>These tools estimate <strong>historical average relationships</strong> between macroeconomic variables in the Peruvian economy. <strong>They are not forecasts of the future.</strong> Confidence intervals reflect the statistical uncertainty of each estimate — real uncertainty is greater (structural changes, unprecedented shocks, unmodeled interactions). Interpret results as orders of magnitude, not exact predictions.</>
              : <>Estas herramientas estiman <strong>relaciones históricas promedio</strong> entre variables macroeconómicas en la economía peruana. <strong>No son predicciones del futuro.</strong> Los intervalos de confianza reflejan la incertidumbre estadística de cada estimación — la incertidumbre real es mayor (cambios estructurales, shocks sin precedente, interacciones no modeladas). Interpreta los resultados como órdenes de magnitud, no como pronósticos exactos.</>}
          </p>
        </div>
      </FadeSection>

      {/* ── DATA BADGE ─────────────────────────────────────────────────────── */}
      <div className="text-center pb-4">
        <span
          className="inline-block rounded-full px-5 py-2 text-xs font-medium tracking-wide"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}`, color: '#78716c' }}
        >
          {isEn
            ? 'BCRP quarterly 2004–2025 (T=85) · ENAHO 2005–2024 (N=18) · Own audited estimates · Code available'
            : 'BCRP trimestral 2004–2025 (T=85) · ENAHO 2005–2024 (N=18) · Estimaciones propias auditadas · Código disponible'}
        </span>
      </div>

      <SourceFooter />
    </div>
  );
}
