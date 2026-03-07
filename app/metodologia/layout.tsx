import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Metodología | Qhawarina',
  description: 'Descripción técnica de los modelos de nowcasting de Qhawarina: DFM, GBR, NTL satelital, NLP para riesgo político y BPP de precios.',
  openGraph: {
    images: [{ url: '/og-metodologia.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-metodologia.png'],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
