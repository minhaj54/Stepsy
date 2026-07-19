import React from 'react';
import HomeClient from './HomeClient';
import { getProducts, getBrands, getCategories, getHomeBannerProductId, getTestimonials } from '../lib/data/products';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [products, brands, categories, bannerProductId, testimonials] = await Promise.all([
    getProducts(),
    getBrands(),
    getCategories(),
    getHomeBannerProductId(),
    getTestimonials(),
  ]);

  const bannerProduct = bannerProductId
    ? products.find((p) => p.id === bannerProductId) ?? null
    : null;

  return (
    <HomeClient
      products={products}
      brands={brands}
      categories={categories}
      bannerProduct={bannerProduct}
      testimonials={testimonials}
    />
  );
}
