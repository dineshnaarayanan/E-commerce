import React, { useMemo } from 'react';
import {
  IndianRupee,
  ShoppingCart,
  Truck,
  Box,
  TrendingUp,
  Eye
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function DashboardView({
  products,
  orders,
  customers,
  theme,
  onViewAllOrders,
  onOpenOrder
}) {
  // Compute dashboard metrics
  const metrics = useMemo(() => {
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered');
    const revenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;
    const transitCount = orders.filter((o) => o.status === 'Shipped').length;
    const productsCount = products.length;
    return { revenue, orderCount, transitCount, productsCount };
  }, [orders, products]);

  // Sort orders for recent feed
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [orders]);

  // Chart data setup
  const lineChartData = useMemo(() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueData = [0, 0, 0, 0, 0, 0, 0];
    const orderCountData = [0, 0, 0, 0, 0, 0, 0];
    const dateLabels = [];
    const today = new Date('2026-06-23T12:00:00Z');

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dateLabels.push(daysOfWeek[d.getDay()] + ' ' + d.getDate());

      orders.forEach((o) => {
        const orderDate = new Date(o.date);
        if (orderDate.toDateString() === d.toDateString() && o.status !== 'Cancelled') {
          revenueData[6 - i] += o.total;
          orderCountData[6 - i] += 1;
        }
      });
    }

    return {
      labels: dateLabels,
      datasets: [
        {
          label: 'Daily Revenue (₹)',
          data: revenueData,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.05)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          yAxisID: 'y-rev'
        },
        {
          label: 'Volume (Orders)',
          data: orderCountData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.1,
          yAxisID: 'y-vol'
        }
      ]
    };
  }, [orders]);

  const lineChartOptions = useMemo(() => {
    const isDark = theme === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? 'hsl(240, 10%, 75%)' : 'hsl(240, 25%, 15%)';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: 'Inter', weight: 500 } }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'Inter' } }
        },
        'y-rev': {
          type: 'linear',
          position: 'left',
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: 'Inter' },
            callback: (v) => '₹' + v
          }
        },
        'y-vol': {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: textColor,
            font: { family: 'Inter' },
            stepSize: 1
          }
        }
      }
    };
  }, [theme]);

  const pieChartData = useMemo(() => {
    const counts = { Pending: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });

    return {
      labels: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      datasets: [
        {
          data: [counts.Pending, counts.Shipped, counts.Delivered, counts.Cancelled],
          backgroundColor: [
            'rgb(245, 158, 11)',
            'rgb(6, 182, 212)',
            'rgb(16, 185, 129)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: theme === 'dark' ? 2 : 1,
          borderColor: theme === 'dark' ? 'hsl(240, 18%, 13%)' : '#fff'
        }
      ]
    };
  }, [orders, theme]);

  const pieChartOptions = useMemo(() => {
    const isDark = theme === 'dark';
    const textColor = isDark ? 'hsl(240, 10%, 75%)' : 'hsl(240, 25%, 15%)';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, font: { family: 'Inter' }, padding: 15 }
        }
      },
      cutout: '70%'
    };
  }, [theme]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Overview</h1>
          <p>Real-time analytics and transaction feeds.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper metric-primary">
            <IndianRupee />
          </div>
          <div className="metric-details">
            <div className="metric-label">Total Revenue</div>
            <div className="metric-value">₹{metrics.revenue.toFixed(2)}</div>
            <div className="metric-trend trend-up">
              <TrendingUp style={{ width: 14, height: 14 }} />
              <span>+12.5%</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper metric-success">
            <ShoppingCart />
          </div>
          <div className="metric-details">
            <div className="metric-label">Orders Placed</div>
            <div className="metric-value">{metrics.orderCount}</div>
            <div className="metric-trend trend-up">
              <TrendingUp style={{ width: 14, height: 14 }} />
              <span>+8.2%</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper metric-warning">
            <Truck />
          </div>
          <div className="metric-details">
            <div className="metric-label">In Transit</div>
            <div className="metric-value">{metrics.transitCount}</div>
            <div className="metric-trend text-muted">
              <span>Courier active</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper metric-danger">
            <Box />
          </div>
          <div className="metric-details">
            <div className="metric-label">Total Products</div>
            <div className="metric-value">{metrics.productsCount}</div>
            <div className="metric-trend text-muted">
              <span>In Stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Revenue & Orders Flow</h3>
            <span className="text-muted" style={{ fontSize: 13 }}>Last 7 Days</span>
          </div>
          <div className="chart-wrapper">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Order Status</h3>
            <span className="text-muted" style={{ fontSize: 13 }}>Live Share</span>
          </div>
          <div className="chart-wrapper">
            <Doughnut data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="content-card">
        <div className="card-header">
          <h3>Recent Orders</h3>
          <button className="btn btn-secondary" onClick={onViewAllOrders}>
            View All Orders
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const cust = customers.find((c) => c.id === order.customerId) || { name: 'Guest User' };
                const orderDate = new Date(order.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                return (
                  <tr key={order.id} onClick={() => onOpenOrder(order)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{order.id}</td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{cust.name}</span>
                      </div>
                    </td>
                    <td>{orderDate}</td>
                    <td style={{ fontWeight: 600 }}>₹{order.total.toFixed(2)}</td>
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
