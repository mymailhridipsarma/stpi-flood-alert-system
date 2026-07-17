import React, { useState } from 'react';
import { Camera as CamIcon, AlertTriangle, ShieldCheck, Eye, Clock } from 'lucide-react';

export default function Camera({ detections, statusLogs }) {
  const [selectedDetection, setSelectedDetection] = useState(null);

  // Extract latest detection or fallback to null
  const latestDetection = detections[0] || null;

  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return '#10b981'; // Green
    if (conf >= 0.5) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const activeObj = selectedDetection || latestDetection;

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>AI Camera Feed</h1>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Real-time object recognition and visual hazard detection</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
        {/* Live Snapshots Monitor */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CamIcon size={20} style={{ color: '#00f2fe' }} />
              Latest Snapshot
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              {activeObj?.detected_at ? new Date(activeObj.detected_at).toLocaleString() : 'Just now'}
            </span>
          </div>

          {/* Image Container with SVG Bounding Box overlay */}
          <div style={{ 
            position: 'relative', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '1px solid hsl(var(--border))', 
            backgroundColor: '#000',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {activeObj?.image_url ? (
              <>
                <img 
                  src={activeObj.image_url} 
                  alt="ESP32-CAM" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                />
                
                {/* SVG Bounding Box Overlay */}
                {activeObj.bounding_box && (
                  <svg 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      pointerEvents: 'none' 
                    }}
                    viewBox="0 0 640 480"
                    preserveAspectRatio="none"
                  >
                    <rect 
                      x={activeObj.bounding_box.x || 100} 
                      y={activeObj.bounding_box.y || 100} 
                      width={activeObj.bounding_box.width || activeObj.bounding_box.w || 200} 
                      height={activeObj.bounding_box.height || activeObj.bounding_box.h || 150} 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="4" 
                      strokeDasharray="4"
                    />
                    <text 
                      x={(activeObj.bounding_box.x || 100) + 10} 
                      y={(activeObj.bounding_box.y || 100) + 30} 
                      fill="#ef4444" 
                      fontSize="20" 
                      fontWeight="bold"
                      style={{ filter: 'drop-shadow(2px 2px 2px black)' }}
                    >
                      {activeObj.object_name.toUpperCase()} ({(activeObj.confidence * 100).toFixed(0)}%)
                    </text>
                  </svg>
                )}
              </>
            ) : (
              <p style={{ color: 'hsl(var(--text-muted))' }}>No feeds uploaded yet</p>
            )}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <div style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid hsl(var(--border))'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Detected Hazard</span>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginTop: '4px' }}>
                {activeObj?.object_name ? activeObj.object_name.toUpperCase() : 'NONE'}
              </p>
            </div>
            <div style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid hsl(var(--border))'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Confidence Score</span>
              <p style={{ 
                fontWeight: 700, 
                fontSize: '1.1rem', 
                color: getConfidenceColor(activeObj?.confidence), 
                marginTop: '4px' 
              }}>
                {activeObj?.confidence ? (activeObj.confidence * 100).toFixed(1) + '%' : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* AI Object History List */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>Detections Log</h3>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {detections.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', marginTop: '50px' }}>No detection history</p>
            ) : (
              detections.map((det) => (
                <div 
                  key={det.id}
                  onClick={() => setSelectedDetection(det)}
                  style={{ 
                    padding: '14px', 
                    borderRadius: '10px', 
                    background: activeObj?.id === det.id ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255,255,255,0.02)', 
                    border: activeObj?.id === det.id ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid hsl(var(--border))',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeObj?.id !== det.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    if (activeObj?.id !== det.id) e.currentTarget.style.borderColor = 'hsl(var(--border))';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{det.object_name.toUpperCase()}</span>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 600, 
                      color: getConfidenceColor(det.confidence) 
                    }}>
                      {(det.confidence * 100).toFixed(0)}% Conf.
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Device ID: {det.device_id}</span>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                      {new Date(det.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
