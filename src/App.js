import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Dashboard from './components/Dashboard';
import Resources from './components/Resources';
import Settings from './components/Settings';
import AnimatedBackground from './components/AnimatedBackground';

// UI Components
import { Navbar, SidebarNav } from './components/ui/navbar';
import ErrorBoundary from './components/ui/error-boundary';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { InstallPrompt } from './components/ui/install-prompt';

// Context
import { AccountProvider } from './context/AccountContext';

// Database services
import { initializeDatabase } from './config/database';
import { scheduleAutoBackup } from './utils/backup';

// Icons
import { Database, AlertCircle, Loader2 } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Database initialization state
  const [dbStatus, setDbStatus] = useState('initializing'); // 'initializing' | 'ready' | 'error'
  const [dbError, setDbError] = useState(null);

  // Check user's preferred color scheme on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Initialize local database on app start
  useEffect(() => {
    const initializeDB = async () => {
      try {
        setDbStatus('initializing');
        setDbError(null);

        console.log('Initializing local database...');
        
        // Initialize the local database
        await initializeDatabase();
        
        setDbStatus('ready');
        console.log('Local database initialized successfully');
        
        // Check for auto-backup if enabled
        if (localStorage.getItem('eol-dashboard-auto-backup-enabled') === 'true') {
          scheduleAutoBackup();
        }

      } catch (error) {
        console.error('Failed to initialize database:', error);
        setDbStatus('error');
        setDbError(error);
      }
    };

    initializeDB();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Retry database initialization
  const retryDbInitialization = async () => {
    setDbStatus('initializing');
    setDbError(null);
    
    try {
      await initializeDatabase();
      setDbStatus('ready');
    } catch (error) {
      console.error('Retry initialization failed:', error);
      setDbStatus('error');
      setDbError(error);
    }
  };

  // Render loading screen during initialization
  if (dbStatus === 'initializing') {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center`}>
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Database className="h-12 w-12 text-primary" />
                <Loader2 className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-spin" />
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">
                  Initializing Database
                </h2>
                <p className="text-muted-foreground text-sm">
                  Opening local database...
                </p>
              </div>
              
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error screen if initialization failed
  if (dbStatus === 'error' && dbError) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-red-900/20 flex items-center justify-center`}>
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Database Connection Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {dbError.message || 'Unable to open the local database. Please check file permissions and disk space.'}
            </p>
            
            <div className="space-y-2">
              <Button onClick={retryDbInitialization} className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Retry Initialization
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="text-sm text-muted-foreground cursor-pointer">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {dbError.stack || dbError.message}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }


  // Main app render
  return (
    <ErrorBoundary>
      <AccountProvider>
        <div className={`min-h-screen ${darkMode ? 'dark' : ''} relative`}>
          {/* Animated Background - now at root level for full page effect */}
          <AnimatedBackground />
          
          {/* Navbar */}
          <Navbar 
            onMenuToggle={toggleSidebar}
          />
          
          {/* Sidebar */}
          <SidebarNav 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            darkMode={darkMode}
            onThemeToggle={toggleDarkMode}
          />

          {/* Main content */}
          <main className="min-h-screen pt-16 lg:pl-64 relative">
            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>

          {/* PWA Install Prompt */}
          <InstallPrompt />

        </div>
      </AccountProvider>
    </ErrorBoundary>
  );
}

export default App;