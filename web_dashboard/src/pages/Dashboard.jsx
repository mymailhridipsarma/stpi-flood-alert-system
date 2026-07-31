import React, { useEffect, useState, useRef } from 'react';
import { Shield, ShieldAlert, Navigation as NavIcon, BellRing, Volume2, VolumeX, X } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import HistoryChart from '../components/HistoryChart';
import { sendTelegramAlert } from '../services/telegram';

export default function Dashboard({ statusLogs = [], devices = [], alerts = [] }) {
  const [toastDismissed, setToastDismissed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);
  const lastAlertTimeRef = useRef(0);

  // Extract latest report or fallback to empty state
  const latestLog = statusLogs[0] || {
    water_level_cm: 0,
    status: 'OFFLINE',
    wifi_rssi: 0,
    recorded_at: null
  };

  const isDanger = latestLog?.status?.toUpperCase() === 'DANGER';

  const getStatusType = (status) => {
    switch (status?.toUpperCase()) {
      case 'SAFE': return 'success';
      case 'RISKY': return 'warning';
      case 'DANGER': return 'danger';
      default: return 'info';
    }
  };

  // 1. Play custom alert audio file (freesound_community-alert-33762.mp3) on Danger
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

  // 2. Trigger Telegram Alert on Danger
  useEffect(() => {
    if (isDanger) {
      const now = Date.now();
      if (now - lastAlertTimeRef.current > 120000) {
        lastAlertTimeRef.current = now;
        sendTelegramAlert('DANGER', latestLog.water_level_cm, devices[0]?.device_id);
      }
    }
  }, [isDanger, latestLog?.water_level_cm]);

  // Reset toast dismissal if status reverts to non-danger then back to danger
  useEffect(() => {
    if (!isDanger) {
      setToastDismissed(false);
    }
  }, [isDanger]);

  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <div style={{ position: 'relative' }}>
      
      {/* 3. Top-Right Emergency Alert Toast Notification */}
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

      <header style={{ marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Real-time AquaPulse water logging and warning console</p>
      </header>

      {/* Primary Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Water Level"
          value={(latestLog.water_level_cm != null ? Number(latestLog.water_level_cm) : 0).toFixed(1)}
          unit="cm"
          icon={Shield}
          statusText={latestLog.status}
          statusType={getStatusType(latestLog.status)}
        />
        <MetricCard
          title="Emergency Alerts"
          value={activeAlerts.length}
          icon={ShieldAlert}
          statusText={activeAlerts.length > 0 ? "ACTION REQUIRED" : "ALL SYSTEMS NOMINAL"}
          statusType={activeAlerts.length > 0 ? "danger" : "success"}
        />
        <MetricCard
          title="Monitored Nodes"
          value={devices.length}
          icon={NavIcon}
          statusText="AquaPulse node active"
          statusType="success"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '32px' }}>
        {/* Telemetry Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600 }}>Water Level History (Dynamic Feed)</h3>
          <HistoryChart data={statusLogs} />
        </div>

        {/* Alerts Center Feed */}
        <div className="glass-panel" style={{ padding: '24px', maxHeight: '380px', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600 }}>System Alerts Logs</h3>
          {alerts.length === 0 ? (
            <p style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', marginTop: '40px' }}>No active notifications</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {alerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id} 
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.02)', 
                    borderLeft: `4px solid ${alert.resolved ? 'rgba(239, 68, 68, 0.4)' : '#ef4444'}` 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{alert.alert_type}</span>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
