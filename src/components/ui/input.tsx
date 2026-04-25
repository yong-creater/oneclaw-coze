import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "border border-slate-200 dark:border-slate-700/60",
        "h-10 w-full min-w-0 rounded-xl border-2 bg-white dark:bg-slate-800/80 px-4 py-2 text-sm text-slate-800 dark:text-slate-200 shadow-xs transition-[color,box-shadow]",
        "hover:border-slate-300 dark:hover:border-slate-600",
        "focus-visible:border-slate-400 dark:focus-visible:border-slate-500 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
