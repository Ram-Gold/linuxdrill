import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

type SlotProps = React.HTMLAttributes<HTMLElement> & {
    children?: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
    ({ children, ...props }, ref) => {
        if (React.isValidElement<Record<string, unknown>>(children)) {
            const childProps = children.props as Record<string, unknown>
            return React.cloneElement(children, {
                ...props,
                ...childProps,
                ref,
                className: cn(props.className as string, childProps.className as string),
            })
        }
        return null
    }
)
Slot.displayName = "Slot"

const buttonVariants = cva(
    "inline-flex touch-manipulation items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold cursor-pointer select-none disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "border-[3px] border-[var(--btn-3d-shadow-color,color-mix(in_srgb,var(--accent-primary)_40%,black))] bg-[var(--accent-primary)] text-white shadow-3d-btn",
                "3d":
                    "border-[3px] border-[var(--btn-3d-shadow-color,color-mix(in_srgb,var(--accent-primary)_40%,black))] bg-[var(--accent-primary)] text-white shadow-3d-btn",
                primary:
                    "border-[3px] border-[var(--btn-3d-shadow-color,color-mix(in_srgb,var(--accent-primary)_40%,black))] bg-[var(--accent-primary)] text-white shadow-3d-btn",
                neutral:
                    "border-[3px] border-[var(--surface-3d-shadow)] bg-[var(--surface-base)] text-[var(--text-main)] shadow-3d-card",
                subtle:
                    "border-0 border-none bg-[var(--surface-subtle)] text-[var(--text-main)]",
                accent:
                    "border-[3px] border-[var(--btn-3d-shadow-color,color-mix(in_srgb,var(--accent-green)_40%,black))] bg-[var(--accent-green)] text-black shadow-3d-btn",
                brutal:
                    "border-2 bg-[var(--accent-primary)] text-white border-[var(--brutal-border,#000000)] shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-brutal-sm",
                noShadow:
                    "border-0 border-none bg-[var(--accent-primary)] text-white",
            },
            size: {
                default: "h-11 px-5 sm:px-6 py-2.5 text-sm sm:text-base",
                sm: "h-9 px-3.5 text-xs sm:text-sm",
                lg: "h-12 px-7 sm:px-8 text-base",
                icon: "h-11 w-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
