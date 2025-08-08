import React, { useState } from 'react';
import { Order } from '@/types/orders';
import { formatDate } from '@/utils/dateUtils';
import { calculateOrderTotal } from '@/utils/currencyUtils';
import DeleteModal from './DeleteModal';
import styles from './Orders.module.css';

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onSelect: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isSelected, onSelect }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const formattedDate = formatDate(order.date);
  const totals = calculateOrderTotal(order.products);

  const handleCardClick = () => {
    onSelect(order);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };
  
  return (
    <>
      <div
        className={`
          ${styles.orderCard} 
          ${isSelected ? styles.selected : ''}
          animate__animated animate__fadeIn
        `}
        onClick={handleCardClick}
      >
        <div className={`${styles.orderCard__titleContainer}`}>
          <h5 className={`${styles.orderCard__title}`}>
            {order.title}
          </h5>
        </div>

        <div className={styles.orderCard__middleSection}>
          {/* Иконка в круглой рамке */}
          <div className={styles.orderCard__iconWrapper}>
            <i className="fa-solid fa-list"></i>
          </div>

          {/* Количество продуктов: цифра + под ней "Продукта" */}
          <div className={styles.orderCard__productsValue}>
            <span className={styles.orderCard__productsCountNumber}>{order.products.length}</span>
            <span className={styles.orderCard__productsLabel}>Продукта</span>
          </div>

          {/* Дата */}
          <div className={styles.orderCard__date}>
            {formattedDate.shortMonStr}
          </div>
        </div>
        
        <div className={`${styles.orderCard__rightSection}`}>
          <div className={`${styles.orderCard__totals}`}>
            {totals[0] && (
              <div className={`${styles.orderCard__totalSecondary}`}>
                {totals[0].formatted}
              </div>
            )}
            {totals[1] && (
              <div className={`${styles.orderCard__totalMain}`}>
                {totals[1].formatted}
              </div>
            )}
          </div>
          <button
            type="button"
            className={`${styles.orderCard__deleteButton}`}
            onClick={handleDeleteClick}
            title="Удалить приход"
          >
            <svg className={styles.orderCard__deleteIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H5C4.45 4 4 4.45 4 5C4 5.55 4.45 6 5 6H19C19.55 6 20 5.55 20 5C20 4.45 19.55 4 19 4Z"/>
            </svg>
          </button>
        </div>
        {/* Квадратик со стрелкой теперь находится здесь, как прямой потомок .orderCard */}
        <div className={styles.orderCard__arrowContainer}>
          <svg className={styles.orderCard__arrowIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" />
          </svg>
        </div>
      </div>

      <DeleteModal
        show={showDeleteModal}
        order={order}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
};

export default OrderCard;