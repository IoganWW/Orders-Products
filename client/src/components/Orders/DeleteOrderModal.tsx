// client/src/components/Orders/DeleteModal.tsx
import React from 'react';
import ProductItemMini from '../Products/ProductItemMini';
import { useAppDispatch } from '@/store';
import { deleteOrder } from '@/store/slices/ordersSlice';
import { Order } from '@/types/orders';
import styles from '../Products/Products.module.css';
import Portal from '@/components/UI/Portal';
import { useTranslation } from 'react-i18next';

interface DeleteModalProps {
  show: boolean;
  order: Order;
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ show, order, onClose }) => {
  const { t } = useTranslation(['orders', 'common']);
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      await dispatch(deleteOrder(order.id)).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

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
              <h5 className="p-4 fw-bold">{t('orders:deleteConfirm')}</h5>
              {/* Список продуктов */}
              {order.products.length > 0 && (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="d-flex flex-column gap-1">
                  {order.products.map((product) => (
                    <div
                      key={product.id}
                      className='d-flex border border-1 justify-content-between align-items-center px-4 py-2 rounded-2'
                    >
                      <ProductItemMini product={product} />
                    </div>
                  ))}
                </div>
              )}

              {order.products.length === 0 && (
                <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '0.9rem', padding: '1rem' }}>
                  <i className="fas fa-inbox me-2"></i>
                  {t('orders:noProducts')}
                </div>
              )}
            </div>

            <div className="modal-footer justify-content-end border-0 pb-4" style={{ backgroundColor: "#69b838ff" }}>
              <button
                type="button"
                className="btn"
                onClick={onClose}
                style={{ fontWeight: '500', color: 'white' }}
              >
                {t('common:cancel')}
              </button>
              <button
                type="button"
                className="btn btn-light px-4 py-2 me-3"
                onClick={handleDelete}
                style={{ borderRadius: '25px', fontWeight: '500', color: '#dc3545', border: 'none' }}
              >
                <i className="fas fa-trash me-1"></i>
                {t('common:delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000 }}></div>
    </Portal>
  );
};

export default DeleteModal;