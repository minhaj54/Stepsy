import 'product_variant.dart';
import 'brand.dart';
import 'category.dart';

class CatalogData {
  const CatalogData(this.products, this.categories, this.brands);
  final List<Product> products;
  final List<Category> categories;
  final List<Brand> brands;
}

class Product {
  const Product({
    required this.id,
    required this.brandId,
    required this.brandName,
    required this.categoryId,
    required this.categorySlug,
    required this.title,
    required this.slug,
    required this.description,
    required this.price,
    this.salePrice,
    required this.sku,
    required this.createdAt,
    required this.images,
    required this.variants,
    this.rating = 0,
    this.reviewsCount = 0,
    this.featured = false,
    this.newArrival = false,
    this.bestSeller = false,
  });

  factory Product.fromSupabase(Map<String, dynamic> json) {
    final images =
        ((json['product_images'] as List<dynamic>? ?? [])..sort(
              (a, b) => ((a['sort_order'] ?? 0) as int).compareTo(
                (b['sort_order'] ?? 0) as int,
              ),
            ))
            .map((row) => row['image_url'] as String)
            .toList();

    return Product(
      id: json['id'] as String,
      brandId: json['brand_id'] as String,
      brandName: json['brands']?['name'] as String? ?? '',
      categoryId: json['category_id'] as String,
      categorySlug: json['categories']?['slug'] as String? ?? '',
      title: json['title'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String? ?? '',
      price: (json['price'] as num).toDouble(),
      salePrice: (json['sale_price'] as num?)?.toDouble(),
      sku: json['sku'] as String? ?? '',
      createdAt:
          DateTime.tryParse(json['created_at'] as String? ?? '') ??
          DateTime.now(),
      images: images,
      variants: (json['product_variants'] as List<dynamic>? ?? [])
          .map((row) => ProductVariant.fromJson(row))
          .toList(),
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      reviewsCount: json['reviews_count'] as int? ?? 0,
      featured: json['featured'] as bool? ?? false,
      newArrival: json['new_arrival'] as bool? ?? false,
      bestSeller: json['best_seller'] as bool? ?? false,
    );
  }

  factory Product.fromJson(Map<String, dynamic> json) => Product(
    id: json['id'] as String,
    brandId: json['brand_id'] as String,
    brandName: json['brand_name'] as String? ?? '',
    categoryId: json['category_id'] as String,
    categorySlug: json['category_slug'] as String? ?? '',
    title: json['title'] as String? ?? '',
    slug: json['slug'] as String? ?? '',
    description: json['description'] as String? ?? '',
    price: (json['price'] as num).toDouble(),
    salePrice: (json['sale_price'] as num?)?.toDouble(),
    sku: json['sku'] as String? ?? '',
    createdAt: DateTime.parse(json['created_at'] as String),
    images: (json['images'] as List<dynamic>).cast<String>(),
    variants: (json['variants'] as List<dynamic>)
        .map((row) => ProductVariant.fromJson(row as Map<String, dynamic>))
        .toList(),
    rating: (json['rating'] as num?)?.toDouble() ?? 0,
    reviewsCount: json['reviews_count'] as int? ?? 0,
    featured: json['featured'] as bool? ?? false,
    newArrival: json['new_arrival'] as bool? ?? false,
    bestSeller: json['best_seller'] as bool? ?? false,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'brand_id': brandId,
    'brand_name': brandName,
    'category_id': categoryId,
    'category_slug': categorySlug,
    'title': title,
    'slug': slug,
    'description': description,
    'price': price,
    'sale_price': salePrice,
    'sku': sku,
    'created_at': createdAt.toIso8601String(),
    'images': images,
    'variants': variants.map((variant) => variant.toJson()).toList(),
    'rating': rating,
    'reviews_count': reviewsCount,
    'featured': featured,
    'new_arrival': newArrival,
    'best_seller': bestSeller,
  };

  final String id;
  final String brandId;
  final String brandName;
  final String categoryId;
  final String categorySlug;
  final String title;
  final String slug;
  final String description;
  final double price;
  final double? salePrice;
  final String sku;
  final DateTime createdAt;
  final List<String> images;
  final List<ProductVariant> variants;
  final double rating;
  final int reviewsCount;
  final bool featured;
  final bool newArrival;
  final bool bestSeller;

  double get currentPrice => salePrice ?? price;
}
