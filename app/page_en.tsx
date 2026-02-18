'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Parse YYYY-MM-DD as local date (avoids UTC-to-local day-shift bug)
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/assets/data/gdp_nowcast.json').then(r => r.json()),
      fetch('/assets/data/inflation_nowcast.json').then(r => r.json()),
      fetch('/assets/data/poverty_nowcast.json').then(r => r.json()),
      fetch('/assets/data/political_index_daily.json').then(r => r.json())
    ]).then(([gdp, inflation, poverty, political]) => {
      setData({ gdp, inflation, poverty, political });
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header - FRED Style */}
      <header className="border-b border-gray-300 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-6">
              <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
                QHAWARINA
              </Link>
              <nav className="flex gap-6 text-sm">
                <Link href="/gdp" className="text-gray-600 hover:text-gray-900 font-medium">GDP</Link>
                <Link href="/inflation" className="text-gray-600 hover:text-gray-900 font-medium">Inflation</Link>
                <Link href="/poverty" className="text-gray-600 hover:text-gray-900 font-medium">Poverty</Link>
                <Link href="/political" className="text-gray-600 hover:text-gray-900 font-medium">Political Risk</Link>
                <Link href="/data" className="text-gray-600 hover:text-gray-900 font-medium">Data</Link>
              </nav>
            </div>
            <div className="text-xs text-gray-500">
              Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Data Grid */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Key Indicators - Clean Table Style */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
            Key Economic Indicators
          </h2>
          <div className="border border-gray-300">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Indicator
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Latest
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">

                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    GDP Growth (YoY)
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.gdp.nowcast.value > 0 ? '+' : ''}{data.gdp.nowcast.value.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {data.gdp.nowcast.target_period}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    DFM-Ridge
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/gdp" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Inflation (MoM)
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.inflation.nowcast.value > 0 ? '+' : ''}{data.inflation.nowcast.value.toFixed(3)}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {data.inflation.nowcast.target_period}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    DFM-AR(1)
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/inflation" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Poverty Rate
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.poverty.national.poverty_rate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {data.poverty.metadata.target_year}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    GBR
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/poverty" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Political Risk Index
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.political.current.score.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {parseLocalDate(data.political.current.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    GPT-4o
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/political" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* About Section - Professional */}
        <section className="grid grid-cols-2 gap-8 mb-12">
          <div className="border border-gray-300 p-6 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              About Qhawarina
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Real-time economic nowcasting platform for Peru using Dynamic Factor Models,
              Gradient Boosting, and GPT-4o classification on 490+ indicators.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Updated daily at 08:00 PET. All data and models open source under CC BY 4.0.
            </p>
          </div>
          <div className="border border-gray-300 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Methodology
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li><strong>GDP:</strong> 2-factor DFM, Ridge bridge (α=1.0), 7-year rolling window</li>
              <li><strong>Inflation:</strong> 2-factor DFM with factor lags + AR(1) component</li>
              <li><strong>Poverty:</strong> GBR on departmental panel + NTL disaggregation</li>
              <li><strong>Political:</strong> 81 RSS feeds, GPT-4o binary classification</li>
            </ul>
          </div>
        </section>

        {/* Performance Metrics - Bloomberg Style */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
            Model Performance (Out-of-Sample)
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">GDP RMSE</div>
              <div className="text-2xl font-semibold text-gray-900">{data.gdp.backtest_metrics.rmse.toFixed(2)}pp</div>
              <div className="text-xs text-gray-600 mt-1">R² = {data.gdp.backtest_metrics.r2.toFixed(3)}</div>
            </div>
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Inflation RMSE</div>
              <div className="text-2xl font-semibold text-gray-900">{data.inflation.backtest_metrics.rmse.toFixed(3)}pp</div>
              <div className="text-xs text-gray-600 mt-1">R² = {data.inflation.backtest_metrics.r2.toFixed(3)}</div>
            </div>
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Poverty RMSE</div>
              <div className="text-2xl font-semibold text-gray-900">{data.poverty.backtest_metrics.rmse.toFixed(2)}pp</div>
              <div className="text-xs text-gray-600 mt-1">R² = {data.poverty.backtest_metrics.r2.toFixed(3)}</div>
            </div>
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Coverage</div>
              <div className="text-2xl font-semibold text-gray-900">490+</div>
              <div className="text-xs text-gray-600 mt-1">Economic indicators</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-300 mt-12 py-6 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 text-xs text-gray-600 text-center">
          <p>Qhawarina Economic Nowcasting Platform | Data: CC BY 4.0 | Updated Daily 08:00 PET</p>
        </div>
      </footer>
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
