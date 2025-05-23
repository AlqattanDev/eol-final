import React from 'react';
import { 
  Filter,
  X 
} from 'lucide-react';

// UI Components
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectOption } from './ui/select';
import { Checkbox } from './ui/checkbox';

const ResourceFilter = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  resourceTypes,
  regions
}) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  const handleStatusChange = (e) => {
    const { name, checked } = e.target;
    
    if (checked) {
      // Add status to the array
      const newStatusFilters = [...filters.status, name];
      onFilterChange('status', newStatusFilters);
    } else {
      // Remove status from the array
      const newStatusFilters = filters.status.filter(status => status !== name);
      onFilterChange('status', newStatusFilters);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Filter className="h-5 w-5 mr-2 text-muted-foreground" />
          Filters
        </CardTitle>
        
        <Button 
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-8 gap-1 text-xs font-normal text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search filter */}
          <div className="col-span-1 lg:col-span-3">
            <label htmlFor="search" className="block text-sm font-medium mb-1">
              Search
            </label>
            <Input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name..."
              className="w-full"
            />
          </div>

          {/* Type filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              Resource Type
            </label>
            <Select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full"
            >
              <SelectOption value="">All Types</SelectOption>
              {resourceTypes.map(type => (
                <SelectOption key={type} value={type}>{type}</SelectOption>
              ))}
            </Select>
          </div>

          {/* Region filter */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium mb-1">
              Region
            </label>
            <Select
              id="region"
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              className="w-full"
            >
              <SelectOption value="">All Regions</SelectOption>
              {regions.map(region => (
                <SelectOption key={region} value={region}>{region}</SelectOption>
              ))}
            </Select>
          </div>

          {/* Status filters */}
          <div className="col-span-1 lg:col-span-3">
            <label className="block text-sm font-medium mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  id="expired"
                  name="expired"
                  checked={filters.status.includes('expired')}
                  onChange={handleStatusChange}
                />
                <span className="text-sm">Expired</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  id="expiring"
                  name="expiring"
                  checked={filters.status.includes('expiring')}
                  onChange={handleStatusChange}
                />
                <span className="text-sm">Expiring Soon</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  id="supported"
                  name="supported"
                  checked={filters.status.includes('supported')}
                  onChange={handleStatusChange}
                />
                <span className="text-sm">Supported</span>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceFilter;