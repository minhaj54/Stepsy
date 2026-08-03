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
    this.specifications = const {},
    this.weightKg,
    this.lengthCm,
    this.breadthCm,
    this.heightCm,
  });

  factory Product.fromSupabase(Map<String, dynamic> json) {
    List<String> imagesList = [];

    // Parse product_images relation if available
    if (json['product_images'] is List) {
      final rawList = List<dynamic>.from(json['product_images'] as List);
      rawList.sort(
        (a, b) => ((a['sort_order'] ?? 0) as int).compareTo((b['sort_order'] ?? 0) as int),
      );
      imagesList = rawList
          .map((row) => row['image_url'] as String? ?? '')
          .where((url) => url.isNotEmpty)
          .toList();
    }

    // Fallback if images array is directly present on product table (e.g. text[])
    if (imagesList.isEmpty && json['images'] is List) {
      imagesList = (json['images'] as List).cast<String>();
    }

    // Fallback default high quality sneaker image if product has no images
    if (imagesList.isEmpty) {
      imagesList = [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
      ];
    }

    // Parse product_variants relation
    List<ProductVariant> parsedVariants = [];
    if (json['product_variants'] is List) {
      parsedVariants = (json['product_variants'] as List<dynamic>)
          .map((row) => ProductVariant.fromJson(row as Map<String, dynamic>))
          .toList();
    }

    // Fallback default variants if none exist in DB
    final productId = json['id'] as String? ?? 'p_${DateTime.now().millisecondsSinceEpoch}';
    if (parsedVariants.isEmpty) {
      parsedVariants = [
        ProductVariant(id: '${productId}_34', productId: productId, size: '34', color: 'Default', stockQuantity: 10),
        ProductVariant(id: '${productId}_38', productId: productId, size: '38', color: 'Default', stockQuantity: 10),
        ProductVariant(id: '${productId}_42', productId: productId, size: '42', color: 'Default', stockQuantity: 10),
        ProductVariant(id: '${productId}_46', productId: productId, size: '46', color: 'Default', stockQuantity: 10),
      ];
    }

    return Product(
      id: productId,
      brandId: json['brand_id'] as String? ?? 'b1',
      brandName: json['brands']?['name'] as String? ?? json['brand_name'] as String? ?? 'Nike',
      categoryId: json['category_id'] as String? ?? 'c1',
      categorySlug: json['categories']?['slug'] as String? ?? json['category_slug'] as String? ?? 'sneakers',
      title: json['title'] as String? ?? 'Sneaker Model',
      slug: json['slug'] as String? ?? 'sneaker-model',
      description: json['description'] as String? ?? 'High performance responsive cushioning sneaker.',
      price: (json['price'] as num?)?.toDouble() ?? 149.00,
      salePrice: (json['sale_price'] as num?)?.toDouble(),
      sku: json['sku'] as String? ?? 'SKU-001',
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
      images: imagesList,
      variants: parsedVariants,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      reviewsCount: json['reviews_count'] as int? ?? 120,
      featured: json['featured'] as bool? ?? false,
      newArrival: json['new_arrival'] as bool? ?? false,
      bestSeller: json['best_seller'] as bool? ?? false,
      specifications: json['specifications'] != null
          ? Map<String, String>.from(json['specifications'] as Map)
          : const {},
      weightKg: json['weight_kg'] as double?,
      lengthCm: json['length_cm'] as int?,
      breadthCm: json['breadth_cm'] as int?,
      heightCm: json['height_cm'] as int?,
    );
  }

  factory Product.fromJson(Map<String, dynamic> json) => Product.fromSupabase(json);

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
    'specifications': specifications,
    'weight_kg': weightKg,
    'length_cm': lengthCm,
    'breadth_cm': breadthCm,
    'height_cm': heightCm,
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
  final Map<String, String> specifications;
  final double? weightKg;
  final int? lengthCm;
  final int? breadthCm;
  final int? heightCm;

  double get currentPrice => salePrice ?? price;
}
