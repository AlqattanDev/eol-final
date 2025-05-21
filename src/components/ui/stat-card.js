import * as React from "react";
import { cn } from "../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

const StatCard = React.forwardRef(
  ({ className, title, value, icon, description, trend, colorClass, ...props }, ref) => {
    const isPositiveTrend = trend > 0;
    
    return (
      <Card 
        ref={ref} 
        className={cn(
          "overflow-hidden transition-all hover:shadow-md h-auto",
          colorClass === "primary" && "bg-primary/10 dark:bg-primary/5 border-primary/20",
          colorClass === "destructive" && "bg-destructive/10 dark:bg-destructive/5 border-destructive/20",
          colorClass === "warning" && "bg-warning/10 dark:bg-warning/5 border-warning/20",
          colorClass === "success" && "bg-success/10 dark:bg-success/5 border-success/20",
          className
        )}
        {...props}
      >
        <CardHeader className="pb-1 p-3">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs">{title}</CardDescription>
            <span className={cn(
              "rounded-full p-1.5 flex items-center justify-center h-6 w-6",
              colorClass === "primary" && "bg-primary/10 text-primary",
              colorClass === "destructive" && "bg-destructive/10 text-destructive",
              colorClass === "warning" && "bg-warning/10 text-warning",
              colorClass === "success" && "bg-success/10 text-success",
            )}>{icon}</span>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-xl font-bold">{value}</CardTitle>
            {trend && (
              <span className={cn(
                "flex items-center text-xs font-medium",
                isPositiveTrend ? "text-success" : "text-destructive"
              )}>
                {isPositiveTrend ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };