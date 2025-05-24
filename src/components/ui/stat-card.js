import * as React from "react";
import { cn, hoverEffects } from "../../utils/styleUtils";
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
          "overflow-hidden h-auto group relative",
          hoverEffects.lift,
          colorClass === "primary" && "bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/10 dark:to-primary/5 border-primary/30 hover:border-primary/50",
          colorClass === "destructive" && "bg-gradient-to-br from-destructive/15 to-destructive/5 dark:from-destructive/10 dark:to-destructive/5 border-destructive/30 hover:border-destructive/50",
          colorClass === "warning" && "bg-gradient-to-br from-warning/15 to-warning/5 dark:from-warning/10 dark:to-warning/5 border-warning/30 hover:border-warning/50",
          colorClass === "success" && "bg-gradient-to-br from-success/15 to-success/5 dark:from-success/10 dark:to-success/5 border-success/30 hover:border-success/50",
          className
        )}
        {...props}
      >
        {/* Glow effect on hover */}
        <div className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
          colorClass === "primary" && "bg-primary/5",
          colorClass === "destructive" && "bg-destructive/5",
          colorClass === "warning" && "bg-warning/5",
          colorClass === "success" && "bg-success/5",
        )} />

        <CardHeader className="pb-2 p-4 relative z-10">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-80">{title}</CardDescription>
            <span className={cn(
              "rounded-xl p-2 flex items-center justify-center h-8 w-8 transition-all duration-default",
              "group-hover:scale-110",
              colorClass === "primary" && "bg-primary/20 text-primary shadow-colored-primary",
              colorClass === "destructive" && "bg-destructive/20 text-destructive shadow-colored-destructive",
              colorClass === "warning" && "bg-warning/20 text-warning shadow-colored-warning",
              colorClass === "success" && "bg-success/20 text-success shadow-colored-success",
            )}>{icon}</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 relative z-10">
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-2xl font-bold tracking-tight" data-testid="stat-value">{value}</CardTitle>
            {trend && (
              <span className={cn(
                "flex items-center text-sm font-semibold px-2 py-1 rounded-md",
                isPositiveTrend
                  ? "text-success bg-success/10"
                  : "text-destructive bg-destructive/10"
              )}>
                {isPositiveTrend ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {description && (
            <p className="mt-2 text-xs text-muted-foreground/80 font-medium">{description}</p>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };