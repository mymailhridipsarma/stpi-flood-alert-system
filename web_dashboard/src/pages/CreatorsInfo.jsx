import React from 'react';
import { 
  Instagram, 
  Linkedin, 
  Github, 
  Cpu, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

const creators = [
  {
    name: 'Hridip Sarma',
    avatar: 'HS',
    profilePic: '/Profile pic/Hridip Sarma.jpg',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    socials: {
      instagram: 'https://www.instagram.com/hridip_sarma?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      linkedin: 'https://www.linkedin.com/in/hridip-sarma-588622366/',
      github: 'https://github.com/mymailhridipsarma/'
    }
  },
  {
    name: 'Abhijeet Das',
    avatar: 'AD',
    profilePic: '/Profile pic/Abhijeet Das.jpg',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    socials: {
      instagram: 'https://www.instagram.com/abhijeet_hoi/?__pwa=1',
      linkedin: 'https://www.linkedin.com/in/abhijeet-das-2a6131303/',
      github: 'https://github.com/ABH1DAS'
    }
  },
  {
    name: 'Prachi Saud',
    avatar: 'PS',
    profilePic: '/Profile pic/Prachi Saud.jpg',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    socials: {
      instagram: 'https://www.instagram.com/prachi__saud?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      linkedin: 'https://www.linkedin.com/in/prachi-saud/?skipRedirect=true',
      github: 'https://github.com/prachisaud04-cyber'
    }
  }
];

export default function CreatorsInfo() {
  return (
    <div className="creators-page">
      <header style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Sparkles className="gradient-safe-text" size={24} />
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            letterSpacing: '0.08em', 
            textTransform: 'uppercase', 
            color: 'hsl(var(--primary))' 
          }}>
            Engineering Team
          </span>
        </div>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>
          Creators Info
        </h1>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.05rem', maxWidth: '680px' }}>
          Meet the minds behind AquaPulse — building next-generation IoT flood detection and real-time emergency telemetry.
        </p>
      </header>

      <div className="creators-grid">
        {creators.map((creator, index) => (
          <div key={index} className="glass-panel creator-card">
            {/* Card Top / Avatar Section */}
            <div className="creator-header">
              <div className="creator-avatar" style={{ background: creator.gradient, overflow: 'hidden', padding: 0 }}>
                {creator.profilePic ? (
                  <img 
                    src={creator.profilePic} 
                    alt={creator.name} 
                  />
                ) : (
                  creator.avatar
                )}
              </div>
              <div className="creator-title-area">
                <h2 className="creator-name">{creator.name}</h2>
              </div>
            </div>

            {/* Divider */}
            <div className="creator-divider" />

            {/* Social Links */}
            <div className="social-links-container">
              <span className="social-links-label">Connect:</span>
              <div className="social-links">
                <a 
                  href={creator.socials.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-btn instagram"
                  title={`${creator.name}'s Instagram`}
                >
                  <Instagram size={18} />
                  <span>Instagram</span>
                  <ExternalLink size={12} className="external-icon" />
                </a>
                <a 
                  href={creator.socials.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-btn linkedin"
                  title={`${creator.name}'s LinkedIn`}
                >
                  <Linkedin size={18} />
                  <span>LinkedIn</span>
                  <ExternalLink size={12} className="external-icon" />
                </a>
                <a 
                  href={creator.socials.github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-btn github"
                  title={`${creator.name}'s GitHub`}
                >
                  <Github size={18} />
                  <span>GitHub</span>
                  <ExternalLink size={12} className="external-icon" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Overview Footer Card */}
      <div className="glass-panel" style={{ marginTop: '36px', padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'rgba(37, 99, 235, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'hsl(var(--primary))'
          }}>
            <Layers size={24} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>Smart Flood System Open Architecture</h3>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
              Built as part of STPI IoT & Flood Monitoring Initiative. High-reliability sensors & real-time alerts.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="badge badge-safe" style={{ padding: '8px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} /> Production Ready
          </span>
        </div>
      </div>
    </div>
  );
}
