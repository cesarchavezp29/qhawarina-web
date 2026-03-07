import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Datos Abiertos | Qhawarina',
  description: 'Descarga gratis todos los datasets de Qhawarina: nowcasts, paneles, backtests, precios. Licencia CC BY 4.0. Sin registro ni API key.',
  openGraph: {
    images: [{ url: '/og-datos.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-datos.png'],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
