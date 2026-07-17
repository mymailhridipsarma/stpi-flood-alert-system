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

export default function HistoryChart({ data }) {
  // Format dates for display
  const MAX_SENSOR_HEIGHT = 40; // Assume sensor is mounted 40cm above ground
  const chartData = data.map(item => ({
    time: new Date(item.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    'Distance (cm)': item.water_level_cm,
    'Water Height (cm)': Math.max(0, MAX_SENSOR_HEIGHT - item.water_level_cm),
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
              <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--text-secondary))" 
            fontSize={12} 
            tickLine={false} 
          />
          <YAxis 
            stroke="hsl(var(--text-secondary))" 
            fontSize={12} 
            tickLine={false}
            domain={[-10, 40]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderColor: 'hsl(var(--border))',
              color: '#fff',
              borderRadius: '8px'
            }} 
          />
          <Area 
            type="natural" 
            dataKey="Water Height (cm)" 
            stroke="#00f2fe" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorLevel)"
            isAnimationActive={true}
            animationDuration={400}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
