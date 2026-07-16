import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getReviewsByProductId, getRelatedProducts } from '../../../lib/data/products';
import { getStoreById } from '../../../lib/data/stores';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: "Footwear Product Not Found - Zarwinto"
    };
  }

  return {
    title: `${product.title} | ${product.brand_name} - Zarwinto`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.title} | ${product.brand_name} - Zarwinto`,
      description: product.description.substring(0, 160),
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
          alt: product.title
        }
      ]
    }
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [reviews, relatedProducts, store] = await Promise.all([
    getReviewsByProductId(product.id),
    getRelatedProducts(product),
    product.store_id ? getStoreById(product.store_id) : Promise.resolve(null),
  ]);

  return <ProductDetailClient product={product} store={store} initialReviews={reviews} relatedProducts={relatedProducts} />;
}
