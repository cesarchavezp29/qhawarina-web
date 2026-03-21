'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import FadeSection from '../components/FadeSection';
import SourceFooter from '../components/SourceFooter';
import {
  TERRACOTTA, TEAL, CARD_BG, CARD_BORDER, GEO_URL,
  DEPT_NAMES, DEPT_NTL, DEPT_STATS, ntlColor, growthColor,
  ALL_YEARS,
} from '../components/ntlData';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';

type SortMode = 'ntl' | 'growth5yr';

export default function MapaPage() {
  const isEn = useLocale() === 'en';
  const [year, setYear] = useState(2023);
  const [hoveredDept, setHoveredDept] = useState<{ code: string; name: string; ntl: number; growth5yr: number | null } | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('ntl');

  // Build dept → NTL map for selected year
  const yearNtl = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [code, series] of Object.entries(DEPT_NTL)) {
      out[code] = series[String(year)] ?? 0;
    }
    return out;
  }, [year]);

  const maxNtl = useMemo(() => Math.max(...Object.values(yearNtl)), [yearNtl]);

  const isSensorTransition = year === 2013 || year === 2014;
  const isViirs = year >= 2014;

  // Rankings sorted
  const ranked = useMemo(() => {
    return [...DEPT_STATS].sort((a, b) => {
      if (sortMode === 'ntl') return (yearNtl[b.code] ?? 0) - (yearNtl[a.code] ?? 0);
      return (b.growth5yr ?? -999) - (a.growth5yr ?? -999);
    });
  }, [sortMode, yearNtl]);

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12" style={{ zIndex: 1 }}>

      {/* Header */}
      <section className="space-y-3 pt-2">
        <p className="text-xs text-stone-400 font-medium tracking-wide">
          {isEn ? 'Night Lights / Map' : 'Luces Nocturnas / Mapa'}
        </p>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {isEn ? 'Economic activity map' : 'Mapa de actividad económica'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton
              indicator={isEn
                ? 'Map of night light intensity by department (1992–2024)'
                : 'Mapa de luminosidad nocturna por departamento (1992–2024)'
              }
              isEn={isEn}
            />
            <ShareButton
              title={isEn
                ? 'Economic activity map — Night Lights · Qhawarina'
                : 'Mapa de actividad económica — Luces Nocturnas · Qhawarina'
              }
              text={isEn
                ? 'Night light intensity by department in Peru, 1992–2024. https://qhawarina.pe/observatorio/luces-nocturnas/mapa'
                : 'Luminosidad nocturna por departamento en Perú, 1992–2024. https://qhawarina.pe/observatorio/luces-nocturnas/mapa'
              }
            />
          </div>
        </div>
        <p className="text-stone-500 max-w-2xl">
          {isEn
            ? 'Night light intensity by department. Drag the slider to see the evolution 1992–2024.'
            : 'Luminosidad nocturna por departamento. Arrastra el slider para ver la evolución 1992–2024.'
          }
        </p>
      </section>

      {/* Year slider */}
      <FadeSection className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500">
            {isEn ? 'Selected year:' : 'Año seleccionado:'}
          </span>
          <span className="text-2xl font-black text-stone-900 tabular-nums">{year}</span>
          {!isViirs && (
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#fffbeb', color: '#92400e' }}>
              {isEn ? 'DMSP Sensor' : 'Sensor DMSP'}
            </span>
          )}
          {isViirs && (
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#f0fdf4', color: '#166534' }}>
              {isEn ? 'VIIRS Sensor' : 'Sensor VIIRS'}
            </span>
          )}
        </div>
        <input
          type="range"
          min={1992}
          max={2024}
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-full accent-teal-600"
          style={{ accentColor: TEAL }}
        />
        <div className="flex justify-between text-xs text-stone-400">
          <span>1992</span>
          <span className="text-amber-500">
            {isEn ? '⚠ 2013–2014 sensor transition' : '⚠ 2013–2014 transición sensor'}
          </span>
          <span>2024</span>
        </div>
        {isSensorTransition && (
          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
            {isEn ? (
              <><strong>DMSP → VIIRS transition:</strong> The 2013-2014 values are not comparable to each other. The harmonized series by Chen et al. partially corrects this, but some discontinuity may remain.</>
            ) : (
              <><strong>Transición DMSP → VIIRS:</strong> Los valores de 2013-2014 no son comparables entre sí. La serie armonizada de Chen et al. corrige parcialmente, pero puede quedar discontinuidad.</>
            )}
          </div>
        )}
      </FadeSection>

      {/* Map + ranking */}
      <FadeSection className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Map */}
          <div
            className="lg:col-span-2 hidden sm:block rounded-2xl overflow-hidden relative"
            style={{ background: '#0f0f23', border: `1px solid ${CARD_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
          >
            {hoveredDept && (
              <div
                className="absolute top-4 left-4 z-20 rounded-xl px-4 py-3 pointer-events-none"
                style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxWidth: 220 }}
              >
                <div className="font-bold text-stone-800 text-sm">{hoveredDept.name}</div>
                <div className="text-2xl font-black mt-0.5 tabular-nums" style={{ color: ntlColor(hoveredDept.ntl, maxNtl) }}>
                  {hoveredDept.ntl.toLocaleString()}
                </div>
                <div className="text-xs text-stone-400 mt-0.5">NTL total (GW-eq)</div>
                {hoveredDept.growth5yr !== null && (
                  <div className="text-sm font-bold mt-1" style={{ color: growthColor(hoveredDept.growth5yr) }}>
                    {hoveredDept.growth5yr > 0 ? '+' : ''}{hoveredDept.growth5yr}% ({isEn ? '5 years' : '5 años'})
                  </div>
                )}
              </div>
            )}

            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [-75.5, -10], scale: 1600 }}
              style={{ width: '100%', height: 'auto' }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }: { geographies: unknown[] }) =>
                  (geographies as { rsmKey: string; properties?: Record<string, unknown> }[]).map(geo => {
                    const rawCode = geo.properties?.FIRST_IDDP;
                    const code = rawCode ? String(rawCode).padStart(2, '0') : null;
                    const ntl = code ? (yearNtl[code] ?? 0) : 0;
                    const fill = ntl > 0 ? ntlColor(ntl, maxNtl) : '#1a1a3e';
                    const dept = code ? { code, name: DEPT_NAMES[code] ?? code, ntl, growth5yr: DEPT_STATS.find(d=>d.code===code)?.growth5yr ?? null } : null;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke="#0f0f23"
                        strokeWidth={0.7}
                        style={{
                          default: { fill, outline: 'none', cursor: dept ? 'pointer' : 'default' },
                          hover:   { fill, opacity: 0.75, outline: 'none', cursor: 'pointer' },
                          pressed: { fill, outline: 'none' },
                        }}
                        onMouseEnter={() => dept && setHoveredDept(dept)}
                        onMouseLeave={() => setHoveredDept(null)}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>

            {/* Color legend */}
            <div className="px-5 pb-4 pt-1">
              <div className="h-3 rounded-full" style={{
                background: 'linear-gradient(to right, #1a1a3e, #4a2080, #c84040, #e8a020, #ffffc0)',
              }}/>
              <div className="flex justify-between text-xs text-stone-500 mt-1.5">
                <span>{isEn ? 'Dark (low)' : 'Oscuro (bajo)'}</span>
                <span>{isEn ? 'Bright (high)' : 'Brillante (alto)'}</span>
              </div>
            </div>
          </div>

          {/* Rankings */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setSortMode('ntl')}
                className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
                style={{
                  background: sortMode === 'ntl' ? TEAL : CARD_BG,
                  color: sortMode === 'ntl' ? 'white' : '#78716c',
                  border: `1px solid ${CARD_BORDER}`,
                }}
              >
                {isEn ? 'By NTL' : 'Por NTL'}
              </button>
              <button
                onClick={() => setSortMode('growth5yr')}
                className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
                style={{
                  background: sortMode === 'growth5yr' ? TEAL : CARD_BG,
                  color: sortMode === 'growth5yr' ? 'white' : '#78716c',
                  border: `1px solid ${CARD_BORDER}`,
                }}
              >
                {isEn ? 'By growth' : 'Por crecimiento'}
              </button>
            </div>

            <div className="text-xs font-semibold text-stone-400 mb-1">
              {sortMode === 'ntl'
                ? (isEn ? `Top 10 by NTL (${year})` : `Top 10 por NTL (${year})`)
                : (isEn ? 'Top 10 growth 2018→2023' : 'Top 10 crecimiento 2018→2023')
              }
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {ranked.slice(0, 10).map((d, i) => {
                const ntl = yearNtl[d.code] ?? 0;
                const color = sortMode === 'ntl' ? ntlColor(ntl, maxNtl) : growthColor(d.growth5yr ?? 0);
                return (
                  <div
                    key={d.code}
                    className="rounded-xl px-3 py-2.5 flex items-center gap-3"
                    style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: color }}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-700 text-sm truncate">{d.name}</div>
                      <div className="text-xs tabular-nums" style={{ color }}>
                        {sortMode === 'ntl'
                          ? ntl.toLocaleString()
                          : d.growth5yr !== null ? `+${d.growth5yr}%` : '—'
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile fallback */}
        <div className="sm:hidden space-y-2">
          <div className="text-sm font-semibold text-stone-400">
            {isEn ? `NTL by department (${year})` : `NTL por departamento (${year})`}
          </div>
          {[...DEPT_STATS].sort((a,b) => (yearNtl[b.code]??0)-(yearNtl[a.code]??0)).map(d => (
            <div key={d.code} className="rounded-xl px-3 py-2.5 flex items-center gap-3" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <div className="w-4 h-4 rounded flex-shrink-0" style={{ background: ntlColor(yearNtl[d.code]??0, maxNtl) }}/>
              <div className="font-semibold text-stone-700 text-sm">{d.name}</div>
              <div className="ml-auto text-xs tabular-nums text-stone-400">{(yearNtl[d.code]??0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </FadeSection>

      {/* Lima insight */}
      <FadeSection>
        <div
          className="rounded-2xl px-6 py-5 space-y-2"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${CARD_BORDER}` }}
        >
          <div className="font-semibold text-stone-700 text-sm">
            {isEn ? 'Note: Lima and DMSP saturation' : 'Nota: Lima y la saturación DMSP'}
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            {isEn
              ? 'Lima concentrates ~16% of total luminosity (2023). During the DMSP period (1992-2013), Lima appeared as a much larger percentage because the sensor saturated in very bright areas. The harmonized series partially corrects this. Lima\'s cumulative growth shows negative values over the long period — an artifact of the saturation correction, not a real decline.'
              : 'Lima concentra el ~16% de la luminosidad total (2023). En el período DMSP (1992-2013), Lima aparecía como un porcentaje mucho mayor porque el sensor se saturaba en zonas muy brillantes. La serie armonizada corrige esto parcialmente. El crecimiento acumulado de Lima muestra valores negativos en el período largo — artefacto de la corrección de saturación, no una caída real.'
            }
          </p>
        </div>
      </FadeSection>

      {/* Next */}
      <div className="flex justify-end pt-4">
        <Link
          href="/observatorio/luces-nocturnas/tendencias"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: TEAL, color: 'white' }}
        >
          {isEn ? 'Next: Trends →' : 'Siguiente: Tendencias →'}
        </Link>
      </div>

      <SourceFooter />
    </div>
  );
}
