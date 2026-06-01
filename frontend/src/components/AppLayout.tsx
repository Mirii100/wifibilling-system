import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  user: any;
  onLogout: () => void;
  isAdmin?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, user, onLogout, isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = isAdmin ? [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Subscribers', path: '/admin/subscribers', icon: '👥' },
    { label: 'Packages', path: '/admin/packages', icon: '📦' },
    { label: 'Payments', path: '/admin/payments', icon: '💳' },
    { label: 'Devices', path: '/admin/devices', icon: '📱' },
    { label: 'MikroTik API', path: '/admin/mikrotik', icon: '📡' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ] : [
    { label: 'My Portal', path: '/dashboard/overview', icon: '🏠' },
    { label: 'Buy Data', path: '/', icon: '📶' },
    { label: 'History', path: '/dashboard/history', icon: '🕒' },
    { label: 'Settings', path: '/dashboard/profile', icon: '⚙️' },
  ];

  return (
    <div className="app-container">
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/wi-fi.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
          <div>
            <div className="brand-name">ALEXIA TECH WiFi</div>
            <div className="brand-sub">{isAdmin ? 'Admin Panel' : 'Customer Portal'}</div>
          </div>
        </div>

        <nav>
          <div className="nav-section">{isAdmin ? 'Management' : 'My Account'}</div>
          {navItems.map(item => (
            <button 
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{isAdmin ? 'Administrator' : 'Subscriber'}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}>☰</button>
            <div className="topbar-title">{title}</div>
          </div>
          <div className="topbar-right">
             <button className="tb-btn" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
};
