import React from 'react';
import { Product } from '@/types/products';
import { formatDate, isDateExpired } from '@/utils/dateUtils';
import { formatPrice } from '@/utils/currencyUtils';
import styles from './Products.module.css';
import { Monitor, Keyboard, Laptop } from 'lucide-react'; // Импортируем иконки из lucide-react

interface ProductCardProps {
  product: Product;
  orderTitle: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, orderTitle }) => {
  // Заглушки для функций, если они не импортированы или не определены
  const formatPrice = (priceArray: any[]) => {
    const defaultPrice = priceArray.find(p => p.isDefault === 1) || priceArray[0]; // Ищем isDefault: 1, иначе берем первый
    const secondaryPrices = priceArray.filter(p => p.isDefault !== 1);
    return {
      default: defaultPrice ? `${defaultPrice.value} ${defaultPrice.symbol}` : '',
      secondary: secondaryPrices
    };
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      short: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      long: date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
    };
  };
  const isDateExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };


  const price = formatPrice(product.price);
  const guaranteeStart = formatDate(product.guarantee.start);
  const guaranteeEnd = formatDate(product.guarantee.end);
  const isGuaranteeExpired = isDateExpired(product.guarantee.end);

  return (
    <div className={`${styles.productCard} product-card animate__animated animate__fadeIn`}>
      {/* Колонка 1: Кружок статуса, Иконка типа, Название продукта, Серийный номер */}
      <div className={`${styles.productCard__col1}`}>
        <div className={`${styles.productCard__statusCircle} ${product.isNew === 1 ? styles.statusCircle__new : styles.statusCircle__used}`}></div>
        <div className={`${styles.productCard__typeIcon}`}>
          {product.type === 'Monitors' && <Monitor size={20} />}
          {product.type === 'Keyboards' && <Keyboard size={20} />}
          {product.type === 'Laptops' && <Laptop size={20} />}
          {/* Если тип не соответствует, можно использовать дефолтную иконку FontAwesome */}
          {product.type !== 'Monitors' && product.type !== 'Keyboards' && product.type !== 'Laptops' && <i className="fas fa-box fa-lg text-muted"></i>}
        </div>
        <div className={`${styles.productCard__titleAndSerial}`}>
          <h5 className={`${styles.productCard__title}`}>
            {product.title}
          </h5>
          <span className={`${styles.productCard__serialNumber}`}>SN-{product.serialNumber}</span>
        </div>
        <div className={`${styles.productCard__col2}`}>
          <span className={`${product.isNew === 1 ? styles.statusAvailable : styles.statusOnRepair}`}>
            {product.isNew === 1 ? 'Свободен' : 'На ремонте'}
          </span>
        </div>
      </div>

      <div className={`${styles.productCard__guaranteeDates}`}>
        <span>
          <small className="text-muted">From:</small>{guaranteeStart.short}
        </span>
        <span className={isGuaranteeExpired ? 'text-danger' : 'text-success'}>
          <small className="text-muted">Until:</small>{guaranteeEnd.short}
        </span>
      </div>
      <div className={`${styles.productCard__col2}`}>
        <span>{product.isNew ? 'Новый' : 'Б/У'}</span>
      </div>
      
      {/* Колонка 3: Цена */}
      <div className={`${styles.productCard__col3}`}>
        {price.secondary.length > 0 && (
          <div className={`${styles.productCard__priceSecondary}`}>
            {price.secondary.map((p, index) => (
              <span key={index}>{p.value} {p.symbol}</span>
            ))}
          </div>
        )}
        <div className={`${styles.productCard__priceMain}`}>
          {price.default}
        </div>
      </div>

      {/* Колонка 5: Длинное описание / Название группы */}
      <div className={`${styles.productCard__col5_description}`}>
        <span className={`${styles.productCard__descriptionText}`}>
          Длинное предлинное длиннющее название группы
        </span>
      </div>

      {/* Колонка 6: Название прихода / Имя человека */}
      <div className={`${styles.productCard__col6_order}`}>
        <span className={`${styles.productCard__orderTitle}`}>{orderTitle}</span>
        {/* <span className={`${styles.productCard__personName}`}>Христорождественский Александр</span> */}
      </div>

      <span className="badge bg-info">{product.type}</span>

      {/* Колонка 7: Гарантия и Дата добавления */}
        <small className="text-muted">
          Added: {formatDate(product.date).short}
        </small>
    </div>
  );
};

export default ProductCard;
