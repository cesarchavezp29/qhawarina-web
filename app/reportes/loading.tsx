export default function ReportesLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-96 mb-6" />
          <div className="border-b border-gray-300 mb-8 flex gap-4 pb-0">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded w-36" />
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
