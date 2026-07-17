import React, { useState } from 'react';
import { Download, Search, Filter, Calendar } from 'lucide-react';

export default function History({ statusLogs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter logs based on search and status dropdown
  const filteredLogs = statusLogs.filter(log => {
    const matchesSearch = log.device_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export filtered logs to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Device ID', 'Water Level (cm)', 'Status', 'Timestamp'];
    const rows = filteredLogs.map(log => [
      log.id || '',
      log.device_id,
      log.water_level_cm,
      log.status,
      log.recorded_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flood_telemetry_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Historical Log</h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Browse and analyze historical sensor telemetry logs</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="glass-panel" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 20px', 
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(79, 172, 254, 0.1) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: '12px',
            color: 'hsl(var(--primary))',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Download size={18} />
          Export CSV
        </button>
      </header>

      {/* Filters Area */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
          <input 
            type="text" 
            placeholder="Search by Device ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              borderRadius: '10px',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: 'hsl(var(--text-primary))',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ width: '180px', position: 'relative' }}>
          <Filter size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              borderRadius: '10px',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: 'hsl(var(--text-primary))',
              fontSize: '0.9rem',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SAFE">Safe</option>
            <option value="RISKY">Risky</option>
            <option value="DANGER">Danger</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
            No records match the active filters.
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Water Level</th>
                <th>Status</th>
                <th>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={log.id || idx}>
                  <td style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{log.device_id}</td>
                  <td>{log.water_level_cm.toFixed(1)} cm</td>
                  <td>
                    <span className={`badge ${
                      log.status === 'SAFE' ? 'badge-safe' : 
                      log.status === 'RISKY' ? 'badge-risky' : 'badge-danger'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ color: 'hsl(var(--text-secondary))' }}>
                    {new Date(log.recorded_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
