import React, { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';
import { BreadcrumbSchema } from '../../components/JsonLd';
import AuthGuard from '../../components/AuthGuard';

export const metadata = {
  title: 'Secure Checkout | Fast & Safe Payment - Zarwinto',
  description: 'Complete your purchase securely at Zarwinto. Fast checkout with multiple payment options including UPI, cards, and Cash on Delivery.',
  keywords: ['checkout', 'secure payment', 'buy shoes', 'online payment', 'COD', 'UPI payment', 'Zarwinto checkout', 'safe checkout'],
  openGraph: {
    title: 'Secure Checkout | Fast & Safe Payment - Zarwinto',
    description: 'Complete your purchase securely at Zarwinto. Fast checkout with multiple payment options.',
    url: 'https://zarwinto.com/checkout',
    siteName: 'Zarwinto',
    type: 'website',
  },
  alternates: {
    canonical: 'https://zarwinto.com/checkout',
  },
};

export default function CheckoutPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://zarwinto.com' },
          { name: 'Cart', url: 'https://zarwinto.com/cart' },
          { name: 'Checkout', url: 'https://zarwinto.com/checkout' },
        ]}
      />
      <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8 py-10 text-center">Loading...</div>}>
        <AuthGuard>
          <CheckoutClient />
        </AuthGuard>
      </Suspense>
    </>
  );
}
