import React, { useState } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown 
} from 'lucide-react';
import { getResourceStatus } from '../data/mockData';
import { formatDate, getDaysRemainingText } from '../utils/dateUtils';
import { formatCurrency, getStatusColor } from '../lib/utils';

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
import { Card } from './ui/card';

const ResourceTable = ({ resources }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon based on current sort configuration
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-primary" />
      : <ArrowDown className="h-4 w-4 text-primary" />;
  };

  // Sort resources based on sortConfig
  const sortedResources = [...resources].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Get status badge based on resource status
  const getStatusBadge = (eolDate) => {
    const status = getResourceStatus(eolDate);
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
  };

  return (
    <Card>
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
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort('monthlyCost')}
            >
              <div className="flex items-center">
                <span>Monthly Cost</span>
                <span className="ml-1">{getSortIcon('monthlyCost')}</span>
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No resources found.
              </TableCell>
            </TableRow>
          ) : (
            sortedResources.map((resource) => (
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
                  {resource.region}
                </TableCell>
                <TableCell>
                  {formatDate(resource.eolDate)}
                  <div className="text-xs text-muted-foreground">
                    {getDaysRemainingText(resource.eolDate)}
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(resource.eosDate)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(resource.monthlyCost)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(resource.eolDate)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ResourceTable;