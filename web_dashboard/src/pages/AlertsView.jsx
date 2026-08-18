import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, BellRing, Filter, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { sendTelegramAlert } from '../services/telegram';

export default function AlertsView({ alerts = [], statusLogs = [], devices = [] }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'resolved'
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const latestLog = statusLogs[0] || {};
  const isDanger = latestLog?.status?.toUpperCase() === 'DANGER';

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return !alert.resolved;
    if (filter === 'resolved') return alert.resolved;
    return true;
  });

  const handleManualTelegramBroadcast = async (e) => {
    e.preventDefault();
    setIsSendingTelegram(true);
    try {
      await sendTelegramAlert(
        latestLog.status || 'DANGER', 
        latestLog.water_level_cm || 0, 
        devices[0]?.device_id
      );
      setBroadcastMessage('🎉 Telegram Alert Broadcast Sent Successfully!');
      setTimeout(() => setBroadcastMessage(''), 4000);
    } catch (err) {
      setBroadcastMessage('❌ Failed to send Telegram Broadcast.');
    } finally {
      setIsSendingTelegram(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Emergency Alerts Console</h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Centralized emergency broadcast and alert monitoring hub</p>
        </div>
        <button
          onClick={handleManualTelegramBroadcast}
          disabled={isSendingTelegram}
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '10px',
            color: '#ffffff',
            fontWeight: 700,
            cursor: isSendingTelegram ? 'wait' : 'pointer',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
          }}
        >
          <BellRing size={18} />
          {isSendingTelegram ? 'Broadcasting...' : 'Broadcast Telegram Alert'}
        </button>
      </header>

      {broadcastMessage && (
        <div style={{
          marginBottom: '24px',
          padding: '14px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#10b981',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {broadcastMessage}
        </div>
      )}

      {/* Real-time System Status Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '32px',
          background: isDanger 
            ? 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' 
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.1) 100%)',
          border: isDanger ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: isDanger ? '0 10px 30px rgba(239, 68, 68, 0.5)' : undefined,
          color: isDanger ? '#ffffff' : 'hsl(var(--text-primary))'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '50%', background: isDanger ? 'rgba(255,255,255,0.25)' : 'rgba(16, 185, 129, 0.2)' }}>
            <AlertTriangle size={32} style={{ color: isDanger ? '#ffffff' : '#10b981' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
              {isDanger ? '🚨 CRITICAL FLOOD EMERGENCY ACTIVE' : '✅ SYSTEM NOMINAL — NO ACTIVE FLOOD EMERGENCY'}
            </h3>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
              Current Water Level: <b>{(Number(latestLog.water_level_cm) || 0).toFixed(1)} cm</b> | Status: <b>{latestLog.status || 'SAFE'}</b>
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setFilter('all')}
          className="glass-panel"
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: filter === 'all' ? '1px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
            background: filter === 'all' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.02)',
            color: filter === 'all' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className="glass-panel"
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: filter === 'active' ? '1px solid #ef4444' : '1px solid hsl(var(--border))',
            background: filter === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.02)',
            color: filter === 'active' ? '#ef4444' : 'hsl(var(--text-secondary))',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Active Danger ({alerts.filter(a => !a.resolved).length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className="glass-panel"
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: filter === 'resolved' ? '1px solid #10b981' : '1px solid hsl(var(--border))',
            background: filter === 'resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.02)',
            color: filter === 'resolved' ? '#10b981' : 'hsl(var(--text-secondary))',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Resolved ({alerts.filter(a => a.resolved).length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'hsl(var(--text-muted))' }}>
            <CheckCircle2 size={48} style={{ color: '#10b981', marginBottom: '12px', opacity: 0.8 }} />
            <h3>No emergency alerts found for this filter</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderLeft: `5px solid ${alert.resolved ? '#10b981' : '#ef4444'}`,
                  borderTop: '1px solid hsl(var(--border))',
                  borderRight: '1px solid hsl(var(--border))',
                  borderBottom: '1px solid hsl(var(--border))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span 
                      style={{ 
                        fontWeight: 700, 
                        fontSize: '0.95rem',
                        color: alert.resolved ? '#10b981' : '#ef4444'
                      }}
                    >
                      {alert.alert_type}
                    </span>
                    <span 
                      className={`badge ${alert.resolved ? 'badge-safe' : 'badge-danger'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {alert.resolved ? 'RESOLVED' : 'ACTIVE DANGER'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', color: 'hsl(var(--text-primary))', fontSize: '0.9rem' }}>
                    {alert.message}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'hsl(var(--text-muted))' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      Created: {new Date(alert.created_at).toLocaleString()}
                    </span>
                    {alert.device_id && <span>Node: {alert.device_id}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
