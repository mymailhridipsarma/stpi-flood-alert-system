import React from 'react';
import LiveMap from '../components/LiveMap';

export default function MapView({ devices }) {
  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Geospatial Map</h1>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Node location tracking and regional status mappings</p>
      </header>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <LiveMap devices={devices} />
      </div>
    </div>
  );
}
