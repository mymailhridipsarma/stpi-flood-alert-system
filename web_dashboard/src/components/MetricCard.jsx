import React from 'react';

export default function MetricCard({ title, value, icon: Icon, statusText, statusType, unit }) {
  const getBadgeClass = () => {
    switch (statusType) {
      case 'success': return 'badge-safe';
      case 'warning': return 'badge-risky';
      case 'danger': return 'badge-danger';
      default: return '';
    }
  };

  const isDanger = statusType === 'danger';

  // Exact same vibrant gradient and styling as top-right alert notification toast
  const cardStyle = isDanger ? {
    background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.5), 0 0 25px rgba(239, 68, 68, 0.4)',
    color: '#ffffff',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  } : { transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };

  return (
    <div className="glass-panel metric-card" style={cardStyle}>
      <div 
        className="metric-header" 
        style={{ 
          color: isDanger ? '#ffffff' : undefined, 
          fontWeight: isDanger ? 700 : undefined,
          opacity: isDanger ? 0.95 : undefined
        }}
      >
        <span>{title}</span>
        {Icon && <Icon size={18} style={{ color: isDanger ? '#ffffff' : 'hsl(var(--primary))' }} />}
      </div>
      <div 
        className="metric-value" 
        style={{ 
          color: isDanger ? '#ffffff' : undefined, 
          fontWeight: isDanger ? 800 : undefined,
          textShadow: isDanger ? '0 2px 12px rgba(0, 0, 0, 0.35)' : undefined 
        }}
      >
        {value}
        {unit && (
          <span 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              marginLeft: '6px', 
              color: isDanger ? '#ffffff' : 'hsl(var(--text-secondary))',
              opacity: isDanger ? 0.9 : 1
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {statusText && (
        <div className="metric-status">
          <span 
            className={`badge ${getBadgeClass()}`}
            style={isDanger ? {
              background: 'rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              fontWeight: 800,
              backdropFilter: 'blur(4px)'
            } : undefined}
          >
            {statusText}
          </span>
        </div>
      )}
    </div>
  );
}
