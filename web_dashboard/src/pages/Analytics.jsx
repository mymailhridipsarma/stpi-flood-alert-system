import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

export default function Analytics({ statusLogs }) {
  const distributionData = [
    { name: 'SAFE', counts: statusLogs.filter(l => l.status === 'SAFE').length },
    { name: 'RISKY', counts: statusLogs.filter(l => l.status === 'RISKY').length },
    { name: 'DANGER', counts: statusLogs.filter(l => l.status === 'DANGER').length }
  ];

  const speedData = statusLogs.map((l, i) => ({
    index: i,
    speed: l.gps_speed || 0,
    level: l.water_level_cm
  })).reverse();

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Analytics & Reports</h1>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Data correlation and statistical node metrics</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Risk Distribution Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600 }}>Risk Status Frequency</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="hsl(var(--text-secondary))" />
                <YAxis stroke="hsl(var(--text-secondary))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'hsl(var(--border))' }}
                />
                <Bar dataKey="counts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="index" stroke="hsl(var(--text-secondary))" />
                <YAxis stroke="hsl(var(--text-secondary))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'hsl(var(--border))' }}
                />
                <Legend />
                <Line type="monotone" dataKey="speed" stroke="#f59e0b" name="Avg Speed (km/h)" strokeWidth={2} />
                <Line type="monotone" dataKey="level" stroke="#ef4444" name="Water Depth (cm)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
