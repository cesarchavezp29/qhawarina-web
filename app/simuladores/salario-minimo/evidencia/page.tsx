'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import EventTabs from '../components/EventTabs';
import HStackBar from '../components/HStackBar';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import { TERRACOTTA, TEAL, CARD_BG, CARD_BORDER, EVENTS } from '../components/mwData';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

export default function EvidenciaPage() {
  const isEn = useLocale() === 'en';
  const [activeEvent, setActiveEvent] = useState(1);
  const ev = EVENTS[activeEvent];

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16" style={{ zIndex: 1 }}>

      {/* Header */}
      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">
          {isEn ? 'Minimum Wage / Evidence' : 'Salario Mínimo / Evidencia'}
        </p>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn ? 'How many jobs come back?' : '¿Cuántos empleos regresan?'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Distributional evidence of minimum wage effects on formal employment in Peru (ENAHO 2015–2023)'
                : 'Evidencia distribucional de efectos del salario mínimo sobre el empleo formal en Perú (ENAHO 2015–2023)'}
              isEn={isEn}
            />
            <ShareButton
              title={isEn
                ? 'Minimum wage evidence in Peru — Qhawarina'
                : 'Evidencia del salario mínimo en Perú — Qhawarina'}
              text={isEn
                ? 'Missing vs. excess mass across three minimum wage increases in Peru. Results from the pre–post distributional estimator. https://qhawarina.pe/simuladores/salario-minimo/evidencia'
                : 'Masa desaparecida vs. reaparecida en tres aumentos del salario mínimo en Perú. Resultados del estimador distribucional pre-post. https://qhawarina.pe/simuladores/salario-minimo/evidencia'}
            />
          </div>
        </div>
        <p className="text-stone-500 max-w-2xl">
          {isEn
            ? 'Missing vs. excess mass across three minimum wage increases. Results from the pre–post distributional estimator.'
            : 'Masa desaparecida vs. reaparecida en tres aumentos del salario mínimo. Resultados del estimador distribucional pre-post.'}
        </p>
      </section>

      {/* ── SECTION A: EVIDENCE TABLE ──────────────────────────────────────────── */}
      <FadeSection className="space-y-5">
        <h2 className="text-xl font-bold text-stone-900">
          {isEn ? 'Summary of results' : 'Resumen de resultados'}
        </h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${CARD_BORDER}`, background: 'rgba(0,0,0,0.02)' }}>
                  <th className="text-left px-5 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">
                    {isEn ? 'Event' : 'Evento'}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">
                    {isEn ? 'Disappear' : 'Desaparecen'}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">
                    {isEn ? 'Reappear' : 'Reaparecen'}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">
                    {isEn ? 'Return' : 'Regresan'}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">
                    {isEn ? '95% CI' : 'IC 95%'}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-400 text-xs uppercase tracking-wider">
                    {isEn ? 'Self-emp.' : 'Autoempleo'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {EVENTS.map((e, i) => (
                  <tr
                    key={e.id}
                    onClick={() => setActiveEvent(i)}
                    className="cursor-pointer transition-colors"
                    style={{
                      borderBottom: `1px solid ${CARD_BORDER}`,
                      background: activeEvent === i ? `${TERRACOTTA}08` : undefined,
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-stone-800">{e.label}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{e.sublabel}</div>
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold" style={{ color: TERRACOTTA }}>
                      −{e.missing_pp.toFixed(1)}<span className="text-xs font-normal">pp</span>
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold" style={{ color: TEAL }}>
                      +{e.excess_pp.toFixed(1)}<span className="text-xs font-normal">pp</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-xl font-black tabular-nums" style={{ color: TERRACOTTA }}>
                        {Math.round(e.ratio * 100)}
                      </span>
                      <span className="text-stone-300 text-sm">/100</span>
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-stone-400" style={{ fontSize: 11 }}>
                      [{e.ci_lo.toFixed(2)}, {e.ci_hi.toFixed(2)}]
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold tabular-nums" style={{ color: TEAL }}>
                        ↑{e.selfemp_delta_pp.toFixed(0)}pp
                      </span>
                      <div className="text-xs text-stone-400">{e.selfemp_abs_chg} abs.</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className="rounded-xl px-5 py-3.5 text-xs text-stone-500 space-y-1"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
        >
          <p>
            <strong>{isEn ? 'Falsification test:' : 'Test de falsificación:'}</strong>{' '}
            {isEn
              ? 'Ratios at fictitious thresholds S/1,100→1,200 and S/1,400→1,500 are 0.114 and 0.013 — 7× smaller than the real threshold.'
              : 'Ratios en umbrales ficticios S/1,100→1,200 y S/1,400→1,500 son 0.114 y 0.013 — 7× menores que el umbral real.'}
          </p>
          <p>
            <strong>{isEn ? 'EPE Lima replication:' : 'Replicación EPE Lima:'}</strong>{' '}
            {isEn
              ? 'Independent dataset, 6-month windows, produces ratios 0.73–1.03 — consistent with ENAHO 0.70–0.83.'
              : 'Dataset independiente, ventanas de 6 meses, produce ratios 0.73–1.03 — consistentes con ENAHO 0.70–0.83.'}
          </p>
        </div>
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* ── SECTION B: WHERE DO THEY GO? ───────────────────────────────────────── */}
      <FadeSection className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-stone-900">
            {isEn
              ? 'Where do the workers who disappear go?'
              : '¿A dónde van los trabajadores que desaparecen?'}
          </h2>
          <p className="text-sm text-stone-500 max-w-2xl">
            {isEn
              ? <>Employment composition in the affected zone [0.85×SM<sub>ant</sub>, SM<sub>nuevo</sub>), before and after</>
              : <>Composición del empleo en la zona afectada [0.85×SM<sub>ant</sub>, SM<sub>nuevo</sub>), antes y después</>}
          </p>
        </div>

        <EventTabs active={activeEvent} onChange={setActiveEvent} color={TEAL}/>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Stacked bars */}
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="flex gap-4 text-xs flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ background: TERRACOTTA }}/>
                {isEn ? 'Formal dep.' : 'Formal dep.'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ background: '#94a3b8' }}/>
                {isEn ? 'Informal dep.' : 'Informal dep.'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ background: TEAL }}/>
                {isEn ? 'Self-employed' : 'Autoempleado'}
              </span>
            </div>
            <HStackBar
              formal={ev.formal_pre} informal={ev.informal_pre} selfemp={ev.selfemp_pre}
              label={isEn ? `Before (${ev.pre_year})` : `Antes (${ev.pre_year})`}
            />
            <HStackBar
              formal={ev.formal_post} informal={ev.informal_post} selfemp={ev.selfemp_post}
              label={isEn ? `After (${ev.post_year})` : `Después (${ev.post_year})`}
            />

            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: TERRACOTTA }}>
                  {ev.formal_pre.toFixed(0)}%→{ev.formal_post.toFixed(0)}%
                </div>
                <div className="text-xs text-stone-400">{isEn ? 'Formal dep.' : 'Formal dep.'}</div>
              </div>
              <div className="text-stone-200 text-2xl">·</div>
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: TEAL }}>
                  {ev.selfemp_pre.toFixed(0)}%→{ev.selfemp_post.toFixed(0)}%
                </div>
                <div className="text-xs text-stone-400">{isEn ? 'Self-employed' : 'Autoempleado'}</div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-4">
            <div
              className="rounded-2xl p-6 space-y-3"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            >
              <div className="text-3xl font-black tabular-nums" style={{ color: TEAL }}>
                ↑{ev.selfemp_delta_pp.toFixed(0)}pp
              </div>
              <p className="text-sm font-semibold text-stone-800">
                {isEn
                  ? `in self-employment in the affected zone (${ev.pre_year} → ${ev.post_year})`
                  : `de autoempleo en la zona afectada (${ev.pre_year} → ${ev.post_year})`}
              </p>
              <div className="space-y-2 text-sm text-stone-600 border-t pt-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                {[
                  { label: isEn ? 'Formal dep.'   : 'Formal dep.',   pre: ev.formal_pre,   post: ev.formal_post,   color: TERRACOTTA },
                  { label: isEn ? 'Informal dep.' : 'Informal dep.', pre: ev.informal_pre, post: ev.informal_post, color: '#94a3b8' },
                  { label: isEn ? 'Self-employed' : 'Autoempleado',  pre: ev.selfemp_pre,  post: ev.selfemp_post,  color: TEAL },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-stone-500">{row.label}</span>
                    <span>
                      <span className="font-bold tabular-nums" style={{ color: row.color }}>{row.pre.toFixed(1)}%</span>
                      <span className="text-stone-300 mx-1">→</span>
                      <span className="font-bold tabular-nums" style={{ color: row.color }}>{row.post.toFixed(1)}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 space-y-2" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div className="font-bold text-amber-900 text-sm">
                {isEn
                  ? 'Total employment holds. The TYPE changes.'
                  : 'El empleo total se mantiene. La MODALIDAD cambia.'}
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {isEn
                  ? 'The increase in self-employment does not imply equivalent welfare — informal self-employed workers lose access to social security. But it does not imply employment destruction either.'
                  : 'El aumento en autoempleo no implica bienestar equivalente — los autoempleados informales pierden acceso a seguridad social. Pero tampoco implica destrucción de empleo.'}
              </p>
              {ev.id === 'C' && (
                <p className="text-xs text-amber-700 leading-relaxed border-t border-amber-200 pt-2">
                  <strong>{isEn ? 'Event C:' : 'Evento C:'}</strong>{' '}
                  {isEn
                    ? 'Absolute count of self-employed falls (−3.5%), consistent with post-COVID re-formalization (formal labor force grew 12.5% in 2021–2023).'
                    : 'Recuento absoluto de autoempleados cae (−3.5%), consistente con re-formalización post-COVID (fuerza laboral formal creció 12.5% en 2021–2023).'}
                </p>
              )}
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              {isEn
                ? 'Source: ENAHO Module 500. Self-employed income: p530a (monthly net business income). Cross-sectional design — individuals are not tracked. Indirect evidence, not direct proof of transition.'
                : 'Fuente: ENAHO Módulo 500. Ingresos de autoempleados: p530a (ingreso neto mensual de negocio). Diseño transversal — no se rastrean individuos. Evidencia indirecta, no prueba directa de transición.'}
            </p>
          </div>
        </div>
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* ── SECTION C: SECONDARY FINDINGS ─────────────────────────────────────── */}
      <FadeSection className="space-y-5">
        <h2 className="text-xl font-bold text-stone-900">
          {isEn ? 'Secondary findings' : 'Hallazgos secundarios'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-3xl p-7 space-y-4"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="text-xs font-bold tracking-widest uppercase text-stone-400">
              {isEn ? 'Finding A' : 'Hallazgo A'}
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              {isEn ? 'Wage compression' : 'Compresión salarial'}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {isEn
                ? 'The MW increase compresses the p10–p50 by 3–7 percentage points (DiD in log-wage).'
                : 'El aumento del SM comprime el p10–p50 en 3–7 puntos porcentuales (DiD en log-salario).'}
            </p>
            <div
              className="rounded-xl px-4 py-3 space-y-2 text-xs text-stone-600"
              style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
            >
              <div className="font-semibold text-stone-700">
                {isEn ? 'Mechanical vs. genuine (Event B)' : 'Mecánica vs. genuina (Evento B)'}
              </div>
              <div className="flex justify-between">
                <span>{isEn ? 'Composition (mechanical)' : 'Composición (mecánica)'}</span>
                <span className="font-bold">41–92%</span>
              </div>
              <div className="flex justify-between">
                <span>{isEn ? 'Real reordering (genuine)' : 'Reordenamiento real (genuina)'}</span>
                <span className="font-bold" style={{ color: TEAL }}>8–59%</span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {isEn
                ? 'Most of the compression reflects changes in who occupies the MW zone, not real wage increases for the same workers.'
                : 'La mayor parte de la compresión refleja cambios en quién ocupa la zona del SM, no alzas reales para los mismos trabajadores.'}
            </p>
          </div>

          <div
            className="rounded-3xl p-7 space-y-4"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="text-xs font-bold tracking-widest uppercase text-stone-400">
              {isEn ? 'Finding B' : 'Hallazgo B'}
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              {isEn ? 'Who is most affected?' : '¿A quién afecta más?'}
            </h3>
            <div className="space-y-3 text-sm">
              {[
                {
                  dot: TEAL,
                  title: isEn
                    ? 'Private sector absorbs better (0.83 vs. 0.75)'
                    : 'Sector privado absorbe mejor (0.83 vs. 0.75)',
                  sub: isEn
                    ? 'Consistent with market adjustment, not compliance via inspection.'
                    : 'Consistente con ajuste de mercado, no cumplimiento por inspección.',
                },
                {
                  dot: TERRACOTTA,
                  title: isEn
                    ? 'No gradient by age, sex, or ethnicity within formal employment'
                    : 'Sin gradiente por edad, sexo ni etnicidad dentro del empleo formal',
                  sub: isEn
                    ? 'Similar ratios across men/women and age groups.'
                    : 'Ratios similares entre hombres/mujeres y grupos de edad.',
                },
                {
                  dot: '#f59e0b',
                  title: isEn
                    ? 'The ethnic gap operates through ACCESS, not wages'
                    : 'La brecha étnica opera por ACCESO, no por salarios',
                  sub: isEn
                    ? 'Indigenous workers: 5.7% formality vs. 20.7% for Spanish speakers. Within formal employment, MW exposure is similar.'
                    : 'Trabajadores indígenas: 5.7% de formalidad vs. 20.7% para hablantes de castellano. Dentro del empleo formal, la exposición al SM es similar.',
                },
              ].map(row => (
                <div key={row.title} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: row.dot }}/>
                  <div>
                    <span className="font-semibold text-stone-800">{row.title}</span>
                    <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{row.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeSection>

      {/* Next section */}
      <div className="flex justify-end pt-4">
        <Link
          href="/simuladores/salario-minimo/kaitz"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: TERRACOTTA, color: 'white' }}
        >
          {isEn ? 'Next: Regional map →' : 'Siguiente: Mapa regional →'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
