import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

export default function CustomersView({ customers, globalSearch }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered list
  const filteredCustomers = useMemo(() => {
    let result = [...customers];
    const search = (searchQuery || globalSearch).toLowerCase().trim();
    if (search) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.location.toLowerCase().includes(search)
      );
    }
    return result;
  }, [customers, searchQuery, globalSearch]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Customers Registry</h1>
          <p>Examine customer records, shipping metrics, and buyer profiles.</p>
        </div>
      </div>

      <div className="content-card">
        <div className="filters-bar">
          <div></div>
          <div className="search-input-wrapper">
            <Search style={{ width: 16, height: 16 }} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Orders Count</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const initials = cust.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();
                  return (
                    <tr key={cust.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            className="admin-avatar"
                            style={{
                              width: 36,
                              height: 36,
                              fontSize: 13,
                              background: 'linear-gradient(135deg, var(--info), var(--primary))'
                            }}
                          >
                            {initials}
                          </div>
                          <span style={{ fontWeight: 600 }}>{cust.name}</span>
                        </div>
                      </td>
                      <td>{cust.email}</td>
                      <td>{cust.phone}</td>
                      <td>{cust.location}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{cust.orderCount}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{cust.totalSpent.toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
