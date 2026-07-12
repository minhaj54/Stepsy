class UserProfile {
  const UserProfile({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.role,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
    id: json['id'] as String,
    fullName: json['full_name'] as String? ?? '',
    email: json['email'] as String? ?? '',
    phone: json['phone'] as String? ?? '',
    role: json['role'] as String? ?? 'customer',
  );

  final String id;
  final String fullName;
  final String email;
  final String phone;
  final String role;
}
