"use client"

import type * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  disabled?: ((date: Date) => boolean) | boolean
}

export function DatePicker({ date, setDate, className, disabled, ...props }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className, // Allow overriding styles
          )}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700 text-slate-100">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={disabled}
          className="[&_button]:text-slate-100 [&_button:hover]:bg-slate-700 [&_button[aria-selected]]:bg-blue-500 [&_button[aria-selected]]:text-white [&_button[aria-selected]:hover]:bg-blue-400"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-slate-100",
            nav: "space-x-1 flex items-center",
            nav_button: cn("h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-slate-100 hover:bg-slate-700"),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-700/50 [&:has([aria-selected])]:bg-slate-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn("h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-slate-100 hover:bg-slate-700 rounded-md"),
            day_range_end: "day-range-end",
            day_selected: "bg-blue-500 text-white hover:bg-blue-400 focus:bg-blue-500 focus:text-white rounded-md",
            day_today: "bg-slate-600 text-slate-50 rounded-md",
            day_outside:
              "day-outside text-slate-500 opacity-50 aria-selected:bg-slate-700/50 aria-selected:text-slate-500 aria-selected:opacity-30",
            day_disabled: "text-slate-600 opacity-50",
            day_range_middle: "aria-selected:bg-slate-700 aria-selected:text-slate-100 rounded-none",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
