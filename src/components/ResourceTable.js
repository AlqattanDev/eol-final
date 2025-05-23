import React, { useState, useMemo, useCallback } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown,
  AlertCircle,
  Loader2,
  RefreshCcw,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { formatDate, getDaysRemainingText } from '../utils/dateUtils';
import { getStatusColor } from '../lib/utils';
import { useAccount } from '../context/AccountContext';

// UI Components
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Loading skeleton
const TableSkeleton = () => (
  <div className="space-y-2">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="animate-pulse flex space-x-4 py-3">
        <div className="h-4 bg-muted rounded flex-1"></div>
        <div className="h-4 bg-muted rounded w-16"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
        <div className="h-4 bg-muted rounded w-16"></div>
        <div className="h-4 bg-muted rounded w-8"></div>
      </div>
    ))}
  </div>
);

// Resource action menu
const ResourceActions = ({ resource, onEdit, onDelete, disabled }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button 
        variant="ghost" 
        size="sm" 
        disabled={disabled}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onEdit(resource)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        onClick={() => onDelete(resource)}
        className="text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ResourceTable = ({ 
  resources, 
  loading, 
  error, 
  isConnected,
  onRefresh,
  onEdit 
}) => {
  const { 
    updateResource, 
    removeResource,
    connectionQuality 
  } = useAccount();

  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });

  const [actionLoading, setActionLoading] = useState(null);

  // Handle sorting
  const handleSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Get sort icon based on current sort configuration
  const getSortIcon = useCallback((key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-primary" />
      : <ArrowDown className="h-4 w-4 text-primary" />;
  }, [sortConfig]);

  // Sort resources based on sortConfig
  const sortedResources = useMemo(() => {
    if (!resources) return [];

    return [...resources].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle date fields
      if (sortConfig.key === 'eolDate' || sortConfig.key === 'eosDate') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }
      
      
      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [resources, sortConfig]);

  // Get status badge based on resource status
  const getStatusBadge = useCallback((resource) => {
    const status = resource.status;
    const variant = getStatusColor(status);
    
    let badgeText = '';
    switch (status) {
      case 'expired':
        badgeText = 'Expired';
        break;
      case 'expiring':
        badgeText = 'Expiring Soon';
        break;
      case 'supported':
        badgeText = 'Supported';
        break;
      default:
        badgeText = 'Unknown';
    }
    
    return (
      <Badge variant={variant}>
        {badgeText}
      </Badge>
    );
  }, []);

  // Handle resource edit
  const handleEdit = useCallback((resource) => {
    if (onEdit) {
      onEdit(resource);
    }
  }, [onEdit]);

  // Handle resource delete
  const handleDelete = useCallback(async (resource) => {
    if (!window.confirm(`Are you sure you want to delete ${resource.name}?`)) return;

    try {
      setActionLoading(resource.id);
      
      // Delete from local database
      const { db } = await import('../config/database');
      await db.resources.delete(resource.id);
      
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Failed to delete resource');
    } finally {
      setActionLoading(null);
    }
  }, [onRefresh]);

  // Connection quality indicator
  const showConnectionWarning = !isConnected || connectionQuality === 'poor';

  return (
    <Card className="relative">
      {/* Connection status overlay */}
      {showConnectionWarning && (
        <div className="absolute top-2 right-2 z-10">
          {!isConnected ? (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          ) : (
            <Badge variant="warning" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Poor Connection
            </Badge>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 border-b border-destructive/20 bg-destructive/10">
          <div className="flex items-center space-x-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load resources</span>
          </div>
          {onRefresh && (
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2"
              onClick={onRefresh}
            >
              Try Again
            </Button>
          )}
        </div>
      )}

      {loading ? (
        <div className="p-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading resources...</span>
          </div>
          <TableSkeleton />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  <span className="ml-1">{getSortIcon('name')}</span>
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center">
                  <span>Type</span>
                  <span className="ml-1">{getSortIcon('type')}</span>
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('region')}
              >
                <div className="flex items-center">
                  <span>Region</span>
                  <span className="ml-1">{getSortIcon('region')}</span>
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('eolDate')}
              >
                <div className="flex items-center">
                  <span>EOL Date</span>
                  <span className="ml-1">{getSortIcon('eolDate')}</span>
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('eosDate')}
              >
                <div className="flex items-center">
                  <span>EOS Date</span>
                  <span className="ml-1">{getSortIcon('eosDate')}</span>
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                    <p>No resources found.</p>
                    {!isConnected && (
                      <p className="text-xs">
                        Data shown is from offline cache.
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedResources.map((resource) => (
                <TableRow 
                  key={resource.id}
                  className={actionLoading === resource.id ? 'opacity-50' : ''}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <span>{resource.name}</span>
                      {!isConnected && (
                        <Badge variant="outline" className="text-xs">
                          Cached
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {resource.type || resource.resourceType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {resource.region}
                  </TableCell>
                  <TableCell>
                    {resource.eolDate ? (
                      <div>
                        {formatDate(resource.eolDate)}
                        <div className="text-xs text-muted-foreground">
                          {getDaysRemainingText(resource.eolDate)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {resource.eosDate ? formatDate(resource.eosDate) : '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(resource)}
                  </TableCell>
                  <TableCell>
                    <ResourceActions
                      resource={resource}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      disabled={actionLoading === resource.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Footer with data freshness info */}
      {!loading && sortedResources.length > 0 && (
        <div className="px-4 py-3 border-t bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live data</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Offline data</span>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Showing {sortedResources.length} resources</span>
              {onRefresh && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRefresh}
                  disabled={loading}
                  className="h-6 px-2"
                >
                  <RefreshCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ResourceTable;