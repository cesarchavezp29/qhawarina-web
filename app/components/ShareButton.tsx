'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

interface Props {
  title?: string;
  text?: string;
}

export default function ShareButton({ title = 'Qhawarina', text = 'Nowcasting Económico para Perú' }: Props) {
  const isEn = useLocale() === 'en';
  const [toast, setToast] = useState(false);

  const url = typeof window !== 'undefined' ? window.location.href : 'https://qhawarina.pe';
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleShare = async () => {
    if (canNativeShare && isMobile) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled
      }
    } else {
      // Desktop: copy full share text (already contains URL) to clipboard
      const shareText = text.includes('http') ? text : `${text}\n${url}`;
      try {
        await navigator.clipboard.writeText(shareText);
        setToast(true);
        setTimeout(() => setToast(false), 2000);
      } catch {
        // clipboard unavailable — silent fail
      }
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title={isEn ? 'Share' : 'Compartir'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {isEn ? 'Share' : 'Compartir'}
      </button>

      {toast && (
        <div className="absolute right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
          📋 {isEn ? 'Copied to clipboard' : 'Copiado al portapapeles'}
        </div>
      )}
    </div>
  );
}
