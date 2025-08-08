// client/src/components/Products/DeleteProductModal.tsx
import React from 'react';
import { Product } from '@/types/products';
import Portal from '@/components/UI/Portal';

interface DeleteProductModalProps {
  show: boolean;
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({ 
  show, 
  product, 
  onClose, 
  onConfirm, 
  isDeleting = false 
}) => {
  if (!show) return null;

  return (
    <Portal>
      <div className="modal fade show" style={{ display: 'block', zIndex: 10001 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
          <div className="modal-content animate__animated animate__zoomIn" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            
            <div className="modal-body text-center p-4">
              <div style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', borderRadius: '12px', padding: '2rem', color: 'white', marginBottom: '1.5rem' }}>
                <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h4 className="mb-2">Вы уверены, что хотите удалить этот продукт?</h4>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8ecf0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-desktop" style={{ color: '#6c757d' }}></i>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: '500', color: '#333', marginBottom: '0.25rem' }}>
                    {product.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    SN-{product.serialNumber}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#28a745', fontWeight: '500', marginTop: '0.25rem' }}>
                    {product.price.find(p => p.isDefault === 1)?.value} {product.price.find(p => p.isDefault === 1)?.symbol}
                  </div>
                </div>
              </div>

              <div className="alert alert-warning text-start">
                <i className="fas fa-info-circle me-2"></i>
                Это действие нельзя отменить. Продукт будет полностью удален из системы.
              </div>
            </div>
            
            <div className="modal-footer justify-content-center border-0 pb-4">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2"
                onClick={onClose}
                disabled={isDeleting}
                style={{ borderRadius: '25px', fontWeight: '500' }}
              >
                ОТМЕНИТЬ
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 py-2 ms-3"
                onClick={onConfirm}
                disabled={isDeleting}
                style={{ borderRadius: '25px', fontWeight: '500', background: '#dc3545', border: 'none' }}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" />
                    УДАЛЕНИЕ...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash me-1"></i>
                    УДАЛИТЬ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000 }}></div>
    </Portal>
  );
};

export default DeleteProductModal;