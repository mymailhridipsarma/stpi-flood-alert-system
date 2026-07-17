import React from 'react';
import { Shield, Radio, ShieldAlert, Navigation as NavIcon, Eye } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import HistoryChart from '../components/HistoryChart';

export default function Dashboard({ statusLogs, devices, alerts }) {
  // Extract latest report or fallback to empty state
  const latestLog = statusLogs[0] || {
    water_level_cm: 0,
    status: 'OFFLINE',
    wifi_rssi: 0,
    recorded_at: null
  };

  const getStatusType = (status) => {
    switch (status?.toUpperCase()) {
      case 'SAFE': return 'success';
      case 'RISKY': return 'warning';
      case 'DANGER': return 'danger';
      default: return 'info';
    }
  };

  // Find active alerts count
  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Real-time water logging and warning console</p>
      </header>

      {/* Primary Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Water Level"
          value={latestLog.water_level_cm.toFixed(1)}
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
          statusText="Devices registered"
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
