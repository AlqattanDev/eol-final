import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';

/**
 * ChartCard - A reusable card component for wrapping charts with consistent styling
 * 
 * @param {string} title - The title to display at the top of the card
 * @param {React.ReactNode} children - The chart component to render inside the card
 * @param {string} className - Additional classes to apply to the chart container (optional)
 */
const ChartCard = ({ title, children, className = '' }) => {
  return (
    <Card className="h-64 shadow-xl bg-gradient-to-br from-card/95 to-card/80 border-border/50 hover:border-primary/30 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={`h-48 relative ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg" />
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;