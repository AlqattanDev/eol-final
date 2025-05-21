import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import { 
  Menu, 
  X, 
  ServerIcon, 
  Home, 
  Settings,
  Building2,
  Sun,
  Moon,
  Plus,
  Check,
  ChevronDown
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from '../../context/AccountContext';

const Navbar = ({ className, onMenuToggle, darkMode, onThemeToggle, ...props }) => {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 h-16 border-b backdrop-blur-md bg-background/80",
        className
      )}
      {...props}
    >
      <div className="container h-full mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ServerIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden md:inline-block">AWS EOL Dashboard</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className="rounded-full"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

const SidebarNav = ({ className, isOpen, onClose, darkMode, ...props }) => {
  const location = useLocation();
  const { accounts, currentAccount, switchAccount } = useAccount();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = React.useRef(null);
  
  const isLinkActive = (path) => location.pathname === path;
  
  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
  };
  
  const handleAccountSwitch = (accountId) => {
    switchAccount(accountId);
    setAccountMenuOpen(false);
  };
  
  // Handle click outside to close the account menu
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r bg-card/30 backdrop-blur-xl transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        {...props}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <ServerIcon className="h-6 w-6 text-primary" />
            <span className="font-bold">AWS EOL Dashboard</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col gap-1 p-4">
          <NavLink href="/" active={isLinkActive('/')}>
            <Home className="h-5 w-5 mr-2" />
            Dashboard
          </NavLink>
          
          <NavLink href="/resources" active={isLinkActive('/resources')}>
            <ServerIcon className="h-5 w-5 mr-2" />
            Resources
          </NavLink>
          
          <NavLink href="/settings" active={isLinkActive('/settings')}>
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </NavLink>
        </div>
        
        {/* Account selector */}
        <div className="border-t mt-auto p-4">
          <div className="relative" ref={accountMenuRef}>
            {/* Account selector button */}
            <button
              onClick={toggleAccountMenu}
              className="flex items-center justify-between w-full px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: currentAccount?.color || '#0EA5E9' }}
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">Account</span>
                  <span className="text-xs text-muted-foreground">{currentAccount?.name || 'Select Account'}</span>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${accountMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu */}
            {accountMenuOpen && (
              <div className="absolute bottom-full mb-1 left-0 w-full bg-card rounded-md shadow-lg border overflow-hidden z-50">
                <div className="py-1">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    AWS Accounts
                  </div>
                  
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      className={cn(
                        "w-full text-left flex items-center px-3 py-2 text-sm",
                        currentAccount?.id === account.id 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => handleAccountSwitch(account.id)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: account.color }}
                        />
                        <div className="truncate">
                          <div className="font-medium">{account.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {account.awsAccountId}
                          </div>
                        </div>
                      </div>
                      {currentAccount?.id === account.id && (
                        <Check className="h-4 w-4 text-primary ml-2" />
                      )}
                    </button>
                  ))}
                  
                  <div className="h-px my-1 bg-border" />
                  
                  <button
                    className="w-full text-left flex items-center px-3 py-2 text-sm text-primary hover:bg-muted"
                    onClick={() => {
                      alert('Add account functionality would be implemented here');
                      setAccountMenuOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

const NavLink = ({ href, active, children, className, ...props }) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active 
          ? "bg-primary/10 text-primary hover:bg-primary/15"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export { Navbar, SidebarNav };