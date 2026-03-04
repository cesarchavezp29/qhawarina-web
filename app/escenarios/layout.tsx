import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Escenarios Contrafactuales | Qhawarina',
  description: '10 escenarios económicos para Perú: recesión leve, crisis política, boom de commodities, pandemia global y más. Análisis contrafactual con DFM.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
