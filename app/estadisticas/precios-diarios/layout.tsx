import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Daily Prices / Precios Diarios BPP | Qhawarina',
  description: 'Daily Jevons price index from Peruvian supermarkets (Plaza Vea, Metro, Wong). 42,000+ products. / Índice Jevons diario de supermercados peruanos. Más de 42,000 productos.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
