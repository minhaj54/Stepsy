import React from 'react';
import { getBlogPosts } from '../../lib/data/products';
import BlogIndexClient from './BlogIndexClient';

export const metadata = {
  title: "Zarwinto Magazine - Footwear Trends & Guides",
  description: "Explore footwear styling tips, sneaker maintenance guides, and technical gear industry reviews."
};

export default async function BlogIndexPage() {
  const blogPosts = await getBlogPosts();
  return <BlogIndexClient posts={blogPosts} />;
}
