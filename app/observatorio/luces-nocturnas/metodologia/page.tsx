'use client';

import { useState } from 'react';
import Link from 'next/link';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER, VALIDATION,
} from '../components/ntlData';

const ACCORDION = [
  {
    id: 'ntl',
    title: 'A. ¿Qué son las luces nocturnas?',
    content: [
      {
        type: 'p' as const,
        text: 'Los satélites DMSP-OLS (1992-2013) y VIIRS-DNB (2012-presente) fotografían la Tierra cada noche, midiendo la luz artificial emitida por ciudades, industrias y carreteras. Usamos la serie armonizada de Chen et al. (2024), que calibra ambos sensores para ser comparables en el tiempo.',
      },
      {
        type: 'table' as const,
        rows: [
          ['Sensor', 'Período', 'Resolución', 'Composites'],
          ['DMSP-OLS', '1992–2013', '~1 km', 'Anuales'],
          ['VIIRS-DNB', '2012–presente', '~500 m', 'Mensuales'],
          ['Serie armonizada', '1992–2024', 'Variable', 'Anuales'],
        ],
      },
    ],
  },
  {
    id: 'miden',
    title: 'B. ¿Qué miden y qué NO miden?',
    content: [
      {
        type: 'table' as const,
        rows: [
          ['Capturan BIEN', 'Capturan MAL'],
          ['Actividad urbana y comercial', 'Agricultura (opera de día, sin luz)'],
          ['Industria y manufactura', 'Minería subterránea (minas oscuras)'],
          ['Infraestructura vial', 'Economía informal diurna'],
          ['Electrificación rural', 'Gas flaring (falso positivo)'],
          ['Expansión urbana', 'Zonas muy brillantes (saturación DMSP)'],
        ],
      },
      {
        type: 'p' as const,
        text: 'En Perú, la minería subterránea representa ~15-20% del PBI pero genera escasa luz nocturna. Esto es la principal razón por la que NTL no predice bien el PBI departamental en regiones mineras como Arequipa, Moquegua y Ancash.',
      },
    ],
  },
  {
    id: 'validacion',
    title: 'C. Validación NTL-PBI: resultados completos',
    content: [
      {
        type: 'p' as const,
        text: `Comparamos NTL departamental anual con producción de electricidad por departamento (BCRP, 2005-2024) como proxy del PBI — la mejor fuente disponible sin acceso a VAB del INEI. N=${VALIDATION.n_dept_years} dept-años, 24 departamentos.`,
      },
      {
        type: 'table' as const,
        rows: [
          ['Modelo', 'R²', 'β', 'Interpretación'],
          ['Niveles (sin FE)', String(VALIDATION.r2_levels), String(VALIDATION.beta_levels), 'Correlación cross-sectional — débil'],
          ['Dentro (FE dept)', String(VALIDATION.r2_within), '−0.09', 'Variación intra-dept — sin señal'],
          ['Tasas de crecimiento', String(VALIDATION.r2_growth), '0.03', 'Crecimiento NTL ≠ crecimiento PBI'],
          ['Rossi (global, referencia)', String(VALIDATION.rossi_r2_cross_country), String(VALIDATION.rossi_beta), 'Cross-country, 188 países'],
        ],
      },
      {
        type: 'p' as const,
        text: `Departamentos donde NTL tiene R²>0.8 (con tendencia): ${VALIDATION.strong_depts.join(', ')}. Departamentos débiles (R²<0.5): ${VALIDATION.weak_depts.join(', ')}.`,
      },
    ],
  },
  {
    id: 'rossi',
    title: 'D. Comparación con proyecto Rossi (global)',
    content: [
      {
        type: 'p' as const,
        text: 'Henderson, Storeygard & Weil (2012) — "Measuring Economic Growth from Outer Space" — documentaron R²≈0.73 para crecimiento del PBI usando NTL en 188 países. Este resultado global funciona por razones específicas que NO aplican al caso departamental peruano:',
      },
      {
        type: 'table' as const,
        rows: [
          ['Dimensión', 'Global (Rossi/Henderson)', 'Peru departamental (este estudio)'],
          ['Unidad', '188 países', '25 departamentos'],
          ['Varianza explicada', 'Enorme (Bangladesh vs. Alemania)', 'Pequeña (depts similares)'],
          ['R² niveles', '0.73', '0.16'],
          ['R² crecimiento', '0.40', '0.001'],
          ['Minería', 'Pocos países mineros', 'Varios depts mineros clave'],
          ['GDP proxy', 'Penn World Tables PBI/cápita', 'Electricidad BCRP'],
        ],
      },
      {
        type: 'p' as const,
        text: 'La conclusión es que NTL es una herramienta poderosa para comparar países con diferente nivel de desarrollo, pero no necesariamente para inferir cambios económicos dentro de un país mediano con economía diversificada y sector minero importante.',
      },
    ],
  },
  {
    id: 'limitaciones',
    title: 'E. Limitaciones técnicas',
    content: [
      {
        type: 'table' as const,
        rows: [
          ['Limitación', 'Impacto', 'Corrección disponible'],
          ['Saturación DMSP en Lima', 'Lima subestimada pre-2014', 'Serie armonizada (parcial)'],
          ['Transición DMSP→VIIRS 2013-2014', 'Discontinuidad artificial', 'Serie armonizada Chen et al.'],
          ['Gas flaring (Loreto)', 'Falsos positivos', 'Máscara gas flaring (no aplicada)'],
          ['Nubosidad selva', 'Datos faltantes mensuales', 'Composites multi-mes'],
          ['Incendios forestales', 'Picos en verano (mayo-oct)', 'Filtrado temporalmente'],
        ],
      },
    ],
  },
  {
    id: 'datos',
    title: 'F. Fuentes de datos',
    content: [
      {
        type: 'table' as const,
        rows: [
          ['Fuente', 'Descripción', 'Cobertura'],
          ['Chen et al. 2024 armonizado', 'Serie DMSP+VIIRS calibrada conjuntamente', '1992-2024, anual, distrital'],
          ['VIIRS-DNB mensual (GEE)', 'Composites mensuales sin nube', '2012-2026, mensual, grilla 0.5°'],
          ['BCRP Series Regionales', 'Electricidad, crédito, impuestos por dept', '2004-2025, mensual'],
          ['INEI Censo Distrital', 'Ubigeos y geometrías distritales', '1,891 distritos'],
        ],
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
              <th key={i} className="px-4 py-2.5 text-left font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < body.length - 1 ? `1px solid ${CARD_BORDER}` : undefined }}>
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'font-medium text-stone-700' : 'text-stone-500'}`}>{cell}</td>
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

      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">Luces Nocturnas / Metodología</p>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
          ¿Cómo miden las luces la economía?
        </h1>
        <p className="text-stone-500 max-w-2xl">
          Metodología, limitaciones, validación contra datos económicos, y comparación con el proyecto Rossi global.
        </p>
      </section>

      {/* Accordion */}
      <FadeSection className="space-y-3">
        {ACCORDION.map(sec => (
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

      {/* Links */}
      <FadeSection className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Material de referencia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: 'Chen et al. (2024)',
              desc: 'Serie armonizada DMSP+VIIRS — metodología de calibración cruzada',
              icon: '📄',
              href: '#',
            },
            {
              label: 'Henderson et al. (2012)',
              desc: 'Measuring Economic Growth from Outer Space — AER',
              icon: '📄',
              href: '#',
            },
            {
              label: 'BCRP Series Regionales',
              desc: 'Estadísticas regionales de electricidad, crédito e impuestos',
              icon: '⌨',
              href: 'https://estadisticas.bcrp.gob.pe/',
            },
            {
              label: 'Contacto',
              desc: 'cchavezp@uchicago.edu',
              icon: '✉',
              href: 'mailto:cchavezp@uchicago.edu',
            },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith('http') || item.href.startsWith('mailto') ? '_blank' : undefined}
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

      {/* Disclaimer */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-2"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
        >
          <div className="font-semibold text-stone-600 text-sm">Descargo de responsabilidad</div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Este sitio es un explorador descriptivo de datos satelitales. Los resultados de validación
            muestran que las luces nocturnas NO son un predictor confiable del PBI departamental en Perú
            (R²=0.16 niveles, R²=0.01 variación interna). Las visualizaciones muestran patrones de
            luminosidad, no estimaciones económicas. El proxy de electricidad BCRP puede diferir
            del VAB oficial del INEI. Interpretar con cautela.
          </p>
        </div>
      </FadeSection>

      {/* Back */}
      <div className="flex justify-start pt-4">
        <Link
          href="/observatorio/luces-nocturnas"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: CARD_BG, color: TERRACOTTA, border: `2px solid ${TERRACOTTA}` }}
        >
          ← Volver al inicio
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
