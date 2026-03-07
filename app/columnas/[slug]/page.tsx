"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import ShareButton from "../../components/ShareButton";

const INK   = "#2D3142";
const INK3  = "#8D99AE";
const BG    = "#FAF8F4";
const TERRA = "#C65D3E";
const BORDER = "#E8E4DF";

interface ColumnaMeta {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  tags: string[];
}

// Minimal markdown → HTML converter
function parseMarkdown(raw: string): string {
  // Strip YAML front matter
  const md = raw.replace(/^---[\s\S]*?---\s*\n/, "").trim();

  const inlineFormat = (text: string): string =>
    text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        `<a href="$2" style="color:${TERRA}" class="hover:underline" target="_blank" rel="noopener">$1</a>`
      );

  const lines = md.split("\n");
  const blocks: string[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push(`<p>${paragraphLines.map(inlineFormat).join(" ")}</p>`);
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(`<ul>${listItems.map((li) => `<li>${li}</li>`).join("")}</ul>`);
      listItems = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("### ")) {
      flushParagraph(); flushList();
      blocks.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushParagraph(); flushList();
      blocks.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      flushParagraph(); flushList();
      blocks.push(`<h1>${inlineFormat(line.slice(2))}</h1>`);
    } else if (line.match(/^-{3,}$/)) {
      flushParagraph(); flushList();
      blocks.push("<hr />");
    } else if (line.startsWith("> ")) {
      flushParagraph(); flushList();
      blocks.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
    } else if (line.match(/^[-*] /)) {
      flushParagraph();
      listItems.push(inlineFormat(line.slice(2)));
    } else if (line.trim() === "") {
      flushParagraph(); flushList();
    } else {
      if (listItems.length > 0) flushList();
      paragraphLines.push(line);
    }
  }
  flushParagraph();
  flushList();

  return blocks.join("\n");
}

// Tag → related pages mapping
const TAG_PAGES: Record<string, [string, string][]> = {
  inflación:  [["/estadisticas/inflacion", "Nowcast Inflación"], ["/estadisticas/precios-diarios", "Precios Diarios (BPP)"]],
  precios:    [["/estadisticas/precios-diarios", "Precios Diarios (BPP)"]],
  BPP:        [["/estadisticas/precios-diarios", "Precios Diarios (BPP)"]],
  alimentos:  [["/estadisticas/precios-diarios", "Precios Diarios (BPP)"], ["/estadisticas/inflacion", "Nowcast Inflación"]],
  PBI:        [["/estadisticas/pbi", "PBI Nowcast"]],
  pobreza:    [["/estadisticas/pobreza", "Nowcast Pobreza"]],
  "tipo de cambio": [["/estadisticas/intervenciones", "Mercado Cambiario"]],
  "riesgo político":[["/estadisticas/riesgo-politico", "Riesgo Político"]],
};

function relatedPages(tags: string[]): [string, string][] {
  const seen = new Set<string>();
  const pages: [string, string][] = [];
  for (const tag of tags) {
    for (const [href, label] of TAG_PAGES[tag] ?? []) {
      if (!seen.has(href)) { seen.add(href); pages.push([href, label]); }
    }
  }
  return pages.slice(0, 4);
}

function fmtDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-PE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function ColumnaPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? "");
  const locale = useLocale();
  const isEn = locale === "en";

  const [meta, setMeta] = useState<ColumnaMeta | null>(null);
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const v = new Date().toISOString().split("T")[0];

    Promise.all([
      fetch(`/assets/columnas/index.json?v=${v}`).then((r) => r.json()),
      fetch(`/assets/columnas/${slug}.md?v=${v}`).then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.text();
      }),
    ])
      .then(([index, mdText]: [ColumnaMeta[], string]) => {
        const found = index.find((c) => c.slug === slug) ?? null;
        setMeta(found);
        setHtml(parseMarkdown(mdText));
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <p style={{ color: INK3 }}>{isEn ? "Loading…" : "Cargando…"}</p>
      </div>
    );
  }

  if (notFound || !meta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: BG }}>
        <p className="text-lg" style={{ color: INK }}>{isEn ? "Article not found." : "Columna no encontrada."}</p>
        <Link href="/columnas" style={{ color: TERRA }} className="hover:underline text-sm">
          ← {isEn ? "Back to Columns" : "Volver a Columnas"}
        </Link>
      </div>
    );
  }

  const related = relatedPages(meta.tags);

  return (
    <div style={{ background: BG }} className="min-h-screen py-12">
      <div className="max-w-[680px] mx-auto px-4 sm:px-6">

        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/columnas"
            className="text-sm hover:underline inline-flex items-center gap-1"
            style={{ color: INK3 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {isEn ? "Back to Columns" : "Volver a Columnas"}
          </Link>
        </div>

        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold leading-tight mb-4" style={{ color: INK }}>
            {meta.title}
          </h1>
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm" style={{ color: INK3 }}>
              <span>{fmtDate(meta.date, locale)}</span>
              <span className="mx-2">·</span>
              <span>{meta.author}</span>
            </div>
            <ShareButton title={meta.title} text={`${meta.title} — Qhawarina`} />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#FDF0EC", color: TERRA }}
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article body */}
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ color: INK }}
        />

        {/* Related data */}
        {related.length > 0 && (
          <aside
            className="mt-12 p-5 rounded-xl border"
            style={{ background: "#fff", borderColor: BORDER }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: INK3 }}>
              {isEn ? "Related data" : "Datos relacionados"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {related.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity text-white"
                  style={{ backgroundColor: TERRA }}
                >
                  {label} →
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* Bottom nav */}
        <div className="mt-10 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
          <Link href="/columnas" className="text-sm hover:underline" style={{ color: INK3 }}>
            ← {isEn ? "All columns" : "Todas las columnas"}
          </Link>
        </div>
      </div>

      {/* Article body styles */}
      <style>{`
        .article-body {
          font-size: 1.0625rem;
          line-height: 1.75;
        }
        .article-body h1 { font-size: 1.75rem; font-weight: 700; margin: 2rem 0 0.75rem; color: ${INK}; }
        .article-body h2 { font-size: 1.35rem; font-weight: 700; margin: 2rem 0 0.75rem; color: ${INK}; }
        .article-body h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: ${INK}; }
        .article-body p  { margin: 0 0 1.25rem; color: ${INK}; }
        .article-body ul { margin: 0 0 1.25rem 1.25rem; list-style-type: disc; color: ${INK}; }
        .article-body li { margin-bottom: 0.35rem; }
        .article-body blockquote {
          border-left: 3px solid ${TERRA};
          padding: 0.5rem 0 0.5rem 1rem;
          margin: 1.25rem 0;
          color: ${INK3};
          font-style: italic;
        }
        .article-body hr {
          border: none;
          border-top: 1px solid ${BORDER};
          margin: 2rem 0;
        }
        .article-body strong { color: ${INK}; }
        .article-body em { color: ${INK3}; }
      `}</style>
    </div>
  );
}
