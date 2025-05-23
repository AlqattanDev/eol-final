import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Status indicator in navbar */}
      <div className="flex items-center">
        {isOnline ? (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <Wifi className="h-4 w-4" />
            <span className="ml-1 text-xs hidden sm:inline">Online</span>
          </div>
        ) : (
          <div className="flex items-center text-amber-600 dark:text-amber-400">
            <WifiOff className="h-4 w-4" />
            <span className="ml-1 text-xs hidden sm:inline">Offline</span>
          </div>
        )}
      </div>

      {/* Notification toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
              isOnline 
                ? 'bg-green-600 text-white' 
                : 'bg-amber-600 text-white'
            }`}>
              {isOnline ? (
                <>
                  <Cloud className="h-4 w-4" />
                  <span>Back online</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-4 w-4" />
                  <span>You are offline</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function DataSyncIndicator() {
  const [lastSync, setLastSync] = useState(() => {
    const stored = localStorage.getItem('eol-dashboard-last-sync');
    return stored ? new Date(stored) : null;
  });
  const [syncing, setSyncing] = useState(false);

  // Simulate sync status (in a real app, this would connect to actual sync logic)
  useEffect(() => {
    const checkSync = () => {
      // Check if we should show as syncing
      const syncInterval = 5 * 60 * 1000; // 5 minutes
      const now = new Date();
      
      if (!lastSync || (now - lastSync) > syncInterval) {
        setSyncing(true);
        setTimeout(() => {
          setSyncing(false);
          const syncTime = new Date();
          setLastSync(syncTime);
          localStorage.setItem('eol-dashboard-last-sync', syncTime.toISOString());
        }, 2000);
      }
    };

    // Check on mount
    checkSync();

    // Check periodically
    const interval = setInterval(checkSync, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastSync]);

  const getTimeSinceSync = () => {
    if (!lastSync) return 'Never';
    
    const now = new Date();
    const diff = now - lastSync;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex items-center text-xs text-muted-foreground">
      {syncing ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
          <span>Syncing...</span>
        </>
      ) : (
        <>
          <Cloud className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">Last sync: {getTimeSinceSync()}</span>
          <span className="sm:hidden">{getTimeSinceSync()}</span>
        </>
      )}
    </div>
  );
}