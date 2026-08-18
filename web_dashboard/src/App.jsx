import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';
import History from './pages/History';
import DeviceStatus from './pages/DeviceStatus';
import AlertsView from './pages/AlertsView';
import Admin from './pages/Admin';
import CreatorsInfo from './pages/CreatorsInfo';
import { BellRing, Volume2, VolumeX, X } from 'lucide-react';
import { sendTelegramAlert } from './services/telegram';

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
  const [detections, setDetections] = useState([]);

  // Global Alert State (Applies across all tabs: dashboard, map, analytics, history, status, etc.)
  const [toastDismissed, setToastDismissed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);
  const lastAlertTimeRef = useRef(0);

  const isFetchingRef = useRef(false);

  const latestLog = statusLogs[0] || {};
  const isDanger = latestLog?.status?.toUpperCase() === 'DANGER';

  // 1. Global Custom Alert Audio Player across ALL tabs
  useEffect(() => {
    if (isDanger && soundEnabled) {
      if (!audioRef.current) {
        audioRef.current = new Audio('/ALERT_SOUND/freesound_community-alert-33762.mp3');
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch((err) => {
        console.warn("Audio autoplay blocked by browser policy (user interaction required):", err);
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isDanger, soundEnabled]);

  // 2. Global Telegram Alert Trigger
  useEffect(() => {
    if (isDanger) {
      const now = Date.now();
      if (now - lastAlertTimeRef.current > 120000) {
        lastAlertTimeRef.current = now;
        sendTelegramAlert('DANGER', latestLog.water_level_cm, devices[0]?.device_id);
      }
    } else {
      setToastDismissed(false);
    }
  }, [isDanger, latestLog?.water_level_cm]);

  // Fetch telemetry and alerts data from API or Supabase
  const fetchData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
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
        
        const { data: detData } = await supabase.from('object_detections').select('*').order('detected_at', { ascending: false }).limit(20);
        if (detData) setDetections(detData);
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
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);

    let channel = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('realtime_status_logs')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'status_logs' },
          (payload) => {
            if (payload.new) {
              const newLog = payload.new;
              setStatusLogs((prev) => [newLog, ...prev.slice(0, 19)]);
              setDevices([
                {
                  device_id: newLog.device_id || 'DEV-ESP32-MAIN-001',
                  name: 'AquaPulse Flood Node',
                  status: newLog.status || 'SAFE',
                  last_seen: newLog.recorded_at,
                  last_latitude: 37.7749,
                  last_longitude: -122.4194
                }
              ]);
            }
          }
        )
        .subscribe();
    }

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
      case 'alerts':
        return <AlertsView alerts={alerts} statusLogs={statusLogs} devices={devices} />;
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
    <div className={getContainerClass()} style={{ position: 'relative' }}>
      
      {/* 3. Global Top-Right Emergency Alert Toast Notification (Visible across ALL tabs) */}
      {isDanger && !toastDismissed && (
        <div 
          className="danger-toast-notification"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.5), 0 0 25px rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            maxWidth: '380px',
            animation: 'slideInRight 0.4s ease-out'
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%', display: 'flex' }}>
            <BellRing size={24} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.5px' }}>
              🚨 CRITICAL FLOOD ALERT
            </h4>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', opacity: 0.95, lineHeight: '1.3' }}>
              DANGER Status Detected! Water level at <b>{(Number(latestLog.water_level_cm) || 0).toFixed(1)} cm</b>.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute Alert Audio" : "Unmute Alert Audio"}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex'
              }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={() => setToastDismissed(true)}
              title="Dismiss Alert"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
