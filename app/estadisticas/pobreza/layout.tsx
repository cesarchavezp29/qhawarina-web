import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Poverty / Pobreza — Annual Nowcast | Qhawarina',
  description: 'Annual poverty nowcast for Peru by department using Gradient Boosting and nighttime light data. / Nowcast anual de pobreza monetaria por departamento con GBR y datos NTL.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
