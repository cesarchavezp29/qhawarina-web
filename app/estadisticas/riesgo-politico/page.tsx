'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LastUpdate from '../../components/stats/LastUpdate';
import EmbedWidget from '../../components/EmbedWidget';
import ShareButton from '../../components/ShareButton';
import PageSkeleton from '../../components/PageSkeleton';

interface PoliticalData {
  metadata: { generated_at: string; coverage_days: number; rss_feeds: number };
  current: { date: string; score: number; level: string; articles_total: number; articles_political: number; articles_economic: number };
}

const LEVEL_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  BAJO:         { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-300' },
  'MEDIO-BAJO': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  MEDIO:        { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  ALTO:         { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-300' },
  'MUY ALTO':   { bg: 'bg-red-100',   text: 'text-red-900',    border: 'border-red-500' },
};

export default function RiesgoPoliticoPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const T = isEn ? {
    breadcrumb: 'Statistics',
    title: 'Political Risk Index',
    currentLevel: 'Current level',
    articlesTotal: 'Articles analyzed today',
    articlesPolitical: 'Political articles',
    articlesEconomic: 'Economic articles',
    rssFeeds: 'RSS feeds monitored',
    cardMethodology: 'Methodology',
    cardMethodologyDesc: 'GPT-4o classification of 81 RSS feeds, components and weights',
    cardDownload: 'Download Data',
    cardDownloadDesc: (days: number) => `Complete daily series — ${days} days of coverage`,
    error: 'Error loading data.',
    retry: 'Retry',
    shareText: (score: string, level: string) => `Political Risk Index Peru: ${score} (${level}) — Qhawarina`,
  } : {
    breadcrumb: 'Estadísticas',
    title: 'Índice de Riesgo Político',
    currentLevel: 'Nivel actual',
    articlesTotal: 'Artículos analizados hoy',
    articlesPolitical: 'Artículos políticos',
    articlesEconomic: 'Artículos económicos',
    rssFeeds: 'Feeds RSS monitoreados',
    cardMethodology: 'Metodología',
    cardMethodologyDesc: 'Clasificación GPT-4o de 81 feeds RSS, componentes y pesos',
    cardDownload: 'Descargar Datos',
    cardDownloadDesc: (days: number) => `Serie diaria completa — ${days} días de cobertura`,
    error: 'Error cargando datos.',
    retry: 'Reintentar',
    shareText: (score: string, level: string) => `Índice de Riesgo Político Perú: ${score} (${level}) — Qhawarina`,
  };

  const [data, setData] = useState<PoliticalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/political_index_daily.json?v=${new Date().toISOString().split('T')[0]}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return <PageSkeleton cards={2} />;
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{T.error} <button onClick={() => window.location.reload()} className="underline">{T.retry}</button></p>
    </div>
  );

  const level = data.current.level;
  const styles = LEVEL_STYLES[level] ?? LEVEL_STYLES['MEDIO'];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">{T.breadcrumb}</a>
          {' / '}
          <span className="text-gray-900 font-medium">{T.title}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">{T.title}</h1>
          <div className="flex gap-2">
            <ShareButton title={`${isEn ? 'Political Risk' : 'Riesgo Político'} — Qhawarina`} text={T.shareText(data.current.score.toFixed(3), level)} />
            <EmbedWidget path="/estadisticas/riesgo-politico" title={`${isEn ? 'Political Risk Index' : 'Índice de Riesgo Político'} — Qhawarina`} height={600} />
          </div>
        </div>

        <div className={`mt-4 inline-flex items-center gap-4 px-5 py-3 rounded-xl border-2 ${styles.border} ${styles.bg}`}>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{T.currentLevel}</p>
            <p className={`text-3xl font-bold ${styles.text}`}>{data.current.score.toFixed(3)}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${styles.bg} ${styles.text} border ${styles.border}`}>
            {level}
          </div>
        </div>

        <div className="mt-3">
          <LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: T.articlesTotal, value: data.current.articles_total.toString() },
            { label: T.articlesPolitical, value: data.current.articles_political.toString() },
            { label: T.articlesEconomic, value: data.current.articles_economic.toString() },
            { label: T.rssFeeds, value: data.metadata.rss_feeds.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/estadisticas/riesgo-politico/metodologia">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📖</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardMethodology}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardMethodologyDesc}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/datos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📥</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardDownload}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardDownloadDesc(data.metadata.coverage_days)}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
