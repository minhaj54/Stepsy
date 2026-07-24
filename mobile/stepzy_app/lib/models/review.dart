class Review {
  const Review({
    required this.id,
    required this.userId,
    required this.productId,
    required this.rating,
    required this.reviewText,
    this.images = const [],
    this.approved = false,
    required this.createdAt,
    this.userName,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      productId: json['product_id'] as String,
      rating: json['rating'] as int,
      reviewText: json['review_text'] as String? ?? '',
      images: (json['images'] as List<dynamic>?)?.cast<String>() ?? const [],
      approved: json['approved'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      userName: json['users']?['full_name'] as String?,
    );
  }

  final String id;
  final String userId;
  final String productId;
  final int rating;
  final String reviewText;
  final List<String> images;
  final bool approved;
  final DateTime createdAt;
  final String? userName;

  String get formattedDate {
    return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
  }
}
