import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X,
  LayoutDashboard,
  Store
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import OrdersView from './components/OrdersView';
import ProductsView from './components/ProductsView';
import CustomersView from './components/CustomersView';
import SettingsView from './components/SettingsView';
import ProductFormModal from './components/ProductFormModal';
import OrderDetailDrawer from './components/OrderDetailDrawer';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import StorefrontView from './components/StorefrontView';

export default function App() {
  // --- DATABASE & SESSION STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [adminProfile, setAdminProfile] = useState({ username: 'dinesh', name: 'Dinesh' });
  const [loading, setLoading] = useState(true);

  // --- GENERAL APPLICATION STYLING STATES ---
  const [activePage, setActivePage] = useState(() => {
    // If admin is logged in, default to dashboard. If not, default to storefront for visitor ease!
    return localStorage.getItem('admin_logged_in') === 'true' ? 'dashboard' : 'storefront';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('admin_theme') || 'light';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');

  // Fetch all data from backend
  const refreshData = async () => {
    try {
      const [prodRes, ordRes, custRes, profRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/customers'),
        fetch('/api/auth/profile')
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
      if (profRes.ok) setAdminProfile(await profRes.json());
    } catch (err) {
      console.error('API loading error:', err);
    }
  };

  // Sync state on load
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    initApp();
  }, []);

  // Apply Theme class
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  // Toast trigger utility
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Submit inputs
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('admin_logged_in', 'true');
        setIsLoggedIn(true);
        setActivePage('dashboard');
        showToast(`Welcome back, ${data.admin.name}!`);
        setUsernameInput('');
        setPasswordInput('');
        refreshData();
      } else {
        showToast(data.message || 'Invalid credentials provided.', 'error');
        const card = document.querySelector('.auth-card');
        if (card) {
          card.style.animation = 'none';
          setTimeout(() => {
            card.style.animation = 'shake 0.4s ease';
          }, 10);
        }
      }
    } catch (err) {
      showToast('Login failed: Backend server is offline', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
    showToast('Signed out of console.', 'warning');
  };

  // --- ORDER DRAWER ACTIONS ---
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);

  const openOrderDrawer = (order) => {
    setSelectedOrder(order);
    setIsOrderDrawerOpen(true);
  };

  const handleCourierUpdate = async ({ orderId, partner, trackingId, status, syncOrderStatus }) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const prevTimeline = orderToUpdate.courier?.timeline || [];
    const existIdx = prevTimeline.findIndex(t => t.status === status);
    
    let desc = '';
    if (status === "Processing") desc = "Order details verified & approved by merchant.";
    if (status === "Shipped") desc = `Consignment dispatched from warehouse via ${partner}.`;
    if (status === "In Transit") desc = `Consignment traveling through ${partner} routing terminal.`;
    if (status === "Out for Delivery") desc = "Dispatched with local delivery runner.";
    if (status === "Delivered") desc = "Parcel delivered and signed for by client.";

    let updatedTimeline = [...prevTimeline];
    if (existIdx === -1) {
      updatedTimeline.push({
        status,
        date: new Date().toISOString(),
        desc,
        completed: true
      });
    } else {
      updatedTimeline[existIdx] = {
        ...updatedTimeline[existIdx],
        date: new Date().toISOString(),
        desc,
        completed: true
      };
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/shipment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner,
          trackingId,
          status,
          timeline: updatedTimeline
        })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        showToast(`Shipment for Order #${orderId} updated to ${status}.`);
      } else {
        showToast('Failed to update shipment records.', 'error');
      }
    } catch (err) {
      showToast('Connection failed: ' + err.message, 'error');
    }
  };

  // Reconcile Order Payment
  const handleVerifyPayment = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Payment reconciled successfully!');
        setOrders(orders.map(o => o.id === orderId ? data.order : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
        refreshData(); // Sync customer counts and product stocks
      } else {
        showToast(data.message || 'Verification reconciliation failed.', 'error');
      }
    } catch (err) {
      showToast('Connection error: ' + err.message, 'error');
    }
  };

  // --- PRODUCT CRUD ACTIONS ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const openAddProductForm = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProductForm = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = async (formData) => {
    try {
      if (editingProduct) {
        // Edit
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updatedProd = await res.json();
          setProducts(products.map(p => p.id === editingProduct.id ? updatedProd : p));
          showToast(`Product "${formData.title}" updated successfully.`);
          setIsProductModalOpen(false);
        } else {
          const errorData = await res.json();
          showToast(errorData.message || 'Failed to update product.', 'error');
        }
      } else {
        // Add
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const newProd = await res.json();
          setProducts([newProd, ...products]);
          showToast(`Product "${formData.title}" created successfully.`);
          setIsProductModalOpen(false);
        } else {
          const errorData = await res.json();
          showToast(errorData.message || 'Failed to create product.', 'error');
        }
      }
    } catch (err) {
      showToast('Failed to save product: ' + err.message, 'error');
    }
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        const res = await fetch(`/api/products/${productToDelete.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setProducts(products.filter(p => p.id !== productToDelete.id));
          showToast('Product deleted permanently.', 'warning');
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }
      } catch (err) {
        showToast('Failed to delete product: ' + err.message, 'error');
      }
    }
  };

  // --- SETTINGS ACTIONS ---
  const handleUpdateProfile = async ({ username, displayName, password }) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminProfile(data.admin);
        showToast('Admin Profile credentials updated.');
      } else {
        showToast(data.message || 'Failed to update credentials.', 'error');
      }
    } catch (err) {
      showToast('Connection failed: ' + err.message, 'error');
    }
  };

  const handleDbReset = async () => {
    if (window.confirm('Restore default mock datasets in MongoDB? All current custom orders, products, and customer registrations will be overwritten.')) {
      setLoading(true);
      try {
        const res = await fetch('/api/system/reset', { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success) {
          await refreshData();
          showToast('Database reset to pre-seeded defaults.');
          setActivePage('dashboard');
        } else {
          showToast(data.message || 'Reset failed', 'error');
        }
      } catch (err) {
        showToast('Connection failed: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDbClear = async () => {
    if (window.confirm('Wipe all database collections? You will be signed out immediately.')) {
      setLoading(true);
      try {
        const res = await fetch('/api/system/clear', { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsLoggedIn(false);
          setProducts([]);
          setOrders([]);
          setCustomers([]);
          showToast('Database wiped successfully.', 'error');
          setActivePage('storefront');
        } else {
          showToast(data.message || 'Clear failed', 'error');
        }
      } catch (err) {
        showToast('Connection failed: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
        <div style={{
          width: 50,
          height: 50,
          border: '5px solid var(--border-color)',
          borderTop: '5px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
          Loading Freakes Ecosystem...
        </div>
      </div>
    );
  }

  // --- RENDER VIEW: STOREFRONT MODE (No admin login required) ---
  if (activePage === 'storefront') {
    return (
      <div className="storefront-mode">
        {/* TOAST SYSTEM */}
        <div id="toast-container" className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              {toast.type === 'success' && <CheckCircle style={{ color: 'var(--success)' }} />}
              {toast.type === 'error' && <AlertCircle style={{ color: 'var(--danger)' }} />}
              {toast.type === 'warning' && <AlertTriangle style={{ color: 'var(--warning)' }} />}
              <div className="toast-message">{toast.message}</div>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ))}
        </div>

        {/* Dynamic Mode Switcher bar */}
        <div style={{ 
          padding: '12px 40px', 
          background: 'var(--bg-tertiary)', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Viewing <strong>Freakes Customer Sandbox</strong>.
          </span>
          <button 
            className="btn btn-primary" 
            onClick={() => setActivePage(isLoggedIn ? 'dashboard' : 'login')}
            style={{ height: 'auto', padding: '6px 14px', fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}
          >
            <LayoutDashboard style={{ width: 14, height: 14 }} />
            <span>Go to Admin Portal</span>
          </button>
        </div>

        <main style={{ padding: '0 40px' }}>
          <StorefrontView 
            products={products} 
            onShowToast={showToast} 
            onRefreshData={refreshData} 
          />
        </main>
      </div>
    );
  }

  // --- RENDER VIEW: ADMIN LOGIN (Unauthenticated) ---
  if (!isLoggedIn || activePage === 'login') {
    return (
      <div className="auth-wrapper">
        <div id="toast-container" className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              {toast.type === 'success' && <CheckCircle style={{ color: 'var(--success)' }} />}
              {toast.type === 'error' && <AlertCircle style={{ color: 'var(--danger)' }} />}
              {toast.type === 'warning' && <AlertTriangle style={{ color: 'var(--warning)' }} />}
              <div className="toast-message">{toast.message}</div>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ))}
        </div>
        <div className="auth-card">
          <div className="auth-logo">
            <LayoutDashboard />
            <span>Freakes Admin</span>
          </div>
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Enter your administrator credentials to access the console.</p>
          </div>
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                type="text"
                id="login-username"
                className="input-field"
                placeholder="e.g., dinesh"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                className="input-field"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 48 }}>
              Sign In
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setActivePage('storefront')}
              style={{ width: '100%', height: 48, marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}
            >
              <Store style={{ width: 16, height: 16 }} />
              <span>Visit Customer Store</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER VIEW: ADMIN CONSOLE (Authenticated) ---
  return (
    <div className="app-container">
      {/* TOAST SYSTEM */}
      <div id="toast-container" className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle style={{ color: 'var(--success)' }} />}
            {toast.type === 'error' && <AlertCircle style={{ color: 'var(--danger)' }} />}
            {toast.type === 'warning' && <AlertTriangle style={{ color: 'var(--warning)' }} />}
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ))}
      </div>

      {/* SIDEBAR */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        adminProfile={adminProfile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* MAIN CONTAINER */}
      <div className="main-wrapper">
        <Header
          theme={theme}
          setTheme={setTheme}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main id="main-content">
          {activePage === 'dashboard' && (
            <DashboardView
              products={products}
              orders={orders}
              customers={customers}
              theme={theme}
              onViewAllOrders={() => setActivePage('orders')}
              onOpenOrder={openOrderDrawer}
            />
          )}

          {activePage === 'orders' && (
            <OrdersView
              orders={orders}
              customers={customers}
              globalSearch={globalSearch}
              onOpenOrder={openOrderDrawer}
            />
          )}

          {activePage === 'products' && (
            <ProductsView
              products={products}
              globalSearch={globalSearch}
              onAddProduct={openAddProductForm}
              onEditProduct={openEditProductForm}
              onDeleteProduct={openDeleteModal}
            />
          )}

          {activePage === 'customers' && (
            <CustomersView
              customers={customers}
              globalSearch={globalSearch}
            />
          )}

          {activePage === 'settings' && (
            <SettingsView
              adminProfile={adminProfile}
              onUpdateProfile={handleUpdateProfile}
              onDbReset={handleDbReset}
              onDbClear={handleDbClear}
            />
          )}
        </main>
      </div>

      {/* PRODUCT FORM MODAL */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        onSubmit={handleProductFormSubmit}
      />

      {/* ORDER DETAILS DRAWER */}
      <OrderDetailDrawer
        isOpen={isOrderDrawerOpen}
        onClose={() => setIsOrderDrawerOpen(false)}
        order={selectedOrder}
        customers={customers}
        onUpdateCourier={handleCourierUpdate}
        onVerifyPayment={handleVerifyPayment}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        product={productToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
