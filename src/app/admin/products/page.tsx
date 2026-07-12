import React from 'react';
import { getAdminProducts, getBrands, getCategories } from '../../../lib/data/products';
import AdminProductsClient from './AdminProductsClient';

export const metadata = {
  title: 'Manage Products - Stepzy Admin',
};

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  const brands = await getBrands();
  const categories = await getCategories();

  return (
    <AdminProductsClient
      initialProducts={products}
      brands={brands}
      categories={categories}
    />
  );
}
