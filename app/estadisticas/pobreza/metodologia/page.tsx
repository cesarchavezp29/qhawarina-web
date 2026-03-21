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
        const iso = d?.metadata?.last_updated ?? new Date().toISOString();
        setDateStr(new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' }));
      }).catch(() => setDateStr(new Date().toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })));
  }, [src, isEn]);
  if (!dateStr) return null;
  return (
    <div className="flex items-center justify-end text-sm" style={{ color: '#8D99AE' }}>
      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{isEn ? 'Last updated:' : 'Última actualización:'} {dateStr}</span>
    </div>
  );
}

export default function PobrezaMetodologiaPage() {
  const isEn = useLocale() === 'en';

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "#FAF8F4", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.045'%3EQHAWARINA%3C/text%3E%3C/svg%3E")` }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm mb-4" style={{ color: '#8D99AE' }}>
          <Link href="/estadisticas" className="hover:text-blue-700">
            {isEn ? 'Statistics' : 'Estadísticas'}
          </Link>
          {" / "}
          <Link href="/estadisticas/pobreza" className="hover:text-blue-700">
            {isEn ? 'Poverty' : 'Pobreza'}
          </Link>
          {" / "}
          <span className="font-medium" style={{ color: '#2D3142' }}>{isEn ? 'Methodology' : 'Metodología'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold" style={{ color: '#2D3142' }}>
            {isEn ? 'Methodology — Poverty Nowcast' : 'Metodología - Nowcast de Pobreza'}
          </h1>
          <CiteButton indicator={isEn ? 'Methodology — Poverty Nowcast' : 'Metodología — Nowcast de Pobreza'} isEn={isEn} />
        </div>
        <div className="mt-4">
          <DynamicLastUpdate src="/assets/data/poverty_nowcast.json" isEn={isEn} />
        </div>

        {/* Overview */}
        <div className="mt-8 rounded-lg border p-8" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D3142' }}>
            {isEn ? 'Executive Summary' : 'Resumen Ejecutivo'}
          </h2>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn
              ? <>The poverty nowcast uses a <strong>departmental panel model with Gradient Boosting Regressor (GBR)</strong> that predicts year-on-year changes in poverty rates for 24 departments. The model uses departmental economic indicators (credit, electricity, tax revenue, public spending, employment, mining, inflation) to estimate monetary poverty 6–12 months ahead of the official annual INEI publication.</>
              : <>El nowcast de pobreza utiliza un <strong>modelo de panel departamental con Gradient Boosting Regressor (GBR)</strong> que predice cambios año-a-año en tasas de pobreza para 24 departamentos. El modelo usa indicadores económicos departamentales (crédito, electricidad, recaudación, gasto público, empleo, minería, inflación) para estimar pobreza monetaria con 6-12 meses de anticipación respecto a la publicación oficial anual de INEI.</>}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm mb-1" style={{ color: '#8D99AE' }}>{isEn ? 'Annual RMSE' : 'RMSE Anual'}</div>
              <div className="text-2xl font-bold text-blue-900">2.54 pp</div>
              <div className="text-xs" style={{ color: '#8D99AE' }}>{isEn ? 'excl. COVID' : 'excl. COVID'}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm mb-1" style={{ color: '#8D99AE' }}>{isEn ? 'vs AR(1)' : 'vs AR(1)'}</div>
              <div className="text-2xl font-bold text-green-900">-4.2%</div>
              <div className="text-xs" style={{ color: '#8D99AE' }}>Rel.RMSE = 0.953</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm mb-1" style={{ color: '#8D99AE' }}>{isEn ? 'GBR vs Ridge' : 'GBR vs Ridge'}</div>
              <div className="text-2xl font-bold text-purple-900">-25%</div>
              <div className="text-xs" style={{ color: '#8D99AE' }}>{isEn ? 'RMSE reduction' : 'RMSE reduction'}</div>
            </div>
          </div>
        </div>

        {/* Model Architecture */}
        <div className="mt-8 rounded-lg border p-8" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D3142' }}>
            {isEn ? '1. Model Architecture' : '1. Arquitectura del Modelo'}
          </h2>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '1.1 Panel PovertyNowcaster with GBR' : '1.1 Panel PovertyNowcaster con GBR'}
          </h3>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn
              ? <>The model operates on a panel of 24 departments × 20 years (2004–2024). It uses a <strong>change-prediction approach</strong>: it predicts the change in poverty, then adds it to the observed value at t-1.</>
              : <>El modelo opera sobre un panel de 24 departamentos × 20 años (2004-2024). Usa un <strong>change-prediction approach</strong>: predice el cambio en pobreza, luego lo suma al valor observado en t-1.</>}
          </p>
          <div className="p-4 rounded font-mono text-sm mb-4 overflow-x-auto" style={{ background: '#F5F2EE' }}>
            Δpobreza<sub>d,t</sub> = GBR(X<sub>d,t</sub>, pobreza<sub>d,t-1</sub>)
            <br />
            pobreza<sub>d,t</sub> = pobreza<sub>d,t-1</sub> + Δpobreza<sub>d,t</sub>
          </div>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn ? 'Where:' : 'Donde:'}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: '#2D3142' }}>
            <li><strong>d</strong>: {isEn ? 'Department (24 units, Callao merged with Lima)' : 'Departamento (24 unidades, Callao fusionado con Lima)'}</li>
            <li><strong>X<sub>d,t</sub></strong>: {isEn ? 'Departmental features aggregated to annual frequency' : 'Features departamentales agregadas a frecuencia anual'}</li>
            <li><strong>pobreza<sub>d,t-1</sub></strong>: {isEn ? 'Poverty lag (highly predictive)' : 'Rezago de pobreza (muy predictivo)'}</li>
            <li><strong>GBR</strong>: {isEn ? 'Gradient Boosting Regressor (scikit-learn) with 100 trees, max_depth=3' : 'Gradient Boosting Regressor (scikit-learn) con 100 árboles, max_depth=3'}</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '1.2 Why Change-Prediction?' : '1.2 ¿Por qué Change-Prediction?'}
          </h3>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn ? 'Earlier attempts to predict levels directly failed:' : 'Intentos anteriores de predecir niveles directos fallaron:'}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2" style={{ color: '#2D3142' }}>
            <li>
              <strong>{isEn ? 'Fixed-effects demeaning:' : 'Fixed-effects demeaning:'}</strong>{' '}
              {isEn ? 'RMSE = 24.5 pp (unstable with N=24, produces negative predictions)' : 'RMSE = 24.5 pp (inestable con N=24, produce predicciones negativas)'}
            </li>
            <li>
              <strong>{isEn ? 'Level prediction with Ridge:' : 'Level prediction con Ridge:'}</strong>{' '}
              {isEn ? 'RMSE = 13.7 pp (loses AR lag info after standardization)' : 'RMSE = 13.7 pp (pierde info del rezago AR tras estandarización)'}
            </li>
            <li>
              <strong>{isEn ? 'Change prediction (current):' : 'Change prediction (actual):'}</strong>{' '}
              {isEn ? 'RMSE = 2.54 pp ✓ — preserves lag information' : 'RMSE = 2.54 pp ✓ — preserva información del rezago'}
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '1.3 Gradient Boosting vs Ridge' : '1.3 Gradient Boosting vs Ridge'}
          </h3>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn ? 'GBR dramatically outperformed linear Ridge:' : 'GBR superó dramáticamente a Ridge lineal:'}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-sm" style={{ borderColor: '#E8E4DF' }}>
              <thead style={{ background: '#F5F2EE' }}>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: '#8D99AE' }}>{isEn ? 'Model' : 'Modelo'}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase" style={{ color: '#8D99AE' }}>RMSE (pp)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase" style={{ color: '#8D99AE' }}>{isEn ? 'Extreme Cases' : 'Casos Extremos'}</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
                <tr>
                  <td className="px-4 py-2" style={{ color: '#2D3142' }}>Ridge (α=100)</td>
                  <td className="px-4 py-2 text-right" style={{ color: '#2D3142' }}>3.40</td>
                  <td className="px-4 py-2" style={{ color: '#8D99AE' }}>Junín: -10pp, Moquegua: -6pp</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-4 py-2 font-semibold" style={{ color: '#2D3142' }}>{isEn ? 'GBR (100 trees)' : 'GBR (100 trees)'}</td>
                  <td className="px-4 py-2 text-right font-bold text-green-900">2.54</td>
                  <td className="px-4 py-2 text-green-800">Junín: +4pp, Moquegua: +0.5pp</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4" style={{ color: '#2D3142' }}>
            {isEn
              ? 'GBR captures non-linearities in the relationship between credit, electricity, and employment with poverty that Ridge cannot model.'
              : 'GBR captura no-linealidades en la relación entre crédito, electricidad y empleo con pobreza que Ridge no puede modelar.'}
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '1.4 COVID-19 Handling' : '1.4 Manejo de COVID-19'}
          </h3>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn
              ? 'Like GDP/Inflation, we exclude 2020–2021 from both training AND evaluation:'
              : 'Similar a GDP/Inflación, excluimos 2020-2021 de training Y evaluación:'}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2" style={{ color: '#2D3142' }}>
            <li>
              <strong>{isEn ? 'Result:' : 'Resultado:'}</strong>{' '}
              {isEn
                ? 'RMSE improves from 4.6 pp (with COVID) to 3.2 pp (without COVID) — 30% reduction'
                : 'RMSE mejora de 4.6 pp (con COVID) a 3.2 pp (sin COVID) — reducción de 30%'}
            </li>
            <li>
              <strong>{isEn ? '"2018 structural break" = 100% COVID:' : '"2018 structural break" = 100% COVID:'}</strong>{' '}
              {isEn
                ? 'pre-2018 RMSE=1.39pp vs post-2018 excl. COVID RMSE=1.57pp (p=0.79, NOT significant)'
                : 'pre-2018 RMSE=1.39pp vs post-2018 excl. COVID RMSE=1.57pp (p=0.79, NO significativo)'}
            </li>
            <li>
              {isEn
                ? 'The supposed "2018 break" disappeared when COVID was excluded — it was an artifact of the 2020 shock'
                : 'El supuesto "quiebre en 2018" desapareció al excluir COVID — era un artefacto del shock 2020'}
            </li>
          </ul>
        </div>

        {/* Data Sources */}
        <div className="mt-8 rounded-lg border p-8" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D3142' }}>
            {isEn ? '2. Data Sources' : '2. Fuentes de Datos'}
          </h2>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '2.1 Departmental Features' : '2.1 Features Departamentales'}
          </h3>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn
              ? 'Monthly departmental panel (25 depts × ~260 months) aggregated to annual frequency:'
              : 'Panel departamental mensual (25 depts × ~260 meses) agregado a frecuencia anual:'}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-sm" style={{ borderColor: '#E8E4DF' }}>
              <thead style={{ background: '#F5F2EE' }}>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: '#8D99AE' }}>{isEn ? 'Category' : 'Categoría'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: '#8D99AE' }}>{isEn ? 'Series' : 'Series'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: '#8D99AE' }}>{isEn ? 'Source' : 'Fuente'}</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
                <tr>
                  <td className="px-4 py-2 font-medium" style={{ color: '#2D3142' }}>{isEn ? 'Credit' : 'Crédito'}</td>
                  <td className="px-4 py-2" style={{ color: '#2D3142' }}>{isEn ? 'Total credit, consumer, MiPyme (YoY%)' : 'Crédito total, consumo, MiPyme (YoY%)'}</td>
                  <td className="px-4 py-2" style={{ color: '#8D99AE' }}>BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium" style={{ color: '#2D3142' }}>{isEn ? 'Deposits' : 'Depósitos'}</td>
                  <td className="px-4 py-2" style={{ color: '#2D3142' }}>{isEn ? 'Demand, savings, term deposits (YoY%)' : 'Depósitos vista, ahorro, plazo (YoY%)'}</td>
                  <td className="px-4 py-2" style={{ color: '#8D99AE' }}>BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium" style={{ color: '#2D3142' }}>{isEn ? 'Electricity' : 'Electricidad'}</td>
                  <td className="px-4 py-2" style={{ color: '#2D3142' }}>{isEn ? 'Departmental electricity production (YoY%)' : 'Producción eléctrica departamental (YoY%)'}</td>
                  <td className="px-4 py-2" style={{ color: '#8D99AE' }}>BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium" style={{ color: '#2D3142' }}>{isEn ? 'Employment' : 'Empleo'}</td>
                  <td className="px-4 py-2" style={{ color: '#2D3142' }}>{isEn ? 'Pension affiliates (ONP/AFP, YoY%)' : 'Afiliados pensiones (ONP/AFP, YoY%)'}</td>
                  <td className="px-4 py-2" style={{ color: '#8D99AE' }}>BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium" style={{ color: '#2D3142' }}>{isEn ? 'Fiscal' : 'Fiscal'}</td>
                  <td className="px-4 py-2" style={{ color: '#2D3142' }}>{isEn ? 'Tax collection, regional/local spending (YoY%)' : 'Recaudación tributaria, gasto regional/local (YoY%)'}</td>
                  <td className="px-4 py-2" style={{ color: '#8D99AE' }}>MEF/SUNAT</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium" style={{ color: '#2D3142' }}>{isEn ? 'GDP' : 'PBI'}</td>
                  <td className="px-4 py-2" style={{ color: '#2D3142' }}>{isEn ? 'Monthly GDP proxy (YoY%)' : 'PBI mensual proxy (YoY%)'}</td>
                  <td className="px-4 py-2" style={{ color: '#8D99AE' }}>BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium" style={{ color: '#2D3142' }}>{isEn ? 'Mining' : 'Minería'}</td>
                  <td className="px-4 py-2" style={{ color: '#2D3142' }}>{isEn ? 'Mining production index (YoY%)' : 'Índice producción minera (YoY%)'}</td>
                  <td className="px-4 py-2" style={{ color: '#8D99AE' }}>BCRP</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '2.2 Nighttime Lights (NTL) — District Disaggregation Only' : '2.2 Luces Nocturnas (NTL) — Solo para Desagregación Distrital'}
          </h3>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn
              ? <><strong>NTL is NOT a predictor in the GBR model.</strong> Both GBR and ENet assign zero weight to NTL at the departmental level. NTL satellite imagery (NOAA-VIIRS) is used exclusively for <strong>district-level spatial disaggregation</strong> via dasymetric mapping: district poverty estimates are distributed proportionally to nighttime light intensity within each department, following Jean et al. (2016).</>
              : <><strong>NTL NO es un predictor del modelo GBR.</strong> Tanto GBR como ENet asignan peso cero a NTL a nivel departamental. La imagenería satelital NTL (NOAA-VIIRS) se usa exclusivamente para <strong>desagregación espacial a nivel distrital</strong> mediante mapeo dasimétrico: las estimaciones de pobreza distrital se distribuyen proporcionalmente a la intensidad de luces nocturnas dentro de cada departamento, siguiendo a Jean et al. (2016).</>}
          </p>
          <div className="p-4 rounded font-mono text-sm mb-4" style={{ background: '#F5F2EE' }}>
            poverty_district<sub>i</sub> = poverty_dept<sub>d</sub> × (NTL_weight<sub>i</sub> / Σ NTL_weight<sub>d</sub>)
          </div>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn
              ? 'NTL weights are computed as inverse-light fractions: districts with less economic activity (lower NTL) receive higher poverty allocation. This dasymetric approach provides district-level granularity without requiring district-level survey data.'
              : 'Los pesos NTL se calculan como fracciones inversas de luz: distritos con menor actividad económica (menor NTL) reciben mayor asignación de pobreza. Este enfoque dasimétrico provee granularidad distrital sin requerir datos de encuesta a ese nivel.'}
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '2.3 Target: Departmental Monetary Poverty (INEI)' : '2.3 Target: Pobreza Monetaria Departamental (INEI)'}
          </h3>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn
              ? 'Monetary poverty rate (% population below poverty line) by department. Published annually with ~6–7 months lag (e.g., 2024 data published in May 2025).'
              : 'Tasa de pobreza monetaria (% población bajo línea de pobreza) por departamento. Publicado anualmente con ~6-7 meses de rezago (ej: datos 2024 publicados en Mayo 2025).'}
          </p>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            <strong>{isEn ? 'Coverage:' : 'Cobertura:'}</strong>{' '}
            {isEn
              ? '24 departments (Callao merged with Lima in official data), 2004–2024.'
              : '24 departamentos (Callao fusionado con Lima en datos oficiales), 2004-2024.'}
          </p>
        </div>

        {/* Performance */}
        <div className="mt-8 rounded-lg border p-8" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D3142' }}>
            {isEn ? '3. Performance and Validation' : '3. Desempeño y Validación'}
          </h2>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '3.1 Annual Backtest (2012–2024, excl. COVID)' : '3.1 Backtest Anual (2012-2024, excl. COVID)'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-sm" style={{ borderColor: '#E8E4DF' }}>
              <thead style={{ background: '#F5F2EE' }}>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: '#8D99AE' }}>{isEn ? 'Model' : 'Modelo'}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase" style={{ color: '#8D99AE' }}>RMSE (pp)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase" style={{ color: '#8D99AE' }}>MAE (pp)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase" style={{ color: '#8D99AE' }}>Rel.RMSE</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
                <tr className="bg-blue-50">
                  <td className="px-4 py-2 font-semibold" style={{ color: '#2D3142' }}>{isEn ? 'Panel GBR (change-pred)' : 'Panel GBR (change-pred)'}</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-900">2.54</td>
                  <td className="px-4 py-2 text-right text-blue-900">1.89</td>
                  <td className="px-4 py-2 text-right text-blue-900">0.953</td>
                </tr>
                <tr>
                  <td className="px-4 py-2" style={{ color: '#2D3142' }}>{isEn ? 'AR(1) Departmental' : 'AR(1) Departamental'}</td>
                  <td className="px-4 py-2 text-right" style={{ color: '#2D3142' }}>2.65</td>
                  <td className="px-4 py-2 text-right" style={{ color: '#2D3142' }}>1.97</td>
                  <td className="px-4 py-2 text-right" style={{ color: '#2D3142' }}>1.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2" style={{ color: '#2D3142' }}>{isEn ? 'Random Walk' : 'Random Walk'}</td>
                  <td className="px-4 py-2 text-right" style={{ color: '#2D3142' }}>2.78</td>
                  <td className="px-4 py-2 text-right" style={{ color: '#2D3142' }}>2.11</td>
                  <td className="px-4 py-2 text-right" style={{ color: '#2D3142' }}>1.049</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4" style={{ color: '#2D3142' }}>
            {isEn
              ? <><strong>First time GBR beats AR(1)</strong> in poverty backtests (Rel.RMSE = 0.953, -4.7% error). Ridge never managed to beat naive benchmarks.</>
              : <><strong>Primera vez que GBR supera AR(1)</strong> en backtests de pobreza (Rel.RMSE = 0.953, -4.7% error). Anteriormente Ridge no lograba vencer benchmarks naive.</>}
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '3.2 Monthly Nowcasting (2012–2024)' : '3.2 Nowcasting Mensual (2012-2024)'}
          </h3>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn
              ? <>The model also produces <strong>monthly</strong> nowcasts using 12-month rolling windows over the panel:</>
              : <>El modelo también produce nowcasts <strong>mensuales</strong> usando rolling windows de 12 meses sobre el panel:</>}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: '#2D3142' }}>
            <li><strong>{isEn ? 'Monthly RMSE:' : 'RMSE mensual:'}</strong> {isEn ? '~4.3–4.5 pp (stable across months 3, 6, 9, 12)' : '~4.3-4.5 pp (estable en meses 3, 6, 9, 12)'}</li>
            <li><strong>{isEn ? 'Within-year noise:' : 'Within-year noise:'}</strong> {isEn ? '0.5–0.7 pp (well below 2pp threshold)' : '0.5-0.7 pp (bien debajo de 2pp threshold)'}</li>
            <li><strong>{isEn ? 'Monthly revisions:' : 'Monthly revisions:'}</strong> {isEn ? '0.6–0.7 pp (small and stable)' : '0.6-0.7 pp (pequeñas y estables)'}</li>
            <li><strong>{isEn ? 'Rel.RMSE vs AR1:' : 'Rel.RMSE vs AR1:'}</strong> {isEn ? '0.989 (-1.1% vs AR1) — slightly better than annual' : '0.989 (-1.1% vs AR1) — ligeramente mejor que anual'}</li>
          </ul>
          <p style={{ color: '#2D3142' }}>
            {isEn
              ? <>Intra-year noise is low, so <strong>no additional smoothing is required</strong>.</>
              : <>El ruido intra-año es bajo, por lo que <strong>NO se requiere suavizado</strong> adicional.</>}
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '3.3 Current Nowcast (2025)' : '3.3 Nowcast Actual (2025)'}
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900 font-medium">
              {isEn ? 'National Poverty 2025:' : 'Pobreza Nacional 2025:'} <strong>25.2%</strong>
            </p>
            <p className="text-sm text-green-800 mt-2">
              {isEn ? '24 departments | −1.0 pp vs 2024 official (26.2%) | Mixed coverage through Dec-2025' : '24 departamentos | −1.0 pp vs oficial 2024 (26.2%) | Cobertura mixta hasta dic-2025'}
            </p>
          </div>
        </div>

        {/* Quarterly Nowcasting */}
        <div className="mt-8 rounded-lg border p-8" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D3142' }}>
            {isEn ? '4. Quarterly Nowcasting' : '4. Nowcasting Trimestral'}
          </h2>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn
              ? <>Complement to annual/monthly nowcasts: <strong>quarterly</strong> predictions using temporal disaggregation (Chow-Lin) to interpolate between years.</>
              : <>Complemento a nowcasts anuales/mensuales: predicciones <strong>trimestrales</strong> usando desagregación temporal (Chow-Lin) para interpolar entre años.</>}
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: '#2D3142' }}>
            {isEn ? '4.1 Chow-Lin Method' : '4.1 Método Chow-Lin'}
          </h3>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            {isEn
              ? <>Disaggregates annual observations to quarterly frequency using high-frequency indicators as related series (Chow &amp; Lin, 1971):</>
              : <>Desagrega observaciones anuales a frecuencia trimestral usando indicadores de alta frecuencia como related series (Chow &amp; Lin, 1971):</>}
          </p>
          <div className="p-4 rounded font-mono text-sm mb-4" style={{ background: '#F5F2EE' }}>
            pobreza_quarterly = ChowLin(pobreza_annual, related=[pbi_q, credito_q, ipc_q])
          </div>
          <p className="mb-4" style={{ color: '#2D3142' }}>
            <strong>{isEn ? 'Advantages:' : 'Ventajas:'}</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: '#2D3142' }}>
            <li>{isEn ? 'Preserves annual totals (sum of 4 quarters = annual value)' : 'Preserva totales anuales (suma de 4 trimestres = valor anual)'}</li>
            <li>{isEn ? 'Captures intra-year variation using monthly indicators aggregated to quarterly' : 'Captura variación intra-año usando indicadores mensuales agregados a trimestral'}</li>
            <li>{isEn ? 'GLS methods minimize residual autocorrelation' : 'Métodos GLS minimizan autocorrelación residual'}</li>
          </ul>
          <p style={{ color: '#2D3142' }}>
            {isEn ? 'See ' : 'Ver '}
            <Link href="/estadisticas/pobreza/graficos" className="text-blue-700 hover:underline">
              {isEn ? 'quarterly charts' : 'gráficos trimestrales'}
            </Link>
            {isEn ? ' for disaggregated series.' : ' para series desagregadas.'}
          </p>
        </div>

        {/* Limitations */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ {isEn ? 'Limitations' : 'Limitaciones'}</h3>
          <ul className="list-disc pl-6 space-y-2 text-yellow-800 text-sm">
            <li>
              <strong>{isEn ? 'Small N:' : 'N pequeño:'}</strong>{' '}
              {isEn
                ? 'Only 24 departments → high variance in departmental estimates. National is more stable.'
                : 'Solo 24 departamentos → varianza alta en estimaciones departamentales. Nacional es más estable.'}
            </li>
            <li>
              <strong>{isEn ? 'Feature lag:' : 'Rezago de features:'}</strong>{' '}
              {isEn
                ? 'Some departmental indicators (credit, employment) have 1–2 months publication lag, limiting nowcast lead time.'
                : 'Algunos indicadores departamentales (crédito, empleo) tienen 1-2 meses de publication lag, limitando la anticipación del nowcast.'}
            </li>
            <li>
              <strong>{isEn ? 'Regional heterogeneity:' : 'Heterogeneidad regional:'}</strong>{' '}
              {isEn
                ? 'Credit-poverty relationships may vary by department (e.g., Lima vs Amazonas). GBR captures some non-linearity but not complex spatial interactions.'
                : 'Relaciones crédito-pobreza pueden variar por departamento (ej: Lima vs Amazonas). GBR captura algo de no-linealidad pero no interacciones espaciales complejas.'}
            </li>
            <li>
              <strong>{isEn ? 'COVID as extreme outlier:' : 'COVID como outlier extremo:'}</strong>{' '}
              {isEn
                ? 'Full exclusion of 2020–2021 reduces available data (from 20 years to 18 effective years). A necessary trade-off to avoid distortion.'
                : 'Exclusión total de 2020-2021 reduce datos disponibles (de 20 años a 18 años efectivos). Trade-off necesario para evitar distorsión.'}
            </li>
          </ul>
        </div>

        {/* References */}
        <div className="mt-8 rounded-lg border p-8" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D3142' }}>
            {isEn ? 'References' : 'Referencias'}
          </h2>
          <div className="space-y-3 text-sm" style={{ color: '#2D3142' }}>
            <p>
              <strong>Elbers, C., Lanjouw, J. O., &amp; Lanjouw, P. (2003).</strong> &quot;Micro-level estimation
              of poverty and inequality.&quot; <em>Econometrica</em>, 71(1), 355-364.
            </p>
            <p>
              <strong>Zhao, X., Yu, B., Liu, Y., Chen, Z., Li, Q., Wang, C., &amp; Wu, J. (2019).</strong>
              {" "}&quot;Estimation of poverty using random forest regression with multi-source data: A case
              study in Bangladesh.&quot; <em>Remote Sensing</em>, 11(4), 375.
            </p>
            <p>
              <strong>Jean, N., Burke, M., Xie, M., Davis, W. M., Lobell, D. B., &amp; Ermon, S. (2016).</strong>
              {" "}&quot;Combining satellite imagery and machine learning to predict poverty.&quot;{" "}
              <em>Science</em>, 353(6301), 790-794.
            </p>
            <p>
              <strong>Chow, G. C., &amp; Lin, A. L. (1971).</strong> &quot;Best linear unbiased interpolation,
              distribution, and extrapolation of time series by related series.&quot;{" "}
              <em>The Review of Economics and Statistics</em>, 53(4), 372-375.
            </p>
          </div>
        </div>

        {/* Code Link */}
        <div className="mt-8 text-center">
          <p className="text-sm mb-2" style={{ color: '#8D99AE' }}>
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
          <p className="text-xs" style={{ color: '#8D99AE' }}>
            {isEn ? 'See:' : 'Ver:'}{' '}
            <code className="px-2 py-1 rounded" style={{ background: '#F5F2EE' }}>src/models/poverty.py</code>,{" "}
            <code className="px-2 py-1 rounded" style={{ background: '#F5F2EE' }}>src/processing/spatial_disagg.py</code>,{" "}
            <code className="px-2 py-1 rounded" style={{ background: '#F5F2EE' }}>scripts/run_poverty_backtest.py</code>
          </p>
        </div>
      </div>
    </div>
  );
}
