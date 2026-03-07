import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Poverty / Pobreza — Annual Nowcast | Qhawarina',
  description: 'Annual poverty nowcast for Peru by department using Gradient Boosting and nighttime light data. / Nowcast anual de pobreza monetaria por departamento con GBR y datos NTL.',
  openGraph: {
    images: [{ url: '/og-pobreza.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-pobreza.png'],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
