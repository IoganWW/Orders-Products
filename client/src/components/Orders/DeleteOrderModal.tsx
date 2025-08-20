// client/src/components/Orders/DeleteModal.tsx
import React from 'react';
import ProductItemMini from '../Products/ProductItemMini';
import { useAppDispatch } from '@/store';
import { deleteOrder } from '@/store/slices/ordersSlice';
import { Order } from '@/types/orders';
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
      <div className="modal fade show d-block" style={{ zIndex: 10001 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '700px' }}>
          <div className="modal-content animate__animated animate__zoomIn border-0 rounded-3 shadow-lg position-relative">
            <button
              type="button"
              className="modalCloseBtn btn-close position-absolute rounded-circle border"
              onClick={onClose}
              aria-label="Закрыть"
            />
            
            <div className="modal-body px-0 py-0 mt-2">
              <h5 className="p-4 fw-bold mb-0">{t('orders:deleteConfirm')}</h5>
              
              {/* Список продуктов */}
              {order.products.length > 0 && (
                <div className="d-flex flex-column gap-1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {order.products.map((product) => (
                    <div
                      key={product.id}
                      className="d-flex border justify-content-between align-items-center px-4 py-2 rounded-2"
                    >
                      <ProductItemMini product={product} />
                    </div>
                  ))}
                </div>
              )}

              {order.products.length === 0 && (
                <div className="text-center text-muted p-4">
                  <i className="fas fa-inbox me-2"></i>
                  {t('orders:noProducts')}
                </div>
              )}
            </div>

            <div className="modal-footer justify-content-end border-0 pb-4 rounded-bottom-3" style={{ backgroundColor: "#69b838ff" }}>
              <button
                type="button"
                className="btn text-white fw-medium"
                onClick={onClose}
              >
                {t('common:cancel')}
              </button>
              <button
                type="button"
                className="btn btn-light px-4 py-2 me-3 border-0 fw-medium text-danger rounded-pill"
                onClick={handleDelete}
              >
                <i className="fas fa-trash me-1"></i>
                {t('common:delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ backgroundColor: 'var(--modal-backdrop)', zIndex: 10000 }}></div>
    </Portal>
  );
};

export default DeleteModal;