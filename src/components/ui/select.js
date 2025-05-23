import * as React from "react";

import { cn } from "../../lib/utils";

const Select = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-11 w-full rounded-lg border-2 border-input bg-background/50 backdrop-blur-sm px-4 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-primary/50 focus:bg-background/80 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Select.displayName = "Select";

const SelectOption = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <option
        className={cn("bg-background text-foreground", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
SelectOption.displayName = "SelectOption";

export { Select, SelectOption };