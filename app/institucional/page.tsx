'use client';

import { useLocale } from 'next-intl';
import BreadcrumbJsonLd from '../components/BreadcrumbJsonLd';
import CiteButton from '../components/CiteButton';
import ShareButton from '../components/ShareButton';

const CONTACT_EMAIL = 'cchavezp@qhawarina.pe';
const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

function TierCard({
  title,
  items,
  contactSubject,
  isEn,
}: {
  title: string;
  items: string[];
  contactSubject: string;
  isEn: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ borderTopWidth: 3, borderTopColor: '#C65D3E' }}>
      <div className="px-6 py-6">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#2D3142' }}>
          {title}
        </h3>
        <ul className="space-y-2 mb-6">
          {items.map(item => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: '#C65D3E' }} />
              {item}
            </li>
          ))}
        </ul>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(contactSubject)}`}
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
          style={{ color: '#C65D3E' }}
        >
          {isEn ? 'Contact →' : 'Contactar →'}
        </a>
      </div>
    </div>
  );
}

export default function InstitucionalPage() {
  const isEn = useLocale() === 'en';

  const tiers = isEn ? [
    {
      title: 'Premium Data',
      items: [
        '~42,000 individual product prices, updated daily',
        'Inflation indices for 8 spending categories',
        'Article feed classified with severity and topic',
        'API key with elevated rate limits',
      ],
      contactSubject: 'Institutional inquiry — Premium Data',
    },
    {
      title: 'Early Access',
      items: [
        'Weekly report delivered Sunday (1 day before publication)',
        'Quarterly report delivered 1 week early',
        'Email alerts when political risk crosses HIGH level',
      ],
      contactSubject: 'Institutional inquiry — Early Access',
    },
    {
      title: 'Consulting',
      items: [
        'Custom sector-specific indices',
        'White-label integration',
        'Presentations and economic briefings',
      ],
      contactSubject: 'Institutional inquiry — Consulting',
    },
  ] : [
    {
      title: 'Datos Premium',
      items: [
        '~42,000 precios de productos individuales, actualizados diariamente',
        'Índices de inflación por 8 categorías de gasto',
        'Feed de artículos clasificados con severidad y tema',
        'API key con rate limits elevados',
      ],
      contactSubject: 'Consulta institucional — Datos Premium',
    },
    {
      title: 'Acceso Anticipado',
      items: [
        'Reporte semanal entregado el domingo (1 día antes de publicación)',
        'Reporte trimestral entregado 1 semana antes',
        'Alertas por email cuando el riesgo político cruza nivel ALTO',
      ],
      contactSubject: 'Consulta institucional — Acceso Anticipado',
    },
    {
      title: 'Consultoría',
      items: [
        'Índices sectoriales personalizados',
        'Integración white-label',
        'Presentaciones y briefings económicos',
      ],
      contactSubject: 'Consulta institucional — Consultoría',
    },
  ];

  return (
    <div className="min-h-screen py-16" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Qhawarina', href: '/' },
          { name: isEn ? 'For Institutions' : 'Para Instituciones', href: '/institucional' },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
            <h1 className="text-4xl font-bold" style={{ color: '#2D3142' }}>
              {isEn ? 'For Institutions' : 'Para Instituciones'}
            </h1>
            <div className="flex gap-2 flex-shrink-0">
              <CiteButton indicator={isEn ? 'Qhawarina Institutional Access' : 'Acceso Institucional — Qhawarina'} isEn={isEn} />
              <ShareButton
                title={isEn ? 'Institutional Access — Qhawarina' : 'Para Instituciones — Qhawarina'}
                text={isEn ? 'High-frequency economic data for institutions | https://qhawarina.pe/institucional' : 'Datos económicos de alta frecuencia para instituciones | https://qhawarina.pe/institucional'}
              />
            </div>
          </div>
          <p className="text-lg text-gray-500">
            {isEn
              ? 'High-frequency economic data for informed decisions'
              : 'Datos económicos de alta frecuencia para decisiones informadas'}
          </p>
        </div>

        <hr className="border-gray-200 mb-10" />

        <p className="text-gray-700 leading-relaxed mb-12 text-sm">
          {isEn
            ? 'Qhawarina offers institutional access to granular data not available in the public version. While the aggregate indicators are and will always remain free, product-level, category-level and article-level data are available to organizations that require greater depth.'
            : 'Qhawarina ofrece acceso institucional a datos granulares que no están disponibles en la versión pública. Mientras los indicadores agregados son y seguirán siendo gratuitos, los datos a nivel de producto, categoría y artículo están disponibles para organizaciones que requieren mayor profundidad.'}
        </p>

        {/* Tier cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          {tiers.map(tier => (
            <TierCard
              key={tier.title}
              title={tier.title}
              items={tier.items}
              contactSubject={tier.contactSubject}
              isEn={isEn}
            />
          ))}
        </div>

        <hr className="border-gray-200 mb-10" />

        {/* Free tier note */}
        <p className="text-sm text-gray-500 leading-relaxed">
          {isEn
            ? 'All Qhawarina aggregate indicators are and will always remain free and open (CC BY 4.0). Institutional access funds the operation of the research center and allows the project to maintain its independence.'
            : 'Todos los indicadores agregados de Qhawarina son y seguirán siendo gratuitos y abiertos (CC BY 4.0). El acceso institucional financia la operación del centro de investigación y permite mantener la independencia del proyecto.'}
        </p>

      </div>
    </div>
  );
}
