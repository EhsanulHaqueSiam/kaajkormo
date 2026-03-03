import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  color?: "primary" | "success" | "warning" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const barColors = {
  primary: "bg-primary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  accent: "bg-accent-500",
};

const barSizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  color = "primary",
  size = "md",
  showLabel,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-gray-200", barSizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColors[color])}
        />
      </div>
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: "primary" | "success" | "warning" | "danger" | "accent";
  className?: string;
  children?: React.ReactNode;
}

const ringColors = {
  primary: "text-primary-500",
  success: "text-success-500",
  warning: "text-warning-500",
  danger: "text-danger-500",
  accent: "text-accent-500",
};

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 4,
  color = "primary",
  className,
  children,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          className="text-gray-200"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          className={ringColors[color]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}
