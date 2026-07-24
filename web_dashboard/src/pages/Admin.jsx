import React, { useState } from 'react';
import { Settings, ShieldAlert, Phone, HardDrive, BellRing, Save } from 'lucide-react';

export default function Admin() {
  const [safeThreshold, setSafeThreshold] = useState(15);
  const [riskyThreshold, setRiskyThreshold] = useState(30);
  const [contacts, setContacts] = useState([
    { name: 'City Disaster Response', phone: '+91 98765 01990', type: 'Primary' },
    { name: 'Municipal Highway Patrol', phone: '+91 98765 01200', type: 'Secondary' }
  ]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'Primary' });
  const [alertConfig, setAlertConfig] = useState({
    sendSms: true,
    sendPush: true,
    soundSiren: true,
    captureInterval: 5
  });

  const saveThresholds = (e) => {
    e.preventDefault();
    alert(`Thresholds updated: Safe up to ${safeThreshold}cm, Risky up to ${riskyThreshold}cm. Config pushed to ESP32 OTA queue.`);
  };

  const addContact = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    setContacts([...contacts, newContact]);
    setNewContact({ name: '', phone: '', type: 'Primary' });
  };

  const deleteContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  return (
    <div>
      <header style={{ marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Admin Settings</h1>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Configure thresholds, alarm limits, and alert integrations</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Water Level Threshold Config */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} style={{ color: 'hsl(var(--primary))' }} />
            Flood Alert Thresholds
          </h3>
          <form onSubmit={saveThresholds} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '8px' }}>
                Safe Water Level Limit (cm)
              </label>
              <input 
                type="number" 
                value={safeThreshold}
                onChange={(e) => setSafeThreshold(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: 'hsl(var(--text-primary))',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '8px' }}>
                Risky Water Level Limit (cm)
              </label>
              <input 
                type="number" 
                value={riskyThreshold}
                onChange={(e) => setRiskyThreshold(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: 'hsl(var(--text-primary))',
                  outline: 'none'
                }}
              />
            </div>
            <button 
              type="submit"
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(79, 172, 254, 0.1) 100%)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                borderRadius: '8px',
                color: 'hsl(var(--primary))',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              <Save size={18} />
              Save Configuration
            </button>
          </form>
        </div>

        {/* Emergency Contacts */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={20} style={{ color: 'hsl(var(--primary))' }} />
            Emergency Contacts (SMS Broadcast)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {contacts.map((contact, idx) => (
              <div 
                key={idx}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '10px 14px', 
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid hsl(var(--border))'
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(var(--text-primary))' }}>{contact.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{contact.phone} ({contact.type})</p>
                </div>
                <button 
                  onClick={() => deleteContact(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addContact} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'hsl(var(--text-primary))',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <input 
              type="text" 
              placeholder="Phone (+91...)"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'hsl(var(--text-primary))',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              className="glass-panel"
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--text-primary))',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </form>
        </div>

        {/* Global System Integration */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BellRing size={20} style={{ color: 'hsl(var(--primary))' }} />
            Notification Broadcast Settings
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={alertConfig.sendSms}
                onChange={(e) => setAlertConfig({ ...alertConfig, sendSms: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-primary))' }}>Enable SMS Broadcasts</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={alertConfig.sendPush}
                onChange={(e) => setAlertConfig({ ...alertConfig, sendPush: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-primary))' }}>Enable Mobile Push Notifications</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={alertConfig.soundSiren}
                onChange={(e) => setAlertConfig({ ...alertConfig, soundSiren: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-primary))' }}>Enable Local Active Buzzer Siren</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
