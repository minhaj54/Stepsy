class ProductVariant {
  const ProductVariant({
    required this.id,
    required this.productId,
    required this.size,
    required this.color,
    required this.stockQuantity,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) => ProductVariant(
    id: json['id'] as String,
    productId: json['product_id'] as String,
    size: json['size'] as String? ?? '',
    color: json['color'] as String? ?? '',
    stockQuantity: json['stock_quantity'] as int? ?? 0,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'product_id': productId,
    'size': size,
    'color': color,
    'stock_quantity': stockQuantity,
  };

  final String id;
  final String productId;
  final String size;
  final String color;
  final int stockQuantity;
}
