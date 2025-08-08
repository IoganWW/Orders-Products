// client/src/components/Orders/DeleteModal.tsx
import React from 'react';
import { useAppDispatch } from '@/store';
import { deleteOrder } from '@/store/slices/ordersSlice';
import { Order } from '@/types/orders';

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
    <>
      <div className="modal fade show" style={{ display: 'block', zIndex: 1060 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
          <div className="modal-content animate__animated animate__zoomIn" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            
            <div className="modal-body text-center p-4">
              <div style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', borderRadius: '12px', padding: '2rem', color: 'white', marginBottom: '1.5rem' }}>
                <i className="fas fa-question-circle fa-3x mb-3"></i>
                <h4 className="mb-2">Вы уверены, что хотите удалить этот приход?</h4>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8ecf0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-desktop" style={{ color: '#6c757d' }}></i>
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: '500', color: '#333', marginBottom: '0.25rem' }}>
                    Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                    SN-12 3456789
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer justify-content-center border-0 pb-4">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2"
                onClick={onClose}
                style={{ borderRadius: '25px', fontWeight: '500' }}
              >
                ОТМЕНИТЬ
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 py-2 ms-3"
                onClick={handleDelete}
                style={{ borderRadius: '25px', fontWeight: '500', background: '#dc3545', border: 'none' }}
              >
                <i className="fas fa-trash me-1"></i>
                УДАЛИТЬ
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}></div>
    </>
  );
};

export default DeleteModal;