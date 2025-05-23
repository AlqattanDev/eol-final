import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Database,
  Settings as SettingsIcon,
  RefreshCw
} from 'lucide-react';

// UI Components
import { 
  PageContainer, 
  PageHeader, 
  PageTitle, 
  PageDescription
} from './ui/layout';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { DataExchange } from './ui/data-exchange';
import { BackupRestore } from './ui/backup-restore';

// Database
import { resetDatabase } from '../config/database';

const Settings = () => {
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    expirationWarningDays: 30,
    criticalExpirationDays: 7
  });
  
  const [isResetting, setIsResetting] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedNotificationSettings = localStorage.getItem('eol-notification-settings');

    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }
  }, []);

  // Handle notification setting changes
  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Save settings to localStorage
      localStorage.setItem('eol-notification-settings', JSON.stringify(notificationSettings));
      alert('Settings saved successfully!');
    } catch (error) {
      alert(`Failed to save settings: ${error.message}`);
    }
  };

  // Handle database reset
  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the database? This will clear all data and reload sample data.')) {
      return;
    }
    
    setIsResetting(true);
    try {
      await resetDatabase();
      alert('Database reset successfully! Please refresh the page to see the updated data.');
    } catch (error) {
      alert(`Failed to reset database: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Settings</PageTitle>
        <PageDescription>
          Configure your dashboard preferences and notification options
        </PageDescription>
      </PageHeader>

      <div className="space-y-6">
        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Local Database Connected</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Using IndexedDB for offline data storage</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Database Management</h4>
                    <p className="text-xs text-muted-foreground">Reset the database to reload sample data with updated dates</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetDatabase}
                    disabled={isResetting}
                    className="ml-4"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
                    {isResetting ? 'Resetting...' : 'Reset Database'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-xs text-muted-foreground">Receive email alerts for expiring resources</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
              </div>

              {/* Warning Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expirationWarningDays" className="block text-sm font-medium mb-1">
                    Warning Period (days)
                  </label>
                  <input
                    type="number"
                    id="expirationWarningDays"
                    name="expirationWarningDays"
                    value={notificationSettings.expirationWarningDays}
                    onChange={handleNotificationChange}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Days before EOL to show warnings</p>
                </div>

                <div>
                  <label htmlFor="criticalExpirationDays" className="block text-sm font-medium mb-1">
                    Critical Period (days)
                  </label>
                  <input
                    type="number"
                    id="criticalExpirationDays"
                    name="criticalExpirationDays"
                    value={notificationSettings.criticalExpirationDays}
                    onChange={handleNotificationChange}
                    min="1"
                    max="90"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Days before EOL to show critical alerts</p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t">
                <Button type="submit" className="w-full md:w-auto">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </form>
            </CardContent>
          </Card>

        {/* Import/Export Settings */}
        <DataExchange />
        
        {/* Backup/Restore Settings */}
        <BackupRestore />
      </div>
    </PageContainer>
  );
};

export default Settings;