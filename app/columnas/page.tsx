"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import BreadcrumbJsonLd from "../components/BreadcrumbJsonLd";

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

function readingTime(excerpt: string): number {
  return Math.max(1, Math.round(excerpt.split(/\s+/).length / 200 * 5));
}

function fmtDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ColumnasPage() {
  const locale = useLocale();
  const isEn = locale === "en";
  const [columnas, setColumnas] = useState<ColumnaMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/assets/columnas/index.json?v=${new Date().toISOString().split("T")[0]}`)
      .then((r) => r.json())
      .then((data: ColumnaMeta[]) => {
        // most recent first
        setColumnas([...data].sort((a, b) => b.date.localeCompare(a.date)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: BG }} className="min-h-screen py-12">
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Qhawarina", href: "/" },
          { name: isEn ? "Columns" : "Columnas", href: "/columnas" },
        ]}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2" style={{ color: INK }}>
            {isEn ? "Columns" : "Columnas"}
          </h1>
          <p className="text-lg" style={{ color: INK3 }}>
            {isEn
              ? "Analysis and opinion on the Peruvian economy"
              : "Análisis y opinión sobre la economía peruana"}
          </p>
        </div>

        {/* Articles */}
        {loading ? (
          <p style={{ color: INK3 }}>{isEn ? "Loading…" : "Cargando…"}</p>
        ) : columnas.length === 0 ? (
          <p style={{ color: INK3 }}>{isEn ? "No articles yet." : "Aún no hay columnas publicadas."}</p>
        ) : (
          <div className="space-y-6">
            {columnas.map((col) => (
              <article
                key={col.slug}
                className="rounded-xl border p-6 hover:shadow-md transition-shadow"
                style={{ background: "#fff", borderColor: BORDER }}
              >
                <Link href={`/columnas/${col.slug}`} className="group block">
                  <h2
                    className="text-xl font-bold mb-2 group-hover:underline"
                    style={{ color: INK, textDecorationColor: TERRA }}
                  >
                    {col.title}
                  </h2>
                </Link>

                <div className="flex items-center gap-3 text-xs mb-3" style={{ color: INK3 }}>
                  <span>{fmtDate(col.date, locale)}</span>
                  <span>·</span>
                  <span>{col.author}</span>
                  <span>·</span>
                  <span>{readingTime(col.excerpt)} min {isEn ? "read" : "lectura"}</span>
                </div>

                <p className="text-sm leading-relaxed mb-4" style={{ color: INK3 }}>
                  {col.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {col.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "#FDF0EC", color: TERRA }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/columnas/${col.slug}`}
                    className="text-sm font-medium hover:underline shrink-0 ml-4"
                    style={{ color: TERRA }}
                  >
                    {isEn ? "Read →" : "Leer →"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
