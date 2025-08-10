// client/src/components/Products/DeleteProductModal.tsx
import React from 'react';
import { Product } from '@/types/products';
import styles from '../Products/Products.module.css';
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
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '700px' }}>
          <div className="modal-content animate__animated animate__zoomIn" style={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            
            <div className="modal-body py-0 mt-4">
              <h5 className="mb-3">Вы уверены, что хотите удалить этот продукт?</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                <div className={`${styles.productCard__statusCircle} ${product.isNew === 1 ? styles.statusCircle__new : styles.statusCircle__used}`}></div>
                <div className="px-4" style={{ width: '24px', height: '24px', background: '#f1f3f4', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fas fa-desktop" style={{ fontSize: '1.2rem', color: '#3b4044ff' }}></i>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: '500', color: '#333', marginBottom: '0.25rem' }}>
                    {product.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    SN-{product.serialNumber}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#28a745', fontWeight: '500', marginTop: '0.25rem' }}>
                  {product.price.find(p => p.isDefault === 1)?.value} {product.price.find(p => p.isDefault === 1)?.symbol}
                </div>
              </div>
            </div>
            
            <div className="modal-footer justify-content-end border-0 pb-4" style={{backgroundColor:"#69b838ff"}}>
              <button
                type="button"
                className="btn"
                onClick={onClose}
                disabled={isDeleting}
                style={{ fontWeight: '500', color: 'white' }}
              >
                ОТМЕНИТЬ
              </button>
              <button
                type="button"
                className="btn btn-light px-4 py-2 me-3"
                onClick={onConfirm}
                disabled={isDeleting}
                style={{ borderRadius: '25px', fontWeight: '500', color: '#dc3545', border: 'none' }}
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