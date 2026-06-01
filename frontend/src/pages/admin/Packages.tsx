import React, { useEffect, useState } from 'react';
import { getPackages, createPackage, updatePackage, deletePackage } from '../../api';

export const Packages: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_seconds: '',
    data_limit_bytes: '0',
    speed_limit_up_kbps: '1024',
    speed_limit_down_kbps: '1024'
  });

  const fetchPackages = async () => {
    try {
      const res = await getPackages();
      setPackages(res.data);
    } catch (err) {
      console.error("Failed to fetch packages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleAddClick = () => {
    setEditModal(false);
    setCurrentPackage(null);
    setFormData({
        name: '',
        price: '',
        duration_seconds: '',
        data_limit_bytes: '0',
        speed_limit_up_kbps: '1024',
        speed_limit_down_kbps: '1024'
    });
    setShowModal(true);
  };

  const handleEditClick = (pkg: any) => {
    setEditModal(true);
    setCurrentPackage(pkg);
    setFormData({
        name: pkg.name,
        price: pkg.price.toString(),
        duration_seconds: pkg.duration_seconds.toString(),
        data_limit_bytes: pkg.data_limit_bytes.toString(),
        speed_limit_up_kbps: pkg.speed_limit_up_kbps.toString(),
        speed_limit_down_kbps: pkg.speed_limit_down_kbps.toString()
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && currentPackage) {
        await updatePackage(currentPackage.id, formData);
      } else {
        await createPackage(formData);
      }
      setShowModal(false);
      fetchPackages();
    } catch (err) {
      alert("Failed to save package");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      await deletePackage(id);
      fetchPackages();
    } catch (err) {
      alert("Failed to delete package");
    }
  };

  if (loading) return <div>Loading packages...</div>;

  return (
    <div className="page-packages">
      <div className="alert alert-info" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>ℹ️</span> Packages sync automatically to MikroTik User Manager. Speed limits are enforced at the router level.
      </div>
      
      <div className="packages-grid">
        {packages.map((pkg, i) => (
          <div key={i} className={`pkg-card ${i === 1 ? 'popular' : ''}`}>
            {i === 1 && <div className="pkg-badge">⭐ Most Popular</div>}
            <div className="pkg-name">{pkg.name}</div>
            <div className="pkg-price">KES {pkg.price} <span>/ {pkg.duration_seconds >= 2592000 ? '30 days' : pkg.duration_seconds >= 604800 ? '7 days' : 'day'}</span></div>
            <div className="pkg-detail">
              <div><span className="icon">⬇️</span> {pkg.speed_limit_down_kbps / 1024} Mbps download</div>
              <div><span className="icon">⬆️</span> {pkg.speed_limit_up_kbps / 1024} Mbps upload</div>
              <div><span className="icon">📱</span> {pkg.data_limit_bytes === 0 ? 'Unlimited' : `${(pkg.data_limit_bytes / (1024*1024*1024)).toFixed(0)} GB`} data</div>
            </div>
            <div style={{ marginTop: '18px', display: 'flex', gap: '8px' }}>
               <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => handleEditClick(pkg)}>Edit Details</button>
               <button className="btn btn-danger btn-sm" onClick={() => handleDelete(pkg.id)}>Delete</button>
            </div>
          </div>
        ))}
        <div className="pkg-card" onClick={handleAddClick} style={{ borderStyle: 'dashed', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: 'var(--muted)' }}>
           <span style={{ fontSize: '32px' }}>➕</span>
           <span style={{ fontSize: '13px' }}>Add New Package</span>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editMode ? 'Edit WiFi Package' : 'Create New Package'}</div>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Package Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Weekly Unlimited" />
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                    <label>Price (KES)</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label>Duration (Seconds)</label>
                    <input type="number" value={formData.duration_seconds} onChange={e => setFormData({...formData, duration_seconds: e.target.value})} required />
                </div>
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                    <label>Download (Kbps)</label>
                    <input type="number" value={formData.speed_limit_down_kbps} onChange={e => setFormData({...formData, speed_limit_down_kbps: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label>Upload (Kbps)</label>
                    <input type="number" value={formData.speed_limit_up_kbps} onChange={e => setFormData({...formData, speed_limit_up_kbps: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Data Limit (Bytes, 0=Unlimited)</label>
                <input type="number" value={formData.data_limit_bytes} onChange={e => setFormData({...formData, data_limit_bytes: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                {editMode ? 'Update Package' : 'Create Package'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
