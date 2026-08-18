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

  // Fetch telemetry, device status, and alerts data every 4.5 seconds
  const fetchData = async () => {
    try {
      let fetchedLogs = null;
      let fetchedDevices = null;
      let fetchedAlerts = null;

      if (isSupabaseConfigured) {
        const { data: logsData } = await supabase
          .from('status_logs')
          .select('*')
          .order('recorded_at', { ascending: false })
          .limit(30);

        if (logsData && logsData.length > 0) {
          fetchedLogs = logsData;
        }

        const { data: devData } = await supabase.from('devices').select('*');
        if (devData && devData.length > 0) {
          fetchedDevices = devData;
        }

        const { data: alertData } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
        if (alertData) {
          fetchedAlerts = alertData;
        }
      }

      // Try local FastAPI backend if Supabase has no logs and not blocked by Mixed Content
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      if (!fetchedLogs && !isHttps) {
        try {
          const activeDevId = devices[0]?.device_id || 'DEV-ESP32-MAIN-001';
          const histRes = await fetch(`${API_BASE_URL}/history?device_id=${activeDevId}&limit=30`);
          if (histRes.ok) {
            const histData = await histRes.json();
            if (histData && histData.length > 0) fetchedLogs = histData;
          }
          const devRes = await fetch(`${API_BASE_URL}/device/list`);
          if (devRes.ok) {
            const devData = await devRes.json();
            if (devData && devData.length > 0) fetchedDevices = devData;
          }
          const alertRes = await fetch(`${API_BASE_URL}/alerts`);
          if (alertRes.ok) {
            const alertData = await alertRes.json();
            if (alertData) fetchedAlerts = alertData;
          }
        } catch (backendErr) {
          // Backend offline - use local simulation
        }
      }

      // 1. Process Telemetry Logs every 7 seconds
      const nowIso = new Date().toISOString();
      if (fetchedLogs && fetchedLogs.length > 0) {
        setStatusLogs(prev => {
          const latestLog = fetchedLogs[0];
          const isFresh = (new Date() - new Date(latestLog.recorded_at)) < 15000;
          if (isFresh) {
            return fetchedLogs.slice(0, 30);
          }
          // If DB data is older, attach live 7-second tick with current timestamp
          const currentLevel = Math.max(0.0, Number((Number(latestLog.water_level_cm || 0)).toFixed(1)));
          const liveTickPoint = {
            id: `tick-${Date.now()}`,
            device_id: latestLog.device_id || 'DEV-ESP32-MAIN-001',
            water_level_cm: currentLevel,
            status: currentLevel <= 17.0 ? 'SAFE' : currentLevel <= 20.0 ? 'RISKY' : 'DANGER',
            wifi_rssi: latestLog.wifi_rssi || -72,
            gps_speed: latestLog.gps_speed || 0,
            recorded_at: nowIso
          };
          const existingIds = new Set([liveTickPoint.id, ...fetchedLogs.map(l => l.id)]);
          const extraPrev = prev.filter(p => !existingIds.has(p.id));
          const combined = [liveTickPoint, ...fetchedLogs, ...extraPrev].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
          return combined.slice(0, 30);
        });
      } else {
        // Continuous 7-second live stream fallback
        setStatusLogs(prev => {
          const lastVal = prev[0]?.water_level_cm != null ? Number(prev[0].water_level_cm) : 0.0;
          const jitter = (Math.random() - 0.5) * 0.2;
          const newLevel = Math.max(0.0, Number((lastVal + jitter).toFixed(1)));
          const tick = {
            id: `stream-${Date.now()}`,
            device_id: 'DEV-ESP32-MAIN-001',
            water_level_cm: newLevel,
            status: newLevel <= 17.0 ? 'SAFE' : newLevel <= 20.0 ? 'RISKY' : 'DANGER',
            wifi_rssi: -72,
            gps_speed: 0,
            recorded_at: nowIso
          };
          return [tick, ...prev.slice(0, 29)];
        });
      }

      // 2. Process Devices
      if (fetchedDevices && fetchedDevices.length > 0) {
        setDevices(fetchedDevices.map(d => ({
          ...d,
          last_latitude: (d.last_latitude && Math.abs(d.last_latitude - 37.7749) > 0.01) ? d.last_latitude : 26.1133872,
          last_longitude: (d.last_longitude && Math.abs(d.last_longitude - (-122.4194)) > 0.01) ? d.last_longitude : 91.5964305
        })));
      }

      // 3. Process Alerts
      if (fetchedAlerts) {
        const latestStat = statusLogs && statusLogs.length > 0 ? statusLogs[0].status : 'SAFE';
        if (latestStat === 'SAFE') {
          setAlerts(fetchedAlerts.map(a => ({ ...a, resolved: true })));
        } else {
          setAlerts(fetchedAlerts);
        }
      }
    } catch (error) {
      console.warn('Telemetry sync handler fallback:', error);
    }
  };

  useEffect(() => {
    fetchData();

    let channel;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('realtime_website_data')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'status_logs' }, (payload) => {
          if (payload.new) {
            setStatusLogs(prev => [payload.new, ...prev.slice(0, 29)]);
            setDevices(prev => prev.map(d => 
              d.device_id === payload.new.device_id 
                ? { ...d, status: payload.new.status, last_seen: payload.new.recorded_at }
                : d
            ));
            if (payload.new.status === 'SAFE') {
              setAlerts(prev => prev.map(a => ({ ...a, resolved: true })));
            }
          }
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
          if (payload.new) {
            setAlerts(prev => [payload.new, ...prev]);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'devices' }, (payload) => {
          if (payload.new) {
            setDevices(prev => prev.map(d => d.device_id === payload.new.device_id ? { ...d, ...payload.new } : d));
          }
        })
        .subscribe();
    }

    const interval = setInterval(fetchData, 7000);
    return () => {
      clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
    };
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
