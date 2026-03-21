'use client';

import { useState } from 'react';

interface CiteButtonProps {
  /** The page/indicator name to include in the citation */
  indicator: string;
  isEn: boolean;
}

/**
 * One-click citation button — copies CC BY 4.0 formatted citation to clipboard.
 * Used on every stat page so journalists can cite correctly.
 */
export default function CiteButton({ indicator, isEn }: CiteButtonProps) {
  const [copied, setCopied] = useState(false);

  const today = new Date().toLocaleDateString(isEn ? 'en-US' : 'es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const citation = isEn
    ? `Qhawarina (qhawarina.pe). ${indicator}. Retrieved ${today}. CC BY 4.0.`
    : `Qhawarina (qhawarina.pe). ${indicator}. Consultado el ${today}. CC BY 4.0.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
      style={{
        borderColor: copied ? '#2A9D8F' : '#E8E4DC',
        color: copied ? '#2A9D8F' : '#8D99AE',
        background: copied ? '#f0fafa' : '#fff',
      }}
      title={citation}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d={copied
            ? "M5 13l4 4L19 7"
            : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          }
        />
      </svg>
      {copied ? (isEn ? 'Copied!' : '¡Copiado!') : (isEn ? 'Cite' : 'Citar')}
    </button>
  );
}
