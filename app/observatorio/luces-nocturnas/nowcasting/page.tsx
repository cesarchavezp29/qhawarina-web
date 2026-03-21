'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER,
  DEPT_NAMES, DEPT_NTL, DEPT_STATS, VALIDATION, growthColor,
} from '../components/ntlData';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

const SCATTER_DATA = [
  { code:'15', name:'Lima',          ntl:876530, elec:17890 },
  { code:'04', name:'Arequipa',      ntl:99837,  elec:7230  },
  { code:'20', name:'Piura',         ntl:179499, elec:2980  },
  { code:'08', name:'Cusco',         ntl:154285, elec:4120  },
  { code:'11', name:'Ica',           ntl:115386, elec:2680  },
  { code:'13', name:'La Libertad',   ntl:131681, elec:3890  },
  { code:'12', name:'Junín',         ntl:62655,  elec:3540  },
  { code:'06', name:'Cajamarca',     ntl:68231,  elec:1210  },
  { code:'14', name:'Lambayeque',    ntl:114105, elec:1870  },
  { code:'02', name:'Ancash',        ntl:60594,  elec:4980  },
  { code:'21', name:'Puno',          ntl:72032,  elec:1340  },
  { code:'22', name:'San Martín',    ntl:73680,  elec:980   },
  { code:'05', name:'Ayacucho',      ntl:26476,  elec:720   },
  { code:'16', name:'Loreto',        ntl:44813,  elec:1120  },
  { code:'25', name:'Ucayali',       ntl:41626,  elec:890   },
  { code:'18', name:'Moquegua',      ntl:45958,  elec:5340  },
  { code:'23', name:'Tacna',         ntl:33899,  elec:1780  },
  { code:'09', name:'Huancavelica',  ntl:8884,   elec:680   },
  { code:'03', name:'Apurímac',      ntl:26776,  elec:390   },
  { code:'10', name:'Huánuco',       ntl:34703,  elec:520   },
  { code:'17', name:'Madre de Dios', ntl:33983,  elec:470   },
  { code:'24', name:'Tumbes',        ntl:26027,  elec:580   },
  { code:'19', name:'Pasco',         ntl:10672,  elec:1890  },
  { code:'01', name:'Amazonas',      ntl:17271,  elec:310   },
];

export default function NowcastingPage() {
  const isEn = useLocale() === 'en';
  const [hoveredPt, setHoveredPt] = useState<typeof SCATTER_DATA[0] | null>(null);

  const OUTLIER_NOTES: Record<string, string> = {
    '02': isEn ? 'Ancash: high energy from mining (Antamina)' : 'Ancash: alta energía por minería (Antamina)',
    '18': isEn ? 'Moquegua: high energy from copper smelting (Southern)' : 'Moquegua: alta energía por fundición de cobre (Southern)',
    '12': isEn ? 'Junín: high energy from hydroelectric (Mantaro)' : 'Junín: alta energía por hidroeléctrica (Mantaro)',
    '19': isEn ? 'Pasco: high energy from mining, low luminosity (underground mining)' : 'Pasco: alta energía por minería, baja luminosidad (minería subterránea)',
    '15': isEn ? 'Lima: highest NTL and highest electricity — anchors the levels regression' : 'Lima: mayor NTL y mayor electricidad — ancla la regresión de niveles',
  };

  // Log transform for scatter
  const logScale = (v: number) => Math.log(v + 1);
  const maxNtlLog = Math.max(...SCATTER_DATA.map(d => logScale(d.ntl)));
  const maxElecLog = Math.max(...SCATTER_DATA.map(d => logScale(d.elec)));

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16" style={{ zIndex: 1 }}>

      {/* Header */}
      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">
          {isEn ? 'Night Lights / Indicator' : 'Luces Nocturnas / Indicador'}
        </p>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn ? 'NTL as an economic indicator' : 'NTL como indicador económico'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Validation of night lights as a departmental economic indicator in Peru (R²=0.74 cross-section)'
                : 'Validación de luces nocturnas como indicador económico departamental en Perú (R²=0.74 cross-section)'
              }
              isEn={isEn}
            />
            <ShareButton
              title={isEn ? 'NTL as an economic indicator — Qhawarina' : 'NTL como indicador económico — Qhawarina'}
              text={isEn
                ? 'What can and cannot night lights tell us about the Peruvian economy? https://qhawarina.pe/observatorio/luces-nocturnas/nowcasting'
                : '¿Qué pueden y qué no pueden decirnos las luces nocturnas sobre la economía peruana? https://qhawarina.pe/observatorio/luces-nocturnas/nowcasting'
              }
            />
          </div>
        </div>
        <p className="text-stone-500 max-w-2xl">
          {isEn
            ? 'What night lights CAN and CANNOT tell us about the Peruvian economy.'
            : 'Qué pueden y qué NO pueden decirnos las luces nocturnas sobre la economía peruana.'
          }
        </p>
      </section>

      {/* Validation verdict */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h2 className="text-xl font-bold text-stone-900">
            {isEn ? 'Validation result' : 'Resultado de validación'}
          </h2>
          <p className="text-sm text-stone-600">
            {isEn
              ? `We validate whether NTL predicts departmental economic activity using bank credit by department (BCRP) as a GDP proxy — better than electricity because it doesn't distort in hydroelectric or mining areas. N=${VALIDATION.n_dept_years} dept-years, 25 departments, 2004-2024.`
              : `Validamos si el NTL predice actividad económica departamental usando crédito bancario por departamento (BCRP) como proxy del PBI — mejor que electricidad porque no distorsiona en zonas hidroeléctricas o mineras. N=${VALIDATION.n_dept_years} dept-años, 25 departamentos, 2004-2024.`
            }
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: isEn ? 'R² cross-section 2019' : 'R² cross-section 2019',
                value: VALIDATION.r2_cross_section.toFixed(3),
                note: isEn ? 'Level correlation between depts — one year' : 'Correlación nivel entre depts — un año',
                color: TEAL,
                verdict: isEn ? 'Strong' : 'Fuerte',
              },
              {
                label: isEn ? 'R² within (dept FE)' : 'R² dentro (FE dept)',
                value: VALIDATION.r2_within.toFixed(3),
                note: isEn ? 'Intra-departmental variation' : 'Variación intra-departamental',
                color: '#f59e0b',
                verdict: isEn ? 'Moderate' : 'Moderado',
              },
              {
                label: isEn ? 'R² growth rates' : 'R² tasas de crecimiento',
                value: VALIDATION.r2_growth.toFixed(3),
                note: isEn ? 'Does NTL predict growth?' : '¿NTL predice crecimiento?',
                color: TERRACOTTA,
                verdict: isEn ? 'No signal' : 'Sin señal',
              },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}>
                <div className="text-2xl font-black tabular-nums" style={{ color: item.color }}>
                  {item.value}
                </div>
                <div className="text-sm font-semibold text-stone-700">{item.label}</div>
                <div className="text-xs text-stone-500">{item.note}</div>
                <div className="text-xs font-bold" style={{ color: item.color }}>{item.verdict}</div>
              </div>
            ))}
          </div>

          {/* Rossi comparison */}
          <div className="rounded-xl px-4 py-3 space-y-1.5" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <div className="font-semibold text-blue-900 text-sm">
              {isEn ? 'Comparison: Rossi project (global)' : 'Comparación: proyecto Rossi (global)'}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-500 font-bold text-lg">0.73</span>
                <p className="text-xs text-blue-700">
                  {isEn
                    ? 'R² cross-country — Henderson, Storeygard & Weil (2012)'
                    : 'R² cross-country — Henderson, Storeygard & Weil (2012)'
                  }
                </p>
                <p className="text-xs text-blue-600">
                  {isEn ? '188 countries · 1992-2008 · Economic growth' : '188 países · 1992-2008 · Crecimiento económico'}
                </p>
              </div>
              <div>
                <span className="text-stone-700 font-bold text-lg">{VALIDATION.r2_cross_section.toFixed(2)}</span>
                <p className="text-xs text-stone-600">
                  {isEn
                    ? 'Our R² — Peru departmental, cross-section 2019'
                    : 'R² nuestro — Perú departamental, cross-section 2019'
                  }
                </p>
                <p className="text-xs text-stone-500">
                  {isEn ? '25 departments · BCRP credit proxy' : '25 departamentos · Proxy crédito BCRP'}
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-700 pt-1">
              {isEn
                ? `Our R²=0.74 cross-sectional is comparable to the global result. The key difference: NTL predicts where activity is (cross-section), but NOT how much it grows year over year (R² growth=0.00). Mining departments remain outliers due to underground light.`
                : `Nuestro R²=0.74 cross-seccional es comparable al global. La diferencia clave: NTL predice dónde está la actividad (cross-section), pero NO cuánto crece año a año (R² crecimiento=0.00). Los departamentos mineros siguen siendo outliers por luz subterránea.`
              }
            </p>
          </div>
        </div>
      </FadeSection>

      {/* Scatter: NTL vs Electricity */}
      <FadeSection className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            {isEn ? 'NTL vs. electricity by department (2023)' : 'NTL vs. electricidad por departamento (2023)'}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {isEn
              ? 'Logarithmic scale. Mining outliers disconnect the relationship.'
              : 'Escala logarítmica. Los outliers mineros desconectan la relación.'
            }
          </p>
        </div>
        <div
          className="rounded-2xl p-6"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {/* SVG scatter plot */}
          <div className="relative" style={{ height: 340 }}>
            <svg width="100%" height="340" style={{ overflow: 'visible' }}>
              {/* Axes */}
              <line x1="50" y1="10" x2="50" y2="300" stroke="#e7e5e4" strokeWidth={1}/>
              <line x1="50" y1="300" x2="580" y2="300" stroke="#e7e5e4" strokeWidth={1}/>
              <text x="300" y="330" textAnchor="middle" fontSize={10} fill="#a8a29e">log(NTL) →</text>
              <text x="12" y="155" textAnchor="middle" fontSize={10} fill="#a8a29e" transform="rotate(-90, 12, 155)">
                {isEn ? 'log(Electricity) →' : 'log(Electricidad) →'}
              </text>

              {/* Points */}
              {SCATTER_DATA.map(d => {
                const x = 50 + (logScale(d.ntl) / maxNtlLog) * 530;
                const y = 300 - (logScale(d.elec) / maxElecLog) * 290;
                const isOutlier = d.code in OUTLIER_NOTES;
                const isHovered = hoveredPt?.code === d.code;
                return (
                  <g key={d.code}
                    onMouseEnter={() => setHoveredPt(d)}
                    onMouseLeave={() => setHoveredPt(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={x} cy={y} r={isHovered ? 7 : 5}
                      fill={isOutlier ? TERRACOTTA : TEAL}
                      opacity={isHovered ? 1 : 0.75}
                    />
                    {(isOutlier || d.code === '15') && (
                      <text x={x + 8} y={y + 4} fontSize={9} fill="#78716c">{d.name}</text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredPt && (
              <div
                className="absolute top-2 right-2 rounded-xl px-3 py-2 pointer-events-none z-10"
                style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: 200 }}
              >
                <div className="font-bold text-stone-800 text-sm">{hoveredPt.name}</div>
                <div className="text-xs text-stone-500 mt-0.5">NTL: {hoveredPt.ntl.toLocaleString()}</div>
                <div className="text-xs text-stone-500">{isEn ? 'Elec:' : 'Elec:'} {hoveredPt.elec.toLocaleString()} GWh</div>
                {OUTLIER_NOTES[hoveredPt.code] && (
                  <div className="text-xs mt-1" style={{ color: TERRACOTTA }}>{OUTLIER_NOTES[hoveredPt.code]}</div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 text-xs mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: TEAL }}/>
              {isEn ? 'Normal' : 'Normal'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: TERRACOTTA }}/>
              {isEn ? 'Mining/energy outlier' : 'Outlier minero/energético'}
            </span>
          </div>
        </div>
      </FadeSection>

      {/* Why does it fail */}
      <FadeSection className="space-y-5">
        <h2 className="text-xl font-bold text-stone-900">
          {isEn ? 'Why does it fail in Peru?' : '¿Por qué falla en Perú?'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              title: isEn ? 'Underground mining' : 'Minería subterránea',
              body: isEn
                ? 'Arequipa, Moquegua, Ancash and Pasco have high mining GDP but dark underground mines. Light does not capture the extracted value.'
                : 'Arequipa, Moquegua, Ancash y Pasco tienen altos PBI mineros pero minas subterráneas oscuras. La luz no captura el valor extraído.',
              icon: '⛏',
              weak: true,
            },
            {
              title: isEn ? 'Agriculture without light' : 'Agricultura sin luz',
              body: isEn
                ? 'The jungle (Loreto, Ucayali) and high sierra (Puno, Huancavelica) have daytime agricultural activity that nighttime satellites do not capture.'
                : 'Selva (Loreto, Ucayali) y sierra alta (Puno, Huancavelica) tienen actividad agropecuaria diurna que los satélites nocturnos no capturan.',
              icon: '🌾',
              weak: true,
            },
            {
              title: isEn ? 'Lima dominates the variance' : 'Lima domina la varianza',
              body: isEn
                ? 'Lima has 10× more NTL than the next department. Without Lima, the levels correlation collapses. Lima artificially anchors the R².'
                : 'Lima tiene 10× más NTL que el siguiente departamento. Sin Lima, la correlación de niveles colapsa. Lima ancla artificialmente el R².',
              icon: '🏙',
              weak: false,
            },
            {
              title: isEn ? 'NTL does not predict growth' : 'NTL no predice crecimiento',
              body: isEn
                ? 'The cross-sectional correlation is strong (R²=0.74), but NTL does not predict year-over-year changes within a department (R² growth=0.00). It is a level indicator, not a dynamics indicator.'
                : 'La correlación cross-seccional es fuerte (R²=0.74), pero NTL no predice cambios año a año dentro de un departamento (R² crecimiento=0.00). Es un indicador de nivel, no de dinámica.',
              icon: '📉',
              weak: false,
            },
          ].map(item => (
            <div
              key={item.title}
              className="rounded-2xl p-5 space-y-2"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="font-semibold text-stone-800">{item.title}</div>
              <p className="text-xs text-stone-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </FadeSection>

      {/* What CAN it tell us */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h2 className="text-xl font-bold text-stone-900">
            {isEn ? 'What IS NTL useful for in Peru?' : '¿Para qué SÍ sirve el NTL en Perú?'}
          </h2>
          <div className="space-y-3">
            {[
              {
                dot: TEAL,
                text: isEn
                  ? 'Rural electrification: measuring progress in electricity access (districts without light → with light)'
                  : 'Electrificación rural: medir el avance en acceso a electricidad (distritos sin luz → con luz)',
              },
              {
                dot: TEAL,
                text: isEn
                  ? 'Urban expansion: detecting new urbanizations before the census'
                  : 'Expansión urbana: detectar nuevas urbanizaciones antes del censo',
              },
              {
                dot: TEAL,
                text: isEn
                  ? 'Long-term trends: comparative growth between regions over 30 years'
                  : 'Tendencias de largo plazo: crecimiento comparativo entre regiones en 30 años',
              },
              {
                dot: TEAL,
                text: isEn
                  ? 'Disruptive events: COVID-19 generated a visible NTL drop in 2020 in urban departments'
                  : 'Eventos disruptivos: el COVID-19 generó una caída visible en NTL en 2020 en departamentos urbanos',
              },
              {
                dot: '#f59e0b',
                text: isEn
                  ? 'With caution: as one of several indicators in a composite index (credit + electricity + NTL)'
                  : 'Con cautela: como uno de varios indicadores en un índice compuesto (crédito + electricidad + NTL)',
              },
              {
                dot: TERRACOTTA,
                text: isEn
                  ? 'NOT recommended: nowcasting departmental GDP, comparisons with INEI VAB, mining departments'
                  : 'NO recomendado: nowcasting de PBI departamental, comparaciones con INEI VAB, departamentos mineros',
              },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: row.dot }}/>
                <span className="text-stone-600">{row.text}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* Next */}
      <div className="flex justify-end pt-4">
        <Link
          href="/observatorio/luces-nocturnas/metodologia"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: TERRACOTTA, color: 'white' }}
        >
          {isEn ? 'See full methodology →' : 'Ver metodología completa →'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
