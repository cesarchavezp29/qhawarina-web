export default function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="bg-gray-50 min-h-screen py-12 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="h-4 bg-gray-200 rounded w-40 mb-6" />
        {/* Title */}
        <div className="h-9 bg-gray-200 rounded w-72 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-56 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-44 mb-8" />
        {/* Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(cards, 3)} gap-6`}>
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
