import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Phone, BellRing, Save, Send, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const API_BASE_URL = 'http://192.168.1.114:8000/api/v1';

export default function Admin() {
  const [safeThreshold, setSafeThreshold] = useState(15);
  const [riskyThreshold, setRiskyThreshold] = useState(30);
  const [contacts, setContacts] = useState([
    { name: 'City Disaster Response', phone: '+91 98765 01990', type: 'Primary' },
    { name: 'Municipal Highway Patrol', phone: '+91 98765 01200', type: 'Secondary' }
  ]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'Primary' });
  
  // Telegram Bot State
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramStatus, setTelegramStatus] = useState(null); // { type: 'success'|'error', text: '' }
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [showTelegramHelp, setShowTelegramHelp] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    sendSms: true,
    sendPush: true,
    soundSiren: true,
    sendTelegram: true
  });

  // Fetch current Telegram settings on load
  useEffect(() => {
    fetch(`${API_BASE_URL}/telegram/config`)
      .then(res => res.json())
      .then(data => {
        if (data.bot_token) setTelegramToken(data.bot_token);
        if (data.chat_id) setTelegramChatId(data.chat_id);
      })
      .catch(() => console.log("Telegram config API offline"));
  }, []);

  const saveThresholds = (e) => {
    e.preventDefault();
    alert(`Thresholds updated: Safe up to ${safeThreshold}cm, Risky up to ${riskyThreshold}cm.`);
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

  const saveTelegramConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/telegram/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_token: telegramToken, chat_id: telegramChatId })
      });
      const data = await res.json();
      if (res.ok) {
        setTelegramStatus({ type: 'success', text: 'Telegram Bot settings saved successfully!' });
      } else {
        setTelegramStatus({ type: 'error', text: data.detail || 'Failed to save settings.' });
      }
    } catch (err) {
      setTelegramStatus({ type: 'error', text: 'Server communication error.' });
    }
  };

  const testTelegramAlert = async () => {
    setIsTestingTelegram(true);
    setTelegramStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/telegram/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_token: telegramToken, chat_id: telegramChatId })
      });
      const data = await res.json();
      if (res.ok) {
        setTelegramStatus({ type: 'success', text: '🎉 Test message sent! Check your Telegram chat.' });
      } else {
        setTelegramStatus({ type: 'error', text: data.detail || 'Failed to send test message.' });
      }
    } catch (err) {
      setTelegramStatus({ type: 'error', text: 'Unable to reach backend server.' });
    } finally {
      setIsTestingTelegram(false);
    }
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

        {/* Telegram Bot Integration Card */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={20} style={{ color: '#0088cc' }} />
              Telegram Emergency Alert Bot Integration
            </h3>
            <button 
              onClick={() => setShowTelegramHelp(!showTelegramHelp)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#0088cc',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <HelpCircle size={16} />
              {showTelegramHelp ? 'Hide Setup Guide' : 'How to set up?'}
            </button>
          </div>

          {/* Setup Guide Accordion */}
          {showTelegramHelp && (
            <div style={{ 
              padding: '16px', 
              borderRadius: '8px', 
              background: 'rgba(0, 136, 204, 0.08)', 
              border: '1px solid rgba(0, 136, 204, 0.3)',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: 'hsl(var(--text-secondary))'
            }}>
              <h4 style={{ color: '#0088cc', marginBottom: '8px', fontWeight: 600 }}>Quick Setup Instructions:</h4>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Open Telegram and search for <b>@BotFather</b>.</li>
                <li>Send <code>/newbot</code> command, give your bot a name (e.g. <i>MyFloodAlertBot</i>) and a username ending in <code>bot</code>.</li>
                <li>Copy the <b>HTTP API Token</b> given by BotFather (e.g. <code>123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ</code>) and paste it into <b>Bot Token</b> below.</li>
                <li>Search for <b>@userinfobot</b> on Telegram, start a chat, and copy your numeric <b>Id</b> (e.g. <code>987654321</code>). Paste it into <b>Chat ID</b> below.</li>
                <li>Start a chat with your newly created bot on Telegram by pressing <b>/start</b>.</li>
                <li>Click <b>Save Telegram Settings</b> and then click <b>Send Test Notification</b> to confirm!</li>
              </ol>
            </div>
          )}

          <form onSubmit={saveTelegramConfig} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '8px' }}>
                Telegram Bot Token
              </label>
              <input 
                type="text" 
                placeholder="e.g. 7123456789:AAFx...xyz"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: 'hsl(var(--text-primary))',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '8px' }}>
                Telegram Target Chat ID / Channel ID
              </label>
              <input 
                type="text" 
                placeholder="e.g. 987654321 or -100123456789"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: 'hsl(var(--text-primary))',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Status Alert Banner */}
            {telegramStatus && (
              <div style={{
                gridColumn: 'span 2',
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.85rem',
                backgroundColor: telegramStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${telegramStatus.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: telegramStatus.type === 'success' ? '#10b981' : '#ef4444'
              }}>
                {telegramStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{telegramStatus.text}</span>
              </div>
            )}

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                type="submit"
                className="glass-panel"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'linear-gradient(135deg, rgba(0, 136, 204, 0.25) 0%, rgba(0, 242, 254, 0.15) 100%)',
                  border: '1px solid rgba(0, 136, 204, 0.4)',
                  borderRadius: '8px',
                  color: '#0088cc',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Save size={18} />
                Save Telegram Settings
              </button>

              <button 
                type="button"
                onClick={testTelegramAlert}
                disabled={isTestingTelegram}
                className="glass-panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--text-primary))',
                  fontWeight: 600,
                  cursor: isTestingTelegram ? 'wait' : 'pointer',
                  opacity: isTestingTelegram ? 0.6 : 1
                }}
              >
                <Send size={18} />
                {isTestingTelegram ? 'Sending Test...' : 'Send Test Notification'}
              </button>
            </div>
          </form>
        </div>

        {/* Global System Integration */}
        <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BellRing size={20} style={{ color: 'hsl(var(--primary))' }} />
            Notification Broadcast Channels
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={alertConfig.sendTelegram}
                onChange={(e) => setAlertConfig({ ...alertConfig, sendTelegram: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-primary))' }}>Enable Telegram Bot Broadcasts</span>
            </label>
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
