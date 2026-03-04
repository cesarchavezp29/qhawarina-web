'use client';

import { useLocale } from 'next-intl';

interface Props {
  generatedAt: string;
  staleAfterDays?: number;
  dataName?: string;
}

export default function DataFreshnessWarning({ generatedAt, staleAfterDays = 3, dataName }: Props) {
  const isEn = useLocale() === 'en';
  const age = (Date.now() - new Date(generatedAt).getTime()) / (1000 * 60 * 60 * 24);

  if (age <= staleAfterDays) return null;

  const days = Math.floor(age);
  const name = dataName ?? (isEn ? 'the data' : 'los datos');

  const message = isEn
    ? `Warning: ${name} ${days === 1 ? 'was' : 'were'} last updated ${days} ${days === 1 ? 'day' : 'days'} ago. The daily update may be delayed.`
    : `Aviso: ${name} fueron actualizados hace ${days} ${days === 1 ? 'día' : 'días'}. La actualización diaria puede estar retrasada.`;

  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2.5 text-sm mt-3">
      <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
