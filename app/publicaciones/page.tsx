'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import BreadcrumbJsonLd from '../components/BreadcrumbJsonLd';

function ReportCard({
  type,
  titleEs,
  titleEn,
  descEs,
  descEn,
  latestPdf,
  archive,
  subscribeSubject,
  isEn,
}: {
  type: 'diario' | 'semanal' | 'trimestral';
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  latestPdf: string;
  archive: { label: string; href: string }[];
  subscribeSubject: string;
  isEn: boolean;
}) {
  const [archiveOpen, setArchiveOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ borderLeftWidth: 3, borderLeftColor: '#C65D3E' }}>
      <div className="px-6 py-5">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-base font-bold tracking-wide uppercase" style={{ color: '#2D3142', fontSize: '0.8rem', letterSpacing: '0.08em' }}>
            {isEn ? titleEn : titleEs}
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">{isEn ? descEn : descEs}</p>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={latestPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md text-white transition-colors"
            style={{ backgroundColor: '#C65D3E' }}
            download
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {isEn ? 'Download latest' : 'Descargar último'}
          </a>

          <button
            onClick={() => setArchiveOpen(!archiveOpen)}
            className="text-sm transition-colors hover:underline"
            style={{ color: '#C65D3E' }}
          >
            {archiveOpen
              ? (isEn ? 'Hide archive ▲' : 'Ocultar archivo ▲')
              : (isEn ? 'Archive ▼' : 'Archivo ▼')}
          </button>

          <a
            href={`mailto:cchavezp@qhawarina.pe?subject=${encodeURIComponent(subscribeSubject)}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors hover:underline"
          >
            {isEn ? 'Subscribe by email →' : 'Suscribirse por email →'}
          </a>
        </div>

        {archiveOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {isEn ? 'Archive' : 'Archivo'}
            </p>
            {archive.length > 0 ? (
              <ul className="space-y-1">
                {archive.map(item => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: '#C65D3E' }}
                      download
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">
                {isEn ? 'Archive available soon.' : 'Archivo disponible próximamente.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicacionesPage() {
  const isEn = useLocale() === 'en';

  // Archive entries — populated as reports are generated
  const dailyArchive: { label: string; href: string }[] = [];
  const weeklyArchive: { label: string; href: string }[] = [];
  const quarterlyArchive: { label: string; href: string }[] = [];

  return (
    <div className="min-h-screen py-16">
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Qhawarina', href: '/' },
          { name: isEn ? 'Publications' : 'Publicaciones', href: '/publicaciones' },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#2D3142' }}>
            {isEn ? 'Publications' : 'Publicaciones'}
          </h1>
          <p className="text-lg text-gray-500">
            {isEn
              ? 'Reports, analyses and working documents'
              : 'Reportes, análisis y documentos de trabajo'}
          </p>
        </div>

        <hr className="border-gray-200 mb-12" />

        {/* Report cards */}
        <div className="space-y-5 mb-14">
          <ReportCard
            type="diario"
            titleEs="Reporte Diario"
            titleEn="Daily Report"
            descEs="Resumen diario de precios, riesgo político y mercado cambiario. Publicado todos los días hábiles."
            descEn="Daily summary of prices, political risk and FX market. Published every business day."
            latestPdf="/assets/reports/latest_daily.pdf"
            archive={dailyArchive}
            subscribeSubject="Suscripción Reporte Diario"
            isEn={isEn}
          />

          <ReportCard
            type="semanal"
            titleEs="Reporte Semanal"
            titleEn="Weekly Report"
            descEs="Análisis semanal con desglose por categorías, perspectiva macro y track record de modelos. Publicado los lunes."
            descEn="Weekly analysis with category breakdown, macro outlook and model track record. Published on Mondays."
            latestPdf="/assets/reports/latest_weekly.pdf"
            archive={weeklyArchive}
            subscribeSubject="Suscripción Reporte Semanal"
            isEn={isEn}
          />

          <ReportCard
            type="trimestral"
            titleEs="Reporte Trimestral"
            titleEn="Quarterly Report"
            descEs="Evaluación trimestral con análisis de desempeño de modelos, cambios metodológicos y perspectiva económica."
            descEn="Quarterly evaluation with model performance analysis, methodological changes and economic outlook."
            latestPdf="/assets/reports/latest_quarterly.pdf"
            archive={quarterlyArchive}
            subscribeSubject="Suscripción Reporte Trimestral"
            isEn={isEn}
          />
        </div>

        <hr className="border-gray-200 mb-12" />

        {/* Documents */}
        <section className="mb-14">
          <h2 className="text-lg font-semibold mb-6" style={{ color: '#2D3142' }}>
            {isEn ? 'Documents' : 'Documentos'}
          </h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <a
                href="/qhawarina_metodologia.pdf"
                className="transition-colors hover:underline"
                style={{ color: '#C65D3E' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {isEn ? 'Qhawarina Methodology (PDF)' : 'Metodología Qhawarina (PDF)'}
              </a>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-400">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {isEn ? 'Working Papers — Coming soon' : 'Documentos de Trabajo — Próximamente'}
            </li>
          </ul>
        </section>

      </div>
    </div>
  );
}
