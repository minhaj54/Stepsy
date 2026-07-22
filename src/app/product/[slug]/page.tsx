import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getReviewsByProductId, getRelatedProducts } from '../../../lib/data/products';
import { getStoreById } from '../../../lib/data/stores';
import ProductDetailClient from './ProductDetailClient';
import { ProductSchema, BreadcrumbSchema } from '../../../components/JsonLd';

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

  const price = product.sale_price || product.price;
  const title = `${product.title} | ${product.brand_name} - Buy Online at Best Price`;
  const description = `Buy ${product.title} by ${product.brand_name} online at Zarwinto. ${product.description.substring(0, 120)}... Price: ₹${price}. Free shipping available.`;

  return {
    title,
    description,
    keywords: [product.title, product.brand_name, product.category_slug, 'buy shoes online', 'footwear', 'sneakers', 'buy online'],
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
          alt: product.title
        }
      ],
      type: 'website',
      url: `https://zarwinto.com/product/${product.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.images[0]],
    },
    alternates: {
      canonical: `https://zarwinto.com/product/${product.slug}`,
    },
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

  const price = product.sale_price || product.price;

  return (
    <>
      <ProductSchema
        name={product.title}
        description={product.description}
        image={product.images}
        price={price}
        salePrice={product.sale_price}
        brand={product.brand_name}
        category={product.category_slug}
        sku={product.sku}
        rating={product.rating}
        reviewCount={product.reviews_count}
        url={`https://zarwinto.com/product/${product.slug}`}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://zarwinto.com' },
          { name: 'Shop', url: 'https://zarwinto.com/shop' },
          { name: product.brand_name, url: `https://zarwinto.com/shop?brand=${product.brand_name.toLowerCase().replace(/\s+/g, '-')}` },
          { name: product.title, url: `https://zarwinto.com/product/${product.slug}` },
        ]}
      />
      <ProductDetailClient product={product} store={store} initialReviews={reviews} relatedProducts={relatedProducts} />
    </>
  );
}
