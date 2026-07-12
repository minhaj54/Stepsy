class Brand {
  const Brand({
    required this.id,
    required this.name,
    required this.slug,
    this.logo = '',
    this.description = '',
    this.featured = false,
  });

  factory Brand.fromJson(Map<String, dynamic> json) => Brand(
    id: json['id'] as String,
    name: json['name'] as String? ?? '',
    slug: json['slug'] as String? ?? '',
    logo: json['logo'] as String? ?? '',
    description: json['description'] as String? ?? '',
    featured: json['featured'] as bool? ?? false,
  );

  final String id;
  final String name;
  final String slug;
  final String logo;
  final String description;
  final bool featured;
}
