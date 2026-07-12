import 'product.dart';
import 'product_variant.dart';

class CartItem {
  const CartItem({
    required this.product,
    required this.variant,
    required this.quantity,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
    product: Product.fromJson(json['product'] as Map<String, dynamic>),
    variant: ProductVariant.fromJson(json['variant'] as Map<String, dynamic>),
    quantity: json['quantity'] as int,
  );

  Map<String, dynamic> toJson() => {
    'product': product.toJson(),
    'variant': variant.toJson(),
    'quantity': quantity,
  };

  final Product product;
  final ProductVariant variant;
  final int quantity;

  double get lineTotal => product.currentPrice * quantity;

  CartItem copyWith({int? quantity}) => CartItem(
    product: product,
    variant: variant,
    quantity: quantity ?? this.quantity,
  );
}
