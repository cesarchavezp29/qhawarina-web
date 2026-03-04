export default function MetodologiaLoading() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 animate-pulse">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
        <div className="h-10 bg-gray-200 rounded w-64 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-96 mb-10" />
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-32" />
          ))}
        </div>
      </div>
    </div>
  );
}
