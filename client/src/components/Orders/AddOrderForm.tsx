// client/src/components/Orders/AddOrderForm.tsx
'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/store';
import { fetchOrders } from '@/store/slices/ordersSlice';
import FormField from '@/components/UI/FormField';
import Portal from '@/components/UI/Portal';
import { useFormValidation, FieldConfig } from '@/hooks/useFormValidation';
import { useTranslation } from 'react-i18next';

interface AddOrderFormProps {
  show: boolean;
  onClose: () => void;
}

const AddOrderForm: React.FC<AddOrderFormProps> = ({ show, onClose }) => {
  const { t } = useTranslation(['orders', 'common']);
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 16), // datetime-local format
  };

  const validationConfig: FieldConfig = {
    title: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    description: {
      required: true,
      minLength: 5,
      maxLength: 500
    },
    date: {
      required: true,
      custom: (value) => {
        const selectedDate = new Date(value);
        const now = new Date();
        if (selectedDate > now) {
          return 'Дата не может быть в будущем';
        }
        return null;
      }
    }
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm
  } = useFormValidation(initialValues, validationConfig);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        dispatch(fetchOrders()); // Обновляем список
        resetForm();
        onClose();
        
        // Показываем уведомление об успехе
        const successEvent = new CustomEvent('showNotification', {
          detail: { type: 'success', message: t('orders:incomeCreatedSuccess') }
        });
        window.dispatchEvent(successEvent);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      
      const errorEvent = new CustomEvent('showNotification', {
        detail: { type: 'error', message: t('orders:incomeCreateError') }
      });
      window.dispatchEvent(errorEvent);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show) return null;

  return (
    <Portal>
      <div className="modal fade show" style={{ display: 'block', zIndex: 10001 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{ borderRadius: '12px', border: '1px solid' }}>
            <div className="modal-header bg-success text-white" style={{ borderRadius: '12px 12px 0 0' }}>
              <h5 className="modal-title">
                {t('orders:addOrder')}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
                disabled={isSubmitting}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                <div className="row">
                  <div className="col-md-6">
                    <FormField
                      label={t('orders:incomeTitle')}
                      name="title"
                      value={values.title}
                      error={errors.title}
                      touched={touched.title}
                      placeholder={t('orders:enterIncomeTitle')}
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <FormField
                      label={t('orders:incomeDate')}
                      name="date"
                      type="datetime-local"
                      value={values.date}
                      error={errors.date}
                      touched={touched.date}
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                <FormField
                  label={t('orders:incomeDescription')}
                  name="description"
                  type="textarea"
                  value={values.description}
                  error={errors.description}
                  touched={touched.description}
                  placeholder={t('orders:enterIncomeDescription')}
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="modal-footer border-0" style={{ borderRadius: '0 0 12px 12px' }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {t('common:cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      {t('common:adding')}...
                    </>
                  ) : (
                    <>
                     {t('common:add')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}></div>
    </Portal>
  );
};

export default AddOrderForm;