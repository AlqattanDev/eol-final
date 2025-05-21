import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

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