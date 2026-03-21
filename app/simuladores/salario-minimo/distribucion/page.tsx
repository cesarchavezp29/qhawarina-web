'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import EventTabs from '../components/EventTabs';
import BunchingChart from '../components/BunchingChart';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import { TERRACOTTA, TEAL, CARD_BG, CARD_BORDER, EVENTS } from '../components/mwData';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

export default function DistribucionPage() {
  const isEn = useLocale() === 'en';
  const [activeEvent, setActiveEvent] = useState(1);
  const ev = EVENTS[activeEvent];

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16" style={{ zIndex: 1 }}>

      {/* Header */}
      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">
          {isEn ? 'Minimum Wage / Distribution' : 'Salario Mínimo / Distribución'}
        </p>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn
              ? 'Wage distribution before and after'
              : 'La distribución salarial antes y después'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Wage distribution before and after minimum wage increases in Peru (ENAHO 2015–2023)'
                : 'Distribución salarial antes y después de aumentos del salario mínimo en Perú (ENAHO 2015–2023)'}
              isEn={isEn}
            />
            <ShareButton
              title={isEn
                ? 'Wage distribution and minimum wage — Qhawarina'
                : 'Distribución salarial y salario mínimo — Qhawarina'}
              text={isEn
                ? 'How the formal wage distribution changes with minimum wage increases in Peru. https://qhawarina.pe/simuladores/salario-minimo/distribucion'
                : 'Cómo cambia la distribución salarial formal ante aumentos del salario mínimo en Perú. https://qhawarina.pe/simuladores/salario-minimo/distribucion'}
            />
          </div>
        </div>
        <p className="text-stone-500 max-w-2xl">
          {isEn
            ? 'Formal dependent workers · ENAHO · Each bar shows the change in worker share in that wage bracket (post − pre). Red bars: mass disappearing below the new MW. Green bars: mass reappearing above.'
            : 'Trabajadores formales dependientes · ENAHO · Cada barra muestra el cambio en la participación de trabajadores en ese tramo salarial (post − pre). Barras rojas: masa que desaparece bajo el nuevo SM. Barras verdes: masa que reaparece por encima.'}
        </p>
      </section>

      {/* Main chart */}
      <FadeSection className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {isEn
                ? `Distribution Change — Event ${ev.label}`
                : `Cambio en la distribución — Evento ${ev.label}`}
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              {ev.sublabel} ({ev.pre_year} → {ev.post_year}) · Bins S/25
            </p>
          </div>
          <EventTabs active={activeEvent} onChange={setActiveEvent}/>
        </div>

        <div
          className="rounded-3xl p-6 sm:p-8 space-y-6"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          {/* Legend */}
          <div className="flex flex-wrap gap-5 text-xs text-stone-500">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded" style={{ background: TERRACOTTA, opacity: 0.85 }}/>
              {isEn
                ? `Jobs disappearing below S/${ev.mw_new}`
                : `Empleos que desaparecen bajo S/${ev.mw_new}`}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded" style={{ background: TEAL, opacity: 0.85 }}/>
              {isEn ? 'Jobs reappearing above' : 'Empleos que reaparecen por encima'}
            </span>
            <span className="flex items-center gap-2 text-stone-400">
              <span className="inline-block w-6" style={{ borderTop: `2.5px dashed ${TERRACOTTA}` }}/>
              {isEn ? `New MW: S/${ev.mw_new}` : `Nuevo SM: S/${ev.mw_new}`}
            </span>
          </div>

          <BunchingChart ev={ev}/>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <div className="text-center">
              <div className="text-2xl font-black tabular-nums" style={{ color: TERRACOTTA }}>
                −{ev.missing_pp.toFixed(1)}pp
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                {isEn ? 'Missing mass' : 'Masa desaparecida'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black tabular-nums" style={{ color: TEAL }}>
                +{ev.excess_pp.toFixed(1)}pp
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                {isEn ? 'Excess mass' : 'Masa en exceso'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black tabular-nums text-stone-800">
                <span style={{ color: TERRACOTTA }}>{Math.round(ev.ratio * 100)}</span>
                <span className="text-stone-300 font-normal text-lg">/100</span>
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                {isEn ? 'Return to formal market' : 'Regresan al mercado formal'}
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-400">
            {isEn ? '95% bootstrap CI' : 'IC bootstrap 95%'}: [{ev.ci_lo.toFixed(3)}, {ev.ci_hi.toFixed(3)}] ·{' '}
            {ev.ci_hi >= 1
              ? (isEn ? 'Does not reject R=1 (consistent with perfect redistribution)' : 'No rechaza R=1 (compatible con redistribución perfecta)')
              : (isEn ? 'Rejects R=1 at 95%' : 'Rechaza R=1 al 95%')} ·{' '}
            {isEn
              ? `Red zone: missing mass · Green zone: excess window [MW, MW+S/220)`
              : `Zona roja: masa desaparecida · Zona verde: ventana de exceso [SM, SM+S/220)`}
          </p>
        </div>
      </FadeSection>

      {/* How to read this */}
      <FadeSection className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900">
          {isEn ? 'How to read this chart?' : '¿Cómo leer este gráfico?'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              color: TERRACOTTA,
              icon: '↓',
              title: isEn ? 'Red zone — missing mass' : 'Zona roja — masa desaparecida',
              body: isEn
                ? `Workers earning between S/${Math.round(0.85 * ev.mw_old)} and S/${ev.mw_new} in the pre period disappear from that zone in the post period. The MW increase makes that bracket "forbidden".`
                : `Los trabajadores que ganaban entre S/${Math.round(0.85 * ev.mw_old)} y S/${ev.mw_new} en el período pre desaparecen de esa zona en el período post. El aumento del SM hace que ese tramo quede "prohibido".`,
            },
            {
              color: TEAL,
              icon: '↑',
              title: isEn ? 'Green zone — excess mass' : 'Zona verde — masa en exceso',
              body: isEn
                ? `Workers reappearing just above the new MW (S/${ev.mw_new}). Many of them came from the red zone — they were "pushed" to the new wage floor.`
                : `Los trabajadores que reaparecen justo por encima del nuevo SM (S/${ev.mw_new}). Muchos de ellos venían de la zona roja — fueron "empujados" al nuevo piso salarial.`,
            },
            {
              color: '#6b7280',
              icon: 'R',
              title: 'Ratio R = excess / missing',
              body: isEn
                ? `R = ${ev.ratio.toFixed(3)} means that for every 100 jobs disappearing below the new MW, ${Math.round(ev.ratio * 100)} reappear above it. R=1 would be perfect redistribution.`
                : `R = ${ev.ratio.toFixed(3)} significa que por cada 100 empleos que desaparecen bajo el nuevo SM, ${Math.round(ev.ratio * 100)} reaparecen por encima. R=1 sería redistribución perfecta.`,
            },
          ].map(item => (
            <div
              key={item.title}
              className="rounded-2xl p-5 space-y-2"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div className="text-2xl font-black" style={{ color: item.color }}>{item.icon}</div>
              <div className="font-semibold text-stone-800 text-sm">{item.title}</div>
              <p className="text-xs text-stone-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </FadeSection>

      {/* Lima note */}
      <FadeSection>
        <div
          className="rounded-2xl px-6 py-5 space-y-2"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
        >
          <div className="font-semibold text-stone-700 text-sm">
            {isEn ? 'Note: Metropolitan Lima' : 'Nota: Lima Metropolitana'}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {isEn
              ? 'The same patterns are observed in EPE Lima (independent dataset, 6-month windows, formality defined by EsSalud affiliation). Ratios: 1.031 (2016), 0.733 (2018), 0.885 (2022) — all within the ENAHO bootstrap CIs. EPE Lima uses a more restrictive formality definition than ENAHO.'
              : 'Los mismos patrones se observan en EPE Lima (dataset independiente, ventanas de 6 meses, formalidad definida por afiliación a EsSalud). Ratios: 1.031 (2016), 0.733 (2018), 0.885 (2022) — todos dentro de los IC bootstrap de ENAHO. EPE Lima usa definición de formalidad más restrictiva que ENAHO.'}
          </p>
        </div>
      </FadeSection>

      {/* Next section */}
      <div className="flex justify-end pt-4">
        <Link
          href="/simuladores/salario-minimo/evidencia"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: TERRACOTTA, color: 'white' }}
        >
          {isEn ? 'Next: Evidence →' : 'Siguiente: Evidencia →'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
