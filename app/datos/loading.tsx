export default function DatosLoading() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-5 bg-gray-100 rounded w-96 mb-8" />
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-9 bg-gray-200 rounded-full w-28" />)}
        </div>
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-7 bg-gray-200 rounded w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(j => <div key={j} className="bg-white rounded-lg border p-5 h-32" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
