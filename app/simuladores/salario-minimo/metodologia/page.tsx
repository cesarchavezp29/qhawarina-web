'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import { TERRACOTTA, CARD_BG, CARD_BORDER } from '../components/mwData';
import CiteButton from '../../../components/CiteButton';

function AccordionTable({ rows }: { rows: string[][] }) {
  const [header, ...body] = rows;
  return (
    <div className="overflow-x-auto rounded-xl my-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: `1px solid ${CARD_BORDER}` }}>
            {header.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-semibold text-stone-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < body.length - 1 ? `1px solid ${CARD_BORDER}` : undefined }}>
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'font-medium text-stone-700' : 'text-stone-500'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MetodologiaPage() {
  const isEn = useLocale() === 'en';
  const [openSection, setOpenSection] = useState<string | null>(null);

  const ACCORDION_SECTIONS = [
    {
      id: 'metodo',
      title: isEn ? 'A. Pre-post distributional estimator' : 'A. Estimador distribucional pre-post',
      content: [
        {
          type: 'p' as const,
          text: isEn
            ? 'Pre-post estimator adapted from Harasztosi & Lindner (2016, Hungary) for a single national minimum wage. We compare the formal wage distribution before and after in S/25 bins, correcting for the background trend using the upper tail (> 2×MW_new).'
            : 'Estimador pre-post adaptado de Harasztosi & Lindner (2016, Hungría) para salario mínimo nacional único. Comparamos la distribución salarial formal antes y después en bins de S/25, corrigiendo la tendencia de fondo por la cola superior (> 2×SM_nuevo).',
        },
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Concept', 'Definition'],
                ['Missing mass', 'Sum of negative deltas in [0.85×MW_old, MW_new)'],
                ['Excess', 'Sum of positive deltas in [MW_new, MW_new+S/250)'],
                ['Ratio R', 'Excess / missing mass'],
              ]
            : [
                ['Concepto', 'Definición'],
                ['Masa desaparecida', 'Suma de deltas negativos en [0.85×SM_ant, SM_nuevo)'],
                ['Exceso', 'Suma de deltas positivos en [SM_nuevo, SM_nuevo+S/250)'],
                ['Ratio R', 'Exceso / masa desaparecida'],
              ],
        },
        {
          type: 'p' as const,
          text: isEn
            ? 'Unlike Cengiz et al. (2019, USA), no control group is required — Peru has a single national MW. Bootstrap with 1,000 repetitions for 95% CI.'
            : 'A diferencia de Cengiz et al. (2019, EE.UU.), no requiere grupo de control — Perú tiene SM nacional único. Bootstrap 1,000 repeticiones para IC 95%.',
        },
      ],
    },
    {
      id: 'empleo',
      title: isEn ? 'B. Why can\'t we measure the employment effect?' : 'B. ¿Por qué no podemos medir el efecto sobre el empleo?',
      content: [
        {
          type: 'p' as const,
          text: isEn
            ? 'Three methods were attempted, all failed due to structural limitations:'
            : 'Tres métodos fueron intentados, todos fallaron por limitaciones estructurales:',
        },
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Method', 'Result', 'Reason for failure'],
                ['Departmental DiD', 'Pre-trends violated', 'p=0.007 (2018), p=0.017 (2022)'],
                ['Departmental Kaitz IV', 'Weak instrument', 'F=1.5/2.6/0.1 — minimum threshold F>10'],
                ['ENAHO panel 978', '76% attrition', 'Differential attrition treatment/control'],
              ]
            : [
                ['Método', 'Resultado', 'Razón del fallo'],
                ['DiD departamental', 'Pre-tendencias violadas', 'p=0.007 (2018), p=0.017 (2022)'],
                ['IV Kaitz departamental', 'Instrumento débil', 'F=1.5/2.6/0.1 — umbral mínimo F>10'],
                ['Panel ENAHO 978', '76% de desgaste', 'Desgaste diferencial trat./control'],
              ],
        },
        {
          type: 'p' as const,
          text: isEn
            ? 'This is not a data failure — it is an institutional constraint: with a single national MW and 25 departments, there is no valid exogenous variation to identify effects on total employment.'
            : 'Esto no es falla de datos — es una restricción institucional: con SM nacional único y 25 departamentos, no existe variación exógena válida para identificar efectos sobre el empleo total.',
        },
      ],
    },
    {
      id: 'autoempleo',
      title: isEn ? 'C. Self-employment evidence' : 'C. Evidencia de autoempleo',
      content: [
        {
          type: 'p' as const,
          text: isEn
            ? 'Employment composition in the affected zone [0.85×MW_old, MW_new), combining dependent workers (p524a1) and self-employed (p530a = monthly net business income).'
            : 'Composición del empleo en la zona afectada [0.85×SM_ant, SM_nuevo), combinando dependientes (p524a1) y autoempleados (p530a = ingreso neto mensual de negocio).',
        },
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Event', 'Δ self-employment (pp)', 'Absolute change', 'Note'],
                ['A (2015→2017)', '+19.1pp', '+8.7%', 'MW: S/750→850'],
                ['B (2017→2019)', '+20.0pp', '+5.1%', 'MW: S/850→930'],
                ['C (2021→2023)', '+14.7pp', '−3.5%', 'Post-COVID re-formalization'],
              ]
            : [
                ['Evento', 'Δ autoempleo (pp)', 'Cambio absoluto', 'Nota'],
                ['A (2015→2017)', '+19.1pp', '+8.7%', 'SM: S/750→850'],
                ['B (2017→2019)', '+20.0pp', '+5.1%', 'SM: S/850→930'],
                ['C (2021→2023)', '+14.7pp', '−3.5%', 'Re-formalización post-COVID'],
              ],
        },
        {
          type: 'p' as const,
          text: isEn
            ? 'The cross-sectional design does not track individuals — this is indirect evidence, not direct proof of transition. Comparisons are between population distributions, not tracking the same workers.'
            : 'El diseño transversal no rastrea individuos — es evidencia indirecta, no prueba directa de transición. Las comparaciones son entre distribuciones poblacionales, no seguimiento de los mismos trabajadores.',
        },
      ],
    },
    {
      id: 'robustez',
      title: isEn ? 'D. Checks and robustness' : 'D. Verificaciones y robustez',
      content: [
        {
          type: 'p' as const,
          text: isEn
            ? 'Falsification test: ratios at fictitious thresholds S/1,100→1,200 and S/1,400→1,500 are 0.114 and 0.013 — approximately 7× smaller than the real threshold (0.829 in Event B).'
            : 'Test de falsificación: ratios en umbrales ficticios S/1,100→1,200 y S/1,400→1,500 son 0.114 y 0.013 — aproximadamente 7× menores que el umbral real (0.829 en Evento B).',
        },
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Check', 'Result'],
                ['Bootstrap 95% CI — Event A', '[0.567, 0.896]'],
                ['Bootstrap 95% CI — Event B', '[0.716, 1.016]'],
                ['Bootstrap 95% CI — Event C', '[0.716, 0.960]'],
                ['EPE Lima replication (6 months)', '1.031 / 0.733 / 0.885'],
                ['S/50 bins (misaligned)', 'R=0.206 (75% downward bias)'],
              ]
            : [
                ['Verificación', 'Resultado'],
                ['Bootstrap IC 95% — Evento A', '[0.567, 0.896]'],
                ['Bootstrap IC 95% — Evento B', '[0.716, 1.016]'],
                ['Bootstrap IC 95% — Evento C', '[0.716, 0.960]'],
                ['Replicación EPE Lima (6 meses)', '1.031 / 0.733 / 0.885'],
                ['Bins S/50 (mal alineados)', 'R=0.206 (bias 75% a la baja)'],
              ],
        },
        {
          type: 'p' as const,
          text: isEn
            ? 'Bin alignment bias is critical: S/50 bins are not aligned with S/930, introducing systematic error. S/25 bins are used (aligned with all three MW levels).'
            : 'El sesgo de alineación de bins es crítico: bins de S/50 no están alineados con S/930, introduciendo error sistemático. Se usan bins de S/25 (alineados con los tres niveles del SM).',
        },
      ],
    },
    {
      id: 'datos',
      title: isEn ? 'E. Data and sample' : 'E. Datos y muestra',
      content: [
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Source', 'Description', 'N approx.'],
                ['ENAHO 2015–2023', 'Module 500 — formal dependent workers. Excludes 2020.', '8,946–11,090/year'],
                ['EPE Lima', 'Quarterly panel, Metropolitan Lima 2016–2022. Formality = EsSalud.', '~2,600/quarter'],
              ]
            : [
                ['Fuente', 'Descripción', 'N aprox.'],
                ['ENAHO 2015–2023', 'Módulo 500 — trabajadores formales dependientes. Excluye 2020.', '8,946–11,090/año'],
                ['EPE Lima', 'Panel trimestral Lima Metropolitana 2016–2022. Formalidad = EsSalud.', '~2,600/trimestre'],
              ],
        },
        {
          type: 'p' as const,
          text: isEn
            ? 'ENAHO inclusion criteria: employed (ocu500=1), dependent (p507∈{3,4,6} or cat07p500a1=2), formal (ocupinf=2), wage p524a1>0. Sample weight: fac500a.'
            : 'Criterios de inclusión ENAHO: ocupados (ocu500=1), dependientes (p507∈{3,4,6} o cat07p500a1=2), formales (ocupinf=2), salario p524a1>0. Peso muestral: fac500a.',
        },
        {
          type: 'p' as const,
          text: isEn
            ? 'Self-employment: p530a (monthly net business income, Module 500). Departmental Kaitz: MW / formal wage median weighted by fac500a, by department-year.'
            : 'Autoempleo: p530a (ingreso neto mensual de negocio, Módulo 500). Kaitz departamental: SM / mediana salarial formal ponderada por fac500a, por departamento-año.',
        },
      ],
    },
  ];

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12" style={{ zIndex: 1 }}>

      {/* Header */}
      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">
          {isEn ? 'Minimum Wage / Methodology' : 'Salario Mínimo / Metodología'}
        </p>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn ? 'Methodology and checks' : 'Metodología y verificaciones'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Methodology of the pre-post distributional estimator for the minimum wage in Peru (Harasztosi & Lindner 2016)'
                : 'Metodología del estimador distribucional pre-post para el salario mínimo en Perú (Harasztosi & Lindner 2016)'}
              isEn={isEn}
            />
          </div>
        </div>
        <p className="text-stone-500 max-w-2xl">
          {isEn
            ? 'How we measure it. What works and what does not. Transparency for researchers and skeptics.'
            : 'Cómo lo medimos. Qué funciona y qué no. Transparencia para investigadores y escépticos.'}
        </p>
      </section>

      {/* ── ACCORDION ─────────────────────────────────────────────────────────── */}
      <FadeSection className="space-y-3">
        {ACCORDION_SECTIONS.map(sec => (
          <div
            key={sec.id}
            className="rounded-2xl overflow-hidden"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <button
              className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-black/[0.02]"
              onClick={() => setOpenSection(openSection === sec.id ? null : sec.id)}
            >
              <span className="font-semibold text-stone-700 text-sm">{sec.title}</span>
              <span className="text-stone-400 text-xl font-light ml-4 flex-shrink-0 w-5 text-center">
                {openSection === sec.id ? '−' : '+'}
              </span>
            </button>
            {openSection === sec.id && (
              <div className="px-6 pb-5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                <div className="mt-4 space-y-3">
                  {sec.content.map((block, i) =>
                    block.type === 'p' ? (
                      <p key={i} className="text-sm text-stone-600 leading-relaxed">{block.text}</p>
                    ) : (
                      <AccordionTable key={i} rows={block.rows}/>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </FadeSection>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }}/>

      {/* ── LINKS ─────────────────────────────────────────────────────────────── */}
      <FadeSection className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900">
          {isEn ? 'Access to materials' : 'Acceso al material'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: isEn ? 'Full paper' : 'Paper completo',
              desc: isEn ? 'Working paper with all results and appendices' : 'Working paper con todos los resultados y apéndices',
              icon: '📄',
              href: 'https://github.com/cesarchavezp29/qhawarina/blob/master/paper/mw_paper.pdf',
              color: TERRACOTTA,
            },
            {
              label: isEn ? 'Code and data' : 'Código y datos',
              desc: isEn ? 'Python and R scripts. ENAHO data via INEI.' : 'Scripts de Python y R. Datos ENAHO vía INEI.',
              icon: '⌨',
              href: 'https://github.com/cesarchavezp29/qhawarina/tree/master/scripts',
              color: '#6b7280',
            },
            {
              label: isEn ? 'Contact' : 'Contacto',
              desc: 'cchavezp@uchicago.edu',
              icon: '✉',
              href: 'mailto:cchavezp@uchicago.edu',
              color: '#6b7280',
            },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="rounded-2xl p-5 space-y-2 transition-all hover:-translate-y-0.5 block"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="font-semibold text-stone-800 text-sm">{item.label}</div>
              <p className="text-xs text-stone-400">{item.desc}</p>
            </a>
          ))}
        </div>
      </FadeSection>

      {/* Full disclaimer */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-2"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
        >
          <div className="font-semibold text-stone-600 text-sm">
            {isEn ? 'Disclaimer' : 'Descargo de responsabilidad'}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {isEn
              ? 'Results are projections based on evidence from three increases between 2016 and 2022. We were unable to identify the net effect on total employment (see section B). Results do not constitute predictions of the effect of future MW increases. The analysis assumes that the 2022 distributional structure is comparable to the current one, which may not be valid given the post-pandemic context.'
              : 'Los resultados son proyecciones basadas en evidencia de tres aumentos entre 2016 y 2022. No pudimos identificar el efecto neto sobre el empleo total (ver sección B). Los resultados no constituyen predicciones del efecto de futuros aumentos del SM. El análisis asume que la estructura distribucional de 2022 es comparable a la actual, lo cual puede no ser válido dado el contexto post-pandemia.'}
          </p>
        </div>
      </FadeSection>

      {/* Back to overview */}
      <div className="flex justify-start pt-4">
        <Link
          href="/simuladores/salario-minimo"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: CARD_BG, color: TERRACOTTA, border: `2px solid ${TERRACOTTA}` }}
        >
          {isEn ? '← Back to overview' : '← Volver al resumen'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
