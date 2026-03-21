'use client';

import { useLocale } from 'next-intl';
import BreadcrumbJsonLd from '../components/BreadcrumbJsonLd';

const TERRA   = '#C65D3E';
const INK     = '#2D3142';
const INK3    = '#8D99AE';
const BG      = '#FAF8F4';
const SURFACE = '#EDEAE5';
const BORDER  = '#E8E4DF';
const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.045'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

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
    { icon: '📂', term: 'Open data', desc: 'Everything we publish is downloadable and reusable under CC BY 4.0.' },
    { icon: '🔍', term: 'Transparent methodology', desc: 'Each model is documented with formulas, assumptions and known limitations.' },
    { icon: '✅', term: 'Rigorous validation', desc: 'We evaluate our models against official data and publish the results.' },
    { icon: '⚖️', term: 'Independence', desc: 'No institutional, political or commercial affiliation.' },
  ] : [
    { icon: '📂', term: 'Datos abiertos', desc: 'Todo lo que publicamos es descargable y reutilizable bajo CC BY 4.0.' },
    { icon: '🔍', term: 'Metodología transparente', desc: 'Cada modelo está documentado con fórmulas, supuestos y limitaciones conocidas.' },
    { icon: '✅', term: 'Validación rigurosa', desc: 'Evaluamos nuestros modelos contra datos oficiales y publicamos los resultados.' },
    { icon: '⚖️', term: 'Independencia', desc: 'Sin afiliación institucional, política ni comercial.' },
  ];

  const affiliations = [
    'University of Chicago',
    'Harvard University',
    'FMI',
    'Georgetown University',
    'BID',
  ];

  return (
    <div style={{ background: BG, backgroundImage: WATERMARK }} className="min-h-screen py-16">
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Qhawarina', href: '/' },
          { name: isEn ? 'About' : 'Sobre Nosotros', href: '/sobre-nosotros' },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: INK }}>
            {isEn ? 'About Qhawarina' : 'Sobre Qhawarina'}
          </h1>
          <p className="text-lg" style={{ color: INK3 }}>
            {isEn
              ? 'Research center for high-frequency economic data on Peru'
              : 'Centro de investigación en datos económicos de alta frecuencia para el Perú'}
          </p>
        </div>

        {/* ── QUÉ ES ─────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-8 space-y-4"
          style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
        >
          <h2 className="text-lg font-semibold" style={{ color: INK }}>
            {isEn ? 'What is Qhawarina' : 'Qué es Qhawarina'}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: INK3 }}>
            {isEn
              ? 'Qhawarina is a research center in high-frequency economic data for Peru. Combining web scraping, econometric models and natural language processing, Qhawarina produces daily indicators of inflation, political risk, GDP growth and monetary poverty — updated more frequently than official sources and freely accessible.'
              : 'Qhawarina es un centro de investigación en datos económicos de alta frecuencia para el Perú. Combinando web scraping, modelos econométricos y procesamiento de lenguaje natural, Qhawarina produce indicadores diarios de inflación, riesgo político, crecimiento del PBI y pobreza monetaria — actualizados con mayor frecuencia que las fuentes oficiales y accesibles de forma gratuita.'}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: INK3 }}>
            {isEn
              ? 'The name comes from the Quechua "qhaway" (to observe) with the instrumental suffix "-rina": an instrument for observing. Like the Andean lookouts from which the territory was watched, Qhawarina offers an anticipatory view of the Peruvian economy.'
              : 'El nombre proviene del quechua "qhaway" (observar) con el sufijo instrumental "-rina": un instrumento para observar. Como los miradores andinos desde donde se vigilaba el territorio, Qhawarina ofrece una vista anticipada de la economía peruana.'}
          </p>
          <p className="text-xs" style={{ color: INK3 }}>
            {isEn
              ? 'Founded in 2026. All data is published under CC BY 4.0. Source code and methodology are open.'
              : 'Fundado en 2026. Todos los datos se publican bajo licencia CC BY 4.0. El código fuente y la metodología son abiertos.'}
          </p>
        </div>

        {/* ── FOUNDER ────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-semibold mb-5" style={{ color: INK }}>
            {isEn ? 'Founding team' : 'Equipo fundador'}
          </h2>

          <div
            className="rounded-2xl p-8"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
          >
            {/* Name + role */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold" style={{ color: INK }}>
                Carlos César Chávez Padilla
              </h3>
              <p className="text-sm mt-1 font-medium" style={{ color: TERRA }}>
                {isEn ? 'Founder & Director' : 'Fundador y Director'}
              </p>
            </div>

            <div className="space-y-3 text-sm leading-relaxed" style={{ color: INK3 }}>
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
              <p>{isEn ? 'Originally from Barranca, Peru.' : 'Originario de Barranca, Perú.'}</p>
            </div>

            {/* Affiliation trust bar */}
            <div
              className="mt-6 pt-5 flex flex-wrap gap-2"
              style={{ borderTop: `1px solid ${BORDER}` }}
            >
              {affiliations.map((aff) => (
                <span
                  key={aff}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: SURFACE, color: INK3 }}
                >
                  {aff}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-4 text-sm italic" style={{ color: INK3 }}>
            {isEn
              ? 'Qhawarina is open to researchers, economists and developers interested in contributing.'
              : 'Qhawarina está abierto a investigadores, economistas y desarrolladores interesados en contribuir.'}
          </p>
        </div>

        {/* ── METHODOLOGY & SOURCES ──────────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-semibold mb-5" style={{ color: INK }}>
            {isEn ? 'Methodology & Sources' : 'Metodología y fuentes'}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Sources */}
            <div
              className="rounded-2xl p-6 space-y-3"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: INK3 }}
              >
                {isEn ? 'Data sources' : 'Fuentes de datos'}
              </h3>
              {sources.map((item) => (
                <div key={item.bold} className="text-sm" style={{ color: INK3 }}>
                  <span className="font-semibold" style={{ color: INK }}>{item.bold}</span>
                  {' — '}{item.desc}
                </div>
              ))}
            </div>

            {/* Tools */}
            <div
              className="rounded-2xl p-6 space-y-3"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: INK3 }}
              >
                {isEn ? 'Tools' : 'Herramientas'}
              </h3>
              {tools.map((item) => (
                <div key={item.bold} className="text-sm" style={{ color: INK3 }}>
                  <span className="font-semibold" style={{ color: INK }}>{item.bold}</span>
                  {' — '}{item.desc}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PRINCIPLES ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-semibold mb-5" style={{ color: INK }}>
            {isEn ? 'Principles' : 'Principios'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {principles.map((item) => (
              <div
                key={item.term}
                className="rounded-2xl p-5"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-semibold mb-1" style={{ color: INK }}>
                  {item.term}
                </div>
                <div className="text-sm leading-relaxed" style={{ color: INK3 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTACT ────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
        >
          <div>
            <h2 className="text-lg font-semibold mb-1" style={{ color: INK }}>
              {isEn ? 'Contact' : 'Contacto'}
            </h2>
            <p className="text-sm" style={{ color: INK3 }}>
              {isEn
                ? 'Questions, contributions or collaborations:'
                : 'Preguntas, contribuciones o colaboraciones:'}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="mailto:cchavezp@qhawarina.pe"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white hover:opacity-80 transition-opacity"
              style={{ background: TERRA }}
            >
              cchavezp@qhawarina.pe
            </a>
            <a
              href="https://github.com/cesarchavezp29/qhawarina"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 transition-opacity border text-center"
              style={{ borderColor: BORDER, color: INK3, background: BG }}
            >
              GitHub ↗
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
