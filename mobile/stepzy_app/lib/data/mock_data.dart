import '../models/brand.dart';
import '../models/category.dart';
import '../models/product.dart';
import '../models/product_variant.dart';

final mockBrands = [
  const Brand(
    id: 'b1',
    name: 'AeroStride',
    slug: 'aerostride',
    logo: 'bolt',
    description: 'Cutting-edge athletic and running performance footwear.',
    featured: true,
  ),
  const Brand(
    id: 'b2',
    name: 'ApexCraft',
    slug: 'apexcraft',
    logo: 'crown',
    description: 'Handcrafted luxury leather shoes, boots, and loafers.',
    featured: true,
  ),
  const Brand(
    id: 'b3',
    name: 'TerraTrek',
    slug: 'terratrek',
    logo: 'mountain',
    description: 'Rugged all-weather boots and trail shoes.',
    featured: true,
  ),
];

final mockCategories = [
  const Category(
    id: 'c1',
    name: 'Sneakers',
    slug: 'sneakers',
    image:
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600',
  ),
  const Category(
    id: 'c2',
    name: 'Casual Shoes',
    slug: 'casual',
    image:
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
  ),
  const Category(
    id: 'c3',
    name: 'Boots',
    slug: 'boots',
    image:
        'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600',
  ),
];

final mockProducts = [
  Product(
    id: 'p1',
    brandId: 'b1',
    brandName: 'AeroStride',
    categoryId: 'c1',
    categorySlug: 'sneakers',
    title: 'Volt Velocity runner v4',
    slug: 'volt-velocity-runner-v4',
    description:
        'Responsive carbon plate running shoe with nitrogen-infused foam and a breathable warp-knit upper.',
    price: 129,
    salePrice: 99,
    sku: 'AS-VOLT-V4-001',
    createdAt: DateTime.parse('2026-05-01T08:00:00Z'),
    images: const [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    ],
    variants: const [
      ProductVariant(
        id: 'v1_1',
        productId: 'p1',
        size: '8',
        color: 'Volt Electric',
        stockQuantity: 12,
      ),
      ProductVariant(
        id: 'v1_2',
        productId: 'p1',
        size: '9',
        color: 'Volt Electric',
        stockQuantity: 24,
      ),
      ProductVariant(
        id: 'v1_3',
        productId: 'p1',
        size: '10',
        color: 'Cyber Pink',
        stockQuantity: 14,
      ),
    ],
    rating: 4.8,
    reviewsCount: 142,
    featured: true,
    newArrival: true,
  ),
  Product(
    id: 'p2',
    brandId: 'b2',
    brandName: 'ApexCraft',
    categoryId: 'c2',
    categorySlug: 'casual',
    title: 'Midnight Stealth Leather',
    slug: 'midnight-stealth-leather',
    description:
        'Full-grain Italian calfskin leather with an athletic ortholite sole and hand-waxed cotton laces.',
    price: 169,
    sku: 'AC-MNS-LTH-002',
    createdAt: DateTime.parse('2026-05-10T10:00:00Z'),
    images: const [
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800',
    ],
    variants: const [
      ProductVariant(
        id: 'v2_1',
        productId: 'p2',
        size: '8',
        color: 'Stealth Black',
        stockQuantity: 15,
      ),
      ProductVariant(
        id: 'v2_2',
        productId: 'p2',
        size: '9',
        color: 'Mocha Tan',
        stockQuantity: 7,
      ),
    ],
    rating: 4.7,
    reviewsCount: 89,
    featured: true,
    bestSeller: true,
  ),
  Product(
    id: 'p3',
    brandId: 'b3',
    brandName: 'TerraTrek',
    categoryId: 'c3',
    categorySlug: 'boots',
    title: 'Urban Explorer Waterproof Boot',
    slug: 'urban-explorer-waterproof-boot',
    description:
        'Seam-sealed waterproof nubuck leather with a rugged grip outsole for city pavement and trails.',
    price: 219,
    sku: 'TT-UXW-BOT-004',
    createdAt: DateTime.parse('2026-04-20T09:00:00Z'),
    images: const [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=800',
    ],
    variants: const [
      ProductVariant(
        id: 'v4_1',
        productId: 'p3',
        size: '9',
        color: 'Sahara Sand',
        stockQuantity: 18,
      ),
      ProductVariant(
        id: 'v4_2',
        productId: 'p3',
        size: '10',
        color: 'Sahara Sand',
        stockQuantity: 25,
      ),
    ],
    rating: 4.6,
    reviewsCount: 67,
  ),
];
