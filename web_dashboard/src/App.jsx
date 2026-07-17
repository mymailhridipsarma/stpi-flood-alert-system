import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Camera from './pages/Camera';
import DeviceStatus from './pages/DeviceStatus';
import Admin from './pages/Admin';

const API_BASE_URL = `http://${window.location.hostname}:8000/api/v1`;

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [devices, setDevices] = useState([]);
  const [statusLogs, setStatusLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [detections, setDetections] = useState([]);

  // Fetch telemetry and alerts data from API
  const fetchData = async () => {
    try {
      // Fetch devices
      const devRes = await fetch(`${API_BASE_URL}/device/list`);
      if (devRes.ok) {
        const devData = await devRes.json();
        if (devData.length > 0) setDevices(devData);
      }

      // Fetch history
      const activeDevId = devices[0]?.device_id || 'DEV-ESP32-MAIN-001';
      const histRes = await fetch(`${API_BASE_URL}/history?device_id=${activeDevId}`);
      if (histRes.ok) {
        const histData = await histRes.json();
        if (histData.length > 0) setStatusLogs(histData);
      }

      // Fetch alerts
      const alertRes = await fetch(`${API_BASE_URL}/alerts`);
      if (alertRes.ok) {
        const alertData = await alertRes.json();
        setAlerts(alertData);
      }

      // Fetch detections
      const detRes = await fetch(`${API_BASE_URL}/object/recent`);
      if (detRes.ok) {
        const detData = await detRes.json();
        if (detData.length > 0) setDetections(detData);
      }
    } catch (error) {
      console.warn('FastAPI backend offline. Operating in simulation mode with local states.');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [devices[0]?.device_id]);

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
      case 'camera':
        return <Camera detections={detections} statusLogs={statusLogs} />;
      case 'status':
        return <DeviceStatus devices={devices} statusLogs={statusLogs} />;
      case 'admin':
        return <Admin />;
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
