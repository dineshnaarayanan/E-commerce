import React, { useState, useEffect } from 'react';
import { X, Info, User, Truck, AlertOctagon, Edit3 } from 'lucide-react';

export default function OrderDetailDrawer({
  isOpen,
  onClose,
  order,
  customers,
  onUpdateCourier,
  onVerifyPayment
}) {
  const [courierEditOpen, setCourierEditOpen] = useState(false);
  const [partner, setPartner] = useState('FedEx');
  const [trackingId, setTrackingId] = useState('');
  const [status, setStatus] = useState('Processing');
  const [syncOrderStatus, setSyncOrderStatus] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync internal state when order changes
  useEffect(() => {
    if (order) {
      const courier = order.courier || {};
      setPartner(courier.partner === 'Unassigned' ? 'FedEx' : courier.partner);
      setTrackingId(courier.trackingId === 'N/A' ? '' : courier.trackingId);
      setStatus(courier.status || 'Processing');
      setSyncOrderStatus(true);
      setCourierEditOpen(false);
    }
  }, [order]);

  const handleVerifyPaymentClick = async () => {
    setIsVerifying(true);
    try {
      await onVerifyPayment(order.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen || !order) return null;

  const customer = customers.find((c) => c.id === order.customerId) || {
    name: 'Guest User',
    email: 'N/A',
    phone: 'N/A',
    location: 'N/A'
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onUpdateCourier({
      orderId: order.id,
      partner,
      trackingId,
      status,
      syncOrderStatus
    });
    setCourierEditOpen(false);
  };

  return (
    <div className="drawer-overlay active" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>Order #{order.id}</h3>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="drawer-body">
          {/* PAYMENT VERIFICATION ACTION BANNER */}
          {order.status === 'Payment Verification Pending' && (
            <div className="alert-banner" style={{
              backgroundColor: 'var(--warning-light)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--warning)', fontWeight: 700 }}>
                <AlertOctagon style={{ width: 20, height: 20 }} />
                <span>Payment Verification Required</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                This order was placed using <strong>{order.paymentMethod}</strong>. Please verify that the transaction is legitimate before confirming the order.
              </p>
              
              <div style={{ fontSize: 13, background: 'var(--bg-card)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                {order.paymentMethod.toLowerCase().includes('upi') ? (
                  <div>
                    <strong>Submitted UTR:</strong> <code style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 700 }}>{order.paymentDetails?.utrNumber || 'N/A'}</code>
                  </div>
                ) : (
                  <div>
                    <strong>Razorpay Payment ID:</strong> <code style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{order.paymentDetails?.razorpayPaymentId || 'N/A'}</code>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
                {isVerifying ? (
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Reconciling transaction...</span>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleVerifyPaymentClick}
                    style={{ padding: '8px 14px', fontSize: 13, height: 'auto' }}
                  >
                    Reconcile & Confirm Payment
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Order Info */}
          <div>
            <div className="drawer-section-title">
              <Info style={{ width: 16, height: 16 }} />
              <span>Order Details</span>
            </div>
            <div className="order-info-list">
              <div className="order-info-row">
                <span className="order-info-label">Date Placed</span>
                <span className="order-info-value">
                  {new Date(order.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Order Status</span>
                <div>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Payment Method</span>
                <span className="order-info-value">{order.paymentMethod}</span>
              </div>
              <div className="order-info-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 4 }}>
                <span className="order-info-label" style={{ fontWeight: 700 }}>Total Paid</span>
                <span className="order-info-value" style={{ fontSize: 16, color: 'var(--primary)' }}>
                  ₹{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Metadata */}
          <div>
            <div className="drawer-section-title">
              <User style={{ width: 16, height: 16 }} />
              <span>Customer Details</span>
            </div>
            <div className="order-info-list" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="order-info-row">
                <span className="order-info-label">Full Name</span>
                <span className="order-info-value">{customer.name}</span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Email Address</span>
                <span className="order-info-value">{customer.email}</span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Phone Contact</span>
                <span className="order-info-value">{customer.phone}</span>
              </div>
              <div className="order-info-row" style={{ flexDirection: 'column', gap: 4, borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 4 }}>
                <span className="order-info-label">Shipping Destination</span>
                <span className="order-info-value" style={{ fontWeight: 400, lineHeight: 1.4, marginTop: 4 }}>
                  {customer.location}
                </span>
              </div>
            </div>
          </div>

          {/* Courier & Tracking */}
          <div>
            <div className="drawer-section-title" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck style={{ width: 16, height: 16 }} />
                <span>Courier Tracking</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setCourierEditOpen(!courierEditOpen)}
                style={{ padding: '4px 10px', fontSize: 12, height: 'auto' }}
              >
                <Edit3 style={{ width: 12, height: 12 }} />
                Manage Status
              </button>
            </div>

            <div className="order-info-list" style={{ marginBottom: 16 }}>
              <div className="order-info-row">
                <span className="order-info-label">Courier Carrier</span>
                <span className="order-info-value">{order.courier?.partner || 'Unassigned'}</span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Tracking ID</span>
                <span className="order-info-value">{order.courier?.trackingId || 'N/A'}</span>
              </div>
              <div className="order-info-row">
                <span className="order-info-label">Courier Status</span>
                <span className="order-info-value" style={{ color: 'var(--warning)' }}>
                  {order.courier?.status || 'Not Dispatched'}
                </span>
              </div>
            </div>

            {/* Timeline Stepper */}
            {order.status === 'Cancelled' ? (
              <div style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertOctagon style={{ width: 18, height: 18 }} />
                <span>This order was cancelled. Courier logistics terminated.</span>
              </div>
            ) : (
              <div className="tracking-timeline">
                {(() => {
                  const courier = order.courier || {};
                  const statusHierarchy = ['Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
                  const currentIdx = statusHierarchy.indexOf(courier.status);

                  const timelineSteps = [
                    { title: 'Order Placed & Processing', desc: 'Merchant accepted transaction. Awaiting packing.' },
                    { title: 'Dispatched from Hub', desc: 'Package labeled & handed off to shipment company.' },
                    { title: 'In Transit', desc: 'Cargo travelling between sorting facilities.' },
                    { title: 'Out for Delivery', desc: 'Driver has parcel on delivery vehicle route.' },
                    { title: 'Delivered', desc: 'Courier confirmed handoff signature.' }
                  ];

                  return timelineSteps.map((step, idx) => {
                    let stepClass = '';
                    if (idx < currentIdx) {
                      stepClass = 'completed';
                    } else if (idx === currentIdx) {
                      stepClass = 'active';
                    }

                    let dateStr = 'Estimated Transit Step';
                    if (idx <= currentIdx && order.date) {
                      const orderDate = new Date(order.date);
                      orderDate.setHours(orderDate.getHours() + idx * 6);
                      dateStr = orderDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    }

                    return (
                      <div key={idx} className={`timeline-step ${stepClass}`}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <div className="timeline-title">{step.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{step.desc}</div>
                          <div className="timeline-date">{dateStr}</div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* Shipment Update Form */}
            {courierEditOpen && (
              <div id="courier-edit-panel" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20, marginTop: 16 }}>
                <h4 style={{ marginBottom: 16, fontSize: 14 }}>Update Shipment Details</h4>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="courier-partner-select">Courier Partner</label>
                    <select
                      id="courier-partner-select"
                      className="input-field select-field"
                      value={partner}
                      onChange={(e) => setPartner(e.target.value)}
                    >
                      <option value="FedEx">FedEx Express</option>
                      <option value="DHL">DHL Worldwide Express</option>
                      <option value="UPS">UPS Logistics</option>
                      <option value="USPS">USPS Priority Mail</option>
                      <option value="Aramex">Aramex International</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="courier-tracking-input">Tracking Number / ID</label>
                    <input
                      type="text"
                      id="courier-tracking-input"
                      className="input-field"
                      placeholder="e.g., FX-92834-US"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="courier-status-select">Courier Progress Status</label>
                    <select
                      id="courier-status-select"
                      className="input-field select-field"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Processing">Processing (Order Placed)</option>
                      <option value="Shipped">Shipped (Dispatched from warehouse)</option>
                      <option value="In Transit">In Transit (With courier partner)</option>
                      <option value="Out for Delivery">Out for Delivery (Local hub to destination)</option>
                      <option value="Delivered">Delivered (Handed over successfully)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, marginBottom: 16 }}>
                    <input
                      type="checkbox"
                      id="sync-order-status-chk"
                      checked={syncOrderStatus}
                      onChange={(e) => setSyncOrderStatus(e.target.checked)}
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <label htmlFor="sync-order-status-chk" style={{ marginBottom: 0, cursor: 'pointer', fontSize: 13 }}>
                      Sync Order Status accordingly
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setCourierEditOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Shipment
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Purchased Items List */}
          <div>
            <div className="drawer-section-title">
              <span style={{ fontWeight: 700 }}>Purchased Items</span>
            </div>
            <div className="order-items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="order-item-row">
                  <img src={item.image} alt="" className="order-item-img" />
                  <div className="order-item-details">
                    <div className="order-item-name">{item.title}</div>
                    <div className="order-item-meta">
                      Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="order-item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
