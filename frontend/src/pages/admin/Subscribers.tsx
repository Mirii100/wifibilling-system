import React, { useEffect, useState } from 'react';
import { getSubscribers, addSubscriber, updateSubscriber, deleteSubscriber } from '../../api';

export const Subscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSub, setCurrentSub] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    full_name: '', 
    phone_number: '', 
    house_number: '', 
    username: '',
    password: '',
    is_active: true
  });

  const fetchSubscribers = async () => {
    try {
      const res = await getSubscribers();
      setSubscribers(res.data);
      setFilteredSubs(res.data);
    } catch (err) {
      console.error("Failed to fetch subscribers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredSubs(subscribers.filter(s => 
      s.full_name?.toLowerCase().includes(term) || 
      s.username?.toLowerCase().includes(term) || 
      s.phone_number?.includes(term) ||
      s.house_number?.toLowerCase().includes(term)
    ));
  }, [searchTerm, subscribers]);

  const handleAddClick = () => {
    setEditMode(false);
    setCurrentSub(null);
    setFormData({ full_name: '', phone_number: '', house_number: '', username: '', password: '', is_active: true });
    setShowModal(true);
  };

  const handleEditClick = (sub: any) => {
    setEditMode(true);
    setCurrentSub(sub);
    setFormData({
      full_name: sub.full_name || '',
      phone_number: sub.phone_number,
      house_number: sub.house_number || '',
      username: sub.username,
      password: '', // Leave empty unless changing
      is_active: sub.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (editMode && !dataToSubmit.password) {
        delete (dataToSubmit as any).password;
      }

      if (editMode && currentSub) {
        await updateSubscriber(currentSub.id, dataToSubmit);
      } else {
        if (!dataToSubmit.password) {
          alert("Password is required for new subscribers");
          return;
        }
        const finalData = { 
          ...dataToSubmit, 
          username: dataToSubmit.username || dataToSubmit.full_name.toLowerCase().replace(/\s+/g, '') 
        };
        await addSubscriber(finalData);
      }
      setShowModal(false);
      fetchSubscribers();
    } catch (err) {
      alert("Failed to save subscriber");
    }
  };

  const toggleStatus = async (sub: any) => {
    const newStatus = !sub.is_active;
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'Activate' : 'Suspend'} this subscriber?`)) return;
    
    try {
      await updateSubscriber(sub.id, { is_active: newStatus });
      fetchSubscribers();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this subscriber?")) return;
    try {
      await deleteSubscriber(id);
      fetchSubscribers();
    } catch (err) {
      alert("Failed to delete subscriber");
    }
  };

  if (loading) return <div>Loading subscribers...</div>;

  return (
    <div className="page-subscribers">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <div className="section-title" style={{ fontSize: '18px', fontWeight: 700 }}>Active Subscribers</div>
        <button className="btn btn-primary" onClick={handleAddClick}>+ Add Subscriber</button>
      </div>

      <div className="card" style={{ padding: '15px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search by name, phone, or house..." 
          className="form-control"
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((s, i) => (
                <tr key={i} style={{ opacity: s.is_active ? 1 : 0.6 }}>
                  <td>
                    <div className="conn-info">
                      <span className="conn-name" style={{ fontWeight: 600 }}>{s.full_name || s.username}</span>
                      <span className="conn-mac" style={{ fontSize: '12px', color: 'var(--hint)' }}>{s.house_number ? `${s.house_number} · @${s.username}` : `@${s.username}`}</span>
                    </div>
                  </td>
                  <td className="text-mono">{s.phone_number}</td>
                  <td>
                    <span className={`pill ${s.is_active ? 'pill-green' : 'pill-red'}`}>
                        {s.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEditClick(s)}>Edit</button>
                      <button 
                        className={`btn btn-sm ${s.is_active ? 'btn-danger' : 'btn-primary'}`} 
                        onClick={() => toggleStatus(s)}
                      >
                        {s.is_active ? 'Suspend' : 'Activate'}
                      </button>
                      <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubs.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No subscribers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editMode ? 'Edit Subscriber' : 'Add New Subscriber'}</div>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required placeholder="e.g. Grace Wanjiku" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} required placeholder="07XX XXX XXX" />
              </div>
              <div className="form-group">
                <label>House / Unit Number</label>
                <input type="text" value={formData.house_number} onChange={e => setFormData({...formData, house_number: e.target.value})} placeholder="e.g. House 14A" />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Username" />
              </div>
              <div className="form-group">
                <label>Password {editMode && '(Leave blank to keep current)'}</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Password" required={!editMode} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editMode ? 'Update Account' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
