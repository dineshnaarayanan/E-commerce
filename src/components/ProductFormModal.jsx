import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  onSubmit
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('Active');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  // Synchronize modal state fields when opening/editing
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setTitle(editingProduct.title || '');
        setCategory(editingProduct.category || '');
        setStatus(editingProduct.status || 'Active');
        setPrice(editingProduct.price || '');
        setComparePrice(editingProduct.comparePrice || '');
        setStock(editingProduct.stock || '');
        setImage(editingProduct.image || '');
        setDescription(editingProduct.description || '');
      } else {
        setTitle('');
        setCategory('');
        setStatus('Active');
        setPrice('');
        setComparePrice('');
        setStock('');
        setImage('');
        setDescription('');
      }
    }
  }, [isOpen, editingProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      category,
      status,
      price: parseFloat(price) || 0,
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      stock: parseInt(stock) || 0,
      image: image.trim(),
      description
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="product-title">Product Title</label>
              <input
                type="text"
                id="product-title"
                className="input-field"
                placeholder="e.g., Wireless Mechanical Keyboard"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="product-category">Category</label>
                <input
                  type="text"
                  id="product-category"
                  className="input-field"
                  placeholder="e.g., Electronics"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="product-status">Status</label>
                <select
                  id="product-status"
                  className="input-field select-field"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="product-price">Price (₹)</label>
                <input
                  type="number"
                  id="product-price"
                  className="input-field"
                  placeholder="999"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="product-compare-price">Compare-at Price (₹)</label>
                <input
                  type="number"
                  id="product-compare-price"
                  className="input-field"
                  placeholder="1299"
                  step="0.01"
                  min="0"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="product-stock">Stock Qty</label>
                <input
                  type="number"
                  id="product-stock"
                  className="input-field"
                  placeholder="50"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Image</label>
              {image ? (
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
                  <img 
                    src={image} 
                    alt="Preview" 
                    style={{ 
                      width: 70, 
                      height: 70, 
                      objectFit: 'cover', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)' 
                    }} 
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setImage('')}
                    style={{ height: 'auto', padding: '6px 12px', fontSize: 12 }}
                  >
                    Remove & Upload New
                  </button>
                </div>
              ) : (
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  textAlign: 'center',
                  background: 'var(--bg-tertiary)',
                  cursor: 'pointer',
                  position: 'relative',
                  marginTop: 8
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImage(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, width: '100%', height: '100%',
                      opacity: 0, cursor: 'pointer'
                    }}
                    required={!editingProduct}
                  />
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Click or drag image file here to upload (PNG/JPG)
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                className="input-field"
                placeholder="Provide description, specs, or key features of the item..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
