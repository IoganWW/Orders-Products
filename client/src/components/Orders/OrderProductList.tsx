import React, { useState } from 'react';
import { Product } from '@/types/products';
import ProductItemMini from '@/components/Products/ProductItemMini';
import DeleteProductModal from '@/components/Products/DeleteProductModal';
import styles from '../Products/Products.module.css';
import { useTranslation } from 'react-i18next';

interface OrderProductsListProps {
  products: Product[];
  orderId: number;
  onDeleteProduct: (orderId: number, productId: number) => Promise<void>;
}

const OrderProductsList: React.FC<OrderProductsListProps> = ({ products, orderId, onDeleteProduct }) => {
  const { t } = useTranslation(['orders', 'products', 'common']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await onDeleteProduct(orderId, productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error in delete confirmation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  if (products.length === 0) {
    return (
      <div className="bg-light p-4 rounded">
        {t('noProducts')}
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-column gap-0">
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`border px-4 py-2 rounded-2 shadow-sm ${styles.productItemCard} ${styles.orderProductGrid}`}
          >
            <ProductItemMini product={product} />
            <span className={`${product.isNew === 1 ? styles.statusAvailable : styles.statusOnRepair} d-none d-xl-flex justify-content-center`}>
              {product.isNew === 1 ? t('products:free') : t('products:underRepair')}
            </span>
            <button
              type="button"
              className="deleteButton justify-self-end"
              onClick={() => handleDeleteClick(product)}
              title={t('common:delete')}
              disabled={isDeleting}
            >
              <svg className="deleteButtonIcon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H5C4.45 4 4 4.45 4 5C4 5.55 4.45 6 5 6H19C19.55 6 20 5.55 20 5C20 4.45 19.55 4 19 4Z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {productToDelete && (
        <DeleteProductModal
          show={showDeleteModal}
          product={productToDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default OrderProductsList;