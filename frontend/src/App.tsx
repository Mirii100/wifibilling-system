import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { getPackages, initiateStkPush, login, register, updateProfile, changePassword, getMyPlans } from './api'
import './App.css'
import './Checkout.css'

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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [regPhone, setRegPhone] = useState('')
  
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

  // Profile management
  const [editPhone, setEditPhone] = useState<string>(() => currentUser?.phone_number?.replace(/^254|^0/, '') || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [plans, setPlans] = useState<any[]>([])

  const [showSplash, setShowSplash] = useState(!currentUser)

  const getFallbackPackages = () => [
    { id: 1, name: "Starter Pack", price: "500", duration_seconds: 1800, data_limit_bytes: 524288000 },
    { id: 2, name: "Daily Lite", price: "50", duration_seconds: 86400, data_limit_bytes: 1073741824 },
    { id: 3, name: "Home Basic", price: "1200", duration_seconds: 2592000, data_limit_bytes: 0 },
    { id: 4, name: "Home Plus", price: "2000", duration_seconds: 2592000, data_limit_bytes: 0 },
  ]

  const fetchPackages = () => {
    getPackages()
      .then(res => {
        if (res.data && res.data.length > 0) setPackages(res.data)
        else setPackages(getFallbackPackages())
      })
      .catch(() => setPackages(getFallbackPackages()))
  }

  const fetchMyPlans = async () => {
    if (currentUser) {
        const res = await getMyPlans(currentUser?.username)
        setPlans(res.data)
    }
  }

  const getPath = () => location.pathname;

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
          setMessage({ text: 'Your package has expired.', type: 'error' });
        }
      } else {
        setRemainingTime(0);
      }
    };

    updateTime();
    if (isConnected && expiryTime > 0) {
      interval = setInterval(updateTime, 1000);
    }
    
    return () => clearInterval(interval)
  }, [isConnected, expiryTime])

  useEffect(() => {
    if (currentUser?.phone_number) {
        setPhoneNumber(currentUser?.phone_number?.replace(/^254|^0/, '') || '')
    }
  }, [currentUser, isDrawerOpen])

  useEffect(() => {
    fetchPackages()
  }, [])

  useEffect(() => {
    if (location.pathname === '/dashboard/history') fetchMyPlans()
  }, [location.pathname])

  if (showSplash) {
    return (
      <div className="splash-container">
        <div className="splash-logo">
          <svg viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="white"/></svg>
        </div>
        <h1>HOPE WiFi</h1>
        <p>Estate WiFi Billing & Management System</p>
        <div className="splash-cards">
          <div className="role-card" onClick={() => { navigate('/login'); setShowSplash(false); }}>
            <div className="icon">🛠️</div>
            <h3>Admin</h3>
            <p>Manage users, packages & revenue</p>
          </div>
          <div className="role-card" onClick={() => { navigate('/'); setShowSplash(false); }}>
            <div className="icon">📶</div>
            <h3>Customer</h3>
            <p>Buy data & manage your account</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSelectPackage = (pkg: Package) => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    setSelectedPackage(pkg)
    setIsDrawerOpen(true)
    setMessage(null)
  }

  const handlePurchase = async () => {
    const cleanPhone = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
    if (!cleanPhone || cleanPhone.length !== 9) {
      setMessage({ text: 'Please enter a valid 9-digit phone number (e.g., 712345678).', type: 'error' })
      return
    }

    setLoading(true)
    setMessage({ text: 'Requesting M-Pesa payment...', type: 'info' })
    try {
      const formattedPhone = `254${cleanPhone}`;
      
      await initiateStkPush(formattedPhone, selectedPackage!.id)
      setMessage({ text: `STK Push sent to ${formattedPhone}. Enter PIN to complete.`, type: 'info' })
      setTimeout(() => {
        setPurchasedPackage(selectedPackage)
        const expiry = Date.now() + (selectedPackage!.duration_seconds * 1000);
        setExpiryTime(expiry);
        setIsConnected(true)
        setMessage({ text: 'Payment confirmed! Account activated.', type: 'success' })
        setIsDrawerOpen(false)
      }, 5000)
    } catch (error) {
      setMessage({ text: 'Unable to process payment.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login({ username, password })
      setCurrentUser(res.data.user)
      setEditPhone(res.data.user?.phone_number || '')
      navigate('/dashboard/overview')
      setMessage(null)
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Invalid username or password.'
      setMessage({ text: errorMsg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' })
      return
    }

    const cleanPhone = regPhone.startsWith('0') ? regPhone.substring(1) : regPhone;
    if (cleanPhone.length !== 9) {
      setMessage({ text: 'Please enter a valid 9-digit phone number (e.g., 712345678).', type: 'error' })
      return
    }

    setLoading(true)
    try {
      await register({ username, password, phone_number: `254${cleanPhone}` })
      setMessage({ text: 'Account created! Login now.', type: 'success' })
      setTimeout(() => navigate('/login'), 1500)
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Registration failed. Username or phone might already be in use.'
      setMessage({ text: errorMsg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault()
      const cleanPhone = editPhone.startsWith('0') ? editPhone.substring(1) : editPhone;
      if (cleanPhone.length !== 9) {
          setMessage({ text: 'Please enter a valid 9-digit phone number.', type: 'error' })
          return
      }
      try {
          const res = await updateProfile({ username: currentUser?.username, phone_number: `254${cleanPhone}` })
          setCurrentUser(res.data)
          setMessage({ text: 'Profile updated!', type: 'success' })
      } catch (err: any) { 
          const errorMsg = err.response?.data?.error || 'Failed to update profile.'
          setMessage({ text: errorMsg, type: 'error' }) 
      }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
          await changePassword({ username: currentUser?.username, old_password: oldPassword, new_password: newPassword })
          setMessage({ text: 'Password updated!', type: 'success' })
      } catch (err) { setMessage({ text: 'Failed to change password.', type: 'error' }) }
  }

  const formatData = (bytes: number) => {
    if (bytes === 0) return 'Unlimited'
    const gb = bytes / (1024 * 1024 * 1024)
    return gb >= 1 ? `${gb.toFixed(0)}GB` : `${(bytes / (1024 * 1024)).toFixed(0)}MB`
  }

  const formatTimeRemaining = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const getUserInitials = () => {
    if (!currentUser?.username) return '??';
    return currentUser?.username.substring(0, 2).toUpperCase();
  };

  const Layout = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/')}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="white"/></svg>
          </div>
          <div>
            <div className="brand-name">HOPE WiFi</div>
            <div className="brand-sub">Estate Billing</div>
          </div>
        </div>

        <nav>
          <div className="nav-section">Customer Portal</div>
          <button className={`nav-item ${location.pathname.includes('/overview') ? 'active' : ''}`} onClick={() => navigate('/dashboard/overview')}>
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            My Portal
          </button>
          <button className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Buy Data
          </button>
          <button className={`nav-item ${location.pathname.includes('/history') ? 'active' : ''}`} onClick={() => navigate('/dashboard/history')}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            History
          </button>
          <button className={`nav-item ${location.pathname.includes('/profile') || location.pathname.includes('/security') ? 'active' : ''}`} onClick={() => navigate('/dashboard/profile')}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{getUserInitials()}</div>
            <div>
              <div className="user-name">{currentUser?.username || 'Guest'}</div>
              <div className="user-role">{isConnected ? 'Online' : 'Offline'}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-right">
            {currentUser && (
              <button className="tb-btn" onClick={() => { navigate('/'); setCurrentUser(null); setIsConnected(false); localStorage.clear(); }}>
                <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            )}
          </div>
        </header>

        <div className="content">
          <div className="path-indicator">Path: <span>{getPath()}</span></div>
          {children}
        </div>
      </main>
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={
        <Layout title="Buy Data">
          <div className="alert alert-info">
             Select a package below to connect instantly via M-Pesa.
          </div>
          <div className="packages-grid">
            {packages.map(pkg => (
              <div key={pkg.id} className="pkg-card" onClick={() => handleSelectPackage(pkg)}>
                <div className="pkg-name">{pkg.name}</div>
                <div className="pkg-price">KES {pkg.price} <span>/ {pkg.duration_seconds >= 2592000 ? 'month' : 'package'}</span></div>
                <div className="pkg-detail">
                  <div><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> {(pkg.duration_seconds / 3600).toFixed(0)} Hours Access</div>
                  <div><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> {formatData(pkg.data_limit_bytes)} Data</div>
                  <div><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> High Speed Link</div>
                </div>
                <button className="btn btn-primary" style={{marginTop: '20px', width: '100%'}}>Select Plan</button>
              </div>
            ))}
          </div>
        </Layout>
      } />

      <Route path="/login" element={
        <div className="auth-page">
          <div className="auth-card">
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to your HOPE account</p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" placeholder="Your username" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="auth-links">
              New here? <button onClick={() => navigate('/register')}>Create account</button>
            </div>
            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
          </div>
        </div>
      } />

      <Route path="/register" element={
        <div className="auth-page">
          <div className="auth-card">
            <h2>Create Account</h2>
            <p className="subtitle">Join HOPE WiFi Network</p>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" placeholder="Choose username" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-prefix">
                   <span>+254</span>
                   <input type="tel" maxLength={9} placeholder="7XX XXX XXX" value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
            <div className="auth-links">
              Already have an account? <button onClick={() => navigate('/login')}>Sign In</button>
            </div>
            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
          </div>
        </div>
      } />

      <Route path="/dashboard/*" element={
        currentUser ? (
          <Layout title="Dashboard">
            <Routes>
              <Route path="overview" element={
                <>
                  <div className="portal-hero">
                    <div className="portal-greet">
                      <h2>Hello, {currentUser?.username} 👋</h2>
                      <p>{isConnected ? `Active Package: ${purchasedPackage?.name}` : 'No active package'}</p>
                      <div style={{marginTop: '16px'}}>
                        <span className={`pill ${isConnected ? 'pill-green' : 'pill-red'}`} style={{background: isConnected ? 'rgba(0,168,107,0.2)' : 'rgba(229,57,53,0.2)'}}>
                          ● {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                    <div className="usage-ring">
                      {(() => {
                        const total = purchasedPackage?.duration_seconds || 1;
                        const used = total - remainingTime;
                        const pct = isConnected ? Math.min(100, Math.round((used / total) * 100)) : 0;
                        const offset = 220 - (pct / 100) * 220;
                        
                        return (
                          <>
                            <svg width="90" height="90" viewBox="0 0 90 90">
                              <circle cx="45" cy="45" r="35" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="7"/>
                              <circle cx="45" cy="45" r="35" fill="none" stroke="#4ade80" stroke-width="7" stroke-dasharray="220 220" stroke-dashoffset={offset} stroke-linecap="round"/>
                            </svg>
                            <div className="usage-ring-label">
                              <div className="usage-ring-pct" style={{color: '#fff'}}>{pct}%</div>
                              <div className="usage-ring-sub">used</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {purchasedPackage && (
                    <div style={{color: '#ffffff88', fontSize: '12px', marginTop: '-15px', marginBottom: '25px', textAlign: 'right', marginRight: '15px'}}>
                      {purchasedPackage.data_limit_bytes === 0 ? 'Unlimited Data' : `${formatData(Math.round(purchasedPackage.data_limit_bytes * (remainingTime / purchasedPackage.duration_seconds)))} of ${formatData(purchasedPackage.data_limit_bytes)}`}
                    </div>
                  )}

                  <div className="portal-quick">
                    <div className="quick-btn" onClick={() => navigate('/')}>
                      <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      <span>Buy Data</span>
                    </div>
                    <div className="quick-btn" onClick={() => navigate('/dashboard/history')}>
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>History</span>
                    </div>
                    <div className="quick-btn" onClick={() => navigate('/dashboard/profile')}>
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      <span>Settings</span>
                    </div>
                    <div className="quick-btn" onClick={() => window.open('https://wa.me/254712000000', '_blank')}>
                      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      <span>Support</span>
                    </div>
                  </div>

                  <div className="stats-grid">
                    <div className="stat">
                      <div className="stat-label">Connection Status</div>
                      <div className="stat-value" style={{color: isConnected ? 'var(--green)' : 'var(--danger)'}}>{isConnected ? 'Online' : 'Offline'}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-label">Time Remaining</div>
                      <div className="stat-value">{formatTimeRemaining(remainingTime)}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-label">Data Remaining</div>
                      <div className="stat-value">{purchasedPackage ? formatData(purchasedPackage.data_limit_bytes) : '0MB'}</div>
                    </div>
                  </div>
                </>
              } />
              <Route path="history" element={
                <div className="card">
                  <div className="card-title">Transaction History</div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Package</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plans.length > 0 ? plans.map((p, i) => (
                          <tr key={i}>
                            <td>{new Date(p.created_at).toLocaleDateString()}</td>
                            <td>{p.package_name}</td>
                            <td>KES {p.amount}</td>
                            <td><span className="pill pill-green">Confirmed</span></td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} style={{textAlign: 'center'}}>No transactions found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              } />
              <Route path="profile" element={
                <div className="card">
                  <div className="card-title">Profile Settings</div>
                  <form onSubmit={handleProfileUpdate} style={{maxWidth: '400px'}}>
                    <div className="form-group">
                      <label>Username</label>
                      <input type="text" value={currentUser?.username} disabled style={{background: 'var(--surface2)'}} />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <div className="input-prefix">
                         <span>+254</span>
                         <input type="tel" maxLength={9} value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Update Profile</button>
                  </form>

                  <div className="card-title" style={{marginTop: '40px'}}>Change Password</div>
                  <form onSubmit={handlePasswordChange} style={{maxWidth: '400px'}}>
                    <div className="form-group">
                      <label>Old Password</label>
                      <input type="password" onChange={e => setOldPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input type="password" onChange={e => setNewPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Update Password</button>
                  </form>
                  {message && <div className={`alert alert-${message.type}`} style={{marginTop: '20px'}}>{message.text}</div>}
                </div>
              } />
              <Route path="*" element={<Navigate to="overview" />} />
            </Routes>
          </Layout>
        ) : <Navigate to="/login" />
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>

    {/* MPESA MODAL (Replaces Drawer) */}
    {isDrawerOpen && (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">M-Pesa Payment</div>
            <button className="close-btn" onClick={() => setIsDrawerOpen(false)}>&times;</button>
          </div>
          <div className="mpesa-logo">
            <div className="mpesa-logo-text">M-PESA</div>
            <div className="mpesa-logo-sub">Lipa Na M-Pesa · STK Push</div>
          </div>
          {selectedPackage && (
            <div style={{background: 'var(--green-light)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: 'var(--green-dark)'}}>
              <strong>{selectedPackage.name}</strong> · <strong>KES {selectedPackage.price}</strong>
            </div>
          )}
          <div className="form-group">
            <label>M-Pesa Phone Number</label>
            <div className="input-prefix">
              <span>+254</span>
              <input type="tel" maxLength={9} placeholder="7XX XXX XXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} autoFocus />
            </div>
          </div>
          <button className="btn btn-primary" style={{background: '#4caf50', width: '100%', marginTop: '10px'}} onClick={handlePurchase} disabled={loading}>
             {loading ? 'Processing...' : '💚 Send Payment Request'}
          </button>
          {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        </div>
      </div>
    )}
  </>
  )
}
