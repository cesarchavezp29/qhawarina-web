'use client';

import { useState } from 'react';
import Link from 'next/link';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import { TERRACOTTA, CARD_BG, CARD_BORDER } from '../components/mwData';

const ACCORDION_SECTIONS = [
  {
    id: 'metodo',
    title: 'A. Estimador distribucional pre-post',
    content: [
      {
        type: 'p' as const,
        text: 'Estimador pre-post adaptado de Harasztosi & Lindner (2016, Hungría) para salario mínimo nacional único. Comparamos la distribución salarial formal antes y después en bins de S/25, corrigiendo la tendencia de fondo por la cola superior (> 2×SM_nuevo).',
      },
      {
        type: 'table' as const,
        rows: [
          ['Concepto', 'Definición'],
          ['Masa desaparecida', 'Suma de deltas negativos en [0.85×SM_ant, SM_nuevo)'],
          ['Exceso', 'Suma de deltas positivos en [SM_nuevo, SM_nuevo+S/250)'],
          ['Ratio R', 'Exceso / masa desaparecida'],
        ],
      },
      {
        type: 'p' as const,
        text: 'A diferencia de Cengiz et al. (2019, EE.UU.), no requiere grupo de control — Perú tiene SM nacional único. Bootstrap 1,000 repeticiones para IC 95%.',
      },
    ],
  },
  {
    id: 'empleo',
    title: 'B. ¿Por qué no podemos medir el efecto sobre el empleo?',
    content: [
      {
        type: 'p' as const,
        text: 'Tres métodos fueron intentados, todos fallaron por limitaciones estructurales:',
      },
      {
        type: 'table' as const,
        rows: [
          ['Método', 'Resultado', 'Razón del fallo'],
          ['DiD departamental', 'Pre-tendencias violadas', 'p=0.007 (2018), p=0.017 (2022)'],
          ['IV Kaitz departamental', 'Instrumento débil', 'F=1.5/2.6/0.1 — umbral mínimo F>10'],
          ['Panel ENAHO 978', '76% de desgaste', 'Desgaste diferencial trat./control'],
        ],
      },
      {
        type: 'p' as const,
        text: 'Esto no es falla de datos — es una restricción institucional: con SM nacional único y 25 departamentos, no existe variación exógena válida para identificar efectos sobre el empleo total.',
      },
    ],
  },
  {
    id: 'autoempleo',
    title: 'C. Evidencia de autoempleo',
    content: [
      {
        type: 'p' as const,
        text: 'Composición del empleo en la zona afectada [0.85×SM_ant, SM_nuevo), combinando dependientes (p524a1) y autoempleados (p530a = ingreso neto mensual de negocio).',
      },
      {
        type: 'table' as const,
        rows: [
          ['Evento', 'Δ autoempleo (pp)', 'Cambio absoluto', 'Nota'],
          ['A (2015→2017)', '+19.1pp', '+8.7%', 'SM: S/750→850'],
          ['B (2017→2019)', '+20.0pp', '+5.1%', 'SM: S/850→930'],
          ['C (2021→2023)', '+14.7pp', '−3.5%', 'Re-formalización post-COVID'],
        ],
      },
      {
        type: 'p' as const,
        text: 'El diseño transversal no rastrea individuos — es evidencia indirecta, no prueba directa de transición. Las comparaciones son entre distribuciones poblacionales, no seguimiento de los mismos trabajadores.',
      },
    ],
  },
  {
    id: 'robustez',
    title: 'D. Verificaciones y robustez',
    content: [
      {
        type: 'p' as const,
        text: 'Test de falsificación: ratios en umbrales ficticios S/1,100→1,200 y S/1,400→1,500 son 0.114 y 0.013 — aproximadamente 7× menores que el umbral real (0.829 en Evento B).',
      },
      {
        type: 'table' as const,
        rows: [
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
        text: 'El sesgo de alineación de bins es crítico: bins de S/50 no están alineados con S/930, introduciendo error sistemático. Se usan bins de S/25 (alineados con los tres niveles del SM).',
      },
    ],
  },
  {
    id: 'datos',
    title: 'E. Datos y muestra',
    content: [
      {
        type: 'table' as const,
        rows: [
          ['Fuente', 'Descripción', 'N aprox.'],
          ['ENAHO 2015–2023', 'Módulo 500 — trabajadores formales dependientes. Excluye 2020.', '8,946–11,090/año'],
          ['EPE Lima', 'Panel trimestral Lima Metropolitana 2016–2022. Formalidad = EsSalud.', '~2,600/trimestre'],
        ],
      },
      {
        type: 'p' as const,
        text: 'Criterios de inclusión ENAHO: ocupados (ocu500=1), dependientes (p507∈{3,4,6} o cat07p500a1=2), formales (ocupinf=2), salario p524a1>0. Peso muestral: fac500a.',
      },
      {
        type: 'p' as const,
        text: 'Autoempleo: p530a (ingreso neto mensual de negocio, Módulo 500). Kaitz departamental: SM / mediana salarial formal ponderada por fac500a, por departamento-año.',
      },
    ],
  },
];

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
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12" style={{ zIndex: 1 }}>

      {/* Header */}
      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">Salario Mínimo / Metodología</p>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
          Metodología y verificaciones
        </h1>
        <p className="text-stone-500 max-w-2xl">
          Cómo lo medimos. Qué funciona y qué no. Transparencia para investigadores y escépticos.
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
        <h2 className="text-xl font-bold text-stone-900">Acceso al material</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Paper completo',
              desc: 'Working paper con todos los resultados y apéndices',
              icon: '📄',
              href: '#',
              color: TERRACOTTA,
            },
            {
              label: 'Código y datos',
              desc: 'Scripts de Python y R. Datos ENAHO vía INEI.',
              icon: '⌨',
              href: '#',
              color: '#6b7280',
            },
            {
              label: 'Contacto',
              desc: 'cchavezp@uchicago.edu',
              icon: '✉',
              href: 'mailto:cchavezp@uchicago.edu',
              color: '#6b7280',
            },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
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
          <div className="font-semibold text-stone-600 text-sm">Descargo de responsabilidad</div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Los resultados son proyecciones basadas en evidencia de tres aumentos entre 2016 y 2022.
            No pudimos identificar el efecto neto sobre el empleo total (ver sección B). Los resultados
            no constituyen predicciones del efecto de futuros aumentos del SM. El análisis asume que
            la estructura distribucional de 2022 es comparable a la actual, lo cual puede no ser válido
            dado el contexto post-pandemia.
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
          ← Volver al resumen
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
