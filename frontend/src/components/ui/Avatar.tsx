import { cn, getInitials } from "../../lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const dotSizes: Record<AvatarSize, string> = {
  sm: "h-2.5 w-2.5 border-[1.5px]",
  md: "h-3 w-3 border-2",
  lg: "h-3.5 w-3.5 border-2",
  xl: "h-4 w-4 border-2",
};

export function Avatar({ src, name, size = "md", online, className }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        <img src={src} alt={name} className={cn("rounded-full object-cover", sizeStyles[size])} />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700",
            sizeStyles[size],
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-white",
            online ? "bg-success-500" : "bg-gray-400",
            dotSizes[size],
          )}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

export function AvatarGroup({ children, max = 5, className }: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((child, i) => (
        <div key={i} className="ring-2 ring-white rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 ring-2 ring-white">
          +{remaining}
        </div>
      )}
    </div>
  );
}
