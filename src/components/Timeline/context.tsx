import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useRef } from "react"

interface TimelineContextMenuProps {
  x: number
  y: number
  date: string
  onClose: () => void
  onCreateItem: (date: string) => void
}

export default function TimelineContextMenu({ x, y, date, onClose, onCreateItem }: TimelineContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <Card ref={menuRef} className="absolute shadow-lg z-50 p-2 min-w-[150px]" style={{ left: `${x}px`, top: `${y}px` }}>
      <div className="text-xs text-gray-500 mb-2">{date}</div>
      <Button
        size="sm"
        className="w-full justify-start text-sm"
        variant="ghost"
        onClick={() => {
          onCreateItem(date)
          onClose()
        }}
      >
        Create new item
      </Button>
    </Card>
  )
}
