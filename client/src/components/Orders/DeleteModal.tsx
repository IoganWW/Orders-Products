import React from 'react';
import { useAppDispatch } from '@/store';
import { deleteOrder } from '@/store/slices/ordersSlice';
import { Order } from '@/types/orders';

// Интерфейс пропсов обновлен. Теперь он не включает 'onConfirm'
interface DeleteModalProps {
  show: boolean;
  order: Order;
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ show, order, onClose }) => {
  const dispatch = useAppDispatch();

  // Логика удаления теперь внутри компонента
  const handleDelete = async () => {
    try {
      // Предполагаем, что order.id имеет тип number, как в вашем интерфейсе Order
      await dispatch(deleteOrder(order.id)).unwrap();
      onClose(); // Закрываем модальное окно после успешного удаления
    } catch (error) {
      console.error('Failed to delete order:', error);
      // Здесь можно добавить обработку ошибок, например, показать всплывающее уведомление
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Используем Bootstrap классы, как в вашем примере */}
      <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content animate__animated animate__zoomIn">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Confirm Deletion
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
            
            <div className="modal-body">
              <p className="mb-3">
                Are you sure you want to delete this order?
              </p>
              
              <div className="alert alert-warning">
                <h6><strong>{order.title}</strong></h6>
                <p className="mb-1">Order ID: #{order.id}</p>
                <p className="mb-0">Products: {order.products.length}</p>
              </div>
              
              <p className="text-muted small mb-0">
                <i className="fas fa-info-circle me-1"></i>
                This action cannot be undone.
              </p>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                <i className="fas fa-trash me-1"></i>
                Delete Order
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default DeleteModal;