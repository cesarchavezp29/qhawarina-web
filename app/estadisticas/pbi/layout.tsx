import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'GDP / PBI — Quarterly Nowcast | Qhawarina',
  description: 'Quarterly GDP nowcast for Peru using Dynamic Factor Models. Historical data since 2003, updated daily. / Nowcast trimestral del PBI de Perú con DFM. Actualizado diariamente.',
  openGraph: {
    images: [{ url: '/og-pbi.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-pbi.png'],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
