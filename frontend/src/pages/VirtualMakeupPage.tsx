import React from 'react';
import { useLocation } from 'react-router-dom';
import VirtualMakeup from '../components/VirtualMakeup';

const VirtualMakeupPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('productId');
  const productColor = searchParams.get('color');
  const productName = searchParams.get('name');
  const productImage = searchParams.get('image');
  const productPrice = searchParams.get('price');
  const productCategory = searchParams.get('category');

  return (
    <VirtualMakeup 
      productId={productId || undefined}
      productColor={productColor || undefined}
      productName={productName || undefined}
      productImage={productImage || undefined}
      productPrice={productPrice ? Number(productPrice) : undefined}
      productCategory={productCategory || undefined}
    />
  );
};

export default VirtualMakeupPage; 