// client/src/components/Products/AddProductForm.tsx
'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProducts } from '@/store/slices/productsSlice';
import { fetchOrders } from '@/store/slices/ordersSlice';
import FormField from '@/components/UI/FormField';
import Portal from '@/components/UI/Portal';
import { useFormValidation, FieldConfig } from '@/hooks/useFormValidation';
import { ProductType } from '@/types/products';

interface AddProductFormProps {
  show: boolean;
  orderId?: number;
  onClose: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ show, orderId, onClose }) => {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector(state => state.orders);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productTypes: ProductType[] = ['Monitors', 'Laptops', 'Keyboards', 'Phones', 'Tablets'];

  const initialValues = {
    title: '',
    type: 'Monitors' as ProductType,
    specification: '',
    serialNumber: '',
    isNew: 1,
    priceUSD: '',
    priceUAH: '',
    guaranteeStart: new Date().toISOString().slice(0, 10),
    guaranteeEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    order: orderId || (orders[0]?.id || 1),
  };

  const validationConfig: FieldConfig = {
    title: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    specification: {
      required: true,
      minLength: 10,
      maxLength: 500
    },
    serialNumber: {
      required: true,
      pattern: /^[A-Za-z0-9-]+$/,
      custom: (value) => {
        if (value && value.length < 4) {
          return 'Серийный номер должен содержать минимум 4 символа';
        }
        return null;
      }
    },
    priceUSD: {
      required: true,
      custom: (value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
          return 'Цена должна быть положительным числом';
        }
        if (num > 999999) {
          return 'Цена слишком большая';
        }
        return null;
      }
    },
    priceUAH: {
      required: true,
      custom: (value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
          return 'Цена должна быть положительным числом';
        }
        if (num > 999999) {
          return 'Цена слишком большая';
        }
        return null;
      }
    },
    guaranteeStart: {
      required: true
    },
    guaranteeEnd: {
      required: true,
      custom: (value) => {
        const startDate = new Date(values.guaranteeStart);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          return 'Дата окончания гарантии должна быть позже даты начала';
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
      const productData = {
        ...values,
        serialNumber: parseInt(values.serialNumber),
        price: [
          { value: parseFloat(values.priceUSD), symbol: 'USD', isDefault: 0 },
          { value: parseFloat(values.priceUAH), symbol: 'UAH', isDefault: 1 }
        ],
        guarantee: {
          start: `${values.guaranteeStart} 00:00:00`,
          end: `${values.guaranteeEnd} 23:59:59`
        },
        photo: 'pathToFile.jpg',
        date: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        // Обновляем и продукты и заказы, чтобы новый продукт появился в деталях заказа
        dispatch(fetchProducts());
        dispatch(fetchOrders());
        
        resetForm();
        onClose();
        
        const successEvent = new CustomEvent('showNotification', {
          detail: { type: 'success', message: 'Продукт успешно добавлен!' }
        });
        window.dispatchEvent(successEvent);
      } else {
        throw new Error('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      
      const errorEvent = new CustomEvent('showNotification', {
        detail: { type: 'error', message: 'Ошибка при создании продукта' }
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
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
            <div className="modal-header bg-info text-white" style={{ borderRadius: '12px 12px 0 0' }}>
              <h5 className="modal-title">
                Добавить новый продукт
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
                disabled={isSubmitting}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-3">
                <div className="row">
                  <div className="col-md-8">
                    <FormField
                      label="Название продукта"
                      name="title"
                      value={values.title}
                      error={errors.title}
                      touched={touched.title}
                      placeholder="Введите название продукта"
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <FormField
                      label="Тип продукта"
                      name="type"
                      value={values.type}
                      error={errors.type}
                      touched={touched.type}
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <select
                        className="form-select"
                        value={values.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        onBlur={() => handleBlur('type')}
                      >
                        {productTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                </div>

                <FormField
                  label="Спецификация"
                  name="specification"
                  type="textarea"
                  value={values.specification}
                  error={errors.specification}
                  touched={touched.specification}
                  placeholder="Подробное описание характеристик продукта"
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <div className="row">
                  <div className="col-md-4">
                    <FormField
                      label="Серийный номер"
                      name="serialNumber"
                      value={values.serialNumber}
                      error={errors.serialNumber}
                      touched={touched.serialNumber}
                      placeholder="Например: ABC123-456"
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <FormField
                      label="Состояние"
                      name="isNew"
                      value={values.isNew}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <select
                        className="form-select"
                        value={values.isNew}
                        onChange={(e) => handleChange('isNew', parseInt(e.target.value))}
                      >
                        <option value={1}>Новый</option>
                        <option value={0}>Б/у</option>
                      </select>
                    </FormField>
                  </div>

                  <div className="col-md-4">
                    <FormField
                      label="Приход"
                      name="order"
                      value={values.order}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <select
                        className="form-select"
                        value={values.order}
                        onChange={(e) => handleChange('order', parseInt(e.target.value))}
                      >
                        {orders.map(order => (
                          <option key={order.id} value={order.id}>
                            {order.title}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <FormField
                      label="Цена USD"
                      name="priceUSD"
                      type="number"
                      value={values.priceUSD}
                      error={errors.priceUSD}
                      touched={touched.priceUSD}
                      placeholder="0.00"
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <FormField
                      label="Цена UAH"
                      name="priceUAH"
                      type="number"
                      value={values.priceUAH}
                      error={errors.priceUAH}
                      touched={touched.priceUAH}
                      placeholder="0.00"
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <FormField
                      label="Гарантия с"
                      name="guaranteeStart"
                      type="date"
                      value={values.guaranteeStart}
                      error={errors.guaranteeStart}
                      touched={touched.guaranteeStart}
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <FormField
                      label="Гарантия до"
                      name="guaranteeEnd"
                      type="date"
                      value={values.guaranteeEnd}
                      error={errors.guaranteeEnd}
                      touched={touched.guaranteeEnd}
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0" style={{ borderRadius: '0 0 12px 12px' }}>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn btn-info"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Создание...
                    </>
                  ) : (
                    <>
                      Добавить продукт
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

export default AddProductForm;