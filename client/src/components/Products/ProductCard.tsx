import React, { useState } from 'react';
import { Product } from '@/types/products';
import { isDateExpired, useSafeDateFormat, useDateFormatter } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/currencyUtils';
import DeleteProductModal from './DeleteProductModal';
import ProductTypeIcon from './ProductTypeIcon';
import { useTranslation } from 'react-i18next';
import styles from '../Products/Products.module.css';

interface ProductCardProps {
  product: Product;
  orderTitle: string;
  onDeleteProduct?: (productId: number) => Promise<void>;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, orderTitle, onDeleteProduct }) => {
  const { t } = useTranslation(['products', 'common']);
  const safeDateFormat = useSafeDateFormat();
  const { formatCustomDate } = useDateFormatter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Простое использование с автоматическими переводами! 🎉
  const guaranteeStart = safeDateFormat(product.guarantee.start);
  const guaranteeEnd = safeDateFormat(product.guarantee.end);
  const isGuaranteeExpired = isDateExpired(product.guarantee.end);
  
  const price = formatPrice(product.price);

  const productDateCustom = product.date ? 
  formatCustomDate(new Date(product.date)) : 
  t('common:notSpecified');

  const handleDeleteClick = () => setShowDeleteModal(true);

  const handleConfirmDelete = async () => {
    if (!onDeleteProduct) return;
    
    setIsDeleting(true);
    try {
      await onDeleteProduct(product.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => setShowDeleteModal(false);

  return (
    <>
      <div className={`bg-white border rounded shadow-sm px-3 py-2 animate__animated animate__fadeIn ${styles.productCardGrid}`}>
        
        {/* Статус индикатор */}
        <div className={`${styles.gridStatus}`}>
          <div 
            className={`rounded-circle ${product.isNew === 1 ? 'bg-warning' : 'bg-dark'}`} 
            style={{ width: '10px', height: '10px' }}
          ></div>
        </div>
        
        {/* Иконка типа */}
        <div className={`${styles.gridIcon}`}>
          <ProductTypeIcon type={product.type} />
        </div>
        
        {/* Название и серийник */}
        <div className={`${styles.gridTitle}`}>
          <h5 className="mb-1 fw-semibold text-decoration-underline fs-6 text-truncate">
            {product.title}
          </h5>
          <span className="text-muted small text-truncate d-block">SN-{product.serialNumber}</span>
        </div>

        {/* Статус текст */}
        <div className={`${styles.gridStatusText} text-center`}>
          <span className={product.isNew === 1 ? 'text-warning' : 'text-dark'}>
            {product.isNew === 1 ? t('products:free') : t('products:underRepair')}
          </span>
        </div>
        
        {/* Цена */}
        <div className={`${styles.gridPrice}`}>
          {price.secondary.length > 0 && (
            <div className="d-flex gap-2 small text-secondary mb-1">
              {price.secondary.map((p, index) => (
                <span key={index}>{p.value} {p.symbol}</span>
              ))}
            </div>
          )}
          <div className="fw-medium">
            {price.default}
          </div>
        </div>
        
        {/* Гарантия */}
        <div className={`${styles.gridWarranty} text-center`}>
          <div className="small mb-1">
            <small className="text-muted">{t('common:from')}:</small> {guaranteeStart}
          </div>
          <div className={`small ${isGuaranteeExpired ? 'text-danger' : 'text-success'}`}>
            <small className="text-muted">{t('common:until')}:</small> {guaranteeEnd}
          </div>
        </div>

        {/* Новый/Б/У */}
        <div className={`${styles.gridCondition} text-center`}>
          <span className="fw-medium">{product.isNew ? t('products:new') : t('products:used')}</span>
        </div>

        {/* Описание */}
        <div className={`${styles.gridDescription}`}>
          <span className="d-block">
            {product.specification || 'Длинное предлинное длиннющее название группы'}
          </span>
        </div>

        {/* Пользователь */}
        <div className={`${styles.gridUser}`}>
          <span className="d-block">Христорождественский Александр</span>
        </div>

        {/* Заказ */}
        <div className={`${styles.gridOrder}`}>
          <span className="d-block">{orderTitle}</span>
        </div>

        {/* Дата */}
        <div className={`${styles.gridDate} text-center`}>
          <small className="text-nowrap">
            {productDateCustom}
          </small>
        </div>

        {/* Кнопка удаления */}
        {onDeleteProduct && (
          <div className={`${styles.gridDelete} text-center`}>
            <button
              type="button"
              className="deleteButton"
              onClick={handleDeleteClick}
              title={t('common:delete')}
              disabled={isDeleting}
            >
              <svg className="deleteButtonIcon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H5C4.45 4 4 4.45 4 5C4 5.55 4.45 6 5 6H19C19.55 6 20 5.55 20 5C20 4.45 19.55 4 19 4Z"/>
              </svg>
            </button>
          </div>
        )}

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

export default ProductCard;