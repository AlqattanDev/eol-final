import React, { useMemo } from 'react';
import { 
  ServerIcon,
  AlertTriangle,
  DollarSign,
  Building2
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
import { formatCurrency, calculateResourceStats } from '../lib/utils';

// Animations
import {
  FadeIn,
  Stagger,
  StaggerItem,
  AnimateOnView
} from './ui/animations';

const Dashboard = () => {
  const { currentAccount, currentAccountResources } = useAccount();
  
  // Get stats for the current account resources using the utility function
  const stats = useMemo(() => {
    return calculateResourceStats(currentAccountResources);
  }, [currentAccountResources]);

  return (
    <PageContainer>
      <FadeIn>
        <PageHeader>
          <div className="flex items-center justify-between">
            <PageTitle>Dashboard</PageTitle>
            {currentAccount && (
              <Badge className="px-3 py-1.5" variant="outline">
                <Building2 className="h-3.5 w-3.5 mr-1.5" style={{ color: currentAccount.color }} />
                <span>{currentAccount.name}</span>
              </Badge>
            )}
          </div>
          <PageDescription>
            Monitor your AWS resources end-of-life and support status
          </PageDescription>
        </PageHeader>
      </FadeIn>

      {/* Stat Cards */}
      <Stagger className="mb-8" childrenDelay={0.1}>
        <ContentGrid cols={4}>
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

          <StaggerItem>
            <StatCard 
              title="Monthly Cost"
              value={formatCurrency(stats.totalCost)}
              icon={<DollarSign className="h-4 w-4" />}
              description="Total cost of all resources"
              colorClass="success"
            />
          </StaggerItem>
        </ContentGrid>
      </Stagger>

      {/* Charts */}
      <ContentGrid cols={2} className="mb-8">
        <AnimateOnView>
          <StatusChart data={stats} />
        </AnimateOnView>
        <AnimateOnView delay={0.2}>
          <TypeDistributionChart resources={currentAccountResources} />
        </AnimateOnView>
      </ContentGrid>

      {/* Resources expiring soon */}
      <AnimateOnView className="mb-8" delay={0.3}>
        <RecentExpirationsTable resources={currentAccountResources} />
      </AnimateOnView>
    </PageContainer>
  );
};

export default Dashboard;