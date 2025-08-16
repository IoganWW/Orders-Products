import React, { useState, useMemo } from 'react';
import { Order } from '@/types/orders';
import { formatDate } from '@/utils/dateUtils';
import { calculateOrderTotal } from '@/utils/currencyUtils';
import DeleteOrderModal from './DeleteOrderModal';
import styles from './Orders.module.css';
import { useTranslation } from 'react-i18next';

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onSelect: (order: Order) => void;
  isDetailPanelOpen?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isSelected, onSelect, isDetailPanelOpen = false }) => {
  const { t, i18n } = useTranslation(['orders', 'common']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Мемоизированные вычисления
  const formattedDate = formatDate(order.date, i18n.language);
  const totals = useMemo(() => calculateOrderTotal(order.products), [order.products]);

  const handleCardClick = React.useCallback(() => {
    onSelect(order);
  }, [order, onSelect]);

  const handleDeleteClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  }, []);

  const handleCloseDeleteModal = React.useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  return (
    <>
      <div
        className={`
          ${styles.orderCard}
          ${isSelected ? styles.selected : ''}
          animate__animated animate__fadeIn
          d-flex align-items-center
          bg-white border border-light
          rounded-1 shadow-sm py-1 px-3
          position-relative
        `}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
      >
        {/* Левая часть: Название прихода - адаптивная ширина */}
        {/* На xl экранах (≥1200px) - 50% ширины */}
        <div className={`${styles.orderCard__titleSection} d-none d-xl-flex`} style={{ flexBasis: '50%', maxWidth: '50%' }}>
          <h5 className="text-decoration-underline text-break text-wrap m-0 pe-3">
            {order.title}
          </h5>
        </div>

        {/* На lg экранах (992px-1199px) - 30% ширины */}
        <div className={`${styles.orderCard__titleSection} d-none d-lg-flex d-xl-none`} style={{ flexBasis: '30%', maxWidth: '30%' }}>
          <h5 className="text-decoration-underline text-nowrap text-truncate m-0 pe-3">
            {order.title}
          </h5>
        </div>

        {/* Иконка + количество продуктов - всегда видна */}
        <div className="d-flex align-items-center gap-3 flex-shrink-0">
          <div className={`${styles.orderCard__iconWrapper} d-flex align-items-center justify-content-center`}>
            <i className="fa-solid fa-list"></i>
          </div>
          <div className="d-flex flex-column align-items-start">
            <span className="fw-semibold fs-5">
              {order.products.length}
            </span>
            <span className="small text-muted">{t('orders:product')}</span>
          </div>
        </div>

        {/* Название и дата на мобильных */}
        <div className="d-lg-none flex-grow-1 ms-5">
          <div className="fw-medium text-dark text-truncate">
            <span className={`${styles.orderCard__mobileOrderId} d-none`}>{t('orders:order')} #{order.id}</span>
          </div>
          <div className="small text-muted">
            {formattedDate.shortMonStr}
          </div>
        </div>

        {/* Колонка 2: Дата */}
        <div className="d-none d-lg-flex flex-fill justify-content-start ms-4">
          <div className="text-muted small">
            {formattedDate.shortMonStr}
          </div>
        </div>

        {/* Колонка 3: Суммы */}
        {!isDetailPanelOpen && (
          <div className="d-none d-md-flex flex-grow-1 align-items-start">
            <div className="d-flex flex-fill justify-content-start">
              <div className="d-flex flex-column text-start">
                {totals[1] && (
                  <div className="small text-muted">
                    {totals[1].formatted}
                  </div>
                )}
                {totals[0] && (
                  <div className="fw-medium">
                    {totals[0].formatted}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Кнопка удаления - всегда справа */}
        {!isDetailPanelOpen && (
          <div className="flex-shrink-0">
            <button
              type="button"
              className={`${styles.orderCard__deleteButton} btn btn-link p-2 text-muted border-0 rounded-circle`}
              onClick={handleDeleteClick}
              title={t('common:delete')}
            >
              <svg className={styles.orderCard__deleteIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H5C4.45 4 4 4.45 4 5C4 5.55 4.45 6 5 6H19C19.55 6 20 5.55 20 5C20 4.45 19.55 4 19 4Z" />
              </svg>
            </button>
          </div>
        )}

        {/* Стрелка для выбранной карточки */}
        <div className={`${styles.orderCard__arrowContainer} position-absolute top-0 end-0 h-100 d-none align-items-center justify-content-center rounded-end`}>
          <svg className={styles.orderCard__arrowIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" />
          </svg>
        </div>
      </div>

      <DeleteOrderModal
        show={showDeleteModal}
        order={order}
        onClose={handleCloseDeleteModal}
      />
    </>
  );
};

export default React.memo(OrderCard);