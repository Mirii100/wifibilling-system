import React from 'react';
import type { Package } from '../../App';

interface PortalOverviewProps {
  user: any;
  isConnected: boolean;
  purchasedPackage: Package | null;
  remainingTime: number;
  formatData: (bytes: number) => string;
  formatTimeRemaining: (seconds: number) => string;
}

export const PortalOverview: React.FC<PortalOverviewProps> = ({
  user, isConnected, purchasedPackage, remainingTime, formatData, formatTimeRemaining
}) => {
  const total = purchasedPackage?.duration_seconds || 1;
  const used = total - remainingTime;
  const pct = isConnected ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const offset = 220 - (pct / 100) * 220;

  return (
    <div className="portal-overview">
      <div className="portal-hero" style={{ background: 'linear-gradient(135deg, #1a1f26 0%, #2d3748 100%)', borderRadius: '22px', padding: '28px', color: '#fff', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="portal-greet">
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Hello, {user?.full_name || user?.username} 👋</h2>
          <p style={{ opacity: 0.8 }}>{isConnected ? `Plan: ${purchasedPackage?.name}` : 'No active package'}</p>
          <div style={{ marginTop: '16px' }}>
            <span className={`pill ${isConnected ? 'pill-green' : 'pill-red'}`} style={{ background: isConnected ? 'rgba(0,168,107,0.2)' : 'rgba(229,57,53,0.2)', border: 'none' }}>
              ● {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="usage-ring" style={{ position: 'relative', width: '90px', height: '90px' }}>
            <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="45" cy="45" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
              <circle cx="45" cy="45" r="35" fill="none" stroke="#4ade80" strokeWidth="7" strokeDasharray="220 220" strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{pct}%</div>
              <div style={{ fontSize: '10px', opacity: 0.6 }}>used</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px' }}>
            {!purchasedPackage ? 'No data' : 
             purchasedPackage.data_limit_bytes === 0 ? 'Unlimited Data' : 
             `${formatData(Math.round(purchasedPackage.data_limit_bytes * (remainingTime / total)))} left`}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <div className="stat-label">Connection Status</div>
          <div className="stat-value" style={{ color: isConnected ? 'var(--green)' : 'var(--danger)' }}>{isConnected ? 'Online' : 'Offline'}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Time Remaining</div>
          <div className="stat-value">{formatTimeRemaining(remainingTime)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Your Package</div>
          <div className="stat-value" style={{ fontSize: '18px' }}>{purchasedPackage?.name || 'None'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Quick Actions</div>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
           <div className="stat" style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📶</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Buy Data</div>
           </div>
           <div className="stat" style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🕒</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>History</div>
           </div>
           <div className="stat" style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Support</div>
           </div>
        </div>
      </div>
    </div>
  );
};
