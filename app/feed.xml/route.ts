import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

const BASE = 'https://qhawarina.pe';

function readJson(filename: string): Record<string, unknown> {
  try {
    const p = join(process.cwd(), 'public', 'assets', 'data', filename);
    return JSON.parse(readFileSync(p, 'utf-8'));
  } catch {
    return {};
  }
}

function escXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function item(title: string, link: string, description: string, pubDate: string) {
  return `  <item>
    <title>${escXml(title)}</title>
    <link>${escXml(link)}</link>
    <guid isPermaLink="true">${escXml(link)}</guid>
    <description>${escXml(description)}</description>
    <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
  </item>`;
}

export async function GET() {
  const gdp = readJson('gdp_nowcast.json') as {
    nowcast?: { target_period?: string; value?: number };
    metadata?: { generated_at?: string };
  };
  const inf = readJson('inflation_nowcast.json') as {
    nowcast?: { target_period?: string; value?: number };
    metadata?: { generated_at?: string };
  };
  const pov = readJson('poverty_nowcast.json') as {
    metadata?: { generated_at?: string; target_year?: number };
    national?: { poverty_rate_nowcast?: number };
  };
  const pol = readJson('political_index_daily.json') as {
    current?: { date?: string; score?: number; level?: string };
    metadata?: { generated_at?: string };
  };

  const now = new Date().toUTCString();

  const gdpDate = gdp.metadata?.generated_at ?? new Date().toISOString();
  const infDate = inf.metadata?.generated_at ?? new Date().toISOString();
  const povDate = pov.metadata?.generated_at ?? new Date().toISOString();
  const polDate = pol.metadata?.generated_at ?? new Date().toISOString();

  const gdpVal = gdp.nowcast?.value != null
    ? `${gdp.nowcast.value > 0 ? '+' : ''}${Number(gdp.nowcast.value).toFixed(2)}%`
    : 'N/D';
  const infVal = inf.nowcast?.value != null
    ? `${Number(inf.nowcast.value).toFixed(3)}% mensual`
    : 'N/D';
  const povVal = pov.national
    ? `${(Number((pov.national as Record<string, unknown>).poverty_rate_nowcast ?? 0) * 100).toFixed(1)}%`
    : 'N/D';
  const polScore = pol.current?.score != null
    ? `${Number(pol.current.score).toFixed(3)} (${pol.current.level ?? ''})`
    : 'N/D';

  const items = [
    item(
      `Nowcast PBI ${gdp.nowcast?.target_period ?? ''}: ${gdpVal}`,
      `${BASE}/estadisticas/pbi`,
      `Qhawarina actualiza su predicción del crecimiento del PBI para ${gdp.nowcast?.target_period ?? 'el período actual'}: ${gdpVal} interanual. Modelo DFM con 34 indicadores líderes.`,
      gdpDate,
    ),
    item(
      `Nowcast Inflación ${inf.nowcast?.target_period ?? ''}: ${infVal}`,
      `${BASE}/estadisticas/inflacion`,
      `Predicción de inflación mensual para ${inf.nowcast?.target_period ?? 'el período actual'}: ${infVal}. Modelo DFM + índice BPP de supermercados.`,
      infDate,
    ),
    item(
      `Nowcast Pobreza ${pov.metadata?.target_year ?? ''}: ${povVal}`,
      `${BASE}/estadisticas/pobreza`,
      `Estimación de pobreza monetaria nacional para ${pov.metadata?.target_year ?? 'el año actual'}: ${povVal}. Modelo GBR con NTL satelital (VIIRS).`,
      povDate,
    ),
    item(
      `Riesgo Político ${pol.current?.date ?? ''}: ${polScore}`,
      `${BASE}/estadisticas/riesgo-politico`,
      `Índice diario de riesgo político para Perú: ${polScore}. Clasificación GPT-4o de 81 feeds RSS de medios peruanos.`,
      polDate,
    ),
  ].sort((a, b) => {
    const da = a.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';
    const db = b.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';
    return new Date(db).getTime() - new Date(da).getTime();
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Qhawarina — Nowcasting Económico para Perú</title>
  <link>${BASE}</link>
  <description>Predicciones diarias de PBI, inflación, pobreza y riesgo político para Perú usando modelos de factores dinámicos.</description>
  <language>es-PE</language>
  <lastBuildDate>${now}</lastBuildDate>
  <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
  <image>
    <url>${BASE}/opengraph-image</url>
    <title>Qhawarina</title>
    <link>${BASE}</link>
  </image>
${items.join('\n')}
</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
