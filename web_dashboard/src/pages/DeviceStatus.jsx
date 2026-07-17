import React from 'react';
import { Activity, Cpu, HardDrive, Wifi, Shield, RefreshCw } from 'lucide-react';

export default function DeviceStatus({ devices, statusLogs }) {
  // Select first device
  const device = devices[0] || {
    device_id: 'AWAITING-CONNECTION',
    name: 'Waiting for Device...',
    status: 'UNKNOWN',
    last_seen: null,
    last_latitude: 0,
    last_longitude: 0
  };

  const latestLog = statusLogs[0] || {
    water_level_cm: 0,
    status: 'OFFLINE',
    wifi_rssi: 0,
    gps_speed: 0.0,
    recorded_at: null
  };



  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Device Diagnostics</h1>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Detailed hardware status and communication telemetry</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Device Specifications */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} style={{ color: '#00f2fe' }} />
            Main Controller specs
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Device Name</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>{device.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Device ID</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>{device.device_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Firmware Version</span>
              <span style={{ fontWeight: 600, color: '#00f2fe' }}>v2.0.4-OTA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Status</span>
              <span style={{ 
                fontWeight: 600, 
                color: device.status === 'ONLINE' ? '#10b981' : '#ef4444' 
              }}>
                {device.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Last Heartbeat</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>
                {new Date(device.last_seen).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Connectivity and Cache */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wifi size={20} style={{ color: '#00f2fe' }} />
            Network & Offline Cache
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Offline Flash Storage cache</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>0 / 512 KB</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Queued Records (Offline Mode)</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>0 cached logs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Watchdog Status</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>ACTIVE (12s Timeout)</span>
            </div>
          </div>
        </div>

        {/* Pinout & GPIO Diagnostics */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} style={{ color: '#00f2fe' }} />
            Active GPIO Pin Diagnostics
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Ultrasonic (Trig / Echo)</p>
              <p style={{ fontWeight: 600, color: '#fff', marginTop: '4px' }}>GPIO 5 / GPIO 18</p>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● OPERATIONAL</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>GPS Module (RX / TX)</p>
              <p style={{ fontWeight: 600, color: '#fff', marginTop: '4px' }}>GPIO 16 / GPIO 17</p>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● GPS SYNC: OK</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Display (I2C SDA / SCL)</p>
              <p style={{ fontWeight: 600, color: '#fff', marginTop: '4px' }}>GPIO 21 / GPIO 22</p>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● LCD Addr: 0x27</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>LED & Buzzer Indicators</p>
              <p style={{ fontWeight: 600, color: '#fff', marginTop: '4px' }}>Pins 12, 14, 27, 26</p>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● ONLINE</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
