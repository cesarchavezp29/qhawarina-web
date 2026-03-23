'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { CHART_DEFAULTS, tooltipContentStyle, axisTickStyle } from '../../lib/chartTheme';
import PageSkeleton from '../../../components/PageSkeleton';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

const Q_COLORS: Record<string, string> = {
  agropecuario: '#8B7355',
  pesca:        '#4A7C8C',
  mineria:      '#5B8C5A',
  manufactura:  '#7FBFB5',
  electricidad: '#C4A35A',
  construccion: '#2A9D8F',
  comercio:     '#D4956A',
  servicios:    '#C65D3E',
};

interface SectorData {
  id: string;
  name_es: string;
  name_en: string;
  color: string;
  dates: string[];
  values: number[];
  latest_value: number;
  latest_date: string;
}

interface SectoralData {
  metadata: { last_update: string; source: string };
  total_gdp: { dates: string[]; values: number[] };
  sectors: SectorData[];
}

export default function PBISectoresPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<SectoralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/assets/data/gdp_sectoral.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => r.json())
      .then((d: SectoralData) => {
        setData(d);
        setSelectedSectors(d.sectors.map(s => s.id));
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // Transform to Recharts format: [{quarter, total, agro, pesca, ...}]
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.total_gdp.dates.map((quarter, i) => {
      const pt: Record<string, string | number | null> = { quarter, total: data.total_gdp.values[i] ?? null };
      for (const s of data.sectors) {
        pt[s.id] = s.values[i] ?? null;
      }
      return pt;
    });
  }, [data]);

  const toggleSector = (id: string) => {
    setSelectedSectors(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (loading) return <PageSkeleton cards={2} />;

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="max-w-md text-center">
        <p className="text-red-500 font-medium mb-2">{isEn ? 'Error loading data.' : 'Error cargando datos.'}</p>
        <p className="text-sm text-gray-500 mb-4">{isEn ? 'Data is updated quarterly. Try again later.' : 'Los datos se actualizan trimestralmente. Intenta de nuevo más tarde.'}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: '#C65D3E', color: '#C65D3E' }}>
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <Link href="/estadisticas/pbi" className="hover:underline">{isEn ? 'GDP' : 'PBI'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Economic Sectors' : 'Sectores Económicos'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            {isEn ? 'GDP by Economic Sector' : 'PBI por Sector Económico'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'GDP by Sector' : 'PBI por Sectores'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'GDP by Sector — Qhawarina' : 'PBI por Sectores — Qhawarina'}
              text={isEn ? '📊 Peru GDP breakdown by economic sector | Qhawarina\nhttps://qhawarina.pe/estadisticas/pbi/sectores' : '📊 PBI peruano por sectores económicos | Qhawarina\nhttps://qhawarina.pe/estadisticas/pbi/sectores'}
            />
          </div>
        </div>
        <p className="text-base text-gray-600 mb-6 max-w-3xl">
          {isEn
            ? 'Breakdown of economic growth by productive sector. Source: INEI / BCRP.'
            : 'Desagregación del crecimiento económico por sector productivo. Fuente: INEI / BCRP.'}
        </p>

        {/* Sector cards — click to toggle line visibility */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {data.sectors.map(sector => {
            const active = selectedSectors.includes(sector.id);
            const color = Q_COLORS[sector.id] ?? sector.color;
            const positive = sector.latest_value >= 0;
            return (
              <button
                key={sector.id}
                onClick={() => toggleSector(sector.id)}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: '#FFFCF7',
                  border: `1px solid ${active ? color : '#E8E4DF'}`,
                  borderLeft: `4px solid ${active ? color : '#E8E4DF'}`,
                  opacity: active ? 1 : 0.45,
                }}
              >
                <p className="text-xs font-medium text-gray-500 mb-1">{isEn ? sector.name_en : sector.name_es}</p>
                <p className="text-xl font-bold" style={{ color: positive ? '#2A9D8F' : '#DC2626' }}>
                  {sector.latest_value > 0 ? '+' : ''}{sector.latest_value.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{sector.latest_date}</p>
              </button>
            );
          })}
        </div>

        {/* Main line chart */}
        <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: '#1a1a1a' }}>
            {isEn ? 'GDP Growth by Economic Sector (% YoY)' : 'Crecimiento del PBI por Sector Económico (% i.a.)'}
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            {isEn ? 'Click sector cards above to show/hide lines.' : 'Clic en las tarjetas para mostrar/ocultar líneas.'}
          </p>
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis
                dataKey="quarter"
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                angle={-45}
                textAnchor="end"
                interval={7}
                height={55}
              />
              <YAxis
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                tickFormatter={v => `${v}%`}
                label={{ value: isEn ? '% YoY' : '% i.a.', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(v: any) => [v != null ? `${Number(v).toFixed(1)}%` : '—']}
              />
              <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily, paddingTop: 8 }} />
              <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 2" />
              {/* Total GDP reference line — always visible */}
              <Line type="monotone" dataKey="total" name={isEn ? 'Total GDP' : 'PBI Total'} stroke="#2D3142" strokeWidth={2.5} strokeDasharray="6 3" dot={false} connectNulls />
              {/* Sector lines — show only if selected */}
              {data.sectors.map(s => selectedSectors.includes(s.id) && (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  name={isEn ? s.name_en : s.name_es}
                  stroke={Q_COLORS[s.id] ?? s.color}
                  strokeWidth={1.8}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs mt-3" style={{ color: CHART_DEFAULTS.axisStroke }}>
            {isEn
              ? `Source: ${data.metadata.source} · Last update: ${new Date(data.metadata.last_update).toLocaleDateString('en-US')}`
              : `Fuente: ${data.metadata.source} · Última actualización: ${new Date(data.metadata.last_update).toLocaleDateString('es-PE')}`}
          </p>
        </div>

        {/* Interpretation — MW callout style */}
        <div className="rounded-xl p-5 mb-6" style={{ background: '#FFFCF7', borderLeft: '3px solid #C65D3E', border: '1px solid #E8E4DF' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#C65D3E' }}>
            {isEn ? 'Interpretation' : 'Interpretación'}
          </h3>
          <ul className="space-y-1.5 text-sm text-gray-700">
            <li><strong>{isEn ? 'Services' : 'Servicios'} ({data.sectors.find(s => s.id === 'servicios')?.latest_value.toFixed(1)}%):</strong>{' '}{isEn ? 'Largest sector (~50% of GDP). Includes transport, telecom, finance, tourism.' : 'Mayor sector (~50% del PBI). Incluye transporte, telecomunicaciones, finanzas, turismo.'}</li>
            <li><strong>{isEn ? 'Construction' : 'Construcción'} ({data.sectors.find(s => s.id === 'construccion')?.latest_value.toFixed(1)}%):</strong>{' '}{isEn ? 'Leading employment indicator. Sensitive to public and real estate investment.' : 'Indicador adelantado del empleo. Sensible a inversión pública e inmobiliaria.'}</li>
            <li><strong>{isEn ? 'Mining' : 'Minería'} ({data.sectors.find(s => s.id === 'mineria')?.latest_value.toFixed(1)}%):</strong>{' '}{isEn ? 'Key export sector. Driven by copper, gold, silver international prices.' : 'Sector exportador clave. Impulsado por precios del cobre, oro y plata.'}</li>
            <li><strong>{isEn ? 'Agriculture' : 'Agropecuario'} ({data.sectors.find(s => s.id === 'agropecuario')?.latest_value.toFixed(1)}%):</strong>{' '}{isEn ? 'High seasonal variability. Includes agriculture, livestock, forestry.' : 'Alta variabilidad estacional. Incluye agricultura, ganadería y silvicultura.'}</li>
          </ul>
        </div>

        {/* Methodology note — MW style */}
        <div className="rounded-xl p-5 mb-8" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF', borderLeft: '3px solid #E8E4DF' }}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{isEn ? 'Methodological Note' : 'Nota Metodológica'}</h3>
          <p className="text-xs text-gray-600 mb-2">
            {isEn
              ? 'Sectoral data from INEI National Accounts, published by BCRP. Figures show YoY % change in gross value added (GVA) per sector.'
              : 'Datos sectoriales de Cuentas Nacionales del INEI, publicados por el BCRP. Las cifras muestran la variación % interanual del valor agregado bruto (VAB) por sector.'}
          </p>
          <p className="text-xs text-gray-500">
            {isEn ? 'Frequency: Quarterly · Unit: % YoY · Base: 2007 = 100' : 'Frecuencia: Trimestral · Unidad: % YoY · Base: 2007 = 100'}
          </p>
          <div className="mt-3 flex gap-4 text-xs">
            <Link href="/estadisticas/pbi/metodologia" className="font-medium hover:underline" style={{ color: '#C65D3E' }}>
              {isEn ? 'Full methodology →' : 'Metodología completa →'}
            </Link>
            <Link href="/estadisticas/pbi" className="font-medium hover:underline" style={{ color: '#C65D3E' }}>
              {isEn ? '← Back to GDP' : '← Volver a PBI'}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
