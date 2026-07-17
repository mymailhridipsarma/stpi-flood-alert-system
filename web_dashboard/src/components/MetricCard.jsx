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

  return (
    <div className="glass-panel metric-card">
      <div className="metric-header">
        <span>{title}</span>
        {Icon && <Icon size={18} style={{ color: 'hsl(var(--primary))' }} />}
      </div>
      <div className="metric-value">
        {value}
        {unit && <span style={{ fontSize: '1.25rem', fontWeight: 500, marginLeft: '4px', color: 'hsl(var(--text-secondary))' }}>{unit}</span>}
      </div>
      {statusText && (
        <div className="metric-status">
          <span className={`badge ${getBadgeClass()}`}>{statusText}</span>
        </div>
      )}
    </div>
  );
}
