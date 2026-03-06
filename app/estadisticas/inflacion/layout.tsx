import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Inflation / Inflación — Monthly Nowcast | Qhawarina',
  description: 'Monthly inflation nowcast for Peru using Dynamic Factor Models. CPI breakdown by category, updated daily. / Nowcast mensual de inflación para Perú con DFM. Actualizado diariamente.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
