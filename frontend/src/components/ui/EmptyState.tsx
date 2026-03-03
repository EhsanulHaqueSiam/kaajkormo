import type { ReactNode } from "react";
import { FileX, Search, Inbox, FolderOpen } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

type EmptyPreset = "no-data" | "no-results" | "empty-inbox" | "empty-folder";

interface EmptyStateProps {
  preset?: EmptyPreset;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const presetIcons: Record<EmptyPreset, ReactNode> = {
  "no-data": <FileX className="h-12 w-12" />,
  "no-results": <Search className="h-12 w-12" />,
  "empty-inbox": <Inbox className="h-12 w-12" />,
  "empty-folder": <FolderOpen className="h-12 w-12" />,
};

export function EmptyState({
  preset,
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const displayIcon = icon || (preset ? presetIcons[preset] : <FileX className="h-12 w-12" />);

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="mb-4 text-gray-300">{displayIcon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm" className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}
