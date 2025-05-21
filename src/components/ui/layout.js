import React from 'react';
import { cn } from '../../lib/utils';

const PageContainer = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "container mx-auto px-4 py-6 md:px-6 md:py-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const PageHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 mb-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const PageTitle = ({ children, className, ...props }) => {
  return (
    <h1
      className={cn(
        "text-3xl font-bold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
};

const PageDescription = ({ children, className, ...props }) => {
  return (
    <p
      className={cn(
        "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

const ContentGrid = ({ children, className, cols = 1, ...props }) => {
  return (
    <div
      className={cn(
        "grid gap-6",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        cols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { 
  PageContainer, 
  PageHeader, 
  PageTitle, 
  PageDescription,
  ContentGrid 
};