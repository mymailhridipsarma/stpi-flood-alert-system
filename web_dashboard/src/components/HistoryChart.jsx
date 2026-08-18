import React, { useState, useEffect } from 'react';
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
  const [flowingPoints, setFlowingPoints] = useState([]);

  // Get latest water level reading
  const latestItem = data && data.length > 0 ? data[0] : null;
  const latestWaterLevel = latestItem?.water_level_cm != null ? Number(latestItem.water_level_cm) : 0;

  // Keep the graph flowing continuously every 1 second, even if water level reading is static
  useEffect(() => {
    const updateFlow = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setFlowingPoints(prev => {
        const newPoint = {
          time: timeStr,
          'Water Level (cm)': latestWaterLevel
        };

        // Initialize timeline points on first render
        if (prev.length === 0) {
          const initialPoints = [];
          for (let i = 19; i >= 0; i--) {
            const pastTime = new Date(now.getTime() - i * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const historicalVal = data && data[i] && data[i].water_level_cm != null ? Number(data[i].water_level_cm) : latestWaterLevel;
            initialPoints.push({
              time: pastTime,
              'Water Level (cm)': historicalVal
            });
          }
          return initialPoints;
        }

        // Append new timestamped point and slide window (keep last 20 points flowing)
        const updated = [...prev, newPoint];
        return updated.slice(-20);
      });
    };

    updateFlow();
    const interval = setInterval(updateFlow, 1000);
    return () => clearInterval(interval);
  }, [latestWaterLevel]);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={flowingPoints}
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
            fontSize={11} 
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
            isAnimationActive={true}
            animationDuration={300}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
