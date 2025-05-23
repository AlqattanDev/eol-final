import React, { useMemo } from 'react';
import { AlertCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { formatDate, getDaysRemainingText } from '../utils/dateUtils';
import { useAccount } from '../context/AccountContext';

// UI Components
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from './ui/table';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from './ui/card';

// Loading skeleton component
const TableSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse flex space-x-4 py-2">
        <div className="h-4 bg-muted rounded flex-1"></div>
        <div className="h-4 bg-muted rounded w-16"></div>
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>
    ))}
  </div>
);

/**
 * RecentExpirationsTable shows resources that are expiring soon
 */
const RecentExpirationsTable = ({ 
  resources: fallbackResources, 
  loading: parentLoading, 
  error: parentError 
}) => {
  const { 
    currentAccountResources
  } = useAccount();

  // Get expiring resources from context
  const resources = useMemo(() => {
    const sourceResources = currentAccountResources || fallbackResources || [];
    
    return sourceResources
      .filter(resource => {
        if (!resource.eolDate) return false;
        
        const today = new Date();
        const eol = new Date(resource.eolDate);
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(today.getDate() + 90);
        
        // Resource is expiring if EOL is in future but within 90 days
        return eol > today && eol <= ninetyDaysFromNow;
      })
      .sort((a, b) => new Date(a.eolDate) - new Date(b.eolDate))
      .slice(0, 5);
  }, [currentAccountResources, fallbackResources]);

  // Transform resources to expected format
  const transformedResources = useMemo(() => {
    return (resources || []).map(resource => ({
      id: resource._id || resource.id,
      name: resource.name,
      type: resource.resourceType || resource.type || resource.service,
      eolDate: resource.eolDate,
      status: resource.status
    }));
  }, [resources]);

  // Determine loading and error states
  const isLoading = parentLoading;
  const error = parentError;

  // Handle refresh
  const handleRefresh = async () => {
    // Data will refresh automatically from context
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resources Expiring Soon</CardTitle>
          <div className="flex items-center space-x-2">
            {/* Refresh button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 border border-destructive/20 bg-destructive/10 rounded-lg">
            <div className="flex items-center space-x-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to load expiring resources</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2"
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading expiring resources...</span>
            </div>
            <TableSkeleton />
          </div>
        ) : transformedResources.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <div className="flex flex-col items-center space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
              <p>No resources expiring soon.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>EOL Date</TableHead>
                  <TableHead>Timeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transformedResources.map(resource => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">
                      {resource.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {resource.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(resource.eolDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">
                        {getDaysRemainingText(resource.eolDate)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Show total count if there are more resources */}
            {resources && resources.length >= 5 && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Showing 5 most urgent resources. Check the Resources page for more.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExpirationsTable;