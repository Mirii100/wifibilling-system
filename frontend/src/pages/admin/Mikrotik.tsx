import React from 'react';

export const Mikrotik: React.FC = () => {
  return (
    <div className="page-mikrotik">
      <div className="alert alert-success" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>✅</span> MikroTik RouterOS API connected — last sync 2 minutes ago.
      </div>
      
      <div className="grid-2">
        <div className="card">
          <div className="card-title">API Connection</div>
          <div className="form-group">
            <label>Router IP Address</label>
            <input type="text" defaultValue="192.168.88.1" placeholder="e.g. 192.168.88.1" />
          </div>
          <div className="form-group">
            <label>API Port</label>
            <input type="text" defaultValue="8728" placeholder="8728" />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" defaultValue="admin" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" defaultValue="••••••••" />
          </div>
          <button className="btn btn-primary">Test Connection</button>
        </div>

        <div className="card">
          <div className="card-title">Auto-Provisioning</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', cursor: 'pointer' }}>
              Auto-create PPP profiles on payment
              <input type="checkbox" defaultChecked style={{ width: '36px', height: '20px', accentColor: 'var(--green)' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', cursor: 'pointer' }}>
              Auto-suspend expired accounts
              <input type="checkbox" defaultChecked style={{ width: '36px', height: '20px', accentColor: 'var(--green)' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', cursor: 'pointer' }}>
              Sync packages to User Manager
              <input type="checkbox" defaultChecked style={{ width: '36px', height: '20px', accentColor: 'var(--green)' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', cursor: 'pointer' }}>
              Queue speed limits on activation
              <input type="checkbox" defaultChecked style={{ width: '36px', height: '20px', accentColor: 'var(--green)' }} />
            </label>
          </div>
          <div style={{ marginTop: '18px', background: 'var(--surface2)', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>QUEUE TREE EXAMPLE (AUTO-GENERATED)</div>
            <pre style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text)', lineHeight: '1.6', margin: 0 }}>
{`/queue simple
add name=gracew-50mbps \\
  target=10.10.1.34/32 \\
  max-limit=50M/20M \\
  comment="Grace Wanjiku · paid"`}
            </pre>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-title">M-Pesa Daraja API Setup</div>
        <div className="alert alert-info" style={{ marginBottom: '18px' }}>
          <span>ℹ️</span> Register at <strong>developer.safaricom.co.ke</strong>, create an app, and get your Consumer Key and Secret.
        </div>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Business Shortcode (Paybill / Till)</label>
            <input type="text" placeholder="e.g. 174379" />
          </div>
          <div className="form-group">
            <label>Passkey (from Daraja portal)</label>
            <input type="password" placeholder="••••••••••••••••" />
          </div>
          <div className="form-group">
            <label>Consumer Key</label>
            <input type="text" placeholder="Your Daraja consumer key" />
          </div>
          <div className="form-group">
            <label>Consumer Secret</label>
            <input type="password" placeholder="••••••••••••••••" />
          </div>
        </div>
        <div className="form-group">
            <label>Callback URL (your server endpoint)</label>
            <input type="text" placeholder="https://yourserver.com/mpesa/callback" />
            <div className="form-hint" style={{ fontSize: '12px', color: 'var(--hint)', marginTop: '5px' }}>Safaricom will POST payment confirmations to this URL.</div>
        </div>
        <button className="btn btn-primary">Save & Test STK Push</button>
      </div>
    </div>
  );
};
