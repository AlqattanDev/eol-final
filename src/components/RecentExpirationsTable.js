import React from 'react';
import { getResourceStatus } from '../data/mockData';
import { formatDate, getDaysRemainingText } from '../utils/dateUtils';
import { getStatusColor } from '../lib/utils';

// UI Components
import { Badge } from './ui/badge';
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

/**
 * RecentExpirationsTable shows resources that are expiring soon
 */
const RecentExpirationsTable = ({ resources }) => {
  // Get resources that are expiring soon and sort by EOL date
  const expiringResources = resources
    .filter(resource => getResourceStatus(resource.eolDate) === 'expiring')
    .sort((a, b) => new Date(a.eolDate) - new Date(b.eolDate))
    .slice(0, 5); // Only show 5 most recent

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resources Expiring Soon</CardTitle>
      </CardHeader>
      <CardContent>
        {expiringResources.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No resources expiring soon.
          </div>
        ) : (
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
              {expiringResources.map(resource => (
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
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExpirationsTable;