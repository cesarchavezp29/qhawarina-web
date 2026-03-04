import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Sobre Nosotros | Qhawarina',
  description: 'Qhawarina: nowcasting económico abierto para Perú. Misión, equipo, tecnología y cómo contribuir al proyecto.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
