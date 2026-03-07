'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

interface Props {
  title?: string;
  text?: string;
}

export default function ShareButton({ title = 'Qhawarina', text = 'Nowcasting Económico para Perú' }: Props) {
  const isEn = useLocale() === 'en';
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const isMobile = window.innerWidth < 768;
    const shareText = text.includes('http') ? text : `${text}\n${window.location.href}`;

    console.log('[ShareButton] shareText:', shareText);

    if (isMobile && navigator.share) {
      try {
        await navigator.share({ title, text: shareText });
      } catch {
        // user cancelled — fall through to clipboard
        await copyToClipboard(shareText);
      }
    } else {
      await copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (shareText: string) => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[ShareButton] clipboard failed:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors"
      style={copied
        ? { color: '#15803d', borderColor: '#86efac', backgroundColor: '#f0fdf4' }
        : { color: '#4b5563', borderColor: '#d1d5db', backgroundColor: 'transparent' }}
      title={isEn ? 'Share' : 'Compartir'}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isEn ? '✓ Copied' : '✓ Copiado'}
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {isEn ? 'Share' : 'Compartir'}
        </>
      )}
    </button>
  );
}
