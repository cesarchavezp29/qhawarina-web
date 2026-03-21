'use client';

import { useLocale } from 'next-intl';
import BreadcrumbJsonLd from '../components/BreadcrumbJsonLd';
import CiteButton from '../components/CiteButton';
import ShareButton from '../components/ShareButton';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

export default function PrensaPage() {
  const isEn = useLocale() === 'en';

  return (
    <div className="min-h-screen py-16" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Qhawarina', href: '/' },
          { name: isEn ? 'Press' : 'Prensa', href: '/prensa' },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
            <h1 className="text-4xl font-bold" style={{ color: '#2D3142' }}>
              {isEn ? 'Press' : 'Prensa'}
            </h1>
            <div className="flex gap-2 flex-shrink-0">
              <CiteButton indicator={isEn ? 'Qhawarina Press' : 'Prensa — Qhawarina'} isEn={isEn} />
              <ShareButton
                title={isEn ? 'Press — Qhawarina' : 'Prensa — Qhawarina'}
                text={isEn ? 'Qhawarina media coverage | https://qhawarina.pe/prensa' : 'Cobertura mediática de Qhawarina | https://qhawarina.pe/prensa'}
              />
            </div>
          </div>
          <p className="text-lg text-gray-500">
            {isEn
              ? 'Media coverage and appearances'
              : 'Cobertura mediática y apariciones'}
          </p>
        </div>

        <hr className="border-gray-200 mb-12" />

        <p className="text-gray-600 leading-relaxed mb-8">
          {isEn
            ? 'This section will be updated with Qhawarina mentions in media, interviews and opinion columns.'
            : 'Esta sección se actualizará con menciones de Qhawarina en medios de comunicación, entrevistas y columnas de opinión.'}
        </p>

        <p className="text-sm text-gray-500">
          {isEn ? 'Press inquiries: ' : 'Para consultas de prensa: '}
          <a
            href="mailto:cchavezp@qhawarina.pe?subject=Consulta de prensa"
            className="transition-colors hover:underline"
            style={{ color: '#C65D3E' }}
          >
            cchavezp@qhawarina.pe
          </a>
        </p>

      </div>
    </div>
  );
}
