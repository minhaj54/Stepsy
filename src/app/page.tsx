import React from 'react';
import HomeClient from './HomeClient';
import { getProducts, getBrands, getCategories, getHomeBannerProductId, getTestimonials } from '../lib/data/products';

export const metadata = {
  title: "Zarwinto - Premium Footwear & Sneaker Marketplace | Buy Shoes Online",
  description: "Discover the ultimate marketplace for elite athletic runners, custom leather boots, designer sneakers, and comfort footwear. Shop authentic brands with free shipping, COD, and easy returns.",
  keywords: ["buy shoes online", "footwear marketplace", "sneakers", "boots", "loafers", "formal shoes", "athletic shoes", "Zarwinto", "online shoe store", "best footwear brand", "premium shoes", "designer sneakers"],
  openGraph: {
    title: "Zarwinto - Premium Footwear & Sneaker Marketplace",
    description: "Discover the ultimate marketplace for elite athletic runners, custom leather boots, designer sneakers, and comfort footwear.",
    url: "https://zarwinto.com",
    siteName: "Zarwinto",
    type: "website",
    images: [
      {
        url: "https://zarwinto.com/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Zarwinto - Premium Footwear Marketplace",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zarwinto - Premium Footwear & Sneaker Marketplace",
    description: "Discover the ultimate marketplace for elite athletic runners, custom leather boots, designer sneakers, and comfort footwear.",
    images: ["https://zarwinto.com/favicon.ico"],
  },
  alternates: {
    canonical: "https://zarwinto.com",
  },
};

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
