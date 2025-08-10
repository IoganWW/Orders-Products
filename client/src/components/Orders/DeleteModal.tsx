// client/src/components/Orders/DeleteModal.tsx
import React from 'react';
import { useAppDispatch } from '@/store';
import { deleteOrder } from '@/store/slices/ordersSlice';
import { Order } from '@/types/orders';
import styles from '../Products/Products.module.css';
import Portal from '@/components/UI/Portal';

interface DeleteModalProps {
  show: boolean;
  order: Order;
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ show, order, onClose }) => {
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

            <div className="modal-body py-0 mt-4">
              <h5 className="mb-3">Вы уверены, что хотите удалить этот приход?</h5>
                {/* Список продуктов */}
                {order.products.length > 0 && (
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {order.products.map((product) => {
                        return (
                          <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '0.75rem 1rem', background: 'white', borderRadius: '6px', marginBottom: '0.25rem', border: '1px solid #e9ecef' }}>
                            <div className={`${styles.productCard__statusCircle} ${product.isNew === 1 ? styles.statusCircle__new : styles.statusCircle__used}`}></div>
                            <div className="px-4" style={{ width: '24px', height: '24px', background: '#f1f3f4', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <i className="fas fa-desktop" style={{ fontSize: '1.2rem', color: '#3b4044ff' }}></i>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '500', fontSize: '0.85rem', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {product.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                                SN: {product.serialNumber}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                )}

                {order.products.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '0.9rem', padding: '1rem' }}>
                    <i className="fas fa-inbox me-2"></i>
                    В этом приходе нет продуктов
                  </div>
                )}
            </div>
            
            <div className="modal-footer justify-content-end border-0 pb-4" style={{backgroundColor:"#69b838ff"}}>
              <button
                type="button"
                className="btn"
                onClick={onClose}
                style={{ fontWeight: '500', color: 'white' }}
              >
                ОТМЕНИТЬ
              </button>
              <button
                type="button"
                className="btn btn-light px-4 py-2 me-3"
                onClick={handleDelete}
                style={{ borderRadius: '25px', fontWeight: '500', color: '#dc3545', border: 'none' }}
              >
                <i className="fas fa-trash me-1"></i>
                УДАЛИТЬ
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