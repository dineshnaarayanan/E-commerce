import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  LogOut, 
  ChevronRight, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  QrCode, 
  CheckCircle, 
  ArrowLeft, 
  Info,
  Clock,
  MapPin,
  Phone,
  Mail,
  Lock,
  Copy
} from 'lucide-react';

export default function StorefrontView({ 
  products, 
  onShowToast, 
  onRefreshData // Callback to sync admin state after purchase
}) {
  // --- STOREFRONT STATES ---
  const [storeView, setStoreView] = useState('catalog'); // 'catalog' or 'history'
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // --- CUSTOMER SESSION STATE ---
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem('customer_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // --- AUTH FORM STATES ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // --- CHECKOUT & PAYMENT STATES ---
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' or 'Razorpay'
  const [enteredUtr, setEnteredUtr] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState(null); // Success screen data

  // Load GIS script for Google Auth
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Pre-fill checkout if customer logs in
  useEffect(() => {
    if (customer) {
      setCheckoutName(customer.name || '');
      setCheckoutEmail(customer.email || '');
      setCheckoutPhone(customer.phone || '');
      setCheckoutAddress(customer.location || '');
      fetchCustomerOrders(customer.id);
    } else {
      setCheckoutName('');
      setCheckoutEmail('');
      setCheckoutPhone('');
      setCheckoutAddress('');
      setCustomerOrders([]);
    }
  }, [customer]);

  const fetchCustomerOrders = async (custId) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders/customer?customerId=${custId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerOrders(data);
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // --- CART MUTATIONS ---
  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        onShowToast(`Cannot add more. Only ${product.stock} items left in stock.`, 'warning');
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image: product.image
      }]);
    }
    onShowToast(`"${product.title}" added to cart!`);
  };

  const updateCartQty = (productId, newQty, maxStock) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
      return;
    }
    if (newQty > maxStock) {
      onShowToast(`Only ${maxStock} items available in inventory.`, 'warning');
      return;
    }
    setCart(cart.map(item => 
      item.productId === productId ? { ...item, quantity: newQty } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
    onShowToast('Item removed from shopping cart.', 'warning');
  };

  // --- CALC PRICING ---
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cartSubtotal * 0.08;
  const cartShipping = cartSubtotal > 150 || cartSubtotal === 0 ? 0 : 10.00;
  const cartTotal = cartSubtotal + cartTax + cartShipping;

  // --- CUSTOMER LOGIN & REGISTER HANDLERS ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customer/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          location: regAddress,
          password: regPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        localStorage.setItem('customer_session', JSON.stringify(data.customer));
        onShowToast(`Account created! Welcome, ${data.customer.name}`);
        setIsAuthOpen(false);
        // Clear inputs
        setRegName(''); setRegEmail(''); setRegPhone(''); setRegAddress(''); setRegPassword('');
      } else {
        onShowToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      onShowToast('Connection failed: ' + err.message, 'error');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        localStorage.setItem('customer_session', JSON.stringify(data.customer));
        onShowToast(`Logged in successfully as ${data.customer.name}`);
        setIsAuthOpen(false);
        setLoginEmail(''); setLoginPassword('');
      } else {
        onShowToast(data.message || 'Login failed', 'error');
      }
    } catch (err) {
      onShowToast('Connection failed: ' + err.message, 'error');
    }
  };

  const handleGoogleLogin = async () => {
    // Check if client is initialized
    try {
      // Send mock token or request Google Token
      const res = await fetch('/api/customer/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'MOCK_GOOGLE_TOKEN' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomer(data.customer);
        localStorage.setItem('customer_session', JSON.stringify(data.customer));
        onShowToast(`Signed in with Google as ${data.customer.name}`);
        setIsAuthOpen(false);
      } else {
        onShowToast(data.message || 'Google login failed', 'error');
      }
    } catch (err) {
      onShowToast('Google Login API Error: ' + err.message, 'error');
    }
  };

  const handleSignOut = () => {
    setCustomer(null);
    localStorage.removeItem('customer_session');
    onShowToast('Logged out of customer session.', 'warning');
    setStoreView('catalog');
  };

  // --- CHECKOUT SUBMISSION ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        customerId: customer?.id || null,
        name: checkoutName,
        email: checkoutEmail,
        phone: checkoutPhone,
        location: checkoutAddress,
        items: cart,
        paymentMethod: paymentMethod,
        shipping: cartShipping,
        tax: cartTax,
        subtotal: cartSubtotal,
        total: cartTotal,
        razorpayPaymentId: paymentMethod === 'Razorpay' ? 'MOCK_PAYMENT_ID' : '',
        utrNumber: paymentMethod === 'UPI' ? enteredUtr : ''
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPlacedOrderInfo(data.order);
        setCart([]); // Clear cart
        setIsCheckoutOpen(false);
        setEnteredUtr('');
        onShowToast(`Order #${data.orderId} placed successfully!`);
        
        // Refresh orders if customer is logged in
        if (customer) {
          fetchCustomerOrders(customer.id);
        }
        // Force refresh parent data to sync admin views immediately
        if (onRefreshData) onRefreshData();
      } else {
        onShowToast(data.message || 'Checkout failed', 'error');
      }
    } catch (err) {
      onShowToast('Checkout Connection Error: ' + err.message, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleCopyUtr = (utrVal) => {
    navigator.clipboard.writeText(utrVal);
    onShowToast(`Copied UTR #${utrVal} to clipboard!`);
  };

  // Filter only active products
  const activeProducts = products.filter(p => p.status === 'Active');

  return (
    <div className="storefront-container" style={{ paddingBottom: 80 }}>
      {/* STOREFRONT HEADER */}
      <header className="store-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 30
      }}>
        <div className="store-logo" onClick={() => setStoreView('catalog')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <ShoppingBag style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Freakes</h2>
        </div>

        <div className="store-nav" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <button 
            className={`btn-text ${storeView === 'catalog' ? 'active' : ''}`}
            onClick={() => setStoreView('catalog')}
            style={{ fontWeight: 600, color: storeView === 'catalog' ? 'var(--primary)' : 'var(--text-secondary)' }}
          >
            Browse Products
          </button>
          
          {customer && (
            <button 
              className={`btn-text ${storeView === 'history' ? 'active' : ''}`}
              onClick={() => setStoreView('history')}
              style={{ fontWeight: 600, color: storeView === 'history' ? 'var(--primary)' : 'var(--text-secondary)' }}
            >
              My Orders ({customerOrders.length})
            </button>
          )}

          <button 
            className="btn btn-secondary" 
            onClick={() => setIsCartOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', height: 'auto' }}
          >
            <ShoppingCart style={{ width: 16, height: 16 }} />
            <span>Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
          </button>

          {customer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--border-color)', paddingLeft: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{customer.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Customer Account</span>
              </div>
              <button className="logout-btn" onClick={handleSignOut} title="Sign Out">
                <LogOut style={{ width: 16, height: 16 }} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', height: 'auto' }}
            >
              <User style={{ width: 16, height: 16 }} />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </header>

      {/* RENDER VIEW: ORDER PLACEMENT SUCCESS SCREEN */}
      {placedOrderInfo ? (
        <div style={{ maxWidth: 650, margin: '40px auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center' }}>
          <CheckCircle style={{ width: 64, height: 64, color: 'var(--success)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 24 }}>
            Your transaction has been logged. Order invoice ID is <strong style={{ color: 'var(--primary)' }}>#{placedOrderInfo.id}</strong>.
          </p>

          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 20, textAlign: 'left', marginBottom: 30, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
              <span style={{ fontWeight: 700 }}>Shipping Destination</span>
              <span style={{ color: 'var(--text-secondary)' }}>{placedOrderInfo.paymentMethod} Payment</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              <div><strong>Name:</strong> {checkoutName}</div>
              <div><strong>Phone:</strong> {checkoutPhone}</div>
              <div><strong>Address:</strong> {checkoutAddress}</div>
              <div style={{ marginTop: 10, color: 'var(--warning)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock style={{ width: 14, height: 14 }} />
                <span>Verification Status: Pending Merchant (dinesh) Approval</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => { setPlacedOrderInfo(null); setStoreView('catalog'); }}>
              Continue Shopping
            </button>
            {customer && (
              <button className="btn btn-primary" onClick={() => { setPlacedOrderInfo(null); setStoreView('history'); }}>
                Track Order Live
              </button>
            )}
          </div>
        </div>
      ) : storeView === 'history' ? (
        /* RENDER VIEW: CUSTOMER ORDER HISTORY */
        <div className="page-container" style={{ padding: 0 }}>
          <div className="page-header" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-icon-only" onClick={() => setStoreView('catalog')}>
              <ArrowLeft style={{ width: 16, height: 16 }} />
            </button>
            <div>
              <h1 style={{ fontSize: 24 }}>My Order History</h1>
              <p>Review payment statuses and live tracking updates for your purchases.</p>
            </div>
          </div>

          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>Loading orders ledger...</div>
          ) : customerOrders.length === 0 ? (
            <div className="content-card" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No orders found for this account. Go buy some products!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {customerOrders.map((order) => {
                const isPending = order.status === 'Payment Verification Pending';
                const hierarchy = ['Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
                const currentIdx = hierarchy.indexOf(order.courier?.status || 'Processing');

                return (
                  <div key={order.id} className="content-card" style={{ padding: 24, border: '1px solid var(--border-color)' }}>
                    {/* Header bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20 }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Order #{order.id}</h4>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          Placed on {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>Total: ₹{order.total.toFixed(2)}</span>
                        <span className={`badge badge-${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span>
                      </div>
                    </div>

                    {/* Order details grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30 }}>
                      {/* Products */}
                      <div>
                        <h5 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12 }}>Items Purchased</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {order.items?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <img src={item.image} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</div>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipment Tracking / UTR */}
                      <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: 30 }}>
                        {isPending ? (
                          <div style={{ background: 'var(--bg-tertiary)', padding: 20, borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning)', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                              <Clock style={{ width: 18, height: 18 }} />
                              <span>Awaiting Merchant Verification</span>
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                              Your payment reference is submitted. The admin (dinesh) must cross-reference this transaction in the bank ledger to confirm the order.
                            </p>
                            {order.paymentMethod === 'UPI' && (
                              <div style={{ fontSize: 12, marginTop: 10, background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 4, display: 'inline-block' }}>
                                <strong>Submitted UTR:</strong> {order.paymentDetails.utrNumber}
                              </div>
                            )}
                          </div>
                        ) : order.status === 'Cancelled' ? (
                          <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <X style={{ width: 18, height: 18 }} />
                            <span>This order was cancelled. Payment refunded or voided.</span>
                          </div>
                        ) : (
                          <div>
                            <h5 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12 }}>Delivery Progress ({order.courier.partner})</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {['Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                                const isDone = idx < currentIdx;
                                const isActive = idx === currentIdx;
                                return (
                                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: idx <= currentIdx ? 1 : 0.4 }}>
                                    <div style={{
                                      width: 10, height: 10, borderRadius: '50%',
                                      background: isDone ? 'var(--success)' : isActive ? 'var(--warning)' : 'var(--border-color)'
                                    }} />
                                    <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500 }}>
                                      {step === 'Processing' && 'Order Confirmed & Processing'}
                                      {step === 'Shipped' && 'Handed over to Courier'}
                                      {step === 'In Transit' && 'In Transit'}
                                      {step === 'Out for Delivery' && 'Out for Delivery'}
                                      {step === 'Delivered' && 'Delivered successfully!'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* RENDER VIEW: PRODUCT CATALOG */
        <div>
          <div className="page-header" style={{ marginBottom: 20 }}>
            <div className="page-title">
              <h1 style={{ fontSize: 24 }}>Explore Catalog</h1>
              <p>Top products selected for premium quality and styling aesthetics.</p>
            </div>
          </div>

          <div className="products-grid">
            {activeProducts.map((prod) => {
              const isOutOfStock = prod.stock === 0;
              return (
                <div key={prod.id} className="product-card">
                  <div className="product-card-img-wrapper" style={{ height: 220 }}>
                    <img src={prod.image} alt={prod.title} className="product-card-img" />
                    {isOutOfStock && (
                      <span className="product-card-tag" style={{ backgroundColor: 'var(--danger)' }}>
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="product-card-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 220px - 50px)' }}>
                    <div>
                      <div className="product-card-category">{prod.category}</div>
                      <h4 className="product-card-title" style={{ fontSize: 15, marginBottom: 8, height: 40, overflow: 'hidden' }}>{prod.title}</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '8px 0', height: 50, overflow: 'hidden' }}>
                        {prod.description}
                      </p>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div className="product-card-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span className="product-card-price" style={{ fontSize: 18 }}>₹{prod.price.toFixed(2)}</span>
                        {prod.comparePrice && (
                          <span className="product-card-compare-price">₹{prod.comparePrice.toFixed(2)}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                        <span className={`stock-indicator ${prod.stock > 5 ? 'stock-in' : prod.stock > 0 ? 'stock-low' : 'stock-out'}`} />
                        <span>{prod.stock > 5 ? `${prod.stock} Items left` : prod.stock > 0 ? `Only ${prod.stock} left!` : 'Unavailable'}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '0 16px 16px 16px' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => addToCart(prod)}
                      disabled={isOutOfStock}
                      style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, padding: '10px 0', height: 'auto' }}
                    >
                      <ShoppingCart style={{ width: 14, height: 14 }} />
                      Add To Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- CART DRAWER PANEL --- */}
      {isCartOpen && (
        <div className="drawer-overlay active" onClick={() => setIsCartOpen(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()} style={{ width: 420 }}>
            <div className="drawer-header">
              <h3>Shopping Cart</h3>
              <button className="modal-close" onClick={() => setIsCartOpen(false)}>
                <X />
              </button>
            </div>
            
            <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)', padding: 0 }}>
              {/* Cart Items list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                    Your shopping cart is currently empty.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {cart.map((item) => {
                      const prod = products.find(p => p.id === item.productId) || { stock: 0 };
                      return (
                        <div key={item.productId} style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                          <img src={item.image} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{item.title}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>₹{item.price.toFixed(2)}</span>
                              
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 4, background: 'var(--bg-tertiary)' }}>
                                <button onClick={() => updateCartQty(item.productId, item.quantity - 1, prod.stock)} style={{ border: 'none', background: 'none', padding: '2px 6px', cursor: 'pointer' }}>
                                  <Minus style={{ width: 10, height: 10 }} />
                                </button>
                                <span style={{ padding: '0 8px', fontSize: 12, fontWeight: 600 }}>{item.quantity}</span>
                                <button onClick={() => updateCartQty(item.productId, item.quantity + 1, prod.stock)} style={{ border: 'none', background: 'none', padding: '2px 6px', cursor: 'pointer' }}>
                                  <Plus style={{ width: 10, height: 10 }} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <button className="btn-icon-only delete" onClick={() => removeFromCart(item.productId)} style={{ padding: 6 }}>
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Cart calculation footer */}
              {cart.length > 0 && (
                <div style={{ padding: 24, borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span>Subtotal</span>
                      <span>₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span>Estimated Sales Tax (8%)</span>
                      <span>₹{cartTax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span>Shipping Fee</span>
                      <span>{cartShipping === 0 ? 'FREE' : `₹${cartShipping.toFixed(2)}`}</span>
                    </div>
                    {cartShipping > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--info)' }}>
                        Add <strong>₹{(150 - cartSubtotal).toFixed(2)}</strong> more to unlock FREE shipping!
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, borderTop: '1px solid var(--border-color)', paddingTop: 10, marginTop: 4 }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--primary)' }}>₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', height: 48, fontSize: 15 }}
                  >
                    Proceed to Checkout
                    <ChevronRight style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOMER AUTHENTICATION MODAL --- */}
      {isAuthOpen && (
        <div className="drawer-overlay active" onClick={() => setIsAuthOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450, padding: 30, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{authMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}</h3>
              <button className="modal-close" onClick={() => setIsAuthOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X />
              </button>
            </div>

            {/* Standard Login */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label htmlFor="auth-email">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: 14, top: 13, width: 16, height: 16, color: 'var(--text-muted)' }} />
                    <input 
                      type="email" id="auth-email" className="input-field" style={{ paddingLeft: 40 }}
                      placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="auth-pass">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: 14, top: 13, width: 16, height: 16, color: 'var(--text-muted)' }} />
                    <input 
                      type="password" id="auth-pass" className="input-field" style={{ paddingLeft: 40 }}
                      placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 44, display: 'flex', justifyContent: 'center' }}>
                  Sign In
                </button>
              </form>
            ) : (
              /* Register */
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '65vh', overflowY: 'auto', paddingRight: 6 }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="input-field" placeholder="e.g., Bob Smith" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="input-field" placeholder="e.g., bob@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Phone Contact</label>
                  <input type="tel" className="input-field" placeholder="e.g., +1 (555) 000-1111" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Shipping Address (Location)</label>
                  <textarea className="input-field" style={{ height: 60, resize: 'none' }} placeholder="e.g., 789 Elm St, Austin, TX" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Account Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 44, display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                  Create Profile
                </button>
              </form>
            )}

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
              <span style={{ padding: '0 12px', fontSize: 11, textTransform: 'uppercase' }}>Or authenticate with</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
            </div>

            {/* Google Sign In Button */}
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleGoogleLogin}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 10, height: 44, alignItems: 'center', fontWeight: 600 }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.936 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.45.346 2.819.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.32 0 2.505.453 3.44 1.348l2.582-2.58C13.463.896 11.428 0 9 0 5.482 0 2.438 2.064.957 5.042l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google Account Login
            </button>

            {/* Toggle auth mode */}
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button className="btn-link" onClick={() => setAuthMode('register')} style={{ color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button className="btn-link" onClick={() => setAuthMode('login')} style={{ color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOMER CHECKOUT MODAL --- */}
      {isCheckoutOpen && (
        <div className="drawer-overlay active" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 800, padding: 30, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Review Checkout</h3>
              <button className="modal-close" onClick={() => setIsCheckoutOpen(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30 }}>
              {/* Shipping Form details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h4 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 4 }}>1. Shipping Details</h4>
                
                <div className="form-group">
                  <label htmlFor="chk-name">Full Name</label>
                  <input type="text" id="chk-name" className="input-field" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-email">Email Address</label>
                  <input type="email" id="chk-email" className="input-field" value={checkoutEmail} onChange={(e) => setCheckoutEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-phone">Contact Number</label>
                  <input type="tel" id="chk-phone" className="input-field" value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-address">Shipping Address</label>
                  <textarea id="chk-address" className="input-field" style={{ height: 70, resize: 'none' }} value={checkoutAddress} onChange={(e) => setCheckoutAddress(e.target.value)} required />
                </div>
              </div>

              {/* Payment selector and summary */}
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12 }}>2. Select Payment</h4>
                  
                  {/* Payment toggle */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <div 
                      className={`payment-option-card ${paymentMethod === 'UPI' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('UPI')}
                      style={{
                        flex: 1, padding: 12, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center',
                        borderColor: paymentMethod === 'UPI' ? 'var(--primary)' : 'var(--border-color)',
                        background: paymentMethod === 'UPI' ? 'var(--bg-tertiary)' : 'none'
                      }}
                    >
                      <QrCode style={{ margin: '0 auto 6px auto', color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>UPI Transfer</span>
                    </div>

                    <div 
                      className={`payment-option-card ${paymentMethod === 'Razorpay' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('Razorpay')}
                      style={{
                        flex: 1, padding: 12, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center',
                        borderColor: paymentMethod === 'Razorpay' ? 'var(--primary)' : 'var(--border-color)',
                        background: paymentMethod === 'Razorpay' ? 'var(--bg-tertiary)' : 'none'
                      }}
                    >
                      <ShoppingCart style={{ margin: '0 auto 6px auto', color: 'var(--primary)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>Razorpay Card</span>
                    </div>
                  </div>

                  {/* Dynamic payment details */}
                  {paymentMethod === 'UPI' ? (
                    <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: 12, lineHeight: 1.5, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <strong>UPI Direct QR (Mock)</strong>
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>Scan QR to Pay</span>
                      </div>
                      
                      {/* Stylized QR placeholder */}
                      <div style={{ width: 100, height: 100, background: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', borderRadius: 8, color: 'var(--bg-main)' }}>
                        <QrCode style={{ width: 80, height: 80 }} />
                      </div>
                      
                      <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
                        Pay: ₹{cartTotal.toFixed(2)}
                      </div>

                      {/* Mock UTR prompt */}
                      <div style={{ marginBottom: 12, background: 'var(--bg-card)', padding: 10, borderRadius: 4, border: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--info)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Info style={{ width: 12, height: 12 }} />
                          <span>Verification UTR Sandbox</span>
                        </div>
                        Choose a pre-seeded UTR below to verify payment:
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                          {['123456789012', '777788889999', '121212121212'].map((utrVal) => (
                            <button 
                              key={utrVal} type="button" className="btn btn-secondary" 
                              onClick={() => { setEnteredUtr(utrVal); handleCopyUtr(utrVal); }}
                              style={{ padding: '2px 6px', fontSize: 10, height: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}
                            >
                              <span>{utrVal}</span>
                              <Copy style={{ width: 8, height: 8 }} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Enter 12-Digit UTR Number</label>
                        <input 
                          type="text" className="input-field" placeholder="12-digit reference number"
                          value={enteredUtr} onChange={(e) => setEnteredUtr(e.target.value)} required maxLength="12" minLength="12"
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: 12, lineHeight: 1.5, marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--info)', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                        <ShoppingCart style={{ width: 16, height: 16 }} />
                        <span>Razorpay Checkout Sandbox</span>
                      </div>
                      We will launch a simulated credit card checkout. Click "Place Order" to execute transaction verification.
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, borderTop: '1px solid var(--border-color)', paddingTop: 12, marginBottom: 12 }}>
                    <span>Total Due</span>
                    <span style={{ color: 'var(--primary)' }}>₹{cartTotal.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsCheckoutOpen(false)} style={{ flex: 1 }}>
                      Cancel
                    </button>
                    <button 
                      type="submit" className="btn btn-primary" 
                      disabled={isSubmittingOrder || (paymentMethod === 'UPI' && enteredUtr.length !== 12)}
                      style={{ flex: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40 }}
                    >
                      {isSubmittingOrder ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
