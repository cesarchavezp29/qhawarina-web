import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API | Qhawarina',
  description: 'Documentación de la API de Qhawarina para acceso programático a nowcasts económicos para Perú.',
  openGraph: {
    title: 'API — Qhawarina',
    description: 'Acceso programático a nowcasts económicos en tiempo real para Perú.',
  },
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
