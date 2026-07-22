import React, { Suspense } from 'react';
import CartClient from './CartClient';
import { BreadcrumbSchema } from '../../components/JsonLd';

export const metadata = {
  title: 'Shopping Cart | Review Your Items - Zarwinto',
  description: 'View and manage your shopping cart. Review your selected footwear before checkout. Free shipping on orders above ₹999.',
  keywords: ['shopping cart', 'cart', 'checkout', 'buy shoes', 'Zarwinto cart', 'footwear cart'],
  openGraph: {
    title: 'Shopping Cart | Review Your Items - Zarwinto',
    description: 'View and manage your shopping cart. Review your selected footwear before checkout.',
    url: 'https://zarwinto.com/cart',
    siteName: 'Zarwinto',
    type: 'website',
  },
  alternates: {
    canonical: 'https://zarwinto.com/cart',
  },
};

export default function CartPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://zarwinto.com' },
          { name: 'Cart', url: 'https://zarwinto.com/cart' },
        ]}
      />
      <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8 py-10 text-center">Loading...</div>}>
        <CartClient />
      </Suspense>
    </>
  );
}
