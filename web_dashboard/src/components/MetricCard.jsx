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

  const cardStyle = isDanger ? {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(153, 27, 27, 0.25) 100%)',
    border: '1px solid rgba(239, 68, 68, 0.65)',
    boxShadow: '0 0 25px rgba(239, 68, 68, 0.3)',
    transition: 'all 0.3s ease'
  } : { transition: 'all 0.3s ease' };

  return (
    <div className="glass-panel metric-card" style={cardStyle}>
      <div className="metric-header" style={{ color: isDanger ? '#fecaca' : undefined, fontWeight: isDanger ? 600 : undefined }}>
        <span>{title}</span>
        {Icon && <Icon size={18} style={{ color: isDanger ? '#f87171' : 'hsl(var(--primary))' }} />}
      </div>
      <div className="metric-value" style={{ color: isDanger ? '#ffffff' : undefined, textShadow: isDanger ? '0 2px 10px rgba(0,0,0,0.5)' : undefined }}>
        {value}
        {unit && <span style={{ fontSize: '1.25rem', fontWeight: 600, marginLeft: '4px', color: isDanger ? '#fca5a5' : 'hsl(var(--text-secondary))' }}>{unit}</span>}
      </div>
      {statusText && (
        <div className="metric-status">
          <span className={`badge ${getBadgeClass()}`}>{statusText}</span>
        </div>
      )}
    </div>
  );
}
