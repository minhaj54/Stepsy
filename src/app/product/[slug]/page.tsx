import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getReviewsByProductId } from '../../../lib/data/products';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: "Footwear Product Not Found - Stepzy"
    };
  }

  return {
    title: `${product.title} | ${product.brand_name} - Stepzy`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.title} | ${product.brand_name} - Stepzy`,
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

  const reviews = await getReviewsByProductId(product.id);

  return <ProductDetailClient product={product} initialReviews={reviews} />;
}
