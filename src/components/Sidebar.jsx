import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Box,
  Users,
  Settings,
  LogOut,
  Store
} from 'lucide-react';

export default function Sidebar({
  activePage,
  setActivePage,
  adminProfile,
  sidebarOpen,
  setSidebarOpen,
  onLogout
}) {
  const adminInitials = useMemo(() => {
    return (adminProfile?.name || 'AD')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [adminProfile?.name]);

  return (
    <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <LayoutDashboard />
          <span>Freakes</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setActivePage('dashboard');
            setSidebarOpen(false);
          }}
        >
          <LayoutDashboard />
          <span>Dashboard</span>
        </div>
        <div
          className={`nav-item ${activePage === 'orders' ? 'active' : ''}`}
          onClick={() => {
            setActivePage('orders');
            setSidebarOpen(false);
          }}
        >
          <ShoppingCart />
          <span>Orders</span>
        </div>
        <div
          className={`nav-item ${activePage === 'products' ? 'active' : ''}`}
          onClick={() => {
            setActivePage('products');
            setSidebarOpen(false);
          }}
        >
          <Box />
          <span>Products</span>
        </div>
        <div
          className={`nav-item ${activePage === 'customers' ? 'active' : ''}`}
          onClick={() => {
            setActivePage('customers');
            setSidebarOpen(false);
          }}
        >
          <Users />
          <span>Customers</span>
        </div>
        <div
          className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}
          onClick={() => {
            setActivePage('settings');
            setSidebarOpen(false);
          }}
        >
          <Settings />
          <span>Settings</span>
        </div>
        <div
          className={`nav-item ${activePage === 'storefront' ? 'active' : ''}`}
          onClick={() => {
            setActivePage('storefront');
            setSidebarOpen(false);
          }}
          style={{ 
            marginTop: 20, 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: 16,
            color: 'var(--primary)',
            fontWeight: 600
          }}
        >
          <Store />
          <span>Customer Store</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="admin-profile-card">
          <div className="admin-avatar">{adminInitials}</div>
          <div className="admin-info">
            <div className="admin-name">{adminProfile?.name || 'Administrator'}</div>
            <div className="admin-role">System Admin</div>
          </div>
          <button onClick={onLogout} className="logout-btn" title="Sign Out">
            <LogOut style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
