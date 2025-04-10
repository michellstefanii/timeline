import { assignLanes } from "@/lib/assignLanes";
import { TimelineItemType } from "@/types/timeline";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { Card } from "../ui/card";
import TimelineItem from "./item";
import TimelineHeader from "./header";
import TimelineContextMenu from "./context";
import CreateItemModal from "./create";

interface TimelineProps {
  items: TimelineItemType[];
}

export default function Timeline({ items }: TimelineProps) {
  const [timelineItems, setTimelineItems] = useState<TimelineItemType[]>(items);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<TimelineItemType | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0 });
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    date: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    date: "",
  });
  const [createModal, setCreateModal] = useState<{
    visible: boolean;
    date: string;
  }>({
    visible: false,
    date: "",
  });

  const [isResizing, setIsResizing] = useState(false);
  const [resizingItem, setResizingItem] = useState<TimelineItemType | null>(
    null
  );
  const [resizeDirection, setResizeDirection] = useState<
    "start" | "end" | null
  >(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [originalDates, setOriginalDates] = useState({ start: "", end: "" });

  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timelineItems.length === 0) return;

    const startDates = timelineItems.map((item) =>
      new Date(item.start).getTime()
    );
    const endDates = timelineItems.map((item) => new Date(item.end).getTime());

    const minDate = new Date(Math.min(...startDates));
    const maxDate = new Date(Math.max(...endDates));

    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    setDateRange({
      start: minDate.toISOString().split("T")[0],
      end: maxDate.toISOString().split("T")[0],
    });
  }, [timelineItems]);

  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e: MouseEvent) => handleResizeMove(e);
      const handleMouseUp = () => handleResizeEnd();

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, resizingItem, resizeDirection, resizeStartX, originalDates]);

  const lanes = assignLanes(timelineItems);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleItemNameChange = (id: number, name: string) => {
    setTimelineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const dayWidth = 40 * zoomLevel;

  const getDatePositionX = (dateStr: string) => {
    if (!dateRange.start) return 0;

    const date = new Date(dateStr);
    const startDate = new Date(dateRange.start);

    const diffTime = Math.abs(date.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays * dayWidth;
  };

  const getDateFromPosition = (x: number): string => {
    if (!dateRange.start) return new Date().toISOString().split("T")[0];

    const startDate = new Date(dateRange.start);
    const daysOffset = Math.floor(x / dayWidth);

    const newDate = new Date(startDate);
    newDate.setDate(startDate.getDate() + daysOffset);

    return newDate.toISOString().split("T")[0];
  };

  const getDatesInRange = () => {
    if (!dateRange.start || !dateRange.end) return [];

    const dateArray = [];
    const currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  };

  const handleDragStart = (item: TimelineItemType, clientX: number) => {
    setIsDragging(true);
    setDraggedItem(item);

    if (timelineRef.current) {
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const itemStartX = getDatePositionX(item.start);
      const offsetX = clientX - (timelineRect.left + itemStartX);
      setDragOffset({ x: offsetX });
    }
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || !draggedItem || !timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const rawX = clientX - timelineRect.left - dragOffset.x;

    const startDate = new Date(dateRange.start);
    const daysOffset = Math.round(rawX / dayWidth);
    const newStartDate = new Date(startDate);
    newStartDate.setDate(startDate.getDate() + daysOffset);

    const oldStartDate = new Date(draggedItem.start);
    const oldEndDate = new Date(draggedItem.end);
    const duration = oldEndDate.getTime() - oldStartDate.getTime();

    const newEndDate = new Date(newStartDate.getTime() + duration);

    const formattedStartDate = newStartDate.toISOString().split("T")[0];
    const formattedEndDate = newEndDate.toISOString().split("T")[0];

    setTimelineItems((prev) =>
      prev.map((item) =>
        item.id === draggedItem.id
          ? {
              ...item,
              start: formattedStartDate,
              end: formattedEndDate,
            }
          : item
      )
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  const handleResizeStart = (
    item: TimelineItemType,
    clientX: number,
    direction: "start" | "end"
  ) => {
    setIsResizing(true);
    setResizingItem(item);
    setResizeDirection(direction);
    setResizeStartX(clientX);
    setOriginalDates({ start: item.start, end: item.end });

    document.body.style.userSelect = "none";
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (
      !isResizing ||
      !resizingItem ||
      !timelineRef.current ||
      !resizeDirection
    )
      return;

    const deltaX = e.clientX - resizeStartX;
    const daysDelta = Math.round(deltaX / dayWidth);

    if (resizeDirection === "start") {
      const newStartDate = new Date(originalDates.start);
      newStartDate.setDate(newStartDate.getDate() + daysDelta);

      const endDate = new Date(resizingItem.end);
      if (newStartDate <= endDate) {
        setTimelineItems((prev) =>
          prev.map((item) =>
            item.id === resizingItem.id
              ? {
                  ...item,
                  start: newStartDate.toISOString().split("T")[0],
                }
              : item
          )
        );
      }
    } else {
      const newEndDate = new Date(originalDates.end);
      newEndDate.setDate(newEndDate.getDate() + daysDelta);

      const startDate = new Date(resizingItem.start);
      if (newEndDate >= startDate) {
        setTimelineItems((prev) =>
          prev.map((item) =>
            item.id === resizingItem.id
              ? {
                  ...item,
                  end: newEndDate.toISOString().split("T")[0],
                }
              : item
          )
        );
      }
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizingItem(null);
    setResizeDirection(null);

    document.body.style.userSelect = "";
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - timelineRect.left;

    const clickedDate = getDateFromPosition(x - 50);

    setCreateModal({
      visible: true,
      date: clickedDate,
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - timelineRect.left;

    const clickedDate = getDateFromPosition(x - 50);

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      date: clickedDate,
    });
  };

  const handleCreateItem = useCallback(
    (name: string, startDate: string, endDate: string) => {
      const newId = Math.max(...timelineItems.map((item) => item.id), 0) + 1;
      console.log(startDate,endDate)
      const newItem: TimelineItemType = {
        id: newId,
        name,
        start: startDate,
        end: endDate,
      };

      setTimelineItems((prev) => [...prev, newItem]);
      setCreateModal({ visible: false, date: "" });
    },
    [timelineItems]
  );

  const allDates = getDatesInRange();
  const timelineWidth = allDates.length * dayWidth;

  return (
    <Card className="p-4 overflow-hidden">
      <div className="flex justify-between mb-4 items-center">
        <div>
          <h2 className="text-lg font-semibold">Timeline</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className="overflow-x-auto"
        onMouseMove={(e) => isDragging && handleDragMove(e.clientX)}
        onMouseUp={() => handleDragEnd()}
        onMouseLeave={() => handleDragEnd()}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        ref={timelineRef}
      >
        <div style={{ width: `${timelineWidth}px` }}>
          <TimelineHeader dates={allDates} dayWidth={dayWidth} />

          <div className="relative mt-4">
            {lanes.map((lane, laneIndex) => (
              <div key={laneIndex} className="h-16 relative mb-2">
                {lane.map((item) => (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    startX={getDatePositionX(item.start)}
                    width={
                      getDatePositionX(item.end) -
                      getDatePositionX(item.start) +
                      dayWidth
                    }
                    onEditName={handleItemNameChange}
                    isEditing={editingItem === item.id}
                    setEditing={(isEditing) =>
                      setEditingItem(isEditing ? item.id : null)
                    }
                    onDragStart={(e) => handleDragStart(item, e.clientX)}
                    onResizeStart={(e, direction) =>
                      handleResizeStart(item, e.clientX, direction)
                    }
                    isResizing={isResizing}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {contextMenu.visible && (
        <TimelineContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          date={contextMenu.date}
          onClose={() =>
            setContextMenu((prev) => ({ ...prev, visible: false }))
          }
          onCreateItem={(date) => setCreateModal({ visible: true, date })}
        />
      )}

      {createModal.visible && (
        <CreateItemModal
          isOpen={createModal.visible}
          onClose={() => setCreateModal({ visible: false, date: "" })}
          onSave={handleCreateItem}
          initialDate={createModal.date}
        />
      )}
    </Card>
  );
}
