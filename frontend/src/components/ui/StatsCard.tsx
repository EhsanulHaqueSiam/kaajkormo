import { TrendingDown, TrendingUp } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface StatsCardProps {
  icon?: ReactNode;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3; // ease-out cubic
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

export function StatsCard({
  icon,
  label,
  value,
  prefix = "",
  suffix = "",
  trend,
  className,
}: StatsCardProps) {
  const animatedValue = useAnimatedCounter(value);

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        {icon && (
          <div className="rounded-lg bg-primary-50 p-2.5 text-primary-600 [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </div>
        )}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.isPositive
                ? "bg-success-100 text-success-700"
                : "bg-danger-100 text-danger-700",
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">
          {prefix}
          {animatedValue.toLocaleString()}
          {suffix}
        </p>
        <p className="mt-0.5 text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
