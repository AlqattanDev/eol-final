import React, { useMemo } from 'react';
import { 
  ServerIcon,
  AlertTriangle,
  Building2,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import StatusChart from './StatusChart';
import TypeDistributionChart from './TypeDistributionChart';
import RecentExpirationsTable from './RecentExpirationsTable';
import { useAccount } from '../context/AccountContext';

// UI Components
import { 
  PageContainer, 
  PageHeader, 
  PageTitle, 
  PageDescription,
  ContentGrid 
} from './ui/layout';
import { StatCard } from './ui/stat-card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { calculateResourceStats } from '../lib/utils';

// Animations
import {
  FadeIn,
  Stagger,
  StaggerItem,
  AnimateOnView
} from './ui/animations';


// Loading skeleton for stats
const StatsSkeleton = () => (
  <ContentGrid cols={4}>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-24 bg-muted rounded-lg"></div>
      </div>
    ))}
  </ContentGrid>
);

const Dashboard = () => {
  const { 
    currentAccount, 
    currentAccountResources,
    loading: contextLoading,
    error: contextError
  } = useAccount();

  // Calculate statistics from resources
  const stats = useMemo(() => {
    if (!currentAccountResources) {
      return { total: 0, expired: 0, expiring: 0, supported: 0 };
    }
    return calculateResourceStats(currentAccountResources);
  }, [currentAccountResources]);

  // Calculate type distribution
  const typeStats = useMemo(() => {
    if (!currentAccountResources) return [];
    
    const distribution = {};
    currentAccountResources.forEach(resource => {
      const type = resource.service || resource.type || 'Unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([type, count]) => ({
      _id: type,
      count
    }));
  }, [currentAccountResources]);

  // Determine loading state
  const isLoading = contextLoading;
  
  // Determine error state
  const error = contextError;

  // Handle refresh
  const handleRefresh = async () => {
    // Data will refresh automatically from context
  };

  return (
    <PageContainer>
      <FadeIn>
        <PageHeader>
          <div className="flex items-center justify-between">
            <PageTitle>Dashboard</PageTitle>
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
            Monitor your AWS resources end-of-life and support status
          </PageDescription>
        </PageHeader>
      </FadeIn>


      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Error loading dashboard data</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message || 'Failed to load dashboard data. Please try again.'}
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

      {/* Stat Cards */}
      <Stagger className="mb-8" childrenDelay={0.1}>
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <ContentGrid cols={3}>
            <StaggerItem>
              <StatCard 
                title="Total Resources"
                value={stats.total.toString()}
                icon={<ServerIcon className="h-4 w-4" />}
                description="Total AWS resources being monitored"
                colorClass="primary"
              />
            </StaggerItem>

            <StaggerItem>
              <StatCard 
                title="Expired Resources"
                value={stats.expired.toString()}
                icon={<AlertTriangle className="h-4 w-4" />}
                description="Resources that have reached end-of-life"
                colorClass="destructive"
                trend={stats.expired > 0 ? 5 : 0}
              />
            </StaggerItem>

            <StaggerItem>
              <StatCard 
                title="Expiring Soon"
                value={stats.expiring.toString()}
                icon={<AlertTriangle className="h-4 w-4" />}
                description="Resources expiring in the next 90 days"
                colorClass="warning"
                trend={stats.expiring > 0 ? 12 : 0}
              />
            </StaggerItem>
          </ContentGrid>
        )}
      </Stagger>

      {/* Charts */}
      <ContentGrid cols={2} className="mb-8">
        <AnimateOnView>
          <StatusChart 
            data={stats} 
            loading={isLoading}
            error={error}
          />
        </AnimateOnView>
        <AnimateOnView delay={0.2}>
          <TypeDistributionChart 
            resources={currentAccountResources} 
            typeStats={typeStats}
            loading={isLoading}
            error={error}
          />
        </AnimateOnView>
      </ContentGrid>

      {/* Resources expiring soon */}
      <AnimateOnView className="mb-8" delay={0.3}>
        <RecentExpirationsTable 
          resources={currentAccountResources}
          loading={isLoading}
          error={error}
        />
      </AnimateOnView>
    </PageContainer>
  );
};

export default Dashboard;