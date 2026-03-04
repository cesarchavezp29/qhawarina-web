'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

type ReportType = 'diario-economico' | 'diario-politico' | 'mensual-economico' | 'mensual-politico';

function fmt(v: number | null | undefined, decimals = 2, suffix = '') {
  if (v == null || isNaN(v)) return '—';
  return v.toFixed(decimals) + suffix;
}

function fmtDate(dateStr: string, isEn: boolean) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(isEn ? 'en-US' : 'es-PE', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

function fmtMonth(monthStr: string, isEn: boolean) {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { month: 'long', year: 'numeric' });
}

function levelColor(level: string) {
  if (level === 'CRÍTICO') return 'text-red-700 bg-red-50 border-red-200';
  if (level === 'ALTO') return 'text-orange-700 bg-orange-50 border-orange-200';
  if (level === 'MODERADO') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  return 'text-green-700 bg-green-50 border-green-200';
}

// ---------- Sub-report components ----------

function DiarioEconomico({ fx, dpi, gdp, inf, isEn }: { fx: any; dpi: any; gdp: any; inf: any; isEn: boolean }) {
  if (!fx || !gdp || !inf) return <Loading />;
  const latest = fx.latest || {};
  const dpiLatest = dpi?.latest || {};
  const gdpNow = gdp.nowcast || {};
  const infNow = inf.nowcast || {};
  const infRecent = inf.recent_months || [];
  const last3 = infRecent.slice(-3);

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="border-b border-gray-300 pb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEn ? 'Daily Economic Report' : 'Reporte Económico Diario'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {latest.date ? fmtDate(latest.date, isEn) : '—'} ·{' '}
              {isEn ? 'Source: BCRP, INEI, QHAWARINA' : 'Fuente: BCRP, INEI, QHAWARINA'}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 print:hidden"
          >
            {isEn ? 'Print / Save PDF' : 'Imprimir / Guardar PDF'}
          </button>
        </div>
      </div>

      {/* FX Market */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'FX Market' : 'Mercado Cambiario'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="TC PEN/USD" value={fmt(latest.fx, 4)} unit="S/ per USD" />
          <KpiCard label={isEn ? 'BCRP Reference Rate' : 'Tasa Referencia BCRP'} value={fmt(latest.reference_rate, 2)} unit="%" />
          <KpiCard label={isEn ? '10Y PEN Bond' : 'Bono Sol 10a'} value={fmt(latest.bond_sol_10y, 2)} unit="%" />
          <KpiCard label="BVL" value={latest.bvl != null ? latest.bvl.toLocaleString(isEn ? 'en-US' : 'es-PE', { maximumFractionDigits: 0 }) : '—'} unit={isEn ? 'points' : 'puntos'} />
        </div>
      </section>

      {/* Nowcasts */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'QHAWARINA Nowcasts' : 'Nowcasts QHAWARINA'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">{isEn ? 'GDP' : 'PBI'} — {gdpNow.target_period || '—'}</p>
            <p className="text-3xl font-bold text-gray-900">{fmt(gdpNow.value, 2)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {isEn ? 'year-on-year change' : 'variación interanual'} · DFM + Bridge R²={fmt(gdpNow.bridge_r2, 3)}
            </p>
            <div className="mt-3 text-xs text-gray-600">
              {isEn ? 'Historical RMSE' : 'RMSE histórico'}: {fmt(gdp.backtest_metrics?.rmse, 2)} pp ·
              Rel.RMSE vs AR1: {fmt(gdp.backtest_metrics?.relative_rmse_vs_ar1, 3)}
            </div>
          </div>
          <div className="border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">{isEn ? 'Inflation' : 'Inflación'} — {infNow.target_period || '—'}</p>
            <p className="text-3xl font-bold text-gray-900">{fmt(infNow.value, 3)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {isEn ? '3-month moving average' : 'promedio móvil 3 meses'} · DFM + Bridge R²={fmt(infNow.bridge_r2, 3)}
            </p>
            <div className="mt-3 text-xs text-gray-600">
              {isEn ? 'Historical RMSE' : 'RMSE histórico'}: {fmt(inf.backtest_metrics?.rmse, 3)} pp ·
              Rel.RMSE vs AR1: {fmt(inf.backtest_metrics?.relative_rmse_vs_ar1, 3)}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Inflation */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'Monthly Inflation — Last 3 Months' : 'Inflación Mensual — Últimos 3 Meses'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">{isEn ? 'Month' : 'Mes'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'Official (%)' : 'Oficial (%)'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Nowcast (%)</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'Error (pp)' : 'Error (pp)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {last3.map((r: any) => (
                <tr key={r.month} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700">{fmtMonth(r.month, isEn)}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {r.official != null ? fmt(r.official, 3) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{fmt(r.nowcast, 3)}</td>
                  <td className={`px-4 py-2 text-right font-mono ${r.error != null && r.error > 0 ? 'text-red-600' : 'text-green-700'}`}>
                    {r.error != null ? (r.error > 0 ? '+' : '') + fmt(r.error, 3) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Supermarket Price Index */}
      {dpiLatest.date && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
            {isEn ? 'Supermarket Price Index (BPP)' : 'Índice de Precios de Supermercados (BPP)'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label={isEn ? 'Overall Index' : 'Índice General'} value={fmt(dpiLatest.index_all, 3)} unit="(base=100)" />
            <KpiCard label={isEn ? 'Food Index' : 'Índice Alimentos'} value={fmt(dpiLatest.index_food, 3)} unit="(base=100)" />
            <KpiCard label={isEn ? 'Daily change' : 'Var. diaria'} value={fmt(dpiLatest.var_all, 4)} unit="%" />
            <KpiCard label={isEn ? 'Monthly cum.' : 'Acum. mensual'} value={fmt(dpiLatest.cum_pct, 3)} unit="%" />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {isEn
              ? `Plaza Vea, Metro, Wong · ~42,000 products · Jevons method · ${dpiLatest.date ? fmtDate(dpiLatest.date, isEn) : ''}`
              : `Plaza Vea, Metro, Wong · ~42 000 productos · Método Jevons · ${dpiLatest.date ? fmtDate(dpiLatest.date, isEn) : ''}`}
          </p>
        </section>
      )}
    </div>
  );
}

function DiarioPolitico({ pol, isEn }: { pol: any; isEn: boolean }) {
  if (!pol) return <Loading />;
  const cur = pol.current || {};
  const agg = pol.aggregates || {};
  const daily = (pol.daily_series || []).slice(-14).reverse();

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-300 pb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEn ? 'Daily Political Report' : 'Reporte Político Diario'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {cur.date ? fmtDate(cur.date, isEn) : '—'} ·{' '}
              {isEn ? 'Source: RSS, NLP analysis, QHAWARINA' : 'Fuente: RSS, análisis NLP, QHAWARINA'}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 print:hidden"
          >
            {isEn ? 'Print / Save PDF' : 'Imprimir / Guardar PDF'}
          </button>
        </div>
      </div>

      {/* Index today */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'Political Instability Index — Today' : 'Índice de Inestabilidad Política — Hoy'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label={isEn ? 'Score (0–1)' : 'Puntuación (0–1)'} value={fmt(cur.score, 3)} unit="" />
          <div className="border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{isEn ? 'Level' : 'Nivel'}</p>
            <span className={`inline-block text-sm font-bold px-2 py-1 border ${levelColor(cur.level || '')}`}>
              {cur.level || '—'}
            </span>
          </div>
          <KpiCard label={isEn ? 'Total articles' : 'Artículos totales'} value={cur.articles_total?.toString() || '—'} unit="" />
          <KpiCard label={isEn ? 'Political articles' : 'Artículos políticos'} value={cur.articles_political?.toString() || '—'} unit="" />
        </div>
      </section>

      {/* Moving averages */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'Moving Averages' : 'Promedios Móviles'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard label={isEn ? '7-day avg' : 'Promedio 7 días'} value={fmt(agg['7d_avg'], 3)} unit="" />
          <KpiCard label={isEn ? '30-day avg' : 'Promedio 30 días'} value={fmt(agg['30d_avg'], 3)} unit="" />
          <div className="border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{isEn ? "Year's peak" : 'Máximo del año'}</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(agg.year_max, 3)}</p>
            <p className="text-xs text-gray-400 mt-1">{agg.year_max_date ? fmtDate(agg.year_max_date, isEn) : ''}</p>
          </div>
        </div>
      </section>

      {/* Last 14 days */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'Last 14 Days' : 'Últimos 14 Días'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">{isEn ? 'Date' : 'Fecha'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'Score' : 'Puntuación'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'Articles' : 'Artículos'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'Provisional' : 'Provisional'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {daily.map((r: any) => (
                <tr key={r.date} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700">{fmtDate(r.date, isEn)}</td>
                  <td className="px-4 py-2 text-right font-mono font-semibold">
                    {fmt(r.score, 3)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">{r.n_articles ?? '—'}</td>
                  <td className="px-4 py-2 text-right text-gray-400 text-xs">
                    {r.provisional ? (isEn ? 'Yes' : 'Sí') : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {isEn
            ? 'Provisional index: partial day estimate, subject to revision.'
            : 'Índice provisional: estimado parcial del día, sujeto a revisión.'}
        </p>
      </section>
    </div>
  );
}

function MensualEconomico({ gdp, inf, pov, isEn }: { gdp: any; inf: any; pov: any; isEn: boolean }) {
  if (!gdp || !inf || !pov) return <Loading />;
  const gdpNow = gdp.nowcast || {};
  const infNow = inf.nowcast || {};
  const recentQ = (gdp.recent_quarters || []).slice(-6);
  const recentM = (inf.recent_months || []).slice(-6);
  const national = pov.national || {};
  const historical = (pov.historical_series || []).slice(-4);
  const today = new Date().toLocaleDateString(isEn ? 'en-US' : 'es-PE', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-300 pb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEn ? 'Monthly Economic Report' : 'Reporte Económico Mensual'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {today} · {isEn ? 'Source: BCRP, INEI, QHAWARINA' : 'Fuente: BCRP, INEI, QHAWARINA'}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 print:hidden"
          >
            {isEn ? 'Print / Save PDF' : 'Imprimir / Guardar PDF'}
          </button>
        </div>
      </div>

      {/* Nowcasts Summary */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'Nowcasts — Summary' : 'Nowcasts — Resumen'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">{isEn ? 'GDP' : 'PBI'} — {gdpNow.target_period}</p>
            <p className="text-3xl font-bold text-gray-900">{fmt(gdpNow.value, 2)}%</p>
            <p className="text-xs text-gray-500">{isEn ? 'YoY change' : 'var. interanual'}</p>
            <div className="mt-2 text-xs text-gray-400">
              RMSE: {fmt(gdp.backtest_metrics?.rmse, 2)} pp
            </div>
          </div>
          <div className="border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">{isEn ? 'Inflation' : 'Inflación'} — {infNow.target_period}</p>
            <p className="text-3xl font-bold text-gray-900">{fmt(infNow.value, 3)}%</p>
            <p className="text-xs text-gray-500">{isEn ? '3-month moving average' : 'promedio móvil 3 meses'}</p>
            <div className="mt-2 text-xs text-gray-400">
              RMSE: {fmt(inf.backtest_metrics?.rmse, 3)} pp
            </div>
          </div>
          <div className="border border-gray-200 p-5">
            <p className="text-xs text-gray-500 mb-1">{isEn ? 'Poverty' : 'Pobreza'} — 2024</p>
            <p className="text-3xl font-bold text-gray-900">{fmt(national.poverty_rate, 1)}%</p>
            <p className="text-xs text-gray-500">{isEn ? 'national rate' : 'tasa nacional'}</p>
            <div className="mt-2 text-xs text-gray-400">
              RMSE: {fmt(pov.backtest_metrics?.rmse, 2)} pp
            </div>
          </div>
        </div>
      </section>

      {/* GDP Quarterly */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'GDP — Last 6 Quarters' : 'PBI — Últimos 6 Trimestres'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">{isEn ? 'Quarter' : 'Trimestre'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'Official (% YoY)' : 'Oficial (% a/a)'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'Nowcast (% YoY)' : 'Nowcast (% a/a)'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Error (pp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentQ.map((r: any) => (
                <tr key={r.quarter} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-gray-700">{r.quarter}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {r.official != null ? fmt(r.official, 2) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{fmt(r.nowcast, 2)}</td>
                  <td className={`px-4 py-2 text-right font-mono ${r.error != null && Math.abs(r.error) > 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                    {r.error != null ? (r.error > 0 ? '+' : '') + fmt(r.error, 2) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Monthly Inflation */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'Inflation — Last 6 Months' : 'Inflación — Últimos 6 Meses'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">{isEn ? 'Month' : 'Mes'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'Official (%)' : 'Oficial (%)'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Nowcast (%)</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Error (pp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentM.map((r: any) => (
                <tr key={r.month} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700">{fmtMonth(r.month, isEn)}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {r.official != null ? fmt(r.official, 3) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{fmt(r.nowcast, 3)}</td>
                  <td className={`px-4 py-2 text-right font-mono ${r.error != null && r.error > 0 ? 'text-red-600' : 'text-green-700'}`}>
                    {r.error != null ? (r.error > 0 ? '+' : '') + fmt(r.error, 3) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historical Poverty */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'Poverty — Last 4 Years' : 'Pobreza — Últimos 4 Años'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">{isEn ? 'Year' : 'Año'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'Official (%)' : 'Oficial (%)'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Nowcast (%)</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Error (pp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historical.map((r: any) => (
                <tr key={r.year} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700">{r.year}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {r.official != null ? fmt(r.official, 1) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{fmt(r.nowcast, 1)}</td>
                  <td className={`px-4 py-2 text-right font-mono ${r.error != null && r.error > 0 ? 'text-red-600' : 'text-green-700'}`}>
                    {r.error != null ? (r.error > 0 ? '+' : '') + fmt(r.error, 1) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Model Quality */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'Model Quality (Backtesting)' : 'Calidad de Modelos (Backtesting)'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">{isEn ? 'Model' : 'Modelo'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">RMSE</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">MAE</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">R²</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Rel. vs AR1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: isEn ? 'GDP (pp)' : 'PBI (pp)', m: gdp.backtest_metrics },
                { name: isEn ? 'Inflation (pp)' : 'Inflación (pp)', m: inf.backtest_metrics },
                { name: isEn ? 'Poverty (pp)' : 'Pobreza (pp)', m: pov.backtest_metrics },
              ].map(({ name, m }) => (
                <tr key={name} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700">{name}</td>
                  <td className="px-4 py-2 text-right font-mono">{m ? fmt(m.rmse, 2) : '—'}</td>
                  <td className="px-4 py-2 text-right font-mono">{m ? fmt(m.mae, 2) : '—'}</td>
                  <td className="px-4 py-2 text-right font-mono">{m ? fmt(m.r2, 3) : '—'}</td>
                  <td className={`px-4 py-2 text-right font-mono ${m && m.relative_rmse_vs_ar1 < 1 ? 'text-green-700' : 'text-red-600'}`}>
                    {m ? fmt(m.relative_rmse_vs_ar1, 3) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {isEn
            ? 'Rel. vs AR1 < 1.0 means the model beats the AR(1) benchmark.'
            : 'Rel. vs AR1 < 1.0 indica que el modelo supera al benchmark AR(1).'}
        </p>
      </section>
    </div>
  );
}

function MensualPolitico({ pol, isEn }: { pol: any; isEn: boolean }) {
  if (!pol) return <Loading />;
  const monthly = (pol.monthly_series || []).slice(-6).reverse();
  const agg = pol.aggregates || {};
  const cur = pol.current || {};

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-300 pb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEn ? 'Monthly Political Report' : 'Reporte Político Mensual'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString(isEn ? 'en-US' : 'es-PE', { month: 'long', year: 'numeric' })} ·{' '}
              {isEn ? 'Source: RSS, NLP analysis, QHAWARINA' : 'Fuente: RSS, análisis NLP, QHAWARINA'}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 print:hidden"
          >
            {isEn ? 'Print / Save PDF' : 'Imprimir / Guardar PDF'}
          </button>
        </div>
      </div>

      {/* Current situation */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'Current Situation' : 'Situación Actual'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label={isEn ? "Today's score" : 'Puntuación hoy'} value={fmt(cur.score, 3)} unit="" />
          <div className="border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{isEn ? 'Level' : 'Nivel'}</p>
            <span className={`inline-block text-sm font-bold px-2 py-1 border ${levelColor(cur.level || '')}`}>
              {cur.level || '—'}
            </span>
          </div>
          <KpiCard label={isEn ? '7-day avg' : 'Promedio 7 días'} value={fmt(agg['7d_avg'], 3)} unit="" />
          <KpiCard label={isEn ? '30-day avg' : 'Promedio 30 días'} value={fmt(agg['30d_avg'], 3)} unit="" />
        </div>
      </section>

      {/* Monthly table */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? 'Monthly Averages — Last 6 Months' : 'Promedios Mensuales — Últimos 6 Meses'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">{isEn ? 'Month' : 'Mes'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'Avg. Index' : 'Índice Promedio'}</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">TC PEN/USD</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">{isEn ? 'FX YoY change (%)' : 'TC Var. a/a (%)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthly.map((r: any) => (
                <tr key={r.month} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700">{fmtMonth(r.month, isEn)}</td>
                  <td className="px-4 py-2 text-right font-mono font-semibold">
                    {fmt(r.political_avg, 3)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {r.fx_level != null ? fmt(r.fx_level, 4) : '—'}
                  </td>
                  <td className={`px-4 py-2 text-right font-mono ${r.fx_yoy != null && r.fx_yoy > 0 ? 'text-red-600' : 'text-green-700'}`}>
                    {r.fx_yoy != null ? (r.fx_yoy > 0 ? '+' : '') + fmt(r.fx_yoy, 2) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {isEn
            ? 'FX YoY: positive sign = weaker sol vs USD. Current month data is preliminary.'
            : 'TC var. interanual: signo positivo = sol más débil vs USD. Datos del mes en curso son preliminares.'}
        </p>
      </section>

      {/* Peak instability */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
          {isEn ? `Instability Peak — ${new Date().getFullYear()}` : `Pico de Inestabilidad — ${new Date().getFullYear()}`}
        </h3>
        <div className="border border-orange-200 bg-orange-50 p-5">
          <div className="flex items-baseline gap-6">
            <div>
              <p className="text-xs text-orange-700 mb-1">{isEn ? 'Maximum score' : 'Puntuación máxima'}</p>
              <p className="text-3xl font-bold text-orange-900">{fmt(agg.year_max, 3)}</p>
            </div>
            <div>
              <p className="text-xs text-orange-700 mb-1">{isEn ? 'Date' : 'Fecha'}</p>
              <p className="text-lg font-semibold text-orange-900">
                {agg.year_max_date ? fmtDate(agg.year_max_date, isEn) : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------- Shared components ----------

function KpiCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {unit && <p className="text-xs text-gray-400 mt-0.5">{unit}</p>}
    </div>
  );
}

function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-gray-100 rounded" />
      ))}
    </div>
  );
}

// ---------- Main page ----------

const BASE = '/assets/data';

export default function ReportesPage() {
  const isEn = useLocale() === 'en';
  const [activeTab, setActiveTab] = useState<ReportType>('diario-economico');
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const v = new Date().toISOString().slice(0, 10);
    Promise.allSettled([
      fetch(`${BASE}/fx_interventions.json?v=${v}`).then(r => r.json()),
      fetch(`${BASE}/daily_price_index.json?v=${v}`).then(r => r.json()),
      fetch(`${BASE}/gdp_nowcast.json?v=${v}`).then(r => r.json()),
      fetch(`${BASE}/inflation_nowcast.json?v=${v}`).then(r => r.json()),
      fetch(`${BASE}/poverty_nowcast.json?v=${v}`).then(r => r.json()),
      fetch(`${BASE}/political_index_daily.json?v=${v}`).then(r => r.json()),
    ]).then(([fxR, dpiR, gdpR, infR, povR, polR]) => {
      setData({
        fx: fxR.status === 'fulfilled' ? fxR.value : null,
        dpi: dpiR.status === 'fulfilled' ? dpiR.value : null,
        gdp: gdpR.status === 'fulfilled' ? gdpR.value : null,
        inf: infR.status === 'fulfilled' ? infR.value : null,
        pov: povR.status === 'fulfilled' ? povR.value : null,
        pol: polR.status === 'fulfilled' ? polR.value : null,
      });
      setLoading(false);
    });
  }, []);

  const tabs: { id: ReportType; label: string }[] = isEn ? [
    { id: 'diario-economico', label: 'Daily Economic' },
    { id: 'diario-politico', label: 'Daily Political' },
    { id: 'mensual-economico', label: 'Monthly Economic' },
    { id: 'mensual-politico', label: 'Monthly Political' },
  ] : [
    { id: 'diario-economico', label: 'Diario Económico' },
    { id: 'diario-politico', label: 'Diario Político' },
    { id: 'mensual-economico', label: 'Mensual Económico' },
    { id: 'mensual-politico', label: 'Mensual Político' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">{isEn ? 'Reports' : 'Reportes'}</h1>
          <p className="text-sm text-gray-500">
            {isEn
              ? 'Automatically generated reports with real-time data. Use the "Print / Save PDF" button in each report to export.'
              : 'Informes generados automáticamente con datos en tiempo real. Usa el botón "Imprimir / Guardar PDF" en cada reporte para exportar.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 mb-8">
          <nav className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <Loading />
        ) : (
          <>
            {activeTab === 'diario-economico' && (
              <DiarioEconomico fx={data.fx} dpi={data.dpi} gdp={data.gdp} inf={data.inf} isEn={isEn} />
            )}
            {activeTab === 'diario-politico' && (
              <DiarioPolitico pol={data.pol} isEn={isEn} />
            )}
            {activeTab === 'mensual-economico' && (
              <MensualEconomico gdp={data.gdp} inf={data.inf} pov={data.pov} isEn={isEn} />
            )}
            {activeTab === 'mensual-politico' && (
              <MensualPolitico pol={data.pol} isEn={isEn} />
            )}
          </>
        )}

        {/* Footer note */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            {isEn
              ? 'Updated daily · Sources: BCRP, INEI, MIDAGRI, QHAWARINA · License CC BY 4.0 · Nowcasts are statistical estimates, not official forecasts.'
              : 'Datos actualizados diariamente · Fuentes: BCRP, INEI, MIDAGRI, QHAWARINA · Licencia CC BY 4.0 · Los nowcasts son estimaciones estadísticas, no pronósticos oficiales.'}
          </p>
        </div>
      </main>
    </div>
  );
}
