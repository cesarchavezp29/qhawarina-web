'use client';

import { useLocale } from 'next-intl';
import BreadcrumbJsonLd from '../components/BreadcrumbJsonLd';

export default function PrensaPage() {
  const isEn = useLocale() === 'en';

  return (
    <div className="min-h-screen py-16">
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Qhawarina', href: '/' },
          { name: isEn ? 'Press' : 'Prensa', href: '/prensa' },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#2D3142' }}>
            {isEn ? 'Press' : 'Prensa'}
          </h1>
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
