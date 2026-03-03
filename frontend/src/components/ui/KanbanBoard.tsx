import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface KanbanCard {
  id: string;
  content: ReactNode;
}

interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  cards: KanbanCard[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string) => void;
  className?: string;
}

export function KanbanBoard({ columns, onCardMove, className }: KanbanBoardProps) {
  const [dragState, setDragState] = useState<{
    cardId: string;
    fromColumn: string;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const handleDragStart = (cardId: string, columnId: string) => {
    setDragState({ cardId, fromColumn: columnId });
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDropTarget(columnId);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (columnId: string) => {
    if (dragState && dragState.fromColumn !== columnId) {
      onCardMove?.(dragState.cardId, dragState.fromColumn, columnId);
    }
    setDragState(null);
    setDropTarget(null);
  };

  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn(
            "flex min-w-[280px] flex-1 flex-col rounded-xl bg-gray-50 transition-colors",
            dropTarget === column.id && "bg-primary-50 ring-2 ring-primary-300",
          )}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={() => handleDrop(column.id)}
        >
          {/* Column header */}
          <div className="flex items-center gap-2 px-3 py-3">
            {column.color && (
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: column.color }}
              />
            )}
            <h3 className="text-sm font-semibold text-gray-700">{column.title}</h3>
            <span className="rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-600">
              {column.cards.length}
            </span>
          </div>

          {/* Cards */}
          <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
            {column.cards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={() => handleDragStart(card.id, column.id)}
                onDragEnd={() => {
                  setDragState(null);
                  setDropTarget(null);
                }}
                className={cn(
                  "cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing active:shadow-lg",
                  dragState?.cardId === card.id && "opacity-50",
                )}
              >
                {card.content}
              </div>
            ))}

            {column.cards.length === 0 && (
              <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                Drop here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
