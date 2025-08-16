import React, { useState } from 'react';
import { Product } from '@/types/products';
import { formatDate, isDateExpired } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/currencyUtils';
import DeleteProductModal from './DeleteProductModal';
import styles from './Products.module.css';
import ProductTypeIcon from './ProductTypeIcon';

interface ProductCardProps {
  product: Product;
  orderTitle: string;
  onDeleteProduct?: (productId: number) => Promise<void>;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, orderTitle, onDeleteProduct }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const price = formatPrice(product.price);
  const guaranteeStart = formatDate(product.guarantee.start);
  const guaranteeEnd = formatDate(product.guarantee.end);
  const isGuaranteeExpired = isDateExpired(product.guarantee.end);

  // Обработчики удаления
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

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

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className={`${styles.productCard} product-card animate__animated animate__fadeIn d-flex flex-lg-row flex-md-column flex-sm-column flex-column g-0 g-lg-1`}>
        
        {/* Столбец 1: Статус + Иконка + Название + Серийник */}
        <div className={`${styles.productCard__col1} d-flex align-items-center`}>
          <div className={`${styles.productCard__statusCircle} ${product.isNew === 1 ? styles.statusCircle__new : styles.statusCircle__used}`}></div>
          
          <ProductTypeIcon type={product.type} />
          
          <div className={styles.productCard__titleAndSerial}>
            <h5 className={styles.productCard__title}>
              {product.title}
            </h5>
            <span className={styles.productCard__serialNumber}>SN-{product.serialNumber}</span>
          </div>
        </div>

        {/* Столбец 2: Статус */}
        <div className={`${styles.productCard__col2} d-lg-flex d-md-none d-sm-none d-none`}>
          <span className={`${product.isNew === 1 ? styles.statusAvailable : styles.statusOnRepair}`}>
            {product.isNew === 1 ? 'Свободен' : 'На ремонте'}
          </span>
        </div>
        
        {/* Столбец 3: Гарантия */}
        <div className={`${styles.productCard__guaranteeDates} d-lg-flex d-md-flex d-sm-none d-none`}>
          <span>
            <small className="text-muted">From:</small> {guaranteeStart.short}
          </span>
          <span className={isGuaranteeExpired ? 'text-danger' : 'text-success'}>
            <small className="text-muted">Until:</small> {guaranteeEnd.short}
          </span>
        </div>

        {/* Столбец 4: Новый/Б/У */}
        <div className={`${styles.productCard__col_newUsed} d-lg-flex d-md-none d-sm-none d-none`}>
          <span>{product.isNew ? 'Новый' : 'Б/У'}</span>
        </div>

        {/* Столбец 5: Цены */}
        <div className={`${styles.productCard__col3} d-flex flex-column`}>
          {price.secondary.length > 0 && (
            <div className={styles.productCard__priceSecondary}>
              {price.secondary.map((p, index) => (
                <span key={index}>{p.value} {p.symbol}</span>
              ))}
            </div>
          )}
          <div className={styles.productCard__priceMain}>
            {price.default}
          </div>
        </div>

        {/* Столбец 6: Описание */}
        <div className={`${styles.productCard__col5_description} d-lg-block d-md-none d-sm-none d-none`}>
          <span className={styles.productCard__descriptionText}>
            {product.specification || 'Длинное предлинное длиннющее название группы'}
          </span>
        </div>

        {/* Столбец 7: User */}
        <div className={`${styles.productCard__col_user} d-xl-block d-lg-block d-md-block d-sm-block d-block`}>
          <span>Христорождественский Александр</span>
        </div>

        {/* Столбец 8: Заказ */}
        <div className={`${styles.productCard__col6_order} d-xl-block d-lg-block d-md-block d-sm-block d-block`}>
          <span>{orderTitle}</span>
        </div>

        {/* Столбец 9: Дата */}
        <div className={`${styles.productCard__col7} d-lg-flex d-md-none d-sm-none d-none`}>
          <small className={styles.productCard__footerDate}>
            {formatDate(product.date).shortMonStr}
          </small>
        </div>

        {/* Столбец 10: Удаление */}
        {onDeleteProduct && (
          <div className={`${styles.productCard__deleteCol} d-lg-flex d-md-none d-sm-none d-none`}>
            <button
              type="button"
              className={styles.productCard__deleteButton}
              onClick={handleDeleteClick}
              title="Удалить продукт"
              disabled={isDeleting}
            >
              <svg className={styles.productCard__deleteIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
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
