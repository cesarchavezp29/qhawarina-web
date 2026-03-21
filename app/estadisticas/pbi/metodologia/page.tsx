'use client';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import CiteButton from '../../../components/CiteButton';

function DynamicLastUpdate({ src, isEn }: { src: string; isEn: boolean }) {
  const [dateStr, setDateStr] = useState('');
  useEffect(() => {
    const locale = isEn ? 'en-US' : 'es-PE';
    fetch(src + '?v=' + new Date().toISOString().slice(0, 10))
      .then(r => r.json()).then(d => {
        const iso = d?.metadata?.generated_at ?? new Date().toISOString();
        setDateStr(new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' }));
      }).catch(() => setDateStr(new Date().toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })));
  }, [src, isEn]);
  if (!dateStr) return null;
  return (
    <div className="flex items-center justify-end text-sm text-gray-500">
      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{isEn ? 'Last update:' : 'Última actualización:'} {dateStr}</span>
    </div>
  );
}

export default function PBIMetodologiaPage() {
  const isEn = useLocale() === 'en';

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "#FAF8F4", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")` }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/estadisticas" className="hover:text-blue-700">
            {isEn ? 'Statistics' : 'Estadísticas'}
          </Link>
          {' / '}
          <Link href="/estadisticas/pbi" className="hover:text-blue-700">PBI</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Methodology' : 'Metodología'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">
            {isEn ? 'Methodology — GDP Nowcast' : 'Metodología - Nowcast de PBI'}
          </h1>
          <CiteButton indicator={isEn ? 'Methodology — GDP Nowcast' : 'Metodología — Nowcast de PBI'} isEn={isEn} />
        </div>
        <div className="mt-4">
          <DynamicLastUpdate src="/assets/data/gdp_nowcast.json" isEn={isEn} />
        </div>

        {/* Overview */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? 'Executive Summary' : 'Resumen Ejecutivo'}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'The quarterly GDP nowcast uses a Dynamic Factor Model (DFM) with a Ridge bridge equation to predict Peruvian GDP growth 1–3 months ahead of the official INEI publication. The model summarizes 35+ high-frequency monthly indicators into 3 latent factors that capture the main dimensions of economic activity.'
              : 'El nowcast de PBI trimestral utiliza un modelo de Factores Dinámicos (DFM) con ecuación puente Ridge para predecir el crecimiento del PBI peruano con 1-3 meses de anticipación respecto a la publicación oficial de INEI. El modelo resume 35+ indicadores mensuales de alta frecuencia en 3 factores latentes que capturan las dimensiones principales de la actividad económica.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{isEn ? 'Pre-COVID RMSE' : 'RMSE Pre-COVID'}</div>
              <div className="text-2xl font-bold text-blue-900">1.47 pp</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{isEn ? 'In-Sample R²' : 'R² In-Sample'}</div>
              <div className="text-2xl font-bold text-green-900">0.93</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{isEn ? 'vs AR(1)' : 'vs AR(1)'}</div>
              <div className="text-2xl font-bold text-purple-900">-31%</div>
              <div className="text-xs text-gray-600">{isEn ? 'RMSE reduction' : 'RMSE reduction'}</div>
            </div>
          </div>
        </div>

        {/* Model Architecture */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '1. Model Architecture' : '1. Arquitectura del Modelo'}
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '1.1 Dynamic Factor Model (DFM)' : '1.1 Modelo de Factores Dinámicos (DFM)'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'The DFM assumes that a panel of N monthly indicators can be summarized by K common latent factors:'
              : 'El DFM asume que un panel de N indicadores mensuales puede ser resumido por K factores latentes comunes:'}
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4 overflow-x-auto">
            X<sub>it</sub> = λ<sub>i</sub>&apos;F<sub>t</sub> + ε<sub>it</sub>
            <br />
            F<sub>t</sub> = A<sub>1</sub>F<sub>t-1</sub> + ... + A<sub>p</sub>F<sub>t-p</sub> + u<sub>t</sub>
          </div>
          <p className="text-gray-700 mb-4">{isEn ? 'Where:' : 'Donde:'}</p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>X<sub>it</sub></strong>: {isEn ? 'Indicator i in month t (standardized)' : 'Indicador i en el mes t (estandarizado)'}</li>
            <li><strong>F<sub>t</sub></strong>: {isEn ? 'Vector of K=3 latent factors' : 'Vector de K=3 factores latentes'}</li>
            <li><strong>λ<sub>i</sub></strong>: {isEn ? 'Factor loadings (weight of each indicator)' : 'Factor loadings (pesos de cada indicador)'}</li>
            <li><strong>A<sub>p</sub></strong>: {isEn ? 'Autoregressive matrices of order p=1' : 'Matrices autorregresivas de orden p=1'}</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '1.2 Bridge Equation' : '1.2 Ecuación Puente (Bridge Equation)'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Monthly factors are aggregated to quarterly frequency and linked to GDP via Ridge regression with an autoregressive term:'
              : 'Los factores mensuales se agregan a frecuencia trimestral y se relacionan con el PBI mediante regresión Ridge con término autorregresivo:'}
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4 overflow-x-auto">
            GDP<sub>t</sub> = α + β<sub>1</sub>·F̄<sub>1,t</sub> + β<sub>2</sub>·F̄<sub>2,t</sub> + β<sub>3</sub>·F̄<sub>3,t</sub> + γ·GDP<sub>t-1</sub> + ε<sub>t</sub>
          </div>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Where F̄k,t is the quarterly average of factor k. Ridge (α=1.0) is used instead of OLS to avoid overfitting — OLS produced coefficients of -81 on factor_1; Ridge gives stable coefficients and reduces RMSE by 28% (1.41 vs 1.97).'
              : 'Donde F̄k,t es el promedio trimestral del factor k. Usamos Ridge (α=1.0) en lugar de OLS para evitar overfitting - OLS producía coeficientes de -81 en factor_1, Ridge da coeficientes estables y reduce RMSE 28% (1.41 vs 1.97).'}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '1.3 COVID-19 Handling' : '1.3 Manejo de COVID-19'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'To avoid distortions from the 2020–2021 structural shock:'
              : 'Para evitar distorsiones por el shock estructural de 2020-2021:'}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
            <li>
              <strong>{isEn ? '7-year rolling window:' : 'Rolling window de 7 años:'}</strong>{' '}
              {isEn
                ? 'Instead of an expanding window, only the last 84 months are used for factor extraction. This prevents the model from "learning" COVID patterns that won\'t repeat.'
                : 'En lugar de ventana expansiva, usamos solo los últimos 84 meses para extracción de factores. Esto evita que el modelo "aprenda" patrones de COVID que no se repetirán.'}
            </li>
            <li>
              <strong>{isEn ? 'Training exclusion:' : 'Exclusión de training:'}</strong>{' '}
              {isEn
                ? 'Post-2022, the model excludes 2020–2021 from bridge equation training. Pre-COVID uses all available data.'
                : 'Post-2022, el modelo excluye 2020-2021 del entrenamiento de la ecuación puente. Pre-COVID usa todos los datos disponibles.'}
            </li>
            <li>
              <strong>{isEn ? 'Result:' : 'Resultado:'}</strong>{' '}
              {isEn
                ? 'Post-COVID RMSE improves from 8.1 pp (expanding window) to 7.1 pp (rolling + exclusion).'
                : 'RMSE post-COVID mejora de 8.1 pp (ventana expansiva) a 7.1 pp (rolling + exclusión).'}
            </li>
          </ul>
        </div>

        {/* Data Sources */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '2. Data Sources' : '2. Fuentes de Datos'}
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '2.1 Monthly Indicators (35 series)' : '2.1 Indicadores Mensuales (35 series)'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {isEn ? 'Category' : 'Categoría'}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {isEn ? 'Indicators' : 'Indicadores'}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {isEn ? 'Source' : 'Fuente'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Production' : 'Producción'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Manufacturing, mining, construction, fishing' : 'Manufactura, minería, construcción, pesca'}</td>
                  <td className="px-4 py-2 text-gray-600">INEI, BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Foreign Trade' : 'Comercio Exterior'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Exports, imports (volume and value)' : 'Exportaciones, importaciones (volumen y valor)'}</td>
                  <td className="px-4 py-2 text-gray-600">BCRP, SUNAT</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Credit' : 'Crédito'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Total credit, consumer, mortgage, corporate' : 'Crédito total, consumo, hipotecario, empresas'}</td>
                  <td className="px-4 py-2 text-gray-600">BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Employment' : 'Empleo'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Formal employment Lima, private payroll' : 'Empleo formal Lima, planilla privada'}</td>
                  <td className="px-4 py-2 text-gray-600">MTPE</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Fiscal' : 'Fiscal'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Tax revenue, public spending' : 'Recaudación tributaria, gasto público'}</td>
                  <td className="px-4 py-2 text-gray-600">SUNAT, MEF</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Expectations' : 'Expectativas'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Business confidence, GDP expectations' : 'Confianza empresarial, expectativas PBI'}</td>
                  <td className="px-4 py-2 text-gray-600">BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Satellite' : 'Satelital'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Nighttime lights (NTL) national sum' : 'Luces nocturnas (NTL) suma nacional'}</td>
                  <td className="px-4 py-2 text-gray-600">NOAA-VIIRS</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '2.2 Target: Quarterly GDP (INEI)' : '2.2 Target: PBI Trimestral (INEI)'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Seasonally adjusted GDP, YoY % change. Published with ~45-day lag. Target period: last complete quarter for which the panel has sufficient data (>50% of series with data).'
              : 'PBI desestacionalizado, variación YoY (%). Publicado con ~45 días de rezago. Target period: último trimestre completo para el cual hay panel suficiente (>50% de series con datos).'}
          </p>
        </div>

        {/* Performance */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '3. Performance and Validation' : '3. Desempeño y Validación'}
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '3.1 Historical Backtest (2010–2025)' : '3.1 Backtest Histórico (2010-2025)'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Period' : 'Período'}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">RMSE (pp)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">MAE (pp)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">R²</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 text-gray-900">{isEn ? 'Pre-COVID (2010–2019)' : 'Pre-COVID (2010-2019)'}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">1.47</td>
                  <td className="px-4 py-2 text-right text-gray-700">1.12</td>
                  <td className="px-4 py-2 text-right text-gray-700">0.89</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-900">{isEn ? 'Post-COVID (2022–2025)' : 'Post-COVID (2022-2025)'}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">7.09</td>
                  <td className="px-4 py-2 text-right text-gray-700">5.21</td>
                  <td className="px-4 py-2 text-right text-gray-700">0.76</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-4 py-2 text-gray-900 font-medium">{isEn ? 'Full Period' : 'Período Completo'}</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-900">5.45</td>
                  <td className="px-4 py-2 text-right text-blue-900">3.89</td>
                  <td className="px-4 py-2 text-right text-blue-900">0.93</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '3.2 Comparison vs Benchmarks' : '3.2 Comparación vs Benchmarks'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn ? 'DFM consistently outperforms naive models:' : 'El DFM supera consistentemente a modelos naive:'}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>AR(1):</strong> RMSE = 7.85 pp → DFM Rel.RMSE = 0.69 (-31% {isEn ? 'error' : 'error'})</li>
            <li><strong>Random Walk:</strong> RMSE = 8.01 pp → DFM Rel.RMSE = 0.68 (-32% {isEn ? 'error' : 'error'})</li>
          </ul>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'DFM value is greatest at turning points (recessions, accelerations) where AR(1) simply projects recent trends.'
              : 'El valor del DFM es mayor en puntos de inflexión (recesiones, aceleraciones) donde AR(1) simplemente proyecta tendencia reciente.'}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '3.3 Current Nowcast (2025-Q4)' : '3.3 Nowcast Actual (2025-Q4)'}
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900 font-medium">
              {isEn ? 'GDP 2025-Q4:' : 'PBI 2025-Q4:'} <strong>+2.13%</strong> YoY
            </p>
            <p className="text-sm text-green-800 mt-2">
              Bridge R² = 0.934 | {isEn ? 'Panel through Nov-2025' : 'Panel a través de Nov-2025'} | 33/35 {isEn ? 'active series' : 'series activas'}
            </p>
          </div>
        </div>

        {/* Regional Disaggregation */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '4. Regional Disaggregation' : '4. Desagregación Regional'}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'The national nowcast is disaggregated to 25 departments using nighttime lights (NTL) as a proxy for regional economic activity. Method: ntl_share (proportional allocation).'
              : 'El nowcast nacional se desagrega a 25 departamentos usando luces nocturnas (NTL) como proxy de actividad económica regional. Método: ntl_share (asignación proporcional).'}
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            GDP<sub>dept,t</sub> = GDP<sub>nacional,t</sub> × share<sub>dept</sub>
            <br />
            share<sub>dept</sub> = NTL<sub>dept</sub> / Σ NTL<sub>nacional</sub>
          </div>
          <p className="text-gray-700 mb-4">
            <strong>{isEn ? 'Assumption:' : 'Supuesto:'}</strong>{' '}
            {isEn
              ? 'Homogeneous model — all departments grow at the national rate. Only the economic share varies, not growth rates. See '
              : 'Modelo homogéneo - todos los departamentos crecen al ritmo nacional. Solo varía la participación económica, no las tasas de crecimiento. Ver '}
            <Link href="/estadisticas/pbi/mapas" className="text-blue-700 hover:underline">
              {isEn ? 'regional maps' : 'mapas regionales'}
            </Link>
            {isEn ? ' for details.' : ' para detalles.'}
          </p>
        </div>

        {/* Limitations */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ {isEn ? 'Limitations' : 'Limitaciones'}</h3>
          <ul className="list-disc pl-6 space-y-2 text-yellow-800 text-sm">
            <li>
              <strong>{isEn ? 'Missing data:' : 'Datos faltantes:'}</strong>{' '}
              {isEn
                ? 'The "ragged edge" (recent months with incomplete series) can introduce noise. We truncate months with <50% of data.'
                : 'El "ragged edge" (meses recientes con series incompletas) puede introducir ruido. Truncamos meses con <50% de datos.'}
            </li>
            <li>
              <strong>{isEn ? 'Structural changes:' : 'Cambios estructurales:'}</strong>{' '}
              {isEn
                ? 'The model assumes stable relationships. Shocks like COVID require special treatment (exclusion, rolling windows).'
                : 'El modelo asume estabilidad de relaciones. Shocks como COVID requieren tratamiento especial (exclusión, rolling windows).'}
            </li>
            <li>
              <strong>{isEn ? 'GDP revisions:' : 'Revisiones de PBI:'}</strong>{' '}
              {isEn
                ? 'INEI revises the official GDP up to 3 quarters back. The backtest uses vintage data for realism.'
                : 'INEI revisa el PBI oficial hasta 3 trimestres hacia atrás. El backtest usa datos vintage para realismo.'}
            </li>
            <li>
              <strong>{isEn ? 'Regional disaggregation:' : 'Desagregación regional:'}</strong>{' '}
              {isEn
                ? 'The homogeneous model does not capture heterogeneity in departmental growth. Future models will use region-specific indicators.'
                : 'El modelo homogéneo no captura heterogeneidad en crecimiento departamental. Futuros modelos usarán indicadores regionales específicos.'}
            </li>
          </ul>
        </div>

        {/* References */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? 'References' : 'Referencias'}
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Giannone, D., Reichlin, L., & Small, D. (2008).</strong> &quot;Nowcasting: The real-time
              informational content of macroeconomic data.&quot; <em>Journal of Monetary Economics</em>, 55(4), 665-676.
            </p>
            <p>
              <strong>Bańbura, M., & Rünstler, G. (2011).</strong> &quot;A look into the factor model black box:
              Publication lags and the role of hard and soft data in forecasting GDP.&quot;{' '}
              <em>International Journal of Forecasting</em>, 27(2), 333-346.
            </p>
            <p>
              <strong>Stock, J. H., & Watson, M. W. (2002).</strong> &quot;Forecasting using principal components
              from a large number of predictors.&quot; <em>Journal of the American Statistical Association</em>,
              97(460), 1167-1179.
            </p>
            <p>
              <strong>Mariano, R. S., & Murasawa, Y. (2003).</strong> &quot;A new coincident index of business
              cycles based on monthly and quarterly series.&quot; <em>Journal of Applied Econometrics</em>, 18(4), 427-443.
            </p>
          </div>
        </div>

        {/* Code Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            {isEn ? 'Source code available in the ' : 'Código fuente disponible en el '}
            <a
              href="https://github.com/btorressz/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              {isEn ? 'NEXUS repository' : 'repositorio NEXUS'}
            </a>
          </p>
          <p className="text-xs text-gray-500">
            {isEn ? 'See:' : 'Ver:'}{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">src/models/dfm.py</code>,{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">scripts/generate_nowcast.py</code>
          </p>
        </div>
      </div>
    </div>
  );
}
