'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER, VALIDATION,
} from '../components/ntlData';
import CiteButton from '../../../components/CiteButton';

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
  const isEn = useLocale() === 'en';
  const [openSection, setOpenSection] = useState<string | null>(null);

  const ACCORDION = [
    {
      id: 'ntl',
      title: isEn ? 'A. What are nighttime lights?' : 'A. ¿Qué son las luces nocturnas?',
      content: [
        {
          type: 'p' as const,
          text: isEn
            ? `DMSP-OLS (1992–2013) and VIIRS-DNB (2012–present) satellites photograph the Earth every night, measuring artificial light emitted by cities, industries, and roads. We use the harmonized series by Chen et al. (2024), which calibrates both sensors to be comparable over time. In the regional indicator, VIIRS nighttime lights serve exclusively as spatial weights — not as a growth signal.`
            : `Los satélites DMSP-OLS (1992-2013) y VIIRS-DNB (2012-presente) fotografían la Tierra cada noche, midiendo la luz artificial emitida por ciudades, industrias y carreteras. Usamos la serie armonizada de Chen et al. (2024), que calibra ambos sensores para ser comparables en el tiempo. En el indicador regional, las luces nocturnas VIIRS sirven exclusivamente como ponderadores espaciales — no como señal de crecimiento.`,
        },
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Sensor', 'Period', 'Resolution', 'Composites'],
                ['DMSP-OLS', '1992–2013', '~1 km', 'Annual'],
                ['VIIRS-DNB', '2012–present', '~500 m', 'Monthly'],
                ['Harmonized series', '1992–2024', 'Variable', 'Annual'],
              ]
            : [
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
      title: isEn ? 'B. What do they measure — and what do they NOT?' : 'B. ¿Qué miden y qué NO miden?',
      content: [
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Captured WELL', 'Captured POORLY'],
                ['Urban and commercial activity', 'Agriculture (operates by day, no light)'],
                ['Industry and manufacturing', 'Underground mining (dark mines)'],
                ['Road infrastructure', 'Daytime informal economy'],
                ['Rural electrification', 'Gas flaring (false positive)'],
                ['Urban expansion', 'Very bright zones (DMSP saturation)'],
              ]
            : [
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
          text: isEn
            ? `In Peru, underground mining represents ~15–20% of GDP but generates little nighttime light. This is the main reason NTL does not predict departmental GDP well in mining regions such as Arequipa, Moquegua, and Ancash.`
            : `En Perú, la minería subterránea representa ~15-20% del PBI pero genera escasa luz nocturna. Esto es la principal razón por la que NTL no predice bien el PBI departamental en regiones mineras como Arequipa, Moquegua y Ancash.`,
        },
      ],
    },
    {
      id: 'validacion',
      title: isEn ? 'C. NTL–GDP validation: full results' : 'C. Validación NTL-PBI: resultados completos',
      content: [
        {
          type: 'p' as const,
          text: isEn
            ? `We compare annual departmental NTL with bank credit by department (BCRP, 2004–2024) as a GDP proxy — better than electricity because it does not distort in hydroelectric or mining zones. N=${VALIDATION.n_dept_years} dept-years, 25 departments. Full audit (2014–2025, VIIRS complete years only): median r=+0.09 between NTL growth and GVA growth, zero departments with |r|>0.6. This confirms that NTL captures the economic STOCK (where activity is), not the FLOW (how much it grows year to year).`
            : `Comparamos NTL departamental anual con crédito bancario por departamento (BCRP, 2004-2024) como proxy del PBI — mejor que electricidad porque no distorsiona en zonas hidroeléctricas o mineras. N=${VALIDATION.n_dept_years} dept-años, 25 departamentos. Auditoría completa (2014-2025, solo años VIIRS completos): mediana r=+0.09 entre crecimiento NTL y crecimiento VAB, cero departamentos con |r|>0.6. Esto confirma que NTL captura el STOCK económico (dónde está la actividad), no el FLUJO (cuánto crece año a año).`,
        },
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Model', 'R²', 'β', 'Interpretation'],
                ['Cross-section 2019 (credit)', String(VALIDATION.r2_cross_section), String(VALIDATION.beta_cross_section), 'Where activity is — strong'],
                ['Year FE (credit)', String(VALIDATION.r2_year_fe), String(VALIDATION.beta_year_fe), 'Pooled with year fixed effect — very strong'],
                ['Within (dept FE)', String(VALIDATION.r2_within), '0.78', 'Intra-dept variation — moderate'],
                ['Growth rates', String(VALIDATION.r2_growth), '0.00', 'NTL growth ≠ credit growth'],
                ['Rossi (global, reference)', String(VALIDATION.rossi_r2_cross_country), String(VALIDATION.rossi_beta), 'Cross-country, 188 nations'],
              ]
            : [
                ['Modelo', 'R²', 'β', 'Interpretación'],
                ['Cross-section 2019 (crédito)', String(VALIDATION.r2_cross_section), String(VALIDATION.beta_cross_section), 'Dónde está la actividad — fuerte'],
                ['Year FE (crédito)', String(VALIDATION.r2_year_fe), String(VALIDATION.beta_year_fe), 'Pooled con año fijo — muy fuerte'],
                ['Dentro (FE dept)', String(VALIDATION.r2_within), '0.78', 'Variación intra-dept — moderado'],
                ['Tasas de crecimiento', String(VALIDATION.r2_growth), '0.00', 'Crecimiento NTL ≠ crecimiento crédito'],
                ['Rossi (global, referencia)', String(VALIDATION.rossi_r2_cross_country), String(VALIDATION.rossi_beta), 'Cross-country, 188 países'],
              ],
        },
        {
          type: 'p' as const,
          text: isEn
            ? `Departments with strong correlation (R²>0.7, 2017–2021): ${VALIDATION.strong_depts.join(', ')}. Weak departments (R²<0.3): ${VALIDATION.weak_depts.join(', ')}.`
            : `Departamentos con correlación fuerte (R²>0.7, periodo 2017-2021): ${VALIDATION.strong_depts.join(', ')}. Departamentos débiles (R²<0.3): ${VALIDATION.weak_depts.join(', ')}.`,
        },
        {
          type: 'p' as const,
          text: isEn
            ? `Role of NTL in the regional indicator: VIIRS VNP46A3 serves as spatial weights reflecting each department's share of national economic activity (cross-sectional R²=0.81). Growth signals come from credit, electricity, and taxes — indicators with direct economic content. NTL growth rates showed insufficient correlation with departmental GDP growth (median r=0.09) and are not used as growth predictors.`
            : `Rol de NTL en el indicador regional: VIIRS VNP46A3 sirve como ponderadores espaciales que reflejan la participación de cada departamento en la actividad económica nacional (R² transversal=0.81). Las señales de crecimiento provienen del crédito, electricidad e impuestos — indicadores con contenido económico directo. Las tasas de crecimiento NTL mostraron correlación insuficiente con el crecimiento departamental del PBI (mediana r=0.09) y no se usan como predictores de crecimiento.`,
        },
      ],
    },
    {
      id: 'rossi',
      title: isEn ? 'D. Comparison with the Rossi project (global)' : 'D. Comparación con proyecto Rossi (global)',
      content: [
        {
          type: 'p' as const,
          text: isEn
            ? `Henderson, Storeygard & Weil (2012) — "Measuring Economic Growth from Outer Space" — documented R²≈0.73 for GDP growth using NTL across 188 countries. This global result works for specific reasons that do NOT apply to the Peruvian departmental case:`
            : `Henderson, Storeygard & Weil (2012) — "Measuring Economic Growth from Outer Space" — documentaron R²≈0.73 para crecimiento del PBI usando NTL en 188 países. Este resultado global funciona por razones específicas que NO aplican al caso departamental peruano:`,
        },
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Dimension', 'Global (Rossi/Henderson)', 'Peru departmental (this study)'],
                ['Unit', '188 countries', '25 departments'],
                ['Variance explained', 'Enormous (Bangladesh vs. Germany)', 'Small (similar depts)'],
                ['R² cross-section', '0.73', '0.74'],
                ['R² growth', '0.40', '0.000'],
                ['Mining', 'Few mining countries', 'Several key mining depts'],
                ['GDP proxy', 'Penn World Tables GDP/capita', 'BCRP credit by dept'],
              ]
            : [
                ['Dimensión', 'Global (Rossi/Henderson)', 'Peru departamental (este estudio)'],
                ['Unidad', '188 países', '25 departamentos'],
                ['Varianza explicada', 'Enorme (Bangladesh vs. Alemania)', 'Pequeña (depts similares)'],
                ['R² cross-section', '0.73', '0.74'],
                ['R² crecimiento', '0.40', '0.000'],
                ['Minería', 'Pocos países mineros', 'Varios depts mineros clave'],
                ['GDP proxy', 'Penn World Tables PBI/cápita', 'Crédito BCRP por dept'],
              ],
        },
        {
          type: 'p' as const,
          text: isEn
            ? `The conclusion is that NTL is a powerful tool for comparing countries at different development levels, but not necessarily for inferring economic changes within a mid-sized country with a diversified economy and a significant mining sector.`
            : `La conclusión es que NTL es una herramienta poderosa para comparar países con diferente nivel de desarrollo, pero no necesariamente para inferir cambios económicos dentro de un país mediano con economía diversificada y sector minero importante.`,
        },
      ],
    },
    {
      id: 'limitaciones',
      title: isEn ? 'E. Technical limitations' : 'E. Limitaciones técnicas',
      content: [
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Limitation', 'Impact', 'Available correction'],
                ['DMSP saturation in Lima', 'Lima underestimated pre-2014', 'Harmonized series (partial)'],
                ['DMSP→VIIRS transition 2013–2014', 'Artificial discontinuity', 'Harmonized series Chen et al.'],
                ['Gas flaring (Loreto)', 'False positives', 'Gas flaring mask (not applied)'],
                ['Cloud cover in the jungle', 'Missing monthly data', 'Multi-month composites'],
                ['Forest fires', 'Peaks in summer (May–Oct)', 'Temporally filtered'],
              ]
            : [
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
      title: isEn ? 'F. Data sources' : 'F. Fuentes de datos',
      content: [
        {
          type: 'table' as const,
          rows: isEn
            ? [
                ['Source', 'Description', 'Coverage'],
                ['Chen et al. 2024 harmonized', 'DMSP+VIIRS series jointly calibrated', '1992–2024, annual, district-level'],
                ['VIIRS VNP46A3 monthly', 'Spatial weights for nowcast (dry months May–Oct, cloud-free)', '2012–2026, monthly, departmental'],
                ['BCRP Regional Series', 'Electricity, credit, taxes by dept', '2004–2025, monthly'],
                ['INEI District Census', 'Ubigeos and district geometries', '1,891 districts'],
              ]
            : [
                ['Fuente', 'Descripción', 'Cobertura'],
                ['Chen et al. 2024 armonizado', 'Serie DMSP+VIIRS calibrada conjuntamente', '1992-2024, anual, distrital'],
                ['VIIRS VNP46A3 mensual', 'Ponderadores espaciales del nowcast (meses secos May-Oct, libre de nubes)', '2012-2026, mensual, departamental'],
                ['BCRP Series Regionales', 'Electricidad, crédito, impuestos por dept', '2004-2025, mensual'],
                ['INEI Censo Distrital', 'Ubigeos y geometrías distritales', '1,891 distritos'],
              ],
        },
        {
          type: 'p' as const,
          text: isEn
            ? `Technical note (sensor): The regional nowcast uses VIIRS VNP46A3 exclusively for spatial weights — dry-season months (May–October) of the most recent year are averaged to avoid cloud contamination. Departmental growth is determined by credit, electricity, and taxes (BCRP). DMSP-OLS data prior to 2012 are NOT harmonized with VIIRS and should not be compared directly. Historical series (1992–2024) in the visualizations use the Chen et al. (2024) harmonized series, which does correct this problem for long-run analysis.`
            : `Nota técnica (sensor): El nowcast regional usa VIIRS VNP46A3 exclusivamente para ponderadores espaciales — se promedian los meses de estación seca (mayo-octubre) del año más reciente para evitar contaminación de nubes. El crecimiento departamental lo determinan crédito, electricidad e impuestos (BCRP). Los datos DMSP-OLS anteriores a 2012 NO están armonizados con VIIRS y no deben compararse directamente. Las series históricas (1992-2024) en las visualizaciones usan la serie armonizada de Chen et al. (2024), que sí corrige este problema para análisis de largo plazo.`,
        },
      ],
    },
  ];

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12" style={{ zIndex: 1 }}>

      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">
          {isEn ? 'Night Lights / Methodology' : 'Luces Nocturnas / Metodología'}
        </p>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn ? 'How do lights measure the economy?' : '¿Cómo miden las luces la economía?'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Nighttime lights as an economic indicator for Peru: methodology (Chen et al. 2024, VIIRS-DNB)'
                : 'Metodología de luces nocturnas como indicador económico para Perú (Chen et al. 2024, VIIRS-DNB)'}
              isEn={isEn}
            />
          </div>
        </div>
        <p className="text-stone-500 max-w-2xl">
          {isEn
            ? 'Methodology, limitations, validation against economic data, and comparison with the global Rossi project.'
            : 'Metodología, limitaciones, validación contra datos económicos, y comparación con el proyecto Rossi global.'}
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
        <h2 className="text-xl font-bold text-stone-900">
          {isEn ? 'Reference material' : 'Material de referencia'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: 'Chen et al. (2024)',
              desc: isEn
                ? 'Harmonized DMSP+VIIRS series — cross-calibration methodology'
                : 'Serie armonizada DMSP+VIIRS — metodología de calibración cruzada',
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
              desc: isEn
                ? 'Regional statistics on electricity, credit, and taxes'
                : 'Estadísticas regionales de electricidad, crédito e impuestos',
              icon: '⌨',
              href: 'https://estadisticas.bcrp.gob.pe/',
            },
            {
              label: isEn ? 'Contact' : 'Contacto',
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
          <div className="font-semibold text-stone-600 text-sm">
            {isEn ? 'Disclaimer' : 'Descargo de responsabilidad'}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {isEn
              ? `This site is a descriptive explorer of satellite data. Validation results show that nighttime lights predict WHERE economic activity is, not how much it grows (R²=0.74 cross-section, R²=0.00 growth). Visualizations show luminosity patterns, not economic estimates. The BCRP credit proxy may differ from INEI's official GVA. Interpret with caution.`
              : `Este sitio es un explorador descriptivo de datos satelitales. Los resultados de validación muestran que las luces nocturnas predicen DÓNDE hay actividad económica, no cuánto crece (R²=0.74 cross-section, R²=0.00 crecimiento). Las visualizaciones muestran patrones de luminosidad, no estimaciones económicas. El proxy de crédito BCRP puede diferir del VAB oficial del INEI. Interpretar con cautela.`}
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
          {isEn ? '← Back to overview' : '← Volver al inicio'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
