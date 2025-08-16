// client/src/components/Products/DeleteProductModal.tsx
import React from 'react';
import { Product } from '@/types/products';
import ProductItemMini from './ProductItemMini';
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
            <button
              type="button"
              className={`${styles.orderDetails__closeButton}`}
              onClick={onClose}
              aria-label="Закрыть"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
              </svg>
            </button>
            <div className="modal-body px-0 py-0 mt-2">
              <h5 className="p-4 fw-bold">Вы уверены, что хотите удалить этот продукт?</h5>
              <div className='d-flex border border-1 justify-content-between align-items-center px-4 py-2 rounded-2'>
                <ProductItemMini product={product} />
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