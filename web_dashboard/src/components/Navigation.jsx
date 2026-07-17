import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  BarChart3, 
  History, 
  Camera, 
  Activity, 
  Settings, 
  Waves 
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', name: 'Live Map', icon: Map },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'history', name: 'History', icon: History },
  { id: 'camera', name: 'Camera Feed', icon: Camera },
  { id: 'status', name: 'Device Status', icon: Activity },
  { id: 'admin', name: 'Admin Control', icon: Settings },
];

export default function Navigation({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="nav-logo">
        <Waves className="gradient-text" size={32} />
        <span style={{ fontWeight: 800, letterSpacing: '0.5px' }}>SmartFlood</span>
      </div>
      <ul className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li 
              key={item.id} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <a href={`#${item.id}`} onClick={(e) => e.preventDefault()}>
                <Icon size={20} />
                <span>{item.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <div style={{ marginTop: 'auto', padding: '12px 16px', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
        v1.0.0 (ESP32)
      </div>
    </aside>
  );
}
