'use client';

import { useState } from 'react';

interface EmbedWidgetProps {
  path: string;   // e.g. "/estadisticas/riesgo-politico"
  title: string;
  height?: number;
}

export default function EmbedWidget({ path, title, height = 500 }: EmbedWidgetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = `https://qhawarina.pe${path}`;
  const code = `<iframe\n  src="${url}"\n  title="${title}"\n  width="100%"\n  height="${height}"\n  frameborder="0"\n  style="border:1px solid #e5e7eb; border-radius:8px;"\n  loading="lazy"\n></iframe>`;

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Obtener código para incrustar en tu sitio web"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        Incrustar
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-gray-200 shadow-xl z-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Código para incrustar</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Copia este código HTML para mostrar este gráfico en tu sitio web o blog.
            </p>
            <pre className="bg-gray-50 rounded border border-gray-200 p-3 text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap break-all mb-3">
              {code}
            </pre>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-blue-800 text-white hover:bg-blue-900'}`}
              >
                {copied ? '✓ Copiado!' : 'Copiar código'}
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
              >
                Abrir
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
