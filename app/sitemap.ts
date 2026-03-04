import { MetadataRoute } from 'next';

const BASE = 'https://qhawarina.pe';
const NOW = new Date();

const routes = [
  '/',
  '/estadisticas',
  '/estadisticas/pbi',
  '/estadisticas/pbi/graficos',
  '/estadisticas/pbi/sectores',
  '/estadisticas/pbi/mapas',
  '/estadisticas/pbi/metodologia',
  '/estadisticas/inflacion',
  '/estadisticas/inflacion/graficos',
  '/estadisticas/inflacion/categorias',
  '/estadisticas/inflacion/mapas',
  '/estadisticas/inflacion/precios-alta-frecuencia',
  '/estadisticas/inflacion/metodologia',
  '/estadisticas/pobreza',
  '/estadisticas/pobreza/graficos',
  '/estadisticas/pobreza/mapas',
  '/estadisticas/pobreza/trimestral',
  '/estadisticas/pobreza/metodologia',
  '/estadisticas/pobreza/distritos',
  '/estadisticas/riesgo-politico',
  '/estadisticas/riesgo-politico/metodologia',
  '/estadisticas/precios-diarios',
  '/estadisticas/intervenciones',
  '/estadisticas/calendario',
  '/simuladores',
  '/escenarios',
  '/datos',
  '/reportes',
  '/metodologia',
  '/sobre-nosotros',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: NOW,
    changeFrequency: route === '/' ? 'daily' : route.includes('metodologia') ? 'monthly' : 'weekly',
    priority: route === '/' ? 1.0 : route === '/estadisticas' ? 0.9 : 0.7,
  }));
}
