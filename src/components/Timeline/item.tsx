import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { TimelineItemType } from "@/types/timeline";

interface TimelineItemProps {
  item: TimelineItemType;
  startX: number;
  width: number;
  onEditName: (id: number, name: string) => void;
  isEditing: boolean;
  isResizing: boolean;
  setEditing: (isEditing: boolean) => void;
  onDragStart: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, direction: "start" | "end") => void;
}

const colors = [
  "bg-blue-100 hover:bg-blue-200 border-blue-300",
  "bg-purple-100 hover:bg-purple-200 border-purple-300",
  "bg-green-100 hover:bg-green-200 border-green-300",
  "bg-yellow-100 hover:bg-yellow-200 border-yellow-300",
  "bg-red-100 hover:bg-red-200 border-red-300",
  "bg-indigo-100 hover:bg-indigo-200 border-indigo-300",
  "bg-pink-100 hover:bg-pink-200 border-pink-300",
  "bg-teal-100 hover:bg-teal-200 border-teal-300",
];

export default function TimelineItem({
  item,
  startX,
  width,
  onEditName,
  isEditing,
  setEditing,
  onDragStart,
  onResizeStart,
  isResizing,
}: TimelineItemProps) {
  const [name, setName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    onEditName(item.id, name);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setName(item.name);
      setEditing(false);
    }
  };

  const effectiveWidth = Math.max(width, 20);
  const smallCard = effectiveWidth <= 60;

  const smallDayHoverStyles =
    smallCard && isEditing
      ? {
          width: "200px",
          zIndex: 20,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }
      : {};

  const colorIndex = item.id % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div
      className={cn(
        colorClass,
        "absolute rounded-md border p-2 shadow-sm transition-all cursor-move select-none",
        "text-xs flex flex-col justify-between overflow-hidden"
      )}
      style={{
        left: `${startX}px`,
        width: `${smallCard && isEditing ? 200 : effectiveWidth}px`,
        height: "60px",
        zIndex: isEditing ? 30 : 1,
        ...smallDayHoverStyles,
        transition: "width 0.2s ease, box-shadow 0.2s ease, z-index 0s",
      }}
      onClick={() => !isEditing && setEditing(true)}
      onMouseDown={(e) => {
        if (isEditing) return;
        e.preventDefault();
        onDragStart(e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className={`absolute left-0 top-0 ${
          smallCard ? "w-1" : "w-2"
        } h-full cursor-w-resize opacity-0 hover:opacity-100 hover:bg-blue-500/20`}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onResizeStart(e, "start");
        }}
      />

      <div
        className={`absolute right-0 top-0 ${
          smallCard ? "w-1" : "w-2"
        } h-full cursor-e-resize opacity-0 hover:opacity-100 hover:bg-blue-500/20`}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onResizeStart(e, "end");
        }}
      />
      {isEditing ? (
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="h-6 p-1 text-xs"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="font-medium truncate">{item.name}</div>
      )}
      <div className="text-gray-500 text-[10px] truncate">
        {formatDate(item.start)}
        {!smallCard || (isEditing && ` - ${formatDate(item.end)}`)}
      </div>
    </div>
  );
}
