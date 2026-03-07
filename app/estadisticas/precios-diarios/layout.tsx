import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Daily Prices / Precios Diarios BPP | Qhawarina',
  description: 'Daily Jevons price index from Peruvian supermarkets (Plaza Vea, Metro, Wong). 42,000+ products. / Índice Jevons diario de supermercados peruanos. Más de 42,000 productos.',
  openGraph: {
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-default.png'],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
