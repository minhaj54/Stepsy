class Testimonial {
  const Testimonial({
    required this.id,
    required this.name,
    required this.initials,
    required this.review,
    required this.product,
    required this.rating,
    this.sortOrder = 0,
    required this.createdAt,
  });

  factory Testimonial.fromJson(Map<String, dynamic> json) => Testimonial(
    id: json['id'] as String,
    name: json['name'] as String? ?? '',
    initials: json['initials'] as String? ?? '',
    review: json['review'] as String? ?? '',
    product: json['product'] as String? ?? '',
    rating: json['rating'] as int? ?? 5,
    sortOrder: json['sort_order'] as int? ?? 0,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  final String id;
  final String name;
  final String initials;
  final String review;
  final String product;
  final int rating;
  final int sortOrder;
  final DateTime createdAt;
}
