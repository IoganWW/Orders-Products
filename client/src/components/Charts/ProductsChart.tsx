'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAppSelector } from '@/store';
import { ProductType } from '@/types/products';

interface ProductsChartProps {
  className?: string;
}

const ProductsChart: React.FC<ProductsChartProps> = ({ className }) => {
  const { products } = useAppSelector(state => state.products);

  const generateBarData = () => {
    const typeCount: { [key in ProductType]?: number } = {};
    
    products.forEach(product => {
      typeCount[product.type] = (typeCount[product.type] || 0) + 1;
    });

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  const barData = generateBarData();

  return (
    <div className={`${className} card border-0`}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title mb-0">Распределение товаров</h6>
          <small className="text-muted">По типам</small>
        </div>

        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8f9fa" />
              <XAxis 
                dataKey="name" 
                stroke="#6c757d"
                fontSize={11}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#6c757d" 
                fontSize={11}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value}`, 'Количество']}
              />
              <Bar 
                dataKey="value" 
                fill="#6c757d"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted py-5">
            <i className="fas fa-box-open fa-2x mb-2 d-block"></i>
            <small>Нет данных для отображения</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsChart;