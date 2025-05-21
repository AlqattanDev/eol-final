import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { getHealthStatus } from './services/api';

// Pages
import Dashboard from './components/Dashboard';
import Resources from './components/Resources';
import Settings from './components/Settings';
import AnimatedBackground from './components/AnimatedBackground';

// UI Components
import { Navbar, SidebarNav } from './components/ui/navbar';

// Context
import { AccountProvider } from './context/AccountContext';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  // Check API health on initial load
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const health = await getHealthStatus();
        setApiStatus(health.status === 'up' ? 'connected' : 'disconnected');
      } catch (err) {
        console.error('API health check failed:', err);
        setApiStatus('disconnected');
      }
    };
    
    // Add a delay to ensure backend is ready
    const timer = setTimeout(() => {
      checkApiHealth();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Check user's preferred color scheme on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
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

  return (
    <AccountProvider>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''} relative`}>
        {/* Animated Background - now at root level for full page effect */}
        <AnimatedBackground />
        
        {/* API Status indicator */}
        {apiStatus !== 'connected' && (
          <div className={`fixed top-0 left-0 right-0 z-50 p-2 text-center text-sm text-white ${
            apiStatus === 'checking' ? 'bg-yellow-600' : 'bg-red-600'
          }`}>
            {apiStatus === 'checking' ? 'Connecting to API...' : 'API Disconnected - Using mock data'}
          </div>
        )}
        
        {/* Navbar */}
        <Navbar 
          onMenuToggle={toggleSidebar} 
          darkMode={darkMode}
          onThemeToggle={toggleDarkMode}
        />
        
        {/* Sidebar */}
        <SidebarNav 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          darkMode={darkMode}
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
      </div>
    </AccountProvider>
  );
}

export default App;