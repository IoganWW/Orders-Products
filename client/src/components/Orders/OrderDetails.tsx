// client/src/components/Orders/OrderDetails.tsx
import React, { useState } from 'react';
import { Order } from '@/types/orders';
import AddProductForm from '@/components/Products/AddProductForm';
import styles from './Orders.module.css';
import OrderProductsList from './OrderProductList';

// Обновленный интерфейс для OrderDetailsProps
interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onDeleteProduct: (orderId: number, productId: number) => Promise<void>;
  onAddProduct: (orderId: number) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose, onDeleteProduct, onAddProduct }) => {
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const handleAddProductClick = () => {
    setShowAddProductForm(true);
  };

  const handleAddProductFormClose = () => {
    setShowAddProductForm(false);
  };

  return (
    <>
      <div className={`${styles.orderDetails} animate__animated animate__slideInRight`}>
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
        <div className={`${styles.orderDetails__header}`}>
          <h5 className={`${styles.orderDetails__title}`}>
            {order.title}
          </h5>
        </div>

        <div className={`${styles.orderDetails__content}`}>
          <i
            className="fa-sharp fa-solid fa-circle-plus fa-lg ms-4"
            style={{ color: " #25b01c", cursor: "pointer" }}
            onClick={handleAddProductClick}
            title="Добавить новый продукт"
          ></i>
          <button
            className={`btn ${styles.orderDetails__addProductButton}`}
            onClick={handleAddProductClick}
          >
            Добавить продукт
          </button>

          <OrderProductsList
            products={order.products}
            orderId={order.id}
            onDeleteProduct={onDeleteProduct}
          />
        </div>
      </div>

      {/* Форма добавления продукта */}
      < AddProductForm
        show={showAddProductForm}
        orderId={order.id}
        onClose={handleAddProductFormClose}
      />
    </>
  );
};

export default OrderDetails;