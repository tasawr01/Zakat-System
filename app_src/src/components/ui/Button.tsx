import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
        const variants = {
            primary: "bg-gradient-to-br from-primary to-primary-dark text-primary-foreground hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl hover:shadow-primary/25 active:shadow-md",
            secondary: "bg-gradient-to-br from-secondary to-secondary-dark text-secondary-foreground hover:from-secondary-dark hover:to-secondary shadow-lg hover:shadow-xl hover:shadow-secondary/25 active:shadow-md",
            outline: "border-2 border-primary text-primary hover:bg-primary/10 hover:border-primary-dark shadow-sm hover:shadow-md active:bg-primary/15",
            ghost: "text-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/20",
        };

        const sizes = {
            sm: "h-9 px-4 text-sm",
            md: "h-11 px-6 text-base",
            lg: "h-14 px-8 text-lg",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button };
