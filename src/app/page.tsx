import React from 'react';
import HomeClient from './HomeClient';
import { getProducts, getBrands, getCategories } from '../lib/data/products';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [products, brands, categories] = await Promise.all([
    getProducts(),
    getBrands(),
    getCategories(),
  ]);

  return (
    <HomeClient products={products} brands={brands} categories={categories} />
  );
}
