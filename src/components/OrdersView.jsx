import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function OrdersView({
  orders,
  customers,
  globalSearch,
  onOpenOrder
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtered list
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (statusFilter !== 'All') {
      result = result.filter((o) => o.status === statusFilter);
    }
    const search = (searchQuery || globalSearch).toLowerCase().trim();
    if (search) {
      result = result.filter((o) => {
        const custName = (customers.find((c) => c.id === o.customerId)?.name || '').toLowerCase();
        return (
          o.id.includes(search) ||
          custName.includes(search) ||
          (o.courier?.trackingId || '').toLowerCase().includes(search)
        );
      });
    }
    // Sort newest first
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, statusFilter, searchQuery, globalSearch, customers]);

  // Paginated list
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Orders Management</h1>
          <p>Track payments, configure shipment tracking, and process receipts.</p>
        </div>
      </div>

      <div className="content-card">
        <div className="filters-bar">
          <div className="filters-left">
            {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
              <span
                key={status}
                className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
              >
                {status === 'All' ? 'All Orders' : status}
              </span>
            ))}
          </div>

          <div className="search-input-wrapper">
            <Search style={{ width: 16, height: 16 }} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Courier Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const cust = customers.find((c) => c.id === order.customerId) || {
                    name: 'Guest User',
                    email: 'N/A'
                  };
                  const orderDate = new Date(order.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const courierText =
                    order.courier?.partner !== 'Unassigned'
                      ? `${order.courier.partner} (${order.courier.status})`
                      : 'Unassigned';

                  return (
                    <tr key={order.id} onClick={() => onOpenOrder(order)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{order.id}</td>
                      <td>
                        <div className="customer-cell">
                          <span className="customer-name">{cust.name}</span>
                          <span className="customer-email">{cust.email}</span>
                        </div>
                      </td>
                      <td>{orderDate}</td>
                      <td style={{ fontWeight: 700 }}>₹{order.total.toFixed(2)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{courierText}</td>
                      <td>
                        <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                      </td>
                      <td>
                        <button className="btn-icon-only edit" title="Inspect Order">
                          <Eye style={{ width: 16, height: 16 }} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <div className="pagination-info">
            Showing {filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
          </div>
          <div className="pagination-buttons">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
              Previous
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
