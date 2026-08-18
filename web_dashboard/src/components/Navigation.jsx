import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  BarChart3, 
  History, 
  Activity, 
  Settings, 
  Waves,
  Users,
  Menu,
  X,
  Sun,
  Moon,
  ShieldAlert
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', name: 'Live Map', icon: Map },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'history', name: 'History', icon: History },
  { id: 'status', name: 'Device Status', icon: Activity },
  { id: 'alerts', name: 'Emergency Alerts', icon: ShieldAlert },
  { id: 'admin', name: 'Admin Control', icon: Settings },
  { id: 'creators', name: 'Creators Info', icon: Users },
];

export default function Navigation({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aquapulse_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aquapulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSelectTab = (id) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Interactive Trigger Icon Button (Visible on mobile screens) */}
      <button 
        className="nav-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        title={isOpen ? "Close menu" : "Open navigation menu"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Dark backdrop overlay when navigation drawer is open */}
      {isOpen && (
        <div 
          className="nav-overlay-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Left Small Theme Toggle Icon Button */}
      <button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* Navigation Sidebar Drawer */}
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="nav-logo">
          <Waves className="gradient-text" size={32} />
          <span style={{ fontWeight: 800, letterSpacing: '0.5px' }}>AquaPulse</span>
        </div>
        <ul className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li 
                key={item.id} 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectTab(item.id)}
              >
                <a href={`#${item.id}`} onClick={(e) => e.preventDefault()}>
                  <Icon size={20} />
                  <span>{item.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}

