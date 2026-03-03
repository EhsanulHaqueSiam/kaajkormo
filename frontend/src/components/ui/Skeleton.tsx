import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

function SkeletonBase({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
        className,
      )}
    />
  );
}

export function SkeletonText({ className, lines = 3 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase key={i} className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonAvatar({
  className,
  size = "md",
}: SkeletonProps & { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
  return <SkeletonBase className={cn("rounded-full", sizes[size], className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-1/3" />
          <SkeletonBase className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="mt-4 flex gap-2">
        <SkeletonBase className="h-6 w-16 rounded-full" />
        <SkeletonBase className="h-6 w-20 rounded-full" />
        <SkeletonBase className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ className, cols = 4 }: SkeletonProps & { cols?: number }) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBase key={i} className={cn("h-4 flex-1", i === 0 && "max-w-[200px]")} />
      ))}
    </div>
  );
}
