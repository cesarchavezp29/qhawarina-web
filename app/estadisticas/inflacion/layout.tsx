import type { Metadata } from 'next';
import InflacionSectionNav from './components/SectionNav';

export const metadata: Metadata = {
  title: 'Inflation / Inflación — Monthly Nowcast | Qhawarina',
  description: 'Monthly inflation nowcast for Peru using Dynamic Factor Models. CPI breakdown by category, updated daily. / Nowcast mensual de inflación para Perú con DFM. Actualizado diariamente.',
  openGraph: {
    images: [{ url: '/og-inflacion.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-inflacion.png'],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InflacionSectionNav />
    </>
  );
}
