import { MetadataRoute } from 'next';
import { getProducts, getCategories, getBrands, getBlogPosts } from '../lib/data/products';
import { getStores } from '../lib/data/stores';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://zarwinto.com';

  const [products, categories, brands, blogPosts, stores] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
    getBlogPosts(),
    getStores(),
  ]);

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/open-store`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/size-guide`,
      lastModified: new Date(),
    },
  ];

  const productPages = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.created_at),
  }));

  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
  }));

  const storePages = stores.map((store) => ({
    url: `${baseUrl}/store/${store.slug}`,
    lastModified: new Date(store.updated_at),
  }));

  return [
    ...staticPages,
    ...productPages,
    ...blogPages,
    ...storePages,
  ];
}
