'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
        <p className="text-gray-500 mb-6">
          Ocurrió un error inesperado. Puede ser un problema temporal con los datos o la red.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-6">ID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
