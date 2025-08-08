// client/src/components/Orders/OrderDetails.tsx
import React, { useState } from 'react';
import { Order } from '@/types/orders';
import { Product } from '@/types/products';
import AddProductForm from '@/components/Products/AddProductForm';
import DeleteProductModal from '@/components/Products/DeleteProductModal';
import styles from './Orders.module.css';

// Обновленный интерфейс для OrderDetailsProps
interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onDeleteProduct: (orderId: number, productId: number) => Promise<void>;
  onAddProduct: (orderId: number) => void;
}

// Обновленный интерфейс для OrderProductItem с модалкой удаления
const OrderProductItem: React.FC<{ 
  product: Product, 
  orderId: number, 
  onDeleteProduct: (orderId: number, productId: number) => Promise<void>
}> = ({ product, orderId, onDeleteProduct }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getConditionClass = (isNew: 0 | 1) => {
    return isNew === 1 ? styles.productCondition__new : styles.productCondition__used;
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteProduct(orderId, product.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error in delete confirmation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className={`${styles.orderDetails__productItem}`}>
        <div className={`${styles.orderDetails__productIcon}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4ZM11 6H13V8H11V6ZM11 9H13V11H11V9ZM11 12H13V14H11V12ZM11 15H13V17H11V15Z"/>
          </svg>
        </div>
        <div className={`${styles.orderDetails__productInfo}`}>
          <div className={`${styles.orderDetails__productTitle}`}>
            {product.title}
          </div>
          <div className={`${styles.orderDetails__productSerialNumber}`}>
            SN: {product.serialNumber}
          </div>
        </div>
        <div className={`${styles.orderDetails__productCondition} ${getConditionClass(product.isNew)}`}>
          {product.isNew === 1 ? 'Новый' : 'Б/У'}
        </div>
        <button
          type="button"
          className={`${styles.orderDetails__productDeleteButton}`}
          onClick={handleDeleteClick}
          title="Удалить продукт"
          disabled={isDeleting}
        >
          <svg className={styles.orderDetails__productDeleteIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H5C4.45 4 4 4.45 4 5C4 5.55 4.45 6 5 6H19C19.55 6 20 5.55 20 5C20 4.45 19.55 4 19 4Z"/>
          </svg>
        </button>
      </div>

      {/* Модалка удаления продукта */}
      <DeleteProductModal
        show={showDeleteModal}
        product={product}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

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
        <div className={`${styles.orderDetails__header}`}>
          <h5 className={`${styles.orderDetails__title}`}>
            {order.title}
          </h5>
          <button
            type="button"
            className={`${styles.orderDetails__closeButton}`}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
            </svg>
          </button>
        </div>

        <div className={`${styles.orderDetails__content}`}>
          <i 
            className="fa-sharp fa-solid fa-circle-plus fa-lg" 
            style={{color:" #25b01c", cursor: "pointer"}}
            onClick={handleAddProductClick}
            title="Добавить новый продукт"
          ></i>
          <button 
            className={`btn ${styles.orderDetails__addProductButton}`} 
            onClick={handleAddProductClick}
          >
            Добавить продукт
          </button>
            
          <div className={`${styles.orderDetails__productsList}`}>
            {order.products.length === 0 ? (
              <div className={`${styles.orderDetails__noProducts}`}>
                Нет продуктов в этом приходе.
              </div>
            ) : (
              order.products.map((product) => (
                <OrderProductItem 
                  key={product.id} 
                  product={product} 
                  orderId={order.id} 
                  onDeleteProduct={onDeleteProduct} 
                />
              ))
            )}
          </div>
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