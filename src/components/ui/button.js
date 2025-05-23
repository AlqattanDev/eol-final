import * as React from "react";
import { cva } from "class-variance-authority";

import { cn, buttonStyles } from "../../utils/styleUtils";

const buttonVariants = cva(
  cn(buttonStyles.base, "whitespace-nowrap transform active:scale-95"),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/25 hover:-translate-y-0.5",
        outline:
          "border-2 border-input hover:bg-accent hover:text-accent-foreground hover:border-accent hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        success: "bg-success text-success-foreground hover:bg-success/90 hover:shadow-lg hover:shadow-success/25 hover:-translate-y-0.5",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-lg hover:shadow-warning/25 hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };