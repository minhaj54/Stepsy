import React from 'react';
import { getBlogPosts } from '../../lib/data/products';
import BlogIndexClient from './BlogIndexClient';
import { BreadcrumbSchema } from '../../components/JsonLd';

export const metadata = {
  title: "Zarwinto Footwear Blog | Sneaker Trends, Care Guides & Style Tips",
  description: "Read the latest sneaker trends, shoe care guides, style tips, and industry insights on the Zarwinto Footwear Magazine. Your source for everything footwear.",
  keywords: ["footwear blog", "sneaker trends", "shoe care", "style tips", "footwear news", "Zarwinto blog", "sneaker culture", "shoe maintenance"],
  openGraph: {
    title: "Zarwinto Footwear Blog | Sneaker Trends, Care Guides & Style Tips",
    description: "Read the latest sneaker trends, shoe care guides, style tips, and industry insights on the Zarwinto Footwear Magazine.",
    url: "https://zarwinto.com/blog",
    siteName: "Zarwinto",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zarwinto Footwear Blog | Sneaker Trends, Care Guides & Style Tips",
    description: "Read the latest sneaker trends, shoe care guides, style tips, and industry insights on the Zarwinto Footwear Magazine.",
  },
  alternates: {
    canonical: "https://zarwinto.com/blog",
  },
};

export default async function BlogIndexPage() {
  const blogPosts = await getBlogPosts();
  
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://zarwinto.com' },
          { name: 'Blog', url: 'https://zarwinto.com/blog' },
        ]}
      />
      <BlogIndexClient posts={blogPosts} />
    </>
  );
}
