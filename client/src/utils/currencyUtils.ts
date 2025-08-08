import { Price } from '@/types/common';

export const formatPrice = (prices: Price[]) => {
  const defaultPrice = prices.find(p => p.isDefault === 1);
  const otherPrices = prices.filter(p => p.isDefault === 0);
  
  return {
    default: defaultPrice ? `${defaultPrice.value} ${defaultPrice.symbol}` : '—',
    all: prices.map(p => `${p.value} ${p.symbol}`).join(' / '),
    primary: defaultPrice,
    secondary: otherPrices
  };
};

export const calculateOrderTotal = (products: any[]) => {
  const totals: { [key: string]: number } = {};
  
  products.forEach(product => {
    product.price.forEach((price: Price) => {
      if (!totals[price.symbol]) {
        totals[price.symbol] = 0;
      }
      totals[price.symbol] += price.value;
    });
  });
  
  return Object.entries(totals).map(([symbol, value]) => ({
    value,
    symbol,
    formatted: `${value} ${symbol}`
  }));
};