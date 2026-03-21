import Link from 'next/link';
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
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-8 pt-4">
        <div
          className="inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: '#78716c' }}
        >
          BCRP datos trimestrales 2004–2025 · ENAHO 2005–2024 · Estimaciones auditadas
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 leading-tight tracking-tight">
            ¿Cómo afectan los shocks<br className="hidden sm:block" /> económicos a la pobreza?
          </h1>
          <p className="text-xl text-stone-500 font-light max-w-2xl mx-auto">
            Estimamos cuánto cambia la pobreza cuando crece el PBI,
            cuando el BCRP mueve la tasa, o cuando el sol se deprecia.
            Con intervalos de confianza en todo momento.
          </p>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            <CiteButton indicator="Simulador de Impacto Macroeconómico" isEn={false} />
            <ShareButton
              title="Impacto Macro — Qhawarina"
              text={"🔬 Simulador de impacto macroeconómico en Perú | Qhawarina\nhttps://qhawarina.pe/simuladores/impacto-macro"}
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
              Crecimiento → Pobreza
            </div>
            <div className="text-4xl font-black" style={{ color: TEAL }}>−0.656</div>
            <p className="text-sm text-stone-600 leading-snug">
              Por cada 1% más de crecimiento, la pobreza cae 0.66pp
            </p>
            <div className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white" style={{ background: TEAL }}>
              Alta confianza
            </div>
          </div>

          {/* Card 2 — Tier 2 */}
          <div
            className="rounded-2xl p-6 space-y-2"
            style={{ background: CARD_BG, border: `2px solid #d97706`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#d97706' }}>
              Tasa BCRP → PBI
            </div>
            <div className="text-4xl font-black" style={{ color: '#d97706' }}>−0.20pp</div>
            <p className="text-sm text-stone-600 leading-snug">
              100pb de alza reducen el PBI en ~0.20pp
            </p>
            <div className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white" style={{ background: '#d97706' }}>
              IC incluye cero
            </div>
          </div>

          {/* Card 3 — Tier 2 */}
          <div
            className="rounded-2xl p-6 space-y-2"
            style={{ background: CARD_BG, border: `2px solid #d97706`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#d97706' }}>
              Depreciación → Inflación
            </div>
            <div className="text-4xl font-black" style={{ color: '#d97706' }}>+0.24pp</div>
            <p className="text-sm text-stone-600 leading-snug">
              10% de depreciación del sol sube la inflación 0.24pp
            </p>
            <div className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block text-white" style={{ background: '#d97706' }}>
              Significativo
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

      {/* ── NAV CARDS ──────────────────────────────────────────────────────── */}
      <FadeSection className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-stone-900">Explora en detalle</h2>
          <p className="text-stone-500 text-sm">Cinco secciones. Cada una profundiza en un ángulo distinto.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_CARDS.map(card => (
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
          <div className="font-semibold text-amber-900">⚠️ Qué son estas herramientas — y qué no son</div>
          <p className="text-sm text-amber-800 leading-relaxed">
            Estas herramientas estiman <strong>relaciones históricas promedio</strong> entre variables
            macroeconómicas en la economía peruana. <strong>No son predicciones del futuro.</strong> Los
            intervalos de confianza reflejan la incertidumbre estadística de cada estimación — la
            incertidumbre real es mayor (cambios estructurales, shocks sin precedente, interacciones
            no modeladas). Interpreta los resultados como órdenes de magnitud, no como pronósticos exactos.
          </p>
        </div>
      </FadeSection>

      {/* ── DATA BADGE ─────────────────────────────────────────────────────── */}
      <div className="text-center pb-4">
        <span
          className="inline-block rounded-full px-5 py-2 text-xs font-medium tracking-wide"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}`, color: '#78716c' }}
        >
          BCRP trimestral 2004–2025 (T=85) · ENAHO 2005–2024 (N=18) · Estimaciones propias auditadas · Código disponible
        </span>
      </div>

      <SourceFooter />
    </div>
  );
}
