import React, { useEffect, useState } from 'react';
import { getAdminStats, getTransactions, initiateStkPush, getExpiringSubscribers } from '../../api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [allExpiring, setAllExpiring] = useState<any[]>([]);
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        getAdminStats(),
        getTransactions()
      ]);
      setStats(statsRes.data);
      setRecentPayments(paymentsRes.data.slice(0, 5));
      setExpiringSoon(statsRes.data.expiring_soon || []);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewAllExpiring = async () => {
    try {
      const res = await getExpiringSubscribers();
      setAllExpiring(res.data);
      setShowExpiringModal(true);
    } catch (err) {
      alert("Failed to fetch all expiring subscribers");
    }
  };

  const handleRenew = async (subscriber: any) => {
    setRenewing(subscriber.id);
    try {
      const phone = subscriber.phone_number.startsWith('254') ? subscriber.phone_number : `254${subscriber.phone_number.replace(/^0/, '')}`;
      await initiateStkPush(phone, subscriber.package_id);
      alert(`STK Push sent to ${subscriber.full_name || subscriber.username} (${phone})`);
    } catch (err) {
      alert("Failed to initiate renewal");
    } finally {
      setRenewing(null);
    }
  };

  const getTimeLabel = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 0) return 'Expired';
    if (diffHrs < 1) return 'In < 1hr';
    return `In ${diffHrs}h`;
  };

  if (loading) return <div>Loading dashboard...</div>;

  const maxRevenue = Math.max(...(stats?.chart_data?.values || [1]), 1);

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat">
          <div className="stat-label">
            <span className="icon">👤</span> Active Subscribers
          </div>
          <div className="stat-value">{stats?.active_subscribers || 0}</div>
          <div className="stat-sub"><span className="stat-up">↑</span> overall</div>
        </div>
        <div className="stat">
          <div className="stat-label">
             <span className="icon">💰</span> Total Revenue
          </div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>KES {stats?.total_revenue?.toLocaleString() || 0}</div>
          <div className="stat-sub">confirmed payments</div>
        </div>
        <div className="stat">
          <div className="stat-label">
             <span className="icon">📱</span> Online Devices
          </div>
          <div className="stat-value">{stats?.online_devices || 0}</div>
          <div className="stat-sub">active sessions</div>
        </div>
        <div className="stat">
          <div className="stat-label">
             <span className="icon">🕒</span> Renewals Due
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats?.renewals_due || 0}</div>
          <div className="stat-sub">within 48 hours</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="section-header">
             <div className="card-title">Revenue — Last 7 Days</div>
          </div>
          <div className="chart-bars">
            {stats?.chart_data?.labels.map((label: string, i: number) => (
              <div key={i} className="cb" style={{ height: `${(stats.chart_data.values[i] / maxRevenue) * 100}%` }}>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--hint)' }}>
            <span>Real-time Data</span>
            <span>7-Day Total: KES {stats?.chart_data?.values.reduce((a:number, b:number)=>a+b, 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="card">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div className="card-title" style={{ margin: 0 }}>Recent Payments</div>
            <button className="btn btn-outline btn-sm" onClick={() => (window.location.href='/admin/payments')}>View All</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subscriber</th>
                  <th>Package</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p, i) => (
                  <tr key={i}>
                    <td>{p.username}</td>
                    <td>{p.package_name}</td>
                    <td className="text-mono">KES {p.amount}</td>
                    <td><span className="pill pill-green">Paid</span></td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center' }}>No recent payments.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div className="card-title" style={{ margin: 0 }}>Subscribers Expiring Soon</div>
          <button className="btn btn-outline btn-sm" onClick={handleViewAllExpiring}>View All</button>
        </div>
        {expiringSoon.length > 0 && (
          <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
            {stats?.renewals_due || expiringSoon.length} subscriber{ (stats?.renewals_due || expiringSoon.length) > 1 ? 's' : ''} expire within 48 hours. Trigger a renewal STK Push below.
          </div>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Package</th>
                <th>Expires</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expiringSoon.map((s, i) => (
                <tr key={i}>
                  <td>
                    <div className="conn-info">
                      <span className="conn-name">{s.full_name || s.username}</span>
                      <span className="conn-mac">{s.house_number || 'No House'}</span>
                    </div>
                  </td>
                  <td className="text-mono">{s.phone_number}</td>
                  <td>{s.package_name}</td>
                  <td><span className="pill pill-warning">{getTimeLabel(s.expires)}</span></td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => handleRenew(s)}
                      disabled={renewing === s.id}
                    >
                      {renewing === s.id ? 'Sending...' : '💚 Renew'}
                    </button>
                  </td>
                </tr>
              ))}
              {expiringSoon.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No subscribers expiring within 48 hours.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showExpiringModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <div className="modal-title">All Subscribers Expiring Soon</div>
              <button className="close-btn" onClick={() => setShowExpiringModal(false)}>&times;</button>
            </div>
            <div className="table-wrap" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Subscriber</th>
                    <th>Package</th>
                    <th>Expires</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allExpiring.map((s, i) => (
                    <tr key={i}>
                      <td>
                        <div className="conn-info">
                          <span style={{ fontWeight: 600 }}>{s.full_name || s.username}</span>
                          <span style={{ fontSize: '12px', color: 'var(--hint)' }}>{s.phone_number} · {s.house_number}</span>
                        </div>
                      </td>
                      <td>{s.package_name}</td>
                      <td><span className="pill pill-warning">{getTimeLabel(s.expires)}</span></td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => handleRenew(s)}
                          disabled={renewing === s.id}
                        >
                          {renewing === s.id ? 'Sending...' : '💚 Renew'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
               <button className="btn btn-outline" onClick={() => setShowExpiringModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
