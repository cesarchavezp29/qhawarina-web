export default function EstadisticasLoading() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48 mb-3" />
          <div className="h-5 bg-gray-200 rounded w-80 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-6 bg-gray-200 rounded w-48" />
                    <div className="h-4 bg-gray-100 rounded w-72" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-20 ml-6" />
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <div className="h-8 bg-gray-200 rounded w-24" />
                  <div className="h-8 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
