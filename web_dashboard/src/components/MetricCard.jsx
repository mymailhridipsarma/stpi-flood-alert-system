import React from 'react';

export default function MetricCard({ title, value, icon: Icon, statusText, statusType, unit, disableDynamicTheme = false }) {
  const getBadgeClass = () => {
    switch (statusType) {
      case 'success': return 'badge-safe';
      case 'warning': return 'badge-risky';
      case 'danger': return 'badge-danger';
      default: return '';
    }
  };

  const getThemeStyle = () => {
    if (disableDynamicTheme) return { transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };

    switch (statusType) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.35), 0 0 20px rgba(16, 185, 129, 0.25)',
          color: '#ffffff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.35), 0 0 20px rgba(245, 158, 11, 0.25)',
          color: '#ffffff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.5), 0 0 25px rgba(239, 68, 68, 0.4)',
          color: '#ffffff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        };
      default:
        return { transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
    }
  };

  const themeStyle = getThemeStyle();
  const isCustomThemed = !disableDynamicTheme && (statusType === 'success' || statusType === 'warning' || statusType === 'danger');

  return (
    <div className="glass-panel metric-card" style={themeStyle}>
      <div 
        className="metric-header" 
        style={{ 
          color: isCustomThemed ? '#ffffff' : undefined, 
          fontWeight: isCustomThemed ? 700 : undefined,
          opacity: isCustomThemed ? 0.95 : undefined
        }}
      >
        <span>{title}</span>
        {Icon && <Icon size={18} style={{ color: isCustomThemed ? '#ffffff' : 'hsl(var(--primary))' }} />}
      </div>
      <div 
        className="metric-value" 
        style={{ 
          color: isCustomThemed ? '#ffffff' : undefined, 
          fontWeight: isCustomThemed ? 800 : undefined,
          textShadow: isCustomThemed ? '0 2px 12px rgba(0, 0, 0, 0.35)' : undefined 
        }}
      >
        {value}
        {unit && (
          <span 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              marginLeft: '6px', 
              color: isCustomThemed ? '#ffffff' : 'hsl(var(--text-secondary))',
              opacity: isCustomThemed ? 0.9 : 1
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
            style={isCustomThemed ? {
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
