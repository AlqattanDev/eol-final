import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Cloud,
  Key,
  Shield,
  List,
  Archive,
  Slack
} from 'lucide-react';

// UI Components
import { 
  PageContainer, 
  PageHeader, 
  PageTitle, 
  PageDescription,
  ContentGrid 
} from './ui/layout';
import { FadeIn, SlideUp } from './ui/animations';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';

const Settings = () => {
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    autoArchive: false,
    expirationWarningDays: 30,
    criticalExpirationDays: 7
  });

  // AWS account settings
  const [awsSettings, setAwsSettings] = useState({
    accessKey: '',
    secretKey: '',
    regions: ['us-east-1'],
    refreshInterval: 24 // hours
  });

  // Handle notification setting changes
  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setNotificationSettings({
      ...notificationSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle AWS setting changes
  const handleAwsChange = (e) => {
    const { name, value } = e.target;
    
    setAwsSettings({
      ...awsSettings,
      [name]: value
    });
  };

  // Handle region selection
  const handleRegionChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      // Add region to array
      setAwsSettings({
        ...awsSettings,
        regions: [...awsSettings.regions, value]
      });
    } else {
      // Remove region from array
      setAwsSettings({
        ...awsSettings,
        regions: awsSettings.regions.filter(region => region !== value)
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would save the settings to a server or localStorage
    alert('Settings saved successfully!');
  };

  return (
    <PageContainer>
      <FadeIn>
        <PageHeader>
          <PageTitle>Settings</PageTitle>
          <PageDescription>
            Configure your dashboard preferences and notification settings
          </PageDescription>
        </PageHeader>
      </FadeIn>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Notification Settings */}
        <SlideUp delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 text-primary mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
          
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 rounded-sm border-primary text-primary focus:ring-primary"
                />
                <label htmlFor="emailNotifications" className="ml-2 flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  Email notifications for expiring resources
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="slackNotifications"
                  name="slackNotifications"
                  checked={notificationSettings.slackNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 rounded-sm border-primary text-primary focus:ring-primary"
                />
                <label htmlFor="slackNotifications" className="ml-2 flex items-center text-sm">
                  <Slack className="h-4 w-4 mr-2 text-muted-foreground" />
                  Slack notifications for expiring resources
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoArchive"
                  name="autoArchive"
                  checked={notificationSettings.autoArchive}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 rounded-sm border-primary text-primary focus:ring-primary"
                />
                <label htmlFor="autoArchive" className="ml-2 flex items-center text-sm">
                  <Archive className="h-4 w-4 mr-2 text-muted-foreground" />
                  Auto-archive resources after end of life
                </label>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <div>
                <label htmlFor="expirationWarningDays" className="block text-sm font-medium mb-1">
                  Expiration warning threshold (days before end of support)
                </label>
                <input
                  type="range"
                  id="expirationWarningDays"
                  name="expirationWarningDays"
                  min="1"
                  max="90"
                  value={notificationSettings.expirationWarningDays}
                  onChange={handleNotificationChange}
                  className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="text-right text-sm text-muted-foreground">
                  {notificationSettings.expirationWarningDays} days
                </div>
              </div>
              
              <div>
                <label htmlFor="criticalExpirationDays" className="block text-sm font-medium mb-1">
                  Critical expiration threshold (days before end of life)
                </label>
                <input
                  type="range"
                  id="criticalExpirationDays"
                  name="criticalExpirationDays"
                  min="1"
                  max="30"
                  value={notificationSettings.criticalExpirationDays}
                  onChange={handleNotificationChange}
                  className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="text-right text-sm text-muted-foreground">
                  {notificationSettings.criticalExpirationDays} days
                </div>
              </div>
            </div>
          </div>
            </CardContent>
          </Card>
        </SlideUp>

        {/* AWS Account Settings */}
        <SlideUp delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cloud className="h-5 w-5 text-primary mr-2" />
                AWS Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="accessKey" className="block text-sm font-medium mb-1">
                      AWS Access Key
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Key className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        type="password"
                        id="accessKey"
                        name="accessKey"
                        value={awsSettings.accessKey}
                        onChange={handleAwsChange}
                        placeholder="Enter your AWS access key"
                        className="w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="secretKey" className="block text-sm font-medium mb-1">
                      AWS Secret Key
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        type="password"
                        id="secretKey"
                        name="secretKey"
                        value={awsSettings.secretKey}
                        onChange={handleAwsChange}
                        placeholder="Enter your AWS secret key"
                        className="w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="refreshInterval" className="block text-sm font-medium mb-1">
                    Data Refresh Interval (hours)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <List className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      type="number"
                      id="refreshInterval"
                      name="refreshInterval"
                      value={awsSettings.refreshInterval}
                      onChange={handleAwsChange}
                      min="1"
                      max="72"
                      className="w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    AWS Regions
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-central-1'].map(region => (
                      <div key={region} className="flex items-center">
                        <input
                          type="checkbox"
                          id={region}
                          value={region}
                          checked={awsSettings.regions.includes(region)}
                          onChange={handleRegionChange}
                          className="h-4 w-4 rounded-sm border-primary text-primary focus:ring-primary"
                        />
                        <label htmlFor={region} className="ml-2 text-sm">
                          {region}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideUp>

        {/* Save Button */}
        <SlideUp delay={0.3} className="flex justify-end">
          <Button type="submit">
            Save Settings
          </Button>
        </SlideUp>
      </form>
    </PageContainer>
  );
};

export default Settings;