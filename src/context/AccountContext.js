import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { mockResources } from '../data/mockData';

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

  // Set the first account as default on initial load
  useEffect(() => {
    if (accounts.length > 0 && !currentAccount) {
      setCurrentAccount(accounts[0]);
    }
  }, [accounts, currentAccount]);

  // Memoized current account resources
  const currentAccountResources = useMemo(() => {
    if (!currentAccount) return mockResources;
    
    // In a real app, we would filter by AWS account ID
    // For the mock, we'll just filter a subset based on the account index
    const accountIndex = parseInt(currentAccount.id.split('-')[1]) - 1;
    return mockResources.filter((resource, index) => index % 3 === accountIndex);
  }, [currentAccount]);

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