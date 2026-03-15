'use client';

export default function PobrezaError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-gray-50 min-h-screen py-20 flex items-center justify-center">
      <div className="max-w-md text-center px-4">
        <p className="text-red-600 font-semibold mb-2">Error al cargar la página de pobreza</p>
        <p className="text-gray-500 text-sm mb-4">{error?.message ?? 'Error desconocido'}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
