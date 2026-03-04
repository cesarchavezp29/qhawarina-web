export default function SimuladoresLoading() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-80 mb-8" />
        <div className="flex gap-4 border-b border-gray-300 mb-8 pb-0">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-200 rounded w-40" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded p-6 h-48" />
            <div className="bg-white border border-gray-200 rounded p-6 h-40" />
          </div>
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded p-6 h-80" />
        </div>
      </div>
    </div>
  );
}
