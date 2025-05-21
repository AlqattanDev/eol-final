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
    <Card className="h-64 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className={`h-48 ${className}`}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;