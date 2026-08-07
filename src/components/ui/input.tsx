import * as React from "react"
import { CalendarDays, Clock } from "lucide-react"

import { cn } from "@/lib/utils"

const DATE_TIME_TYPES = new Set(["date", "time", "datetime-local", "month", "week"])

function Input({ className, type, disabled, ...props }: React.ComponentProps<"input">) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const isDateTime = typeof type === "string" && DATE_TIME_TYPES.has(type)
  const Icon = type === "time" ? Clock : CalendarDays

  const openPicker = () => {
    if (disabled) return
    const input = inputRef.current
    if (!input) return
    input.focus()
    try {
      if (typeof input.showPicker === "function") {
        input.showPicker()
        return
      }
    } catch {
      // fall through
    }
    input.click()
  }

  const inputClassName = cn(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    isDateTime &&
      "pr-10 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
    className
  )

  if (!isDateTime) {
    return (
      <input
        type={type}
        data-slot="input"
        disabled={disabled}
        className={inputClassName}
        {...props}
      />
    )
  }

  return (
    <div data-slot="date-time-input" className="relative w-full min-w-0">
      <input
        ref={inputRef}
        type={type}
        data-slot="input"
        disabled={disabled}
        className={inputClassName}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={openPicker}
        className="absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-center rounded-r-[inherit] text-[#ffc72c] transition hover:bg-white/5 hover:text-[#ffd24d] disabled:pointer-events-none disabled:opacity-50"
        aria-label={type === "time" ? "Open time picker" : "Open date picker"}
      >
        <Icon className="h-4 w-4 shrink-0" />
      </button>
    </div>
  )
}

export { Input }
