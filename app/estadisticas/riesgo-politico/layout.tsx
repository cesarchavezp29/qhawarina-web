import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Political Risk / Riesgo Político | Qhawarina',
  description: 'Daily political instability index for Peru. Claude Haiku · 11 RSS feeds · 6 sources, updated daily. / Índice diario de riesgo político para Perú. Claude Haiku · 11 feeds RSS · 6 fuentes.',
  openGraph: {
    images: [{ url: '/og-riesgo-politico.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-riesgo-politico.png'],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
