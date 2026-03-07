'use client';

import { useLocale } from 'next-intl';
import BreadcrumbJsonLd from '../components/BreadcrumbJsonLd';

export default function SobreNosotrosPage() {
  const isEn = useLocale() === 'en';

  const sources = isEn ? [
    { bold: 'BCRP', desc: 'Monetary, production and trade series' },
    { bold: 'INEI', desc: 'Quarterly GDP, monthly CPI, ENAHO (poverty)' },
    { bold: 'MIDAGRI', desc: 'Agricultural wholesale prices' },
    { bold: 'Supermarkets', desc: 'Plaza Vea, Metro, Wong (~42,000 daily products via VTEX API)' },
    { bold: 'Media', desc: 'El Comercio, Gestión, La República, Andina, RPP, Correo (11 RSS feeds)' },
  ] : [
    { bold: 'BCRP', desc: 'Series monetarias, producción, comercio exterior' },
    { bold: 'INEI', desc: 'PBI trimestral, IPC mensual, ENAHO (pobreza)' },
    { bold: 'MIDAGRI', desc: 'Precios mayoristas agrícolas' },
    { bold: 'Supermercados', desc: 'Plaza Vea, Metro, Wong (~42,000 productos diarios vía VTEX API)' },
    { bold: 'Medios', desc: 'El Comercio, Gestión, La República, Andina, RPP, Correo (11 feeds RSS)' },
  ];

  const tools = isEn ? [
    { bold: 'Models', desc: 'Dynamic Factor Models (DFM), Gradient Boosting, Ridge Regression' },
    { bold: 'NLP', desc: 'Claude Haiku (Anthropic) for article classification' },
    { bold: 'Satellite data', desc: 'NOAA-VIIRS (nighttime lights)' },
    { bold: 'Stack', desc: 'Python, Next.js, Vercel' },
  ] : [
    { bold: 'Modelos', desc: 'Dynamic Factor Models (DFM), Gradient Boosting, Ridge Regression' },
    { bold: 'NLP', desc: 'Claude Haiku (Anthropic) para clasificación de artículos' },
    { bold: 'Datos satelitales', desc: 'NOAA-VIIRS (luminosidad nocturna)' },
    { bold: 'Stack', desc: 'Python, Next.js, Vercel' },
  ];

  const principles = isEn ? [
    { term: 'Open data', desc: 'Everything we publish is downloadable and reusable under CC BY 4.0.' },
    { term: 'Transparent methodology', desc: 'Each model is documented with formulas, assumptions and known limitations.' },
    { term: 'Rigorous validation', desc: 'We evaluate our models against official data and publish the results.' },
    { term: 'Independence', desc: 'No institutional, political or commercial affiliation.' },
  ] : [
    { term: 'Datos abiertos', desc: 'Todo lo que publicamos es descargable y reutilizable bajo CC BY 4.0.' },
    { term: 'Metodología transparente', desc: 'Cada modelo está documentado con fórmulas, supuestos y limitaciones conocidas.' },
    { term: 'Validación rigurosa', desc: 'Evaluamos nuestros modelos contra datos oficiales y publicamos los resultados.' },
    { term: 'Independencia', desc: 'Sin afiliación institucional, política ni comercial.' },
  ];

  return (
    <div className="min-h-screen py-16">
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Qhawarina', href: '/' },
          { name: isEn ? 'About' : 'Sobre Nosotros', href: '/sobre-nosotros' },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#2D3142] mb-3">
            {isEn ? 'About Qhawarina' : 'Sobre Qhawarina'}
          </h1>
          <p className="text-lg text-gray-500">
            {isEn
              ? 'Research center for high-frequency economic data on Peru'
              : 'Centro de investigación en datos económicos de alta frecuencia para el Perú'}
          </p>
        </div>

        <hr className="border-gray-200 mb-12" />

        {/* Qué es Qhawarina */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#2D3142] mb-5">
            {isEn ? 'What is Qhawarina' : 'Qué es Qhawarina'}
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              {isEn
                ? 'Qhawarina is a research center in high-frequency economic data for Peru. Combining web scraping, econometric models and natural language processing, Qhawarina produces daily indicators of inflation, political risk, GDP growth and monetary poverty — updated more frequently than official sources and freely accessible.'
                : 'Qhawarina es un centro de investigación en datos económicos de alta frecuencia para el Perú. Combinando web scraping, modelos econométricos y procesamiento de lenguaje natural, Qhawarina produce indicadores diarios de inflación, riesgo político, crecimiento del PBI y pobreza monetaria — actualizados con mayor frecuencia que las fuentes oficiales y accesibles de forma gratuita.'}
            </p>
            <p>
              {isEn
                ? 'The name comes from the Quechua "qhaway" (to observe) with the instrumental suffix "-rina": an instrument for observing. Like the Andean lookouts from which the territory was watched, Qhawarina offers an anticipatory view of the Peruvian economy.'
                : 'El nombre proviene del quechua "qhaway" (observar) con el sufijo instrumental "-rina": un instrumento para observar. Como los miradores andinos desde donde se vigilaba el territorio, Qhawarina ofrece una vista anticipada de la economía peruana.'}
            </p>
            <p className="text-sm text-gray-500">
              {isEn
                ? 'Founded in 2026. All data is published under CC BY 4.0. Source code and methodology are open.'
                : 'Fundado en 2026. Todos los datos se publican bajo licencia CC BY 4.0. El código fuente y la metodología son abiertos.'}
            </p>
          </div>
        </section>

        <hr className="border-gray-200 mb-12" />

        {/* Equipo fundador */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#2D3142] mb-6">
            {isEn ? 'Founding team' : 'Equipo fundador'}
          </h2>

          <div className="border border-gray-200 rounded-lg p-8">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-[#2D3142]">Carlos César Chávez Padilla</h3>
              <p className="text-sm text-gray-500 mt-1">
                {isEn ? 'Founder & Director' : 'Fundador y Director'}
              </p>
            </div>

            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <p>
                {isEn
                  ? 'Peruvian economist specializing in applied econometrics, development economics and political economy. More than 20 academic publications in international journals.'
                  : 'Economista peruano especializado en econometría aplicada, economía del desarrollo y economía política. Más de 20 publicaciones académicas en revistas internacionales.'}
              </p>
              <p>
                {isEn
                  ? 'Currently a researcher at the Center for the Economy of Human Development, University of Chicago. Previously Research Professional at Harvard Business School, Research Analyst at Georgetown University, Senior Research Analyst at the International Monetary Fund, and Research Consultant at the Inter-American Development Bank.'
                  : 'Actualmente investigador en el Centro de Economía para el Desarrollo Humano de la Universidad de Chicago. Previamente investigador profesional en Harvard Business School, analista de investigación en Georgetown University, analista sénior en el Fondo Monetario Internacional y consultor de investigación en el Banco Interamericano de Desarrollo.'}
              </p>
              <p>
                {isEn
                  ? 'MA in Public Policy, Harris School of Public Policy, University of Chicago.'
                  : 'Máster en Políticas Públicas, Escuela Harris de Políticas Públicas, Universidad de Chicago.'}
              </p>
              <p className="text-gray-500">
                {isEn ? 'Originally from Barranca, Peru.' : 'Originario de Barranca, Perú.'}
              </p>
            </div>

            {/* Trust bar */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 leading-relaxed">
                University of Chicago · Harvard University · Fondo Monetario Internacional · Georgetown University · Banco Interamericano de Desarrollo
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm text-gray-500 italic">
            {isEn
              ? 'Qhawarina is open to researchers, economists and developers interested in contributing.'
              : 'Qhawarina está abierto a investigadores, economistas y desarrolladores interesados en contribuir.'}
          </p>
        </section>

        <hr className="border-gray-200 mb-12" />

        {/* Metodología y fuentes */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#2D3142] mb-4">
            {isEn ? 'Methodology & Sources' : 'Metodología y fuentes'}
          </h2>
          <p className="text-sm text-gray-600 mb-8">
            {isEn ? (
              <>The complete methodological documentation is available in{' '}
                <a href="/qhawarina_metodologia.pdf" className="text-[#C65D3E] hover:underline">
                  the methodology document (PDF)
                </a>.</>
            ) : (
              <>La documentación metodológica completa está disponible en{' '}
                <a href="/qhawarina_metodologia.pdf" className="text-[#C65D3E] hover:underline">
                  el documento de metodología (PDF)
                </a>.</>
            )}
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xs font-semibold text-[#2D3142] uppercase tracking-wider mb-4">
                {isEn ? 'Data sources' : 'Fuentes de datos'}
              </h3>
              <ul className="space-y-3">
                {sources.map(item => (
                  <li key={item.bold} className="text-sm text-gray-600">
                    <span className="font-semibold text-[#2D3142]">{item.bold}</span>
                    {' — '}{item.desc}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#2D3142] uppercase tracking-wider mb-4">
                {isEn ? 'Tools' : 'Herramientas'}
              </h3>
              <ul className="space-y-3">
                {tools.map(item => (
                  <li key={item.bold} className="text-sm text-gray-600">
                    <span className="font-semibold text-[#2D3142]">{item.bold}</span>
                    {' — '}{item.desc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <hr className="border-gray-200 mb-12" />

        {/* Principios */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[#2D3142] mb-6">
            {isEn ? 'Principles' : 'Principios'}
          </h2>
          <ul className="space-y-3">
            {principles.map(item => (
              <li key={item.term} className="text-sm text-gray-600">
                <span className="font-semibold text-[#2D3142]">{item.term}</span>
                {' — '}{item.desc}
              </li>
            ))}
          </ul>
        </section>

        <hr className="border-gray-200 mb-12" />

        {/* Contacto */}
        <section className="mb-16">
          <h2 className="text-lg font-semibold text-[#2D3142] mb-5">
            {isEn ? 'Contact' : 'Contacto'}
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <a href="mailto:cchavezp@qhawarina.pe" className="text-[#C65D3E] hover:underline">
                cchavezp@qhawarina.pe
              </a>
            </p>
            <p>
              <span className="text-gray-500">GitHub: </span>
              <a
                href="https://github.com/cesarchavezp29/qhawarina"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C65D3E] hover:underline"
              >
                github.com/cesarchavezp29/qhawarina
              </a>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
