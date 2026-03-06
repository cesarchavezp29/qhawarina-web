export default function InflacionLoading() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
        <div className="h-9 bg-gray-200 rounded w-56 mb-2" />
        <div className="h-5 bg-gray-100 rounded w-80 mb-8" />
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="h-4 bg-gray-100 rounded w-40 mb-3" />
          <div className="h-12 bg-gray-200 rounded w-28 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-52" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="h-5 bg-gray-200 rounded w-36 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-48 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
