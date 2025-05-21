import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { mockResources } from '../data/mockData';
import { getAccounts, getEOLResources } from '../services/api';
import { mapResourcesToFrontend } from '../utils/dataMappers';

// Sample accounts data
const sampleAccounts = [
  {
    id: 'acc-1',
    name: 'Production',
    awsAccountId: '123456789012',
    description: 'Main production environment',
    regions: ['us-east-1', 'us-west-2', 'eu-west-1'],
    color: '#0EA5E9', // primary-500
  },
  {
    id: 'acc-2',
    name: 'Development',
    awsAccountId: '234567890123',
    description: 'Development and testing environment',
    regions: ['us-east-1', 'us-west-2'],
    color: '#22C55E', // success-500
  },
  {
    id: 'acc-3',
    name: 'Staging',
    awsAccountId: '345678901234',
    description: 'Pre-production staging environment',
    regions: ['us-east-1', 'eu-west-1'],
    color: '#F59E0B', // warning-500
  }
];

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
  // State for accounts and currently selected account
  const [accounts, setAccounts] = useState(sampleAccounts);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch accounts from the backend
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const backendAccounts = await getAccounts();
        
        if (backendAccounts && backendAccounts.length > 0) {
          // Map backend accounts to our format
          const formattedAccounts = backendAccounts.map((account, index) => ({
            id: account.id,
            name: account.name || `Account ${account.id}`,
            awsAccountId: account.id,
            description: `AWS Account ${account.id}`,
            color: sampleAccounts[index % sampleAccounts.length].color, // Reuse colors from sample
          }));
          
          setAccounts(formattedAccounts);
        }
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
        setError('Failed to load accounts');
        // Fall back to sample accounts
      } finally {
        setLoading(false);
      }
    };
    
    // Add delay to ensure API is ready
    const timer = setTimeout(() => {
      fetchAccounts();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Set the first account as default on initial load
  useEffect(() => {
    if (accounts.length > 0 && !currentAccount) {
      setCurrentAccount(accounts[0]);
    }
  }, [accounts, currentAccount]);

  // Fetch resources when the current account changes
  useEffect(() => {
    const fetchResources = async () => {
      if (!currentAccount) return;
      
      try {
        setLoading(true);
        const accountResources = await getEOLResources(currentAccount.awsAccountId);
        // Map backend data to frontend format
        const mappedResources = mapResourcesToFrontend(accountResources);
        setResources(mappedResources);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources');
        // Fall back to mock data for this account
        const accountIndex = parseInt(currentAccount.id.split('-')[1] || '1') - 1;
        setResources(mockResources.filter((resource, index) => index % 3 === accountIndex));
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [currentAccount]);

  // Memoized current account resources with fallback to mock data
  const currentAccountResources = useMemo(() => {
    if (!currentAccount) return mockResources;
    if (resources.length > 0) return resources;
    
    // Fallback to mock data if backend request fails
    const accountIndex = parseInt(currentAccount.id.split('-')[1] || '1') - 1;
    return mockResources.filter((resource, index) => index % 3 === accountIndex);
  }, [currentAccount, resources]);

  // Switch account
  const switchAccount = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      setCurrentAccount(account);
    }
  };

  // Add a new account
  const addAccount = (newAccount) => {
    setAccounts([...accounts, { ...newAccount, id: `acc-${accounts.length + 1}` }]);
  };

  // Update an existing account
  const updateAccount = (accountId, updatedData) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId ? { ...acc, ...updatedData } : acc
    ));

    // Update current account if it's the one being edited
    if (currentAccount && currentAccount.id === accountId) {
      setCurrentAccount({ ...currentAccount, ...updatedData });
    }
  };

  // Remove an account
  const removeAccount = (accountId) => {
    // Filter out the account to be removed
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);

    // If the current account is the one being removed, switch to the first available account
    if (currentAccount && currentAccount.id === accountId && updatedAccounts.length > 0) {
      setCurrentAccount(updatedAccounts[0]);
    }
  };

  // Prepare the context value
  const contextValue = {
    accounts,
    currentAccount,
    currentAccountResources,
    loading,
    error,
    switchAccount,
    addAccount,
    updateAccount,
    removeAccount
  };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountContext;