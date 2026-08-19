class Store {
  const Store({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    this.logoUrl,
    this.bannerUrl,
  });

  factory Store.fromJson(Map<String, dynamic> json) => Store(
    id: json['id'] as String? ?? json['store_id'] as String? ?? '',
    name: json['name'] as String? ?? json['business_name'] as String? ?? 'Store',
    slug: json['slug'] as String? ?? '',
    description: json['description'] as String? ?? '',
    logoUrl: json['logo_url'] as String?,
    bannerUrl: json['banner_url'] as String?,
  );

  final String id;
  final String name;
  final String slug;
  final String description;
  final String? logoUrl;
  final String? bannerUrl;
}
