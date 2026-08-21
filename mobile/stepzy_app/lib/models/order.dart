class Order {
  const Order({
    required this.id,
    required this.userId,
    required this.status,
    required this.paymentStatus,
    required this.paymentMethod,
    required this.totalAmount,
    required this.shippingAddress,
    required this.items,
    this.couponCode,
    this.discountAmount = 0,
    this.cancelReason,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final itemsList = json['order_items'] as List<dynamic>? ?? [];
    return Order(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      status: json['status'] as String,
      paymentStatus: json['payment_status'] as String,
      paymentMethod: json['payment_method'] as String? ?? 'prepaid',
      totalAmount: (json['total_amount'] as num).toDouble(),
      shippingAddress: json['shipping_address'] as Map<String, dynamic>,
      couponCode: json['coupon_code'] as String?,
      discountAmount: (json['discount_amount'] as num?)?.toDouble() ?? 0,
      cancelReason: json['cancel_reason'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      items: itemsList.map((item) => OrderItem.fromJson(item as Map<String, dynamic>)).toList(),
    );
  }

  final String id;
  final String userId;
  final String status;
  final String paymentStatus;
  final String paymentMethod;
  final double totalAmount;
  final Map<String, dynamic> shippingAddress;
  final String? couponCode;
  final double discountAmount;
  final String? cancelReason;
  final List<OrderItem> items;
  final DateTime createdAt;

  String get statusDisplay {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  String get formattedDate {
    return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
  }
}

class OrderItem {
  const OrderItem({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.variantId,
    required this.quantity,
    required this.price,
    this.productTitle,
    this.productImage,
    this.variantSize,
    this.variantColor,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] as String,
      orderId: json['order_id'] as String,
      productId: json['product_id'] as String,
      variantId: json['variant_id'] as String,
      quantity: json['quantity'] as int,
      price: (json['price'] as num).toDouble(),
      productTitle: json['products']?['title'] as String?,
      productImage: json['products'] is Map &&
              json['products']['product_images'] is List &&
              (json['products']['product_images'] as List).isNotEmpty
          ? (json['products']['product_images'] as List).first['image_url']?.toString()
          : null,
      variantSize: json['product_variants']?['size'] as String?,
      variantColor: json['color'] as String?,
    );
  }

  final String id;
  final String orderId;
  final String productId;
  final String variantId;
  final int quantity;
  final double price;
  final String? productTitle;
  final String? productImage;
  final String? variantSize;
  final String? variantColor;

  double get lineTotal => price * quantity;
}
