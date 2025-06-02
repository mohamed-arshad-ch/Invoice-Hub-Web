"use client"

import type * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onSelect: (date: DateRange | undefined) => void
  buttonClassName?: string
}

export function DatePickerWithRange({ className, date, onSelect, buttonClassName }: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              buttonClassName,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelect}
            numberOfMonths={2}
            className="text-slate-900 dark:text-slate-100"
            classNames={{
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground dark:bg-sky-500 dark:text-white dark:hover:bg-sky-600 dark:focus:bg-sky-600",
              day_today: "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100",
              day_outside: "text-slate-400 dark:text-slate-500 opacity-50",
              day_disabled: "text-slate-400 dark:text-slate-500 opacity-50",
              day_range_middle:
                "aria-selected:bg-primary/20 aria-selected:text-primary-foreground dark:aria-selected:bg-sky-500/30 dark:aria-selected:text-white",
              // ... other classes if needed
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
