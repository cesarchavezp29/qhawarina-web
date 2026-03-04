import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Datos Abiertos | Qhawarina',
  description: 'Descarga gratis todos los datasets de Qhawarina: nowcasts, paneles, backtests, precios. Licencia CC BY 4.0. Sin registro ni API key.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
