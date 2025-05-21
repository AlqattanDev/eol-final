import * as React from "react";
import { cn } from "../../lib/utils";

const Checkbox = React.forwardRef(
  ({ className, checked, defaultChecked, onChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked || false);

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (event) => {
      const newChecked = event.target.checked;
      if (checked === undefined) {
        setIsChecked(newChecked);
      }
      onChange?.(event);
    };

    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          className={cn(
            "h-4 w-4 rounded border-primary text-primary shadow focus:ring-0 focus:ring-offset-0 focus:ring-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
            className
          )}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };