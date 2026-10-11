import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
    "rounded-2xl",
    {
        variants: {
            variant: {
                default:
                    "border-[3px] border-[var(--surface-3d-shadow)] bg-[var(--surface-base)] text-[var(--text-main)] shadow-3d-card",
                "3d":
                    "border-[3px] border-[var(--surface-3d-shadow)] bg-[var(--surface-base)] text-[var(--text-main)] shadow-3d-card",
                brutal:
                    "border-2 border-[var(--brutal-border,#000000)] bg-[var(--surface-base)] text-[var(--text-main)] shadow-brutal",
                neutral:
                    "border-[3px] border-[var(--surface-3d-shadow)] bg-white text-black shadow-3d-card",
                accent:
                    "border-[3px] border-[var(--surface-3d-shadow)] bg-[var(--surface-subtle)] text-[var(--text-main)] shadow-3d-card",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export type CardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant }), "p-4", className)}
            {...props}
        />
    )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 pb-2", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-2xl font-bold",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center pt-6", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardContent, cardVariants }
