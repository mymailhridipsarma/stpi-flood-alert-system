import React from 'react';
import { 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

export default function Analytics({ statusLogs = [] }) {
  const distributionData = [
    { name: 'SAFE', counts: statusLogs.filter(l => l.status === 'SAFE').length, color: '#10b981' },
    { name: 'RISKY', counts: statusLogs.filter(l => l.status === 'RISKY').length, color: '#f59e0b' },
    { name: 'DANGER', counts: statusLogs.filter(l => l.status === 'DANGER').length, color: '#ef4444' }
  ];

  const speedData = (statusLogs || []).map((l, i) => ({
    index: i + 1,
    speed: l.gps_speed || 0,
    level: l.water_level_cm != null ? Number(l.water_level_cm) : 0
  })).reverse();

  const tooltipStyle = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderColor: 'var(--glass-border)',
    color: 'var(--text-primary-color)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    fontWeight: 600
  };

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Analytics & Reports</h1>
        <p style={{ color: 'var(--text-secondary-color)' }}>Data correlation and statistical node metrics</p>
      </header>

      <div className="analytics-grid">
        {/* Risk Distribution Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600 }}>Risk Status Frequency</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--table-border)" opacity={0.6} />
                <XAxis dataKey="name" stroke="var(--text-secondary-color)" />
                <YAxis stroke="var(--text-secondary-color)" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="counts" radius={[6, 6, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Speed vs Water Level Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600 }}>Traffic Speed vs. Flood Depth</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--table-border)" opacity={0.6} />
                <XAxis dataKey="index" stroke="var(--text-secondary-color)" />
                <YAxis stroke="var(--text-secondary-color)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: 'var(--text-primary-color)' }} />
                <Line type="monotone" dataKey="speed" stroke="#f59e0b" name="Avg Speed (km/h)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="level" stroke="#0284c7" name="Water Depth (cm)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
