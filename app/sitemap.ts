import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://qhawarina.pe'
  const now = new Date().toISOString()
  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/estadisticas/pbi`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/estadisticas/inflacion`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/estadisticas/precios-diarios`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/estadisticas/pobreza`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/estadisticas/riesgo-politico`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/estadisticas/intervenciones`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/estadisticas/pobreza/distritos`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/estadisticas/calendario`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/publicaciones`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/reportes`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/datos`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/api/docs`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/metodologia`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/sobre-nosotros`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/institucional`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/prensa`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/simuladores`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/escenarios`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
