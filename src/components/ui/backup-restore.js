import React, { useState, useRef } from 'react';
import { Download, Upload, Shield, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from './button';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { motion, AnimatePresence } from 'framer-motion';
import { createBackup, restoreBackup, verifyBackup, scheduleAutoBackup } from '../../utils/backup';
import { format } from 'date-fns';

export function BackupRestore() {
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState(null);
  const [autoBackup, setAutoBackup] = useState(() => {
    return localStorage.getItem('eol-dashboard-auto-backup-enabled') === 'true';
  });
  const fileInputRef = useRef(null);

  // Handle backup creation
  const handleBackup = async () => {
    setBacking(true);
    setMessage(null);
    
    try {
      const result = await createBackup();
      setMessage({
        type: 'success',
        text: `Backup created successfully with ${result.metadata.resourceCount} resources and ${result.metadata.accountCount} accounts`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Backup failed: ${error.message}`
      });
    } finally {
      setBacking(false);
    }
  };

  // Handle restore
  const handleRestore = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setRestoring(true);
    setMessage(null);
    
    try {
      // First verify the backup
      const verification = await verifyBackup(file);
      if (!verification.valid) {
        throw new Error(verification.error);
      }
      
      // Restore the backup
      const result = await restoreBackup(file);
      
      if (result.cancelled) {
        setMessage({
          type: 'info',
          text: 'Restore cancelled'
        });
      } else if (result.success) {
        setMessage({
          type: 'success',
          text: `Restored ${result.restored.resources} resources and ${result.restored.accounts} accounts`
        });
        
        // Refresh page after successful restore
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Restore failed: ${error.message}`
      });
    } finally {
      setRestoring(false);
      event.target.value = '';
    }
  };

  // Toggle auto-backup
  const toggleAutoBackup = () => {
    const newValue = !autoBackup;
    setAutoBackup(newValue);
    localStorage.setItem('eol-dashboard-auto-backup-enabled', newValue.toString());
    
    if (newValue) {
      scheduleAutoBackup();
      setMessage({
        type: 'info',
        text: 'Auto-backup enabled. Backups will be created weekly.'
      });
    } else {
      setMessage({
        type: 'info',
        text: 'Auto-backup disabled'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Backup & Restore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Backup Section */}
        <div>
          <h3 className="text-sm font-medium mb-2">Create Backup</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Download a complete backup of all your resources and settings
          </p>
          <Button
            onClick={handleBackup}
            disabled={backing}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {backing ? 'Creating backup...' : 'Create Backup'}
          </Button>
        </div>

        {/* Restore Section */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Restore from Backup</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Upload a backup file to restore your data
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleRestore}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={restoring}
            variant="outline"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {restoring ? 'Restoring...' : 'Restore from File'}
          </Button>
        </div>

        {/* Auto-backup Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Auto-backup</h3>
              <p className="text-xs text-muted-foreground">
                Automatically create backups weekly
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={toggleAutoBackup}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
          </div>
          {autoBackup && (
            <div className="mt-2 text-xs text-muted-foreground">
              Last auto-backup: {
                localStorage.getItem('eol-dashboard-auto-backup') 
                  ? format(new Date(parseInt(localStorage.getItem('eol-dashboard-auto-backup'))), 'MMM dd, yyyy')
                  : 'Never'
              }
            </div>
          )}
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 p-3 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}