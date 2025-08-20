// client/src/components/Orders/OrderDetails.tsx
import React, { useState } from 'react';
import { Order } from '@/types/orders';
import AddProductForm from '@/components/Products/AddProductForm';
import OrderProductsList from './OrderProductList';
import { useTranslation } from 'react-i18next';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onDeleteProduct: (orderId: number, productId: number) => Promise<void>;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose, onDeleteProduct }) => {
  const { t } = useTranslation(['products']);
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const handleAddProductClick = () => {
    setShowAddProductForm(true);
  };

  const handleAddProductFormClose = () => {
    setShowAddProductForm(false);
  };

  return (
    <>
      <div className="order-details animate__animated animate__slideInRight position-relative bg-white rounded shadow-sm">
        <button
          type="button"
          className="btn-close position-absolute bg-white border-0 p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
          style={{ 
            top: '0', 
            right: '0',
            transform: 'translate(50%, -50%)',
            width: '35px', 
            height: '35px',
            zIndex: 50 
          }}
          onClick={onClose}
          aria-label="Закрыть"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="text-secondary"
          >
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
          </svg>
        </button>
        
        <div className="position-relative d-flex px-4 py-4">
          <h5 className="mb-0">
            {order.title}
          </h5>
        </div>

        <div>
          <div className="d-flex gap-2 mb-3 align-items-center px-4">
            <button
              className="btn px-0 text-success d-flex align-items-center gap-3 border-0 bg-transparent hover-text-success-emphasis"
              onClick={handleAddProductClick}
            >
              <i className="fa-sharp fa-solid fa-circle-plus fa-lg" />
              {t('products:addProduct')}
            </button>
          </div>

          <OrderProductsList
            products={order.products}
            orderId={order.id}
            onDeleteProduct={onDeleteProduct}
          />
        </div>
      </div>

      {/* Форма добавления продукта */}
      <AddProductForm
        show={showAddProductForm}
        orderId={order.id}
        onClose={handleAddProductFormClose}
      />
    </>
  );
};

export default OrderDetails;