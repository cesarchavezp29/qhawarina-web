import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Precios Diarios BPP | Qhawarina',
  description: 'Índice Jevons diario de precios de supermercados peruanos (Plaza Vea, Metro, Wong). 42,000+ productos. Metodología Cavallo-Rigobon (MIT).',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
