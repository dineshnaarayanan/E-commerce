import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2
} from 'lucide-react';

export default function ProductsView({
  products,
  globalSearch,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}) {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const itemsPerPage = 6;

  // Extract all categories
  const categoriesList = useMemo(() => {
    return ['All', ...new Set(products.map((p) => p.category))];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (categoryFilter !== 'All') {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (statusFilter !== 'All') {
      result = result.filter((p) => p.status === statusFilter);
    }
    const search = (searchQuery || globalSearch).toLowerCase().trim();
    if (search) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }
    return result;
  }, [products, categoryFilter, statusFilter, searchQuery, globalSearch]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Product Catalog</h1>
          <p>Create, update, and remove products in your digital store.</p>
        </div>
        <button className="btn btn-primary" onClick={() => onAddProduct()}>
          <Plus style={{ width: 16, height: 16 }} />
          Add Product
        </button>
      </div>

      <div className="content-card">
        <div className="filters-bar">
          <div className="filters-left">
            <select
              className="input-field select-field"
              style={{ width: 180, padding: '8px 16px', height: 'auto' }}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <select
              className="input-field select-field"
              style={{ width: 150, padding: '8px 16px', height: 'auto' }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="search-input-wrapper">
              <Search style={{ width: 16, height: 16 }} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <button
              className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid style={{ width: 18, height: 18 }} />
            </button>
            <button
              className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Grid visual renderer */}
        {viewMode === 'grid' ? (
          <div className="products-grid">
            {paginatedProducts.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 0' }}>
                No products found.
              </div>
            ) : (
              paginatedProducts.map((prod) => {
                let stockClass = 'stock-in';
                let stockText = `${prod.stock} in stock`;
                if (prod.stock === 0) {
                  stockClass = 'stock-out';
                  stockText = 'Out of Stock';
                } else if (prod.stock < 5) {
                  stockClass = 'stock-low';
                  stockText = `Low stock (${prod.stock})`;
                }

                return (
                  <div key={prod.id} className="product-card">
                    <div className="product-card-img-wrapper">
                      <img src={prod.image} alt={prod.title} className="product-card-img" />
                      <span
                        className="product-card-tag"
                        style={{
                          backgroundColor: prod.status === 'Active' ? 'var(--success)' : 'var(--text-muted)'
                        }}
                      >
                        {prod.status}
                      </span>
                    </div>
                    <div className="product-card-content">
                      <div className="product-card-category">{prod.category}</div>
                      <h4 className="product-card-title">{prod.title}</h4>
                      <div className="product-card-price-row">
                        <span className="product-card-price">₹{prod.price.toFixed(2)}</span>
                        {prod.comparePrice && (
                          <span className="product-card-compare-price">₹{prod.comparePrice.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="product-card-stock">
                        <span className={`stock-indicator ${stockClass}`}></span>
                        <span>{stockText}</span>
                      </div>
                    </div>
                    <div className="product-card-actions">
                      <button className="btn-icon-only" onClick={() => onEditProduct(prod)} title="Edit">
                        <Edit3 style={{ width: 14, height: 14 }} />
                      </button>
                      <button className="btn-icon-only" onClick={() => onDeleteProduct(prod)} title="Delete">
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* List (Table) visual renderer */
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>
                      No products found.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((prod) => {
                    let stockClass = 'stock-in';
                    let stockText = `${prod.stock} in stock`;
                    if (prod.stock === 0) {
                      stockClass = 'stock-out';
                      stockText = 'Out of Stock';
                    } else if (prod.stock < 5) {
                      stockClass = 'stock-low';
                      stockText = `Low stock (${prod.stock})`;
                    }

                    return (
                      <tr key={prod.id}>
                        <td>
                          <div className="table-product">
                            <img src={prod.image} alt="" className="table-product-img" />
                            <div className="table-product-info">
                              <span className="table-product-title">{prod.title}</span>
                              <span className="table-product-sku">ID: {prod.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>{prod.category}</td>
                        <td style={{ fontWeight: 700 }}>₹{prod.price.toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className={`stock-indicator ${stockClass}`}></span>
                            <span>{stockText}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: prod.status === 'Active' ? 'var(--success-light)' : 'var(--border-color)',
                              color: prod.status === 'Active' ? 'var(--success)' : 'var(--text-secondary)'
                            }}
                          >
                            {prod.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-icon-only edit" onClick={() => onEditProduct(prod)} title="Edit">
                              <Edit3 style={{ width: 14, height: 14 }} />
                            </button>
                            <button className="btn-icon-only delete" onClick={() => onDeleteProduct(prod)} title="Delete">
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination-row">
          <div className="pagination-info">
            Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
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
