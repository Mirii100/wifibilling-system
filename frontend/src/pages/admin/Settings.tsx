import React, { useEffect, useState } from 'react';
import { getSystemSettings, updateSystemSettings } from '../../api';

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    business_name: '',
    location: '',
    admin_phone: '',
    mpesa_shortcode: '',
    renewal_reminder_days: 2,
    grace_period_hours: 24,
    auto_suspend_enabled: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSystemSettings();
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSystemSettings(settings);
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="page-settings">
      <div className="grid-2">
        <form className="card" onSubmit={handleSave}>
          <div className="card-title">Business Profile</div>
          <div className="form-group">
            <label>Business Name</label>
            <input 
              type="text" 
              value={settings.business_name} 
              onChange={e => setSettings({...settings, business_name: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Location / Estate</label>
            <input 
              type="text" 
              value={settings.location} 
              onChange={e => setSettings({...settings, location: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Admin Phone</label>
            <input 
              type="text" 
              value={settings.admin_phone} 
              onChange={e => setSettings({...settings, admin_phone: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>M-Pesa Paybill / Till Number</label>
            <input 
              type="text" 
              value={settings.mpesa_shortcode} 
              onChange={e => setSettings({...settings, mpesa_shortcode: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <form className="card" onSubmit={handleSave}>
          <div className="card-title">Billing Settings</div>
          <div className="form-group">
            <label>Renewal Reminder (days before expiry)</label>
            <select 
              value={settings.renewal_reminder_days} 
              onChange={e => setSettings({...settings, renewal_reminder_days: parseInt(e.target.value)})}
            >
              <option value={3}>3 days</option>
              <option value={2}>2 days</option>
              <option value={1}>1 day</option>
            </select>
          </div>
          <div className="form-group">
            <label>Grace Period After Expiry</label>
            <select 
              value={settings.grace_period_hours} 
              onChange={e => setSettings({...settings, grace_period_hours: parseInt(e.target.value)})}
            >
              <option value={0}>None</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
            </select>
          </div>
          <div className="form-group">
            <label>Auto-suspend After Grace Period</label>
            <select 
              value={settings.auto_suspend_enabled ? 'true' : 'false'} 
              onChange={e => setSettings({...settings, auto_suspend_enabled: e.target.value === 'true'})}
            >
              <option value="false">Disable</option>
              <option value="true">Enable</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};
