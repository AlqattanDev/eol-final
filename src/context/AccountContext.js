import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAccounts, useResources } from '../hooks/useDatabase';

// Create the context
const AccountContext = createContext();

// Custom hook to use the account context
export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

// Account provider component
export const AccountProvider = ({ children }) => {
  // Local state for current account selection
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Reactive accounts query
  const {
    data: accounts,
    isLoading: accountsLoading,
    error: accountsError
  } = useAccounts();

  // Resources for current account
  const {
    data: currentAccountResources,
    isLoading: resourcesLoading,
    error: resourcesError
  } = useResources(currentAccountId);

  // Utility functions
  const getAccountColor = useCallback((accountId) => {
    const colors = [
      '#0EA5E9', // primary-500
      '#22C55E', // success-500
      '#F59E0B', // warning-500
      '#EF4444', // error-500
      '#8B5CF6', // purple-500
      '#06B6D4', // cyan-500
    ];
    
    const hash = accountId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }, []);

  // Transform accounts data to match expected format
  const transformedAccounts = useMemo(() => {
    if (!accounts) return [];
    
    return accounts.map(account => ({
      id: account.id,
      accountId: account.accountId,
      name: account.name,
      awsAccountId: account.accountId,
      description: account.description || '',
      color: getAccountColor(account.accountId),
      status: 'active'
    }));
  }, [accounts, getAccountColor]);

  // Current account object
  const currentAccount = useMemo(() => {
    if (!currentAccountId || !transformedAccounts.length) return null;
    
    return transformedAccounts.find(acc => acc.accountId === currentAccountId) || null;
  }, [currentAccountId, transformedAccounts]);

  // Transform resources data
  const transformedResources = useMemo(() => {
    if (!currentAccountResources) return [];
    
    return currentAccountResources.map(resource => ({
      id: resource.id,
      resourceId: resource.resourceId,
      name: resource.name,
      service: resource.service,
      type: resource.type,
      region: resource.region,
      eolDate: resource.eolDate,
      eosDate: resource.eosDate,
      status: resource.status,
      accountId: resource.account,
      description: resource.description || ''
    }));
  }, [currentAccountResources]);

  // Set default account when accounts are loaded
  useEffect(() => {
    if (transformedAccounts.length > 0 && !currentAccountId) {
      setCurrentAccountId(transformedAccounts[0].accountId);
      setInitialized(true);
    }
  }, [transformedAccounts, currentAccountId]);

  // Account management functions
  const switchAccount = useCallback(async (accountId) => {
    const account = transformedAccounts.find(acc => acc.id === accountId || acc.accountId === accountId);
    if (account) {
      setCurrentAccountId(account.accountId);
    }
  }, [transformedAccounts]);

  const refreshData = useCallback(async () => {
    // Data will automatically refresh due to reactive queries
    console.log('Data refresh requested');
  }, []);

  // Determine loading state
  const loading = useMemo(() => {
    return accountsLoading || resourcesLoading || !initialized;
  }, [accountsLoading, resourcesLoading, initialized]);

  // Determine error state
  const error = useMemo(() => {
    return accountsError || resourcesError;
  }, [accountsError, resourcesError]);

  // Prepare the context value
  const contextValue = {
    // Data
    accounts: transformedAccounts,
    currentAccount: currentAccount,
    currentAccountResources: transformedResources,
    
    // State
    loading,
    error,
    initialized,
    
    // Account actions
    switchAccount,
    
    // Utility actions
    refreshData,
    getAccountColor
  };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountContext;