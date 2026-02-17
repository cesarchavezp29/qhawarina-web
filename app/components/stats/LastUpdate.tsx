interface LastUpdateProps {
  date: string;
}

export default function LastUpdate({ date }: LastUpdateProps) {
  return (
    <div className="flex items-center justify-end text-sm text-gray-500">
      <svg
        className="h-4 w-4 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Última actualización: {date}</span>
    </div>
  );
}
