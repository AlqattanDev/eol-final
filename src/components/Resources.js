import React, { useState, useMemo } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { getResourceStatus } from '../data/mockData';
import ResourceFilter from './ResourceFilter';
import ResourceTable from './ResourceTable';
import { useAccount } from '../context/AccountContext';

// UI Components
import { 
  PageContainer, 
  PageHeader, 
  PageTitle, 
  PageDescription 
} from './ui/layout';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Animations
import {
  FadeIn,
  SlideUp,
  AnimateOnView
} from './ui/animations';

const Resources = () => {
  const { currentAccount, currentAccountResources } = useAccount();
  
  // Extract unique resource types and regions for filters
  const resourceTypes = [...new Set(currentAccountResources.map(r => r.type))];
  const regions = [...new Set(currentAccountResources.map(r => r.region))];
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    region: '',
    maxCost: '',
    status: []
  });

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      region: '',
      maxCost: '',
      status: []
    });
  };

  // Apply filters to resources
  const filteredResources = useMemo(() => {
    return currentAccountResources.filter(resource => {
      // Search filter
      if (filters.search && !resource.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filters.type && resource.type !== filters.type) {
        return false;
      }
      
      // Region filter
      if (filters.region && resource.region !== filters.region) {
        return false;
      }
      
      // Max cost filter
      if (filters.maxCost && resource.monthlyCost > Number(filters.maxCost)) {
        return false;
      }
      
      // Status filter
      if (filters.status.length > 0) {
        const status = getResourceStatus(resource.eolDate);
        if (!filters.status.includes(status)) {
          return false;
        }
      }
      
      return true;
    });
  }, [currentAccountResources, filters]);

  return (
    <PageContainer>
      <FadeIn className="flex flex-wrap items-center justify-between mb-8">
        <PageHeader className="mb-0">
          <div className="flex items-center justify-between">
            <PageTitle>Resources</PageTitle>
            {currentAccount && (
              <Badge className="px-3 py-1.5" variant="outline">
                <Building2 className="h-3.5 w-3.5 mr-1.5" style={{ color: currentAccount.color }} />
                <span>{currentAccount.name}</span>
              </Badge>
            )}
          </div>
          <PageDescription>
            Manage and monitor your AWS resources
          </PageDescription>
        </PageHeader>
        
        <Button className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </FadeIn>

      {/* Filters */}
      <SlideUp delay={0.1}>
        <ResourceFilter 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          resourceTypes={resourceTypes}
          regions={regions}
        />
      </SlideUp>

      {/* Results summary */}
      <SlideUp delay={0.2} className="mb-4 text-sm text-muted-foreground">
        Showing {filteredResources.length} of {currentAccountResources.length} resources
      </SlideUp>

      {/* Resource table */}
      <AnimateOnView delay={0.1}>
        <ResourceTable resources={filteredResources} />
      </AnimateOnView>
    </PageContainer>
  );
};

export default Resources;