import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  product,
  onConfirm
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Product?</h3>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-body" style={{ padding: 24, textAlign: 'center' }}>
          <AlertTriangle style={{ width: 52, height: 52, color: 'var(--danger)', marginBottom: 16, display: 'inline-block' }} />
          <p style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 8, fontWeight: 600 }}>
            Are you absolutely sure?
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            This action will permanently delete <strong>"{product.title}"</strong> from the catalog inventory. This cannot be undone.
          </p>
        </div>
        <div className="modal-footer" style={{ padding: '16px 24px', backgroundColor: 'var(--bg-tertiary)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Keep Product
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}
