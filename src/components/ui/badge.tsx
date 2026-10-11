import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-lg border-2 px-2.5 py-0.5 text-[11px] font-bold font-mono tracking-wider transition-brutal",
    {
        variants: {
            variant: {
                default:
                    "border-[var(--brutal-border,#000000)] bg-[var(--surface-subtle)] text-[var(--text-main)] shadow-brutal-sm",
                neutral:
                    "border-black bg-white text-black shadow-brutal-sm",
                primary:
                    "border-[var(--brutal-border,#000000)] bg-[var(--accent-primary-bg)] text-[var(--accent-primary-soft)] shadow-brutal-sm",
                success:
                    "border-[var(--brutal-border,#000000)] bg-[var(--accent-green-bg)] text-[var(--accent-green)] shadow-brutal-sm",
                warning:
                    "border-[var(--brutal-border,#000000)] bg-[var(--accent-amber-bg)] text-[var(--accent-amber)] shadow-brutal-sm",
                destructive:
                    "border-[var(--brutal-border,#000000)] bg-[var(--accent-red-bg)] text-[var(--accent-red)] shadow-brutal-sm",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, ...props }, ref) => {
        return (
            <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
        )
    }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
