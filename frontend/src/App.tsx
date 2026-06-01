import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { getPackages, initiateStkPush, login, getMyPlans } from './api'
import './App.css'
import './Checkout.css'

// Components
import { AppLayout } from './components/AppLayout'

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard'
import { Subscribers } from './pages/admin/Subscribers'
import { Packages } from './pages/admin/Packages'
import { Payments } from './pages/admin/Payments'
import { Devices } from './pages/admin/Devices'
import { Mikrotik } from './pages/admin/Mikrotik'
import { Settings as AdminSettings } from './pages/admin/Settings'

// Customer Pages
import { PortalOverview } from './pages/customer/PortalOverview'

export interface Package {
  id: number;
  name: string;
  price: string;
  duration_seconds: number;
  data_limit_bytes: number;
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [packages, setPackages] = useState<Package[]>([])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'info' | 'error' | 'success' } | null>(null)

  // Auth & Connection State
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('hope_user');
    if (!saved || saved === 'null') return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  })

  const [purchasedPackage, setPurchasedPackage] = useState<Package | null>(() => {
    const saved = localStorage.getItem('hope_package');
    if (!saved || saved === 'null') return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  })

  const [isConnected, setIsConnected] = useState<boolean>(() => localStorage.getItem('hope_connected') === 'true')
  const [expiryTime, setExpiryTime] = useState<number>(() => {
    const saved = localStorage.getItem('hope_expiry');
    return saved ? parseInt(saved, 10) : 0;
  })
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [plans, setPlans] = useState<any[]>([])

  const [showSplash, setShowSplash] = useState(!currentUser)

  const fetchPackages = () => {
    getPackages()
      .then(res => {
        if (res.data && res.data.length > 0) setPackages(res.data)
      })
      .catch(console.error)
  }

  const fetchMyPlans = async () => {
    if (currentUser) {
        try {
            const res = await getMyPlans(currentUser?.username)
            setPlans(res.data)
        } catch (e) {}
    }
  }

  useEffect(() => {
    localStorage.setItem('hope_user', JSON.stringify(currentUser))
    localStorage.setItem('hope_package', JSON.stringify(purchasedPackage))
    localStorage.setItem('hope_connected', String(isConnected))
    localStorage.setItem('hope_expiry', String(expiryTime))
  }, [currentUser, purchasedPackage, isConnected, expiryTime])

  useEffect(() => {
    let interval: any
    const updateTime = () => {
      if (expiryTime > 0) {
        const now = Date.now();
        const diff = Math.max(0, Math.round((expiryTime - now) / 1000));
        setRemainingTime(diff);
        if (diff <= 0 && isConnected) {
            setIsConnected(false);
            setExpiryTime(0);
        }
      } else {
        setRemainingTime(0);
      }
    };
    updateTime();
    if (isConnected && expiryTime > 0) interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval)
  }, [isConnected, expiryTime])

  useEffect(() => {
    fetchPackages()
  }, [])

  useEffect(() => {
    if (location.pathname === '/dashboard/history') fetchMyPlans()
  }, [location.pathname])

  if (showSplash) {
    return (
      <div className="landing-page">
        <div className="landing-hero">
          <img src="/wi-fi.png" alt="Logo" style={{ width: '120px', height: '120px', marginBottom: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }} />
          <h1>ALEXIA TECH WiFi</h1>
          <p>Experience ultra-fast estate internet with instant M-Pesa activation. High speed, reliable, and always connected.</p>
          
          <div className="splash-cards" style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="role-card feature-card" onClick={() => { navigate('/login'); setShowSplash(false); }} style={{ cursor: 'pointer', maxWidth: '300px' }}>
              <div className="feature-icon">🛠️</div>
              <h3>Admin Dashboard</h3>
              <p>Manage network users, monitor revenue, and configure packages in real-time.</p>
              <button className="btn btn-outline" style={{ marginTop: '20px', width: '100%' }}>Access Admin</button>
            </div>
            
            <div className="role-card feature-card" onClick={() => { navigate('/'); setShowSplash(false); }} style={{ cursor: 'pointer', maxWidth: '300px', border: '2px solid var(--green)' }}>
              <div className="feature-icon">📶</div>
              <h3>Customer Portal</h3>
              <p>Buy data bundles instantly and manage your connection from any device.</p>
              <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>Browse Packages</button>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Ultra Fast</h3>
              <p>Symmetric high-speed connections optimized for streaming and remote work.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure</h3>
              <p>Enterprise-grade security ensuring your data and devices are always protected.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Reliable</h3>
              <p>99.9% uptime with 24/7 dedicated support for all estate residents.</p>
            </div>
          </div>
        </div>
        
        <footer style={{ textAlign: 'center', padding: '40px', color: 'var(--hint)', fontSize: '14px' }}>
          &copy; 2026 ALEXIA TECH WiFi. All rights reserved.
        </footer>
      </div>
    )
  }

  const handleLogout = () => {
    setCurrentUser(null);
    setIsConnected(false);
    setExpiryTime(0);
    localStorage.clear();
    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login({ username, password })
      setCurrentUser(res.data.user)
      if (res.data.user.is_admin) navigate('/admin/dashboard')
      else navigate('/dashboard/overview')
    } catch (error: any) {
      setMessage({ text: 'Login failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPackage = (pkg: Package) => {
    if (!currentUser) { navigate('/login'); return; }
    setSelectedPackage(pkg)
    setIsDrawerOpen(true)
  }

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    const cleanPhone = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
    if (cleanPhone.length !== 9) {
      setMessage({ text: 'Invalid phone number', type: 'error' })
      return
    }

    setLoading(true)
    try {
      await initiateStkPush(`254${cleanPhone}`, selectedPackage!.id)
      setMessage({ text: 'STK Push sent. Confirm on phone.', type: 'info' })
      setTimeout(() => {
        setPurchasedPackage(selectedPackage)
        setExpiryTime(Date.now() + (selectedPackage!.duration_seconds * 1000));
        setIsConnected(true)
        setIsDrawerOpen(false)
        navigate('/dashboard/overview')
      }, 5000)
    } catch (error) {
      setMessage({ text: 'Payment failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const formatData = (bytes: number) => {
    if (bytes === 0) return 'Unlimited'
    const gb = bytes / (1024 * 1024 * 1024)
    return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(bytes / (1024 * 1024)).toFixed(0)}MB`
  }

  const formatTimeRemaining = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <>
    <Routes>
      <Route path="/login" element={
        <div className="auth-page">
          <form onSubmit={handleLogin} className="auth-card">
            <h2 style={{textAlign:'center', marginBottom:'20px'}}>Sign In</h2>
            <div className="form-group"><label>Username</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} required /></div>
            <div className="form-group"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={loading}>Login</button>
            {message && <div className={`alert alert-${message.type}`} style={{marginTop:'15px'}}>{message.text}</div>}
          </form>
        </div>
      } />

      <Route path="/admin/*" element={
        currentUser?.is_admin ? (
          <AppLayout title="Admin Panel" user={currentUser} onLogout={handleLogout} isAdmin>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="subscribers" element={<Subscribers />} />
              <Route path="packages" element={<Packages />} />
              <Route path="payments" element={<Payments />} />
              <Route path="devices" element={<Devices />} />
              <Route path="mikrotik" element={<Mikrotik />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
          </AppLayout>
        ) : <Navigate to="/login" />
      } />

      <Route path="/dashboard/*" element={
        currentUser ? (
          <AppLayout title="My Portal" user={currentUser} onLogout={handleLogout}>
            <Routes>
              <Route path="overview" element={
                <PortalOverview 
                    user={currentUser} 
                    isConnected={isConnected} 
                    purchasedPackage={purchasedPackage} 
                    remainingTime={remainingTime}
                    formatData={formatData}
                    formatTimeRemaining={formatTimeRemaining}
                />
              } />
              <Route path="history" element={
                <div className="card">
                  <div className="card-title">Transaction History</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Date</th><th>Package</th><th>Amount</th></tr></thead>
                      <tbody>
                        {plans.map((p, i) => (
                          <tr key={i}><td>{new Date(p.created_at).toLocaleDateString()}</td><td>{p.package_name}</td><td>KES {p.amount}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              } />
              <Route path="*" element={<Navigate to="overview" />} />
            </Routes>
          </AppLayout>
        ) : <Navigate to="/login" />
      } />

      <Route path="/" element={
        <AppLayout title="Buy Data" user={currentUser} onLogout={handleLogout}>
          <div className="packages-grid">
            {packages.map(pkg => (
              <div key={pkg.id} className="pkg-card" onClick={() => handleSelectPackage(pkg)}>
                <div className="pkg-name">{pkg.name}</div>
                <div className="pkg-price">KES {pkg.price}</div>
                <div className="pkg-detail">
                    <div>Data: {formatData(pkg.data_limit_bytes)}</div>
                    <div>Duration: {pkg.duration_seconds / 3600} Hours</div>
                </div>
                <button className="btn btn-primary" style={{marginTop:'15px', width:'100%'}}>Select Plan</button>
              </div>
            ))}
          </div>
        </AppLayout>
      } />
    </Routes>

    {isDrawerOpen && (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">M-Pesa Payment</div>
            <button className="close-btn" onClick={() => setIsDrawerOpen(false)}>&times;</button>
          </div>
          <div className="mpesa-logo" style={{ background: 'var(--green-light)', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: '20px' }}>M-PESA</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Lipa Na M-Pesa STK Push</div>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="7XX XXX XXX" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', background: '#4caf50' }} onClick={handlePurchase} disabled={loading}>
            {loading ? 'Processing...' : '💚 Pay with M-Pesa'}
          </button>
        </div>
      </div>
    )}
    </>
  )
}
