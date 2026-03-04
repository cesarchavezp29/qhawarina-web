'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Parse YYYY-MM-DD as local date (avoids UTC-to-local day-shift bug)
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function HomePage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch(`/assets/data/gdp_nowcast.json?v=${new Date().toISOString().split('T')[0]}`).then(r => r.json()),
      fetch(`/assets/data/inflation_nowcast.json?v=${new Date().toISOString().split('T')[0]}`).then(r => r.json()),
      fetch(`/assets/data/poverty_nowcast.json?v=${new Date().toISOString().split('T')[0]}`).then(r => r.json()),
      fetch(`/assets/data/political_index_daily.json?v=${new Date().toISOString().split('T')[0]}`).then(r => r.json()),
      fetch(`/assets/data/fx_interventions.json?v=${new Date().toISOString().split('T')[0]}`).then(r => r.json()),
      fetch(`/assets/data/daily_price_index.json?v=${new Date().toISOString().split('T')[0]}`).then(r => r.json()),
    ]).then(([gdpR, inflR, povR, polR, fxR, pricesR]) => {
      setData({
        gdp:       gdpR.status === 'fulfilled' ? gdpR.value : null,
        inflation: inflR.status === 'fulfilled' ? inflR.value : null,
        poverty:   povR.status === 'fulfilled' ? povR.value : null,
        political: polR.status === 'fulfilled' ? polR.value : null,
        fx:        fxR.status === 'fulfilled' ? fxR.value : null,
        prices:    pricesR.status === 'fulfilled' ? pricesR.value : null,
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  const allFailed = data && Object.values(data).every((v) => v === null);
  if (allFailed) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isEn ? 'Error loading data' : 'Error cargando datos'}
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          {isEn
            ? 'Could not load data files. Try reloading the page.'
            : 'No se pudieron cargar los archivos de datos. Intenta recargar la página.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 bg-blue-700 text-white text-sm font-medium hover:bg-blue-800"
        >
          {isEn ? 'Reload' : 'Recargar'}
        </button>
      </div>
    </div>
  );

  // Pre-compute filtered series for charts (avoid IIFE in JSX)
  const CHART_START = '2025-03-01';
  const polSeries = (data?.political?.daily_series ?? []).filter((d: any) => d.date >= CHART_START);
  const fxSeries = (data?.political?.daily_fx_series ?? []).filter((d: any) => d.date >= CHART_START);
  const scatterSeries = (data?.political?.monthly_series ?? []).filter((m: any) => m.fx_yoy !== null);

  return (
    <div className="bg-gray-50">
      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Key Indicators */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
            {isEn ? 'Key Economic Indicators' : 'Indicadores Económicos Clave'}
          </h2>
          <div className="border border-gray-300">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {isEn ? 'Indicator' : 'Indicador'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {isEn ? 'Latest' : 'Último'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {isEn ? 'Period' : 'Periodo'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {isEn ? 'Model' : 'Modelo'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">

                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {isEn ? 'GDP Growth (year-on-year)' : 'Crecimiento PBI (interanual)'}
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.gdp?.nowcast?.value != null ? `${data.gdp.nowcast.value > 0 ? '+' : ''}${data.gdp.nowcast.value.toFixed(2)}%` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {data.gdp?.nowcast?.target_period ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    DFM-Ridge
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/estadisticas/pbi" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      {isEn ? 'View →' : 'Ver →'}
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {isEn ? 'Inflation (monthly)' : 'Inflación (mensual)'}
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.inflation?.nowcast?.value != null ? `${data.inflation.nowcast.value > 0 ? '+' : ''}${data.inflation.nowcast.value.toFixed(3)}%` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {data.inflation?.nowcast?.target_period ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    DFM-AR(1)
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/estadisticas/inflacion" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      {isEn ? 'View →' : 'Ver →'}
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {isEn ? 'Poverty Rate' : 'Tasa de Pobreza'}
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.poverty?.national?.poverty_rate != null ? `${data.poverty.national.poverty_rate.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {data.poverty?.metadata?.target_year ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    GBR
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/estadisticas/pobreza" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      {isEn ? 'View →' : 'Ver →'}
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {isEn ? 'Political Risk Index' : 'Índice de Riesgo Político'}
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.political?.current?.score != null ? data.political.current.score.toFixed(3) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {data.political?.current?.date
                      ? parseLocalDate(data.political.current.date).toLocaleDateString(
                          isEn ? 'en-US' : 'es-PE',
                          { day: 'numeric', month: 'short' }
                        )
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    GPT-4o
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/estadisticas/riesgo-politico" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      {isEn ? 'View →' : 'Ver →'}
                    </Link>
                  </td>
                </tr>
                {data.fx?.latest && (
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {isEn ? 'Exchange Rate PEN/USD' : 'Tipo de Cambio PEN/USD'}
                    </td>
                    <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                      {data.fx.latest.fx != null ? `S/ ${data.fx.latest.fx.toFixed(4)}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {data.fx.latest.date ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      BCRP
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href="/estadisticas/intervenciones" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        {isEn ? 'View →' : 'Ver →'}
                      </Link>
                    </td>
                  </tr>
                )}
                {data.prices?.latest && (
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {isEn ? 'Daily Prices (BPP)' : 'Precios Diarios (BPP)'}
                    </td>
                    <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                      {data.prices.latest.var_all != null
                        ? `${data.prices.latest.var_all >= 0 ? '+' : ''}${data.prices.latest.var_all.toFixed(3)}%`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {data.prices.latest.date ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      Jevons
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href="/estadisticas/precios-diarios" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        {isEn ? 'View →' : 'Ver →'}
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Charts: Timeline + Scatter */}
        {polSeries.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
              {isEn ? 'Political Risk vs. Exchange Rate' : 'Riesgo Político vs. Tipo de Cambio'}
            </h2>
            <div className="grid grid-cols-2 gap-4">

              {/* Chart 1: Political (bars) + daily TC (line, right y-axis) */}
              <div className="border border-gray-300 p-4 bg-white">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  {isEn
                    ? 'Daily evolution — Political Instability & PEN/USD FX (since Mar. 2025)'
                    : 'Evolución diaria — Inestabilidad Política y TC PEN/USD (desde mar. 2025)'}
                </div>
                <Plot
                  data={[
                    {
                      x: polSeries.map((d: any) => d.date),
                      y: polSeries.map((d: any) => d.score_raw),
                      type: 'bar',
                      name: isEn ? 'Political (raw)' : 'Político (raw)',
                      yaxis: 'y',
                      marker: { color: 'rgba(220, 38, 38, 0.2)' },
                      hovertemplate: isEn
                        ? '<b>%{x}</b><br>Political: %{y:.3f}<extra></extra>'
                        : '<b>%{x}</b><br>Político: %{y:.3f}<extra></extra>',
                    },
                    {
                      x: polSeries.map((d: any) => d.date),
                      y: polSeries.map((d: any) => d.score),
                      type: 'scatter',
                      mode: 'lines',
                      name: isEn ? 'Political (7d)' : 'Político (7d)',
                      yaxis: 'y',
                      line: { color: '#DC2626', width: 2 },
                      hovertemplate: isEn
                        ? '<b>%{x}</b><br>7d trend: %{y:.3f}<extra></extra>'
                        : '<b>%{x}</b><br>Tend. 7d: %{y:.3f}<extra></extra>',
                    },
                    ...(fxSeries.length > 0 ? [{
                      x: fxSeries.map((d: any) => d.date),
                      y: fxSeries.map((d: any) => d.fx),
                      type: 'scatter' as const,
                      mode: 'lines' as const,
                      name: isEn ? 'PEN/USD FX' : 'TC PEN/USD',
                      yaxis: 'y2',
                      line: { color: '#2563EB', width: 1.5 },
                      hovertemplate: '<b>%{x}</b><br>TC: S/ %{y:.4f}<extra></extra>',
                    }] : []),
                  ]}
                  layout={{
                    autosize: true,
                    height: 280,
                    margin: { l: 40, r: 52, t: 8, b: 40 },
                    hovermode: 'x unified',
                    barmode: 'overlay',
                    legend: { orientation: 'h', y: -0.22, x: 0, font: { size: 10 } },
                    xaxis: { gridcolor: '#E5E7EB', tickfont: { size: 10 } },
                    yaxis: {
                      range: [0, 1],
                      gridcolor: '#E5E7EB',
                      tickfont: { size: 10 },
                      title: { text: isEn ? 'Index (0-1)' : 'Índice (0-1)', font: { size: 9 } },
                    },
                    yaxis2: {
                      anchor: 'x',
                      overlaying: 'y',
                      side: 'right',
                      tickfont: { size: 10 },
                      title: { text: isEn ? 'PEN/USD' : 'S/ por USD', font: { size: 9 } },
                      showgrid: false,
                    },
                    plot_bgcolor: '#fff',
                    paper_bgcolor: '#fff',
                    font: { family: 'Inter, sans-serif', size: 11 },
                  }}
                  config={{ responsive: true, displaylogo: false, displayModeBar: false }}
                  className="w-full"
                  useResizeHandler
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  <Link href="/estadisticas/riesgo-politico" className="text-blue-600 hover:underline">
                    {isEn ? 'View full index →' : 'Ver índice completo →'}
                  </Link>
                </div>
              </div>

              {/* Chart 2: Scatter — monthly political avg vs FX YoY */}
              {scatterSeries.length > 0 && (
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    {isEn
                      ? 'Monthly scatter — Political Instability vs. FX (annual var.)'
                      : 'Dispersión mensual — Inestabilidad Política vs. TC (var. anual)'}
                  </div>
                  <Plot
                    data={[
                      {
                        x: scatterSeries.map((m: any) => m.political_avg),
                        y: scatterSeries.map((m: any) => m.fx_yoy),
                        text: scatterSeries.map((m: any) => m.month),
                        type: 'scatter',
                        mode: 'markers+text',
                        textposition: 'top center',
                        textfont: { size: 8, color: '#6B7280' },
                        marker: {
                          size: 10,
                          color: scatterSeries.map((m: any) => m.political_avg),
                          colorscale: [[0, '#DBEAFE'], [0.5, '#F59E0B'], [1, '#DC2626']],
                          showscale: false,
                          line: { color: '#9CA3AF', width: 0.5 },
                        },
                        hovertemplate: isEn
                          ? '<b>%{text}</b><br>Political: %{x:.3f}<br>FX annual var: %{y:.1f}%<extra></extra>'
                          : '<b>%{text}</b><br>Político: %{x:.3f}<br>TC var. anual: %{y:.1f}%<extra></extra>',
                      },
                    ]}
                    layout={{
                      autosize: true,
                      height: 280,
                      margin: { l: 52, r: 16, t: 8, b: 52 },
                      showlegend: false,
                      xaxis: {
                        title: { text: isEn ? 'Monthly political index (0-1)' : 'Índice político mensual (0-1)', font: { size: 10 } },
                        gridcolor: '#E5E7EB',
                        tickfont: { size: 10 },
                      },
                      yaxis: {
                        title: { text: isEn ? 'FX annual change (%)' : 'TC var. anual (%)', font: { size: 10 } },
                        gridcolor: '#E5E7EB',
                        tickfont: { size: 10 },
                      },
                      plot_bgcolor: '#fff',
                      paper_bgcolor: '#fff',
                      font: { family: 'Inter, sans-serif', size: 11 },
                    }}
                    config={{ responsive: true, displaylogo: false, displayModeBar: false }}
                    className="w-full"
                    useResizeHandler
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {isEn
                      ? 'Each dot = monthly avg · color = instability level'
                      : 'Cada punto = promedio mensual · color = nivel de inestabilidad'}
                  </div>
                </div>
              )}

            </div>
          </section>
        )}

        {/* Counterfactual Analysis Feature */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold mr-3">
                    {isEn ? 'NEW' : 'NUEVO'}
                  </span>
                  <span className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
                    PRO
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-3">
                  {isEn ? 'Counterfactual Analysis' : 'Análisis Contrafactual'}
                </h2>
                <p className="text-blue-100 text-lg mb-4 max-w-2xl">
                  {isEn
                    ? 'Simulate economic scenarios and evaluate their impact before they happen. What if GDP falls to 0%? What if there\'s a political crisis?'
                    : 'Simula escenarios económicos y evalúa su impacto antes de que ocurran. ¿Qué pasaría si el PBI cae a 0%? ¿Y si hay una crisis política?'}
                </p>
                <div className="flex items-center gap-6 text-sm text-blue-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <span>{isEn ? '10 pre-built scenarios' : '10 escenarios pre-construidos'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔗</span>
                    <span>{isEn ? 'Cross-model propagation' : 'Propagación cross-model'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <span>{isEn ? 'Instant results' : 'Resultados instantáneos'}</span>
                  </div>
                </div>
                <Link
                  href="/escenarios"
                  className="inline-block bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  {isEn ? 'Explore Scenarios →' : 'Explorar Escenarios →'}
                </Link>
              </div>
              <div className="hidden lg:block pl-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border-2 border-white/20">
                  <div className="text-sm font-semibold mb-3 text-blue-100">
                    {isEn ? 'Example: Mild Recession' : 'Ejemplo: Recesión Leve'}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-200">{isEn ? 'GDP Baseline:' : 'PBI Baseline:'}</span>
                      <span className="font-bold">
                        {data.gdp?.nowcast?.value != null
                          ? `${data.gdp.nowcast.value >= 0 ? '+' : ''}${data.gdp.nowcast.value.toFixed(1)}%`
                          : '+2.5%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">{isEn ? 'GDP Counterfactual:' : 'PBI Contrafactual:'}</span>
                      <span className="font-bold">0.0%</span>
                    </div>
                    <div className="h-px bg-white/20 my-2"></div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">{isEn ? 'Impact:' : 'Impacto:'}</span>
                      <span className="font-bold text-red-300">
                        {data.gdp?.nowcast?.value != null
                          ? `-${data.gdp.nowcast.value.toFixed(1)}pp`
                          : '-2.5pp'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">{isEn ? 'Poverty:' : 'Pobreza:'}</span>
                      <span className="font-bold text-red-300">
                        {data.gdp?.nowcast?.value != null
                          ? `+${(data.gdp.nowcast.value * 0.5).toFixed(2)}pp`
                          : '+1.25pp'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="grid grid-cols-2 gap-8 mb-12">
          <div className="border border-gray-300 p-6 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              {isEn ? 'About Qhawarina' : 'Sobre Qhawarina'}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {isEn
                ? 'Real-time economic nowcasting platform for Peru using Dynamic Factor Models, Gradient Boosting, and GPT-4o classification across 490+ indicators.'
                : 'Plataforma de nowcasting económico en tiempo real para Perú utilizando Modelos de Factores Dinámicos, Gradient Boosting y clasificación GPT-4o sobre 490+ indicadores.'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {isEn
                ? 'Daily update at 08:00 PET. All data and models are open source under CC BY 4.0 license.'
                : 'Actualización diaria a las 08:00 PET. Todos los datos y modelos son código abierto bajo licencia CC BY 4.0.'}
            </p>
          </div>
          <div className="border border-gray-300 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              {isEn ? 'Methodology' : 'Metodología'}
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              {isEn ? (
                <>
                  <li><strong>GDP:</strong> DFM 2 factors, Ridge bridge (α=1.0), 7-year rolling window</li>
                  <li><strong>Inflation:</strong> DFM 2 factors with lags + AR(1) component</li>
                  <li><strong>Poverty:</strong> GBR on departmental panel + NTL disaggregation</li>
                  <li><strong>Political:</strong> 81 RSS feeds, GPT-4o binary classification</li>
                </>
              ) : (
                <>
                  <li><strong>PBI:</strong> DFM 2 factores, puente Ridge (α=1.0), ventana móvil 7 años</li>
                  <li><strong>Inflación:</strong> DFM 2 factores con rezagos + componente AR(1)</li>
                  <li><strong>Pobreza:</strong> GBR en panel departamental + desagregación NTL</li>
                  <li><strong>Político:</strong> 81 feeds RSS, clasificación binaria GPT-4o</li>
                </>
              )}
            </ul>
          </div>
        </section>

        {/* Model Performance Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
            {isEn ? 'Model Performance (Out-of-Sample)' : 'Rendimiento de Modelos (Fuera de Muestra)'}
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {isEn ? 'GDP RMSE' : 'RMSE PBI'}
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {data.gdp?.backtest_metrics?.rmse != null ? `${data.gdp.backtest_metrics.rmse.toFixed(2)}pp` : '—'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {data.gdp?.backtest_metrics?.r2 != null ? `R² = ${data.gdp.backtest_metrics.r2.toFixed(3)}` : ''}
              </div>
            </div>
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {isEn ? 'Inflation RMSE' : 'RMSE Inflación'}
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {data.inflation?.backtest_metrics?.rmse != null ? `${data.inflation.backtest_metrics.rmse.toFixed(3)}pp` : '—'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {data.inflation?.backtest_metrics?.r2 != null ? `R² = ${data.inflation.backtest_metrics.r2.toFixed(3)}` : ''}
              </div>
            </div>
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {isEn ? 'Poverty RMSE' : 'RMSE Pobreza'}
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {data.poverty?.backtest_metrics?.rmse != null ? `${data.poverty.backtest_metrics.rmse.toFixed(2)}pp` : '—'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {data.poverty?.backtest_metrics?.r2 != null ? `R² = ${data.poverty.backtest_metrics.r2.toFixed(3)}` : ''}
              </div>
            </div>
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {isEn ? 'Coverage' : 'Cobertura'}
              </div>
              <div className="text-2xl font-semibold text-gray-900">490+</div>
              <div className="text-xs text-gray-600 mt-1">
                {isEn ? 'Economic indicators' : 'Indicadores económicos'}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="border border-gray-300">
          <div className="h-12 bg-gray-100 mb-2"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-white border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
