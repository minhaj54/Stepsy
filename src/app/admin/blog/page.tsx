import React from 'react';
import Link from 'next/link';
import { getAdminBlogPosts } from '../../../lib/data/products';
import AdminBlogClient from './AdminBlogClient';

export const metadata = {
  title: 'Blog Management - Super Admin',
};

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();

  return <AdminBlogClient initialPosts={posts} />;
}
