import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function HistoryChart({ data = [] }) {
  // Format dates for display
  const chartData = (data || []).map(item => ({
    time: item?.recorded_at ? new Date(item.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
    'Water Level (cm)': item?.water_level_cm != null ? Number(item.water_level_cm) : 0,
  })).reverse(); // Reverse to read chronologically (left to right)

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--table-border)" opacity={0.6} />
          <XAxis 
            dataKey="time" 
            stroke="var(--text-secondary-color)" 
            fontSize={12} 
            tickLine={false} 
          />
          <YAxis 
            stroke="var(--text-secondary-color)" 
            fontSize={12} 
            tickLine={false}
            domain={[-5, 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--glass-bg)', 
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderColor: 'var(--glass-border)',
              color: 'var(--text-primary-color)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              fontWeight: 600
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="Water Level (cm)" 
            stroke="#0284c7" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorLevel)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
