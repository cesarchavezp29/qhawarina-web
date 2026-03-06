export default function IntervencionesLoading() {
  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-80 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-96 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border border-gray-200 p-4 rounded">
              <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <div className="h-8 bg-gray-200 rounded w-28" />
          <div className="h-8 bg-gray-200 rounded w-28" />
        </div>
        <div className="h-80 bg-gray-100 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-gray-100 rounded" />
          <div className="h-40 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
