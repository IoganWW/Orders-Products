import React, { useState } from 'react';
import { Product } from '@/types/products';
import { formatDate, isDateExpired } from '@/utils/dateUtils';
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
  const { t, i18n } = useTranslation(['products', 'common']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const price = formatPrice(product.price);
  const guaranteeStart = formatDate(product.guarantee.start, i18n.language);
  const guaranteeEnd = formatDate(product.guarantee.end, i18n.language);
  const isGuaranteeExpired = isDateExpired(product.guarantee.end);

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
      <div className={`bg-white border rounded shadow-sm px-3 py-2 animate__animated animate__fadeIn d-flex flex-lg-row flex-column g-0 g-lg-1 ${styles.productCard}`}>
        
        {/* Колонка 1: Статус + Иконка + Название + Серийник */}
        <div className={`d-flex align-items-center gap-4 pb-3 pb-lg-0 ${styles.productCard__col1}`} style={{ width: '600px', minWidth: '600px' }}>
          <div 
            className={`rounded-circle ${product.isNew === 1 ? 'bg-warning' : 'bg-dark'}`} 
            style={{ width: '10px', height: '10px', flexShrink: 0 }}
          ></div>
          
          <ProductTypeIcon type={product.type} />
          
          <div className="flex-fill min-w-0">
            <h5 className="mb-1 fw-semibold text-decoration-underline fs-6 text-nowrap overflow-hidden text-truncate">
              {product.title}
            </h5>
            <span className="text-muted small">SN-{product.serialNumber}</span>
          </div>
        </div>

        {/* Колонка 2: Статус */}
        <div className="d-lg-flex d-none align-items-center justify-content-center text-center px-2" style={{ width: '120px', minWidth: '120px' }}>
          <span className={product.isNew === 1 ? 'text-warning' : 'text-dark'}>
            {product.isNew === 1 ? t('products:free') : t('products:underRepair')}
          </span>
        </div>
        
        {/* Колонка 3: Цены */}
        <div className="d-flex flex-column align-items-start justify-content-center gap-1 px-2 py-2 py-lg-0" style={{ width: '150px', minWidth: '150px' }}>
          {price.secondary.length > 0 && (
            <div className="d-flex gap-2 small text-secondary">
              {price.secondary.map((p, index) => (
                <span key={index}>{p.value} {p.symbol}</span>
              ))}
            </div>
          )}
          <div className="fw-medium">
            {price.default}
          </div>
        </div>
        
        {/* Колонка 4: Гарантия */}
        <div className="d-lg-flex d-md-flex d-none flex-column align-items-center justify-content-center gap-1 px-2" style={{ width: '140px', minWidth: '140px' }}>
          <span className="small">
            <small className="text-muted">{t('common:from')}:</small> {guaranteeStart.short}
          </span>
          <span className={`small ${isGuaranteeExpired ? 'text-danger' : 'text-success'}`}>
            <small className="text-muted">{t('common:until')}:</small> {guaranteeEnd.short}
          </span>
        </div>

        {/* Колонка 5: Новый/Б/У */}
        <div className="d-lg-flex d-none align-items-center justify-content-center px-2" style={{ width: '100px', minWidth: '100px' }}>
          <span className="fw-medium">{product.isNew ? t('products:new') : t('products:used')}</span>
        </div>

        {/* Колонка 6: Описание */}
        <div className="d-lg-flex d-none align-items-center px-2 overflow-hidden" style={{ width: '300px', minWidth: '300px' }}>
          <span className="text-truncate d-block">
            {product.specification || 'Длинное предлинное длиннющее название группы'}
          </span>
        </div>

        {/* Колонка 7: User */}
        <div className="d-flex align-items-center px-2 py-2 py-lg-0 overflow-hidden" style={{ width: '250px', minWidth: '250px' }}>
          <span className="text-truncate d-block">Христорождественский Александр</span>
        </div>

        {/* Колонка 8: Заказ */}
        <div className="d-flex align-items-center px-2 py-2 py-lg-0 overflow-hidden" style={{ width: '300px', minWidth: '300px' }}>
          <span className="text-truncate d-block">{orderTitle}</span>
        </div>

        {/* Колонка 9: Дата */}
        <div className="d-lg-flex d-none align-items-center justify-content-center px-2" style={{ width: '150px', minWidth: '150px' }}>
          <small className="text-nowrap">
            {formatDate(product.date, i18n.language).shortMonStr}
          </small>
        </div>

        {/* Колонка 10: Удаление */}
        {onDeleteProduct && (
          <div className="d-lg-flex d-none align-items-center justify-content-center px-2" style={{ width: '60px', minWidth: '60px' }}>
            <button
              type="button"
              className="deleteButton justify-self-end"
              onClick={handleDeleteClick}
              title={t('common:delete')}
              disabled={isDeleting}
            >
              <svg className="deleteButtonIcon" viewBox="0 0 24 24" fill="currentColor">
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