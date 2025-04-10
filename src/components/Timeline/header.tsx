import { cn } from "@/lib/utils"

interface TimelineHeaderProps {
  dates: Date[]
  dayWidth: number
}

export default function TimelineHeader({ dates, dayWidth }: TimelineHeaderProps) {
  const months: { [key: string]: Date[] } = {}

  dates.forEach((date) => {
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    if (!months[monthKey]) {
      months[monthKey] = []
    }
    months[monthKey].push(date)
  })

  return (
    <div className="sticky top-0 bg-white z-10">
      <div className="flex border-b h-8">
        {Object.entries(months).map(([monthKey, daysInMonth]) => {
          const date = daysInMonth[0]
          const monthName = date.toLocaleDateString("en-US", { month: "long" })
          const year = date.getFullYear()
          const width = daysInMonth.length * dayWidth

          return (
            <div
              key={monthKey}
              className="flex-shrink-0 border-r font-medium px-2 flex items-center"
              style={{ width: `${width}px` }}
            >
              {monthName} {year}
            </div>
          )
        })}
      </div>

      <div className="flex h-8">
        {dates.map((date, i) => {
          const isFirstOfMonth = date.getDate() === 1
          const isWeekend = date.getDay() === 0 || date.getDay() === 6

          return (
            <div
              key={i}
              className={cn(
                "flex-shrink-0 text-center text-xs flex items-center justify-center border-r",
                isWeekend ? "bg-gray-50" : "",
                isFirstOfMonth ? "border-l-2 border-l-gray-400" : "",
              )}
              style={{ width: `${dayWidth}px` }}
            >
              {date.getDate()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
