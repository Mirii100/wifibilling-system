import React, { useEffect, useState } from 'react';
import { getTransactions, exportTransactions } from '../../api';

export const Payments: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleExport = () => {
    window.open(exportTransactions(), '_blank');
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await getTransactions();
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="page-payments">
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat">
          <div className="stat-label">Today</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>KES 4,800</div>
          <div className="stat-sub">8 transactions</div>
        </div>
        <div className="stat">
          <div className="stat-label">This Month</div>
          <div className="stat-value">KES 48,200</div>
          <div className="stat-sub">94 transactions</div>
        </div>
        <div className="stat">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>KES 3,600</div>
          <div className="stat-sub">4 pending</div>
        </div>
      </div>

      <div className="card">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div className="card-title">All Transactions</div>
          <button className="btn btn-outline btn-sm" onClick={handleExport}>
            <span style={{ marginRight: '5px' }}>📥</span> Export CSV
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>M-Pesa Ref</th>
                <th>Subscriber</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i}>
                  <td className="text-mono">{t.mpesa_receipt_number || 'STK_PUSH'}</td>
                  <td>{t.username}</td>
                  <td>{t.package_name}</td>
                  <td className="text-mono">KES {t.amount}</td>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td><span className="pill pill-green">{t.status}</span></td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
