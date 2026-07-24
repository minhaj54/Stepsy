class Coupon {
  const Coupon({
    required this.id,
    required this.code,
    required this.type,
    required this.value,
    required this.startDate,
    required this.endDate,
    required this.active,
    this.minPurchase,
    this.maxDiscount,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      id: json['id'] as String,
      code: json['code'] as String,
      type: json['type'] as String,
      value: (json['value'] as num).toDouble(),
      startDate: DateTime.parse(json['start_date'] as String),
      endDate: DateTime.parse(json['end_date'] as String),
      active: json['active'] as bool? ?? true,
      minPurchase: (json['min_purchase'] as num?)?.toDouble(),
      maxDiscount: (json['max_discount'] as num?)?.toDouble(),
    );
  }

  final String id;
  final String code;
  final String type;
  final double value;
  final DateTime startDate;
  final DateTime endDate;
  final bool active;
  final double? minPurchase;
  final double? maxDiscount;

  bool get isValid {
    final now = DateTime.now();
    return active && now.isAfter(startDate) && now.isBefore(endDate);
  }

  String get displayValue {
    if (type == 'percentage') {
      return '$value% OFF';
    }
    return '₹$value OFF';
  }

  double calculateDiscount(double subtotal) {
    if (!isValid) return 0;
    if (minPurchase != null && subtotal < minPurchase!) return 0;
    
    if (type == 'percentage') {
      final discount = subtotal * (value / 100);
      if (maxDiscount != null && discount > maxDiscount!) {
        return maxDiscount!;
      }
      return discount;
    }
    return value;
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'code': code,
    'type': type,
    'value': value,
    'start_date': startDate.toIso8601String(),
    'end_date': endDate.toIso8601String(),
    'active': active,
    'min_purchase': minPurchase,
    'max_discount': maxDiscount,
  };
}
