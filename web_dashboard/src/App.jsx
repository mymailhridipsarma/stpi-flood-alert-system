import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';
import History from './pages/History';
import DeviceStatus from './pages/DeviceStatus';
import Admin from './pages/Admin';
import CreatorsInfo from './pages/CreatorsInfo';

const DEFAULT_BACKEND_IP = '192.168.1.114';
const currentHost = window.location.hostname;
const backendHost = (currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost === '') ? currentHost : DEFAULT_BACKEND_IP;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${backendHost}:8000/api/v1`;

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [devices, setDevices] = useState([
    {
      device_id: 'DEV-ESP32-MAIN-001',
      name: 'Highway 101 Flood Node',
      status: 'SAFE',
      last_seen: new Date().toISOString(),
      last_latitude: 37.7749,
      last_longitude: -122.4194
    }
  ]);
  const [statusLogs, setStatusLogs] = useState([
    {
      id: 'init-001',
      device_id: 'DEV-ESP32-MAIN-001',
      water_level_cm: 0,
      status: 'SAFE',
      wifi_rssi: -75,
      gps_speed: 0,
      recorded_at: new Date().toISOString()
    }
  ]);
  const [alerts, setAlerts] = useState([]);

  // Fetch telemetry and alerts data from API or Supabase
  const fetchData = async () => {
    try {
      if (isSupabaseConfigured) {
        const { data: logsData } = await supabase
          .from('status_logs')
          .select('*')
          .order('recorded_at', { ascending: false })
          .limit(20);

        if (logsData && logsData.length > 0) {
          setStatusLogs(logsData);

          const latest = logsData[0];
          setDevices([
            {
              device_id: latest.device_id || 'DEV-ESP32-MAIN-001',
              name: 'AquaPulse Flood Node',
              status: latest.status || 'SAFE',
              last_seen: latest.recorded_at,
              last_latitude: 37.7749,
              last_longitude: -122.4194
            }
          ]);
        }

        const { data: alertData } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
        if (alertData) setAlerts(alertData);
        return;
      }

      // Fetch devices
      const devRes = await fetch(`${API_BASE_URL}/device/list`);
      if (devRes.ok) {
        const devData = await devRes.json();
        if (devData.length > 0) {
          setDevices(devData);
        }
      }

      // Fetch history
      const activeDevId = devices[0]?.device_id || 'DEV-ESP32-MAIN-001';
      const histRes = await fetch(`${API_BASE_URL}/history?device_id=${activeDevId}&limit=20`);
      if (histRes.ok) {
        const histData = await histRes.json();
        if (histData.length > 0) {
          setStatusLogs(prev => prev.length === 0 || prev[0].id !== histData[0].id ? histData : prev);
        }
      }

      // Fetch alerts
      const alertRes = await fetch(`${API_BASE_URL}/alerts`);
      if (alertRes.ok) {
        const alertData = await alertRes.json();
        setAlerts(prev => prev.length !== alertData.length || (alertData.length > 0 && prev[0]?.id !== alertData[0].id) ? alertData : prev);
      }
    } catch (error) {
      console.warn('FastAPI backend offline. Operating in simulation mode with local states.');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Render Page Content based on tab ID
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard statusLogs={statusLogs} devices={devices} alerts={alerts} />;
      case 'map':
        return <MapView devices={devices} />;
      case 'analytics':
        return <Analytics statusLogs={statusLogs} />;
      case 'history':
        return <History statusLogs={statusLogs} />;
      case 'status':
        return <DeviceStatus devices={devices} statusLogs={statusLogs} />;
      case 'admin':
        return <Admin />;
      case 'creators':
        return <CreatorsInfo />;
      default:
        return <Dashboard statusLogs={statusLogs} devices={devices} alerts={alerts} />;
    }
  };

  const latestStatus = statusLogs[0]?.status || 'UNKNOWN';
  const getContainerClass = () => {
    switch (latestStatus.toUpperCase()) {
      case 'SAFE': return 'app-container status-safe';
      case 'RISKY': return 'app-container status-risky';
      case 'DANGER': return 'app-container status-danger';
      default: return 'app-container';
    }
  };

  return (
    <div className={getContainerClass()}>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
