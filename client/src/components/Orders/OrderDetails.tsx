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
          className="modalCloseBtn btn-close position-absolute rounded-circle border"
          onClick={onClose}
          aria-label="Закрыть"
        />

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
    </div >

      {/* Форма добавления продукта */ }
      < AddProductForm
  show = { showAddProductForm }
  orderId = { order.id }
  onClose = { handleAddProductFormClose }
    />
    </>
  );
};

export default OrderDetails;