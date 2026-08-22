class BannerModel {
  const BannerModel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    this.linkUrl,
    this.backgroundColor,
    this.textColor,
    this.isActive = true,
    this.sortOrder = 0,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String? ?? '',
      imageUrl: json['image_url'] as String? ?? '',
      linkUrl: json['link_url'] as String?,
      backgroundColor: json['background_color'] as String?,
      textColor: json['text_color'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      sortOrder: json['sort_order'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'subtitle': subtitle,
    'image_url': imageUrl,
    'link_url': linkUrl,
    'background_color': backgroundColor,
    'text_color': textColor,
    'is_active': isActive,
    'sort_order': sortOrder,
  };

  final String id;
  final String title;
  final String subtitle;
  final String imageUrl;
  final String? linkUrl;
  final String? backgroundColor;
  final String? textColor;
  final bool isActive;
  final int sortOrder;
}
