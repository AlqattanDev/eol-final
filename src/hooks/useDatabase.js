import { useState, useEffect } from 'react';
import { db } from '../config/database';

export const useDatabase = (collection, query = {}, dependencies = []) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let result;
        
        if (collection === 'resources') {
          let dbQuery = db.resources;
          
          // Apply filters
          if (query.account) {
            dbQuery = dbQuery.where('account').equals(query.account);
          }
          
          result = await dbQuery.toArray();
        } else if (collection === 'accounts') {
          result = await db.accounts.toArray();
        } else {
          throw new Error(`Unknown collection: ${collection}`);
        }
        
        setData(result || []);
      } catch (err) {
        console.error('Database query error:', err);
        setError(err);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [collection, JSON.stringify(query), ...dependencies]);

  return { data, isLoading, error };
};

export const useResources = (accountFilter = null) => {
  const query = accountFilter ? { account: accountFilter } : {};
  return useDatabase('resources', query, [accountFilter]);
};

export const useAccounts = () => {
  return useDatabase('accounts');
};

// Legacy hook for compatibility
export const useRealmQuery = useDatabase;