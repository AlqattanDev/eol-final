import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Building2, RefreshCcw, AlertCircle } from 'lucide-react';
import ResourceFilter from './ResourceFilter';
import ResourceTable from './ResourceTable';
import { ResourceEditor } from './ui/resource-editor';
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
  const { 
    currentAccount, 
    currentAccountResources,
    loading: contextLoading,
    error: contextError
  } = useAccount();
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    region: '',
    status: []
  });
  
  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  // Use resources from context
  const sourceResources = currentAccountResources;

  // Extract unique resource types and regions
  const { resourceTypes, regions } = useMemo(() => {
    const data = currentAccountResources;
    if (!data) return { resourceTypes: [], regions: [] };

    const types = [...new Set(data.map(r => r.resourceType || r.type))];
    const regs = [...new Set(data.map(r => r.region))];
    
    return {
      resourceTypes: types.filter(Boolean),
      regions: regs.filter(Boolean)
    };
  }, [currentAccountResources]);

  // Determine which resources to use
  const resources = useMemo(() => {
    if (!sourceResources) {
      return [];
    }

    // Apply client-side filtering
    return sourceResources.filter(resource => {
      if (filters.search && !resource.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.type && resource.type !== filters.type) {
        return false;
      }
      if (filters.region && resource.region !== filters.region) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(resource.status)) {
        return false;
      }
      return true;
    });
  }, [sourceResources, filters]);

  // Handle filter changes
  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: '',
      region: '',
      status: []
    });
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    // Force re-render to refresh data
    window.location.reload();
  }, []);

  // Handle add resource
  const handleAddResource = useCallback(() => {
    setEditingResource(null);
    setEditorOpen(true);
  }, []);
  
  // Handle edit resource
  const handleEditResource = useCallback((resource) => {
    setEditingResource(resource);
    setEditorOpen(true);
  }, []);
  
  // Handle editor close
  const handleEditorClose = useCallback(() => {
    setEditorOpen(false);
    setEditingResource(null);
  }, []);
  
  // Handle save from editor
  const handleEditorSave = useCallback(() => {
    // Refresh the page to show updated data
    window.location.reload();
  }, []);

  // Determine loading state
  const isLoading = contextLoading;
  
  // Determine error state
  const error = contextError;


  return (
    <PageContainer>
      <FadeIn className="flex flex-wrap items-center justify-between mb-8">
        <PageHeader className="mb-0">
          <div className="flex items-center justify-between">
            <PageTitle>Resources</PageTitle>
            <div className="flex items-center space-x-2">
              {currentAccount && (
                <Badge className="px-3 py-1.5" variant="outline">
                  <Building2 className="h-3.5 w-3.5 mr-1.5" style={{ color: currentAccount.color }} />
                  <span>{currentAccount.name}</span>
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCcw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          <PageDescription>
            Manage and monitor your AWS resources
          </PageDescription>
        </PageHeader>
        
        <Button 
          className="mt-4 sm:mt-0"
          onClick={handleAddResource}
          disabled={!currentAccount || isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </FadeIn>


      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Error loading resources</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message || 'Failed to load resources. Please try again.'}
          </p>
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

      {/* Filters */}
      <SlideUp delay={0.1}>
        <ResourceFilter 
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          resourceTypes={resourceTypes}
          regions={regions}
          loading={false}
        />
      </SlideUp>

      {/* Results summary */}
      <SlideUp delay={0.2} className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {resources.length} resources
        </div>
        
      </SlideUp>

      {/* Resource table */}
      <AnimateOnView delay={0.1}>
        <ResourceTable 
          resources={resources}
          loading={isLoading}
          error={error}
          onRefresh={handleRefresh}
          onEdit={handleEditResource}
        />
      </AnimateOnView>
      
      {/* Resource Editor Modal */}
      {editorOpen && (
        <ResourceEditor
          resource={editingResource}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      )}
    </PageContainer>
  );
};

export default Resources;