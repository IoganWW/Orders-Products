// client/src/components/Products/DeleteProductModal.tsx
import React from 'react';
import { Product } from '@/types/products';
import ProductItemMini from './ProductItemMini';
import Portal from '@/components/UI/Portal';
import { useTranslation } from 'react-i18next';

interface DeleteProductModalProps {
  show: boolean;
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({ 
  show, 
  product, 
  onClose, 
  onConfirm, 
  isDeleting = false 
}) => {
  const { t } = useTranslation(['common', 'products']);

  if (!show) return null;

  return (
    <Portal>
      <div className="modal fade show d-block" style={{ zIndex: 10001 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '700px' }}>
          <div className="modal-content animate__animated animate__zoomIn border-0 rounded-3 shadow-lg position-relative">
            <button
              type="button"
              className="modalCloseBtn btn-close position-absolute rounded-circle border"
              onClick={onClose}
              aria-label="Закрыть"
            />

            <div className="modal-body px-0 py-0 mt-2">
              <h5 className="p-4 fw-bold mb-0">{t('products:confirmDeleteProduct')}</h5>
              <div className='d-flex border justify-content-between align-items-center px-4 py-2 rounded-2'>
                <ProductItemMini product={product} />
              </div>
            </div>
            
            <div className="modal-footer justify-content-end border-0 pb-4 rounded-bottom-3" style={{backgroundColor:"#69b838ff"}}>
              <button
                type="button"
                className="btn text-white fw-medium"
                onClick={onClose}
                disabled={isDeleting}
              >
                {t('common:cancel')}
              </button>
              <button
                type="button"
                className="btn btn-light px-4 py-2 me-3 border-0 fw-medium text-danger rounded-pill"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" />
                    {t('common:deleting')}...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash me-1"></i>
                    {t('common:delete')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ backgroundColor: 'var(--modal-backdrop)', zIndex: 10000 }}></div>
    </Portal>
  );
};

export default DeleteProductModal;