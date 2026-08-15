import 'product.dart';
import 'product_variant.dart';

class CartItem {
  const CartItem({
    required this.product,
    required this.variant,
    required this.quantity,
    this.color,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
    product: Product.fromJson(json['product'] as Map<String, dynamic>),
    variant: ProductVariant.fromJson(json['variant'] as Map<String, dynamic>),
    quantity: json['quantity'] as int,
    color: json['color'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'product': product.toJson(),
    'variant': variant.toJson(),
    'quantity': quantity,
    if (color != null) 'color': color,
  };

  final Product product;
  final ProductVariant variant;
  final int quantity;
  final String? color;

  double get lineTotal => product.currentPrice * quantity;

  CartItem copyWith({int? quantity, String? color}) => CartItem(
    product: product,
    variant: variant,
    quantity: quantity ?? this.quantity,
    color: color ?? this.color,
  );
}
