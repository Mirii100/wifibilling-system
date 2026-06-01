import React, { useEffect, useState } from 'react';
import { getSessions } from '../../api';

export const Devices: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getSessions();
        setSessions(res.data);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) return <div>Loading active sessions...</div>;

  const unknownDevicesCount = sessions.filter(s => s.username === 'Unknown').length;

  return (
    <div className="page-devices">
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat">
          <div className="stat-label">Online Now</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{sessions.length}</div>
          <div className="stat-sub">active sessions</div>
        </div>
        <div className="stat">
          <div className="stat-label">Bandwidth Used</div>
          <div className="stat-value">Real-time</div>
          <div className="stat-sub">active monitoring</div>
        </div>
        <div className="stat">
          <div className="stat-label">Unknown Devices</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{unknownDevicesCount}</div>
          <div className="stat-sub">not authenticated</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Live Connected Devices</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Device / MAC</th>
                <th>Real IP</th>
                <th>Subscriber</th>
                <th>Device Type</th>
                <th>Session Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i} style={{ background: s.username === 'Unknown' ? '#fff8f8' : 'transparent' }}>
                  <td>
                    <div className="conn-info">
                      <span className="conn-name" style={{ color: s.username === 'Unknown' ? 'var(--danger)' : 'inherit' }}>
                        {s.username === 'Unknown' ? 'Unknown Device' : `Device_${s.username}`}
                      </span>
                      <span className="conn-mac" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                        {s.mac_address || 'FF:EE:DD:CC:BB:AA'}
                      </span>
                    </div>
                  </td>
                  <td className="text-mono">{s.framed_ip_address || '10.10.1.x'}</td>
                  <td style={{ color: s.username === 'Unknown' ? 'var(--danger)' : 'inherit' }}>
                    {s.username === 'Unknown' ? '⚠ Not registered' : (
                      <div className="conn-info">
                        <span style={{ fontWeight: 600 }}>{s.full_name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--hint)' }}>@{s.username}</span>
                      </div>
                    )}
                  </td>
                  <td>{s.device_type}</td>
                  <td>{new Date(s.start_time).toLocaleTimeString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm">
                      {s.username === 'Unknown' ? 'Block' : 'Disconnect'}
                    </button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No active sessions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
