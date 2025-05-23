import * as React from "react";

import { cn, inputStyles } from "../../utils/styleUtils";

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputStyles.base,
          "h-11 border-2 bg-background/50 backdrop-blur-sm px-4 py-2 font-medium",
          "placeholder:text-muted-foreground/60",
          "focus:border-primary/50 focus:bg-background/80",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };