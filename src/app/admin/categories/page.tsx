import React from 'react';
import { getBrands, getCategories } from '../../../lib/data/products';
import { createCategory, updateCategory, deleteCategory } from '../../../lib/data/products';
import AdminCategoriesClient from './AdminCategoriesClient';

export const metadata = {
  title: 'Categories Management - Super Admin',
};

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  const brands = await getBrands();

  return <AdminCategoriesClient initialCategories={categories} brands={brands} />;
}
