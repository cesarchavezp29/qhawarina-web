'use client';

import { useState } from 'react';
import Link from 'next/link';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER,
  DEPT_NAMES, DEPT_NTL, DEPT_STATS, VALIDATION, growthColor,
} from '../components/ntlData';

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

const OUTLIER_NOTES: Record<string, string> = {
  '02': 'Ancash: alta energía por minería (Antamina)',
  '18': 'Moquegua: alta energía por fundición de cobre (Southern)',
  '12': 'Junín: alta energía por hidroeléctrica (Mantaro)',
  '19': 'Pasco: alta energía por minería, baja luminosidad (minería subterránea)',
  '15': 'Lima: mayor NTL y mayor electricidad — ancla la regresión de niveles',
};

export default function NowcastingPage() {
  const [hoveredPt, setHoveredPt] = useState<typeof SCATTER_DATA[0] | null>(null);

  // Log transform for scatter
  const logScale = (v: number) => Math.log(v + 1);
  const maxNtlLog = Math.max(...SCATTER_DATA.map(d => logScale(d.ntl)));
  const maxElecLog = Math.max(...SCATTER_DATA.map(d => logScale(d.elec)));

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16" style={{ zIndex: 1 }}>

      {/* Header */}
      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">Luces Nocturnas / Indicador</p>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
          NTL como indicador económico
        </h1>
        <p className="text-stone-500 max-w-2xl">
          Qué pueden y qué NO pueden decirnos las luces nocturnas sobre la economía peruana.
        </p>
      </section>

      {/* Validation verdict */}
      <FadeSection>
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <h2 className="text-xl font-bold text-stone-900">Resultado de validación</h2>
          <p className="text-sm text-stone-600">
            Validamos si el NTL predice actividad económica departamental usando producción de
            electricidad (BCRP) como proxy del PBI — la mejor fuente disponible sin acceso a VAB del INEI.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'R² niveles (sin FE)', value: VALIDATION.r2_levels.toFixed(3), note: 'Correlación cruzada entre depts', color: TERRACOTTA, verdict: 'Débil' },
              { label: 'R² dentro (con FE dept)', value: VALIDATION.r2_within.toFixed(3), note: 'Variación intra-departamental', color: TERRACOTTA, verdict: 'Muy débil' },
              { label: 'R² tasas de crecimiento', value: VALIDATION.r2_growth.toFixed(3), note: '¿NTL predice crecimiento?', color: TERRACOTTA, verdict: 'Sin señal' },
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
            <div className="font-semibold text-blue-900 text-sm">Comparación: proyecto Rossi (global)</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-500 font-bold text-lg">0.73</span>
                <p className="text-xs text-blue-700">R² cross-country — Henderson, Storeygard & Weil (2012)</p>
                <p className="text-xs text-blue-600">188 países · 1992-2008 · Crecimiento económico</p>
              </div>
              <div>
                <span className="text-stone-700 font-bold text-lg">0.16</span>
                <p className="text-xs text-stone-600">R² nuestro — Peru departamental, niveles</p>
                <p className="text-xs text-stone-500">25 departamentos · 2005-2024 · Proxy electricidad</p>
              </div>
            </div>
            <p className="text-xs text-blue-700 pt-1">
              El resultado global de Rossi funciona porque hay enorme variación entre países (Bangladesh vs. Alemania).
              Dentro de Perú, la variación departamental es mucho menor y los depts mineros distorsionan la relación.
            </p>
          </div>
        </div>
      </FadeSection>

      {/* Scatter: NTL vs Electricity */}
      <FadeSection className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-stone-900">NTL vs. electricidad por departamento (2023)</h2>
          <p className="text-sm text-stone-500 mt-1">Escala logarítmica. Los outliers mineros desconectan la relación.</p>
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
              <text x="12" y="155" textAnchor="middle" fontSize={10} fill="#a8a29e" transform="rotate(-90, 12, 155)">log(Electricidad) →</text>

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
                <div className="text-xs text-stone-500">Elec: {hoveredPt.elec.toLocaleString()} GWh</div>
                {OUTLIER_NOTES[hoveredPt.code] && (
                  <div className="text-xs mt-1" style={{ color: TERRACOTTA }}>{OUTLIER_NOTES[hoveredPt.code]}</div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 text-xs mt-2">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: TEAL }}/> Normal</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: TERRACOTTA }}/> Outlier minero/energético</span>
          </div>
        </div>
      </FadeSection>

      {/* Why does it fail */}
      <FadeSection className="space-y-5">
        <h2 className="text-xl font-bold text-stone-900">¿Por qué falla en Perú?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              title: 'Minería subterránea',
              body: 'Arequipa, Moquegua, Ancash y Pasco tienen altos PBI mineros pero minas subterráneas oscuras. La luz no captura el valor extraído.',
              icon: '⛏',
              weak: true,
            },
            {
              title: 'Agricultura sin luz',
              body: 'Selva (Loreto, Ucayali) y sierra alta (Puno, Huancavelica) tienen actividad agropecuaria diurna que los satélites nocturnos no capturan.',
              icon: '🌾',
              weak: true,
            },
            {
              title: 'Lima domina la varianza',
              body: 'Lima tiene 10× más NTL que el siguiente departamento. Sin Lima, la correlación de niveles colapsa. Lima ancla artificialmente el R².',
              icon: '🏙',
              weak: false,
            },
            {
              title: 'Proxy de electricidad defectuoso',
              body: 'Usamos producción de electricidad (generación), no consumo. Departments con represas hidroeléctricas exportan energía, distorsionando la comparación.',
              icon: '⚡',
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
          <h2 className="text-xl font-bold text-stone-900">¿Para qué SÍ sirve el NTL en Perú?</h2>
          <div className="space-y-3">
            {[
              { dot: TEAL, text: 'Electrificación rural: medir el avance en acceso a electricidad (distritos sin luz → con luz)' },
              { dot: TEAL, text: 'Expansión urbana: detectar nuevas urbanizaciones antes del censo' },
              { dot: TEAL, text: 'Tendencias de largo plazo: crecimiento comparativo entre regiones en 30 años' },
              { dot: TEAL, text: 'Eventos disruptivos: el COVID-19 generó una caída visible en NTL en 2020 en departamentos urbanos' },
              { dot: '#f59e0b', text: 'Con cautela: como uno de varios indicadores en un índice compuesto (crédito + electricidad + NTL)' },
              { dot: TERRACOTTA, text: 'NO recomendado: nowcasting de PBI departamental, comparaciones con INEI VAB, departamentos mineros' },
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
          Ver metodología completa →
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
