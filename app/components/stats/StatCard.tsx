import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string;
  period: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  href: string;
}

export default function StatCard({
  title,
  value,
  period,
  change,
  changeDirection = "neutral",
  href,
}: StatCardProps) {
  const changeColorClass =
    changeDirection === "up"
      ? "text-green-600"
      : changeDirection === "down"
      ? "text-red-600"
      : "text-gray-600";

  const changeIcon =
    changeDirection === "up" ? "↑" : changeDirection === "down" ? "↓" : "→";

  return (
    <Link href={href}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
          {title}
        </h3>
        <div className="mt-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{period}</p>
          {change && (
            <p className={`text-sm font-medium mt-2 ${changeColorClass}`}>
              {changeIcon} {change}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
