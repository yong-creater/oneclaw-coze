import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
        secondary: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
        success: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
        warning: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
        destructive: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
        outline: "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400",
        gradient: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
