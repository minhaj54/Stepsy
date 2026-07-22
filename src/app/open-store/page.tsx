import React, { Suspense } from 'react';
import OpenStoreClient from './OpenStoreClient';
import { BreadcrumbSchema } from '../../components/JsonLd';

export const metadata = {
  title: 'Open Your Store | Start Selling Online - Zarwinto Seller Program',
  description: 'Start selling on Zarwinto. Open your own footwear store and reach thousands of customers across India. Zero setup fees, dedicated dashboard, and logistics support.',
  keywords: ['open store', 'start selling', 'sell shoes online', 'seller program', 'marketplace seller', 'footwear business', 'online store', 'Zarwinto seller'],
  openGraph: {
    title: 'Open Your Store | Start Selling Online - Zarwinto Seller Program',
    description: 'Start selling on Zarwinto. Open your own footwear store and reach thousands of customers across India.',
    url: 'https://zarwinto.com/open-store',
    siteName: 'Zarwinto',
    type: 'website',
  },
  alternates: {
    canonical: 'https://zarwinto.com/open-store',
  },
};

export default function OpenStorePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://zarwinto.com' },
          { name: 'Open Your Store', url: 'https://zarwinto.com/open-store' },
        ]}
      />
      <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8 py-10 text-center">Loading...</div>}>
        <OpenStoreClient />
      </Suspense>
    </>
  );
}
