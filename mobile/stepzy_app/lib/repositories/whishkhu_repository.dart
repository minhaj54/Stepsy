import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../models/brand.dart';
import '../models/user_profile.dart';
import '../models/cart_item.dart';
import '../models/shipping_address.dart';
import '../data/mock_data.dart';
import '../core/constants.dart';

class WhishkhuRepository {
  WhishkhuRepository(this.client);

  final SupabaseClient? client;

  Future<CatalogData> loadCatalog() async {
    if (client == null) {
      return CatalogData(mockProducts, mockCategories, mockBrands);
    }

    final responses = await Future.wait([
      client!.from('brands').select().order('name'),
      client!.from('categories').select().order('name'),
      client!
          .from('products')
          .select('''
        *,
        brands(name, slug),
        categories(slug),
        product_images(image_url, sort_order),
        product_variants(id, product_id, size, color, stock_quantity)
      ''')
          .eq('status', 'active')
          .order('created_at', ascending: false),
    ]);

    final brandRows = responses[0] as List<dynamic>;
    final categoryRows = responses[1] as List<dynamic>;
    final productRows = responses[2] as List<dynamic>;

    return CatalogData(
      productRows.map((row) => Product.fromSupabase(row)).toList(),
      categoryRows.map((row) => Category.fromJson(row)).toList(),
      brandRows.map((row) => Brand.fromJson(row)).toList(),
    );
  }

  Future<UserProfile?> loadProfile() async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return null;

    final row = await client!
        .from('users')
        .select()
        .eq('id', user.id)
        .maybeSingle();
    if (row == null) return null;
    return UserProfile.fromJson(row);
  }

  Future<Set<String>> loadWishlist() async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return {};

    final rows = await client!
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);
    return rows.map<String>((row) => row['product_id'] as String).toSet();
  }

  Future<void> toggleWishlist(String productId, bool remove) async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return;

    if (remove) {
      await client!
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
    } else {
      await client!.from('wishlist').insert({
        'user_id': user.id,
        'product_id': productId,
      });
    }
  }

  Future<String?> signIn(String email, String password) async {
    if (client == null) return 'Supabase is not configured for this build.';
    try {
      await client!.auth.signInWithPassword(email: email, password: password);
      return null;
    } on AuthException catch (err) {
      return err.message;
    }
  }

  Future<String?> signUp(String email, String password, String fullName) async {
    if (client == null) return 'Supabase is not configured for this build.';
    try {
      await client!.auth.signUp(
        email: email,
        password: password,
        data: {'full_name': fullName},
      );
      return null;
    } on AuthException catch (err) {
      return err.message;
    }
  }

  Future<void> signOut() async {
    await client?.auth.signOut();
  }

  Future<String?> sendOtp(String phone) async {
    if (whishkhuApiBaseUrl.isEmpty) {
      return 'WHISHKHU_API_BASE_URL is not configured for this build.';
    }
    try {
      final response = await http.post(
        Uri.parse('$whishkhuApiBaseUrl/api/auth/send-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phone}),
      );
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode != 200) {
        return data['error'] as String? ?? 'Failed to send OTP.';
      }
      return null;
    } catch (e) {
      return 'Network error. Please try again.';
    }
  }

  Future<String?> verifyOtp(String phone, String code, String? fullName) async {
    if (whishkhuApiBaseUrl.isEmpty) {
      return 'WHISHKHU_API_BASE_URL is not configured for this build.';
    }
    if (client == null) {
      return 'Supabase is not configured for this build.';
    }
    try {
      final response = await http.post(
        Uri.parse('$whishkhuApiBaseUrl/api/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'phone': phone,
          'code': code,
          if (fullName != null && fullName.isNotEmpty) 'fullName': fullName,
        }),
      );
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode != 200) {
        return data['error'] as String? ?? 'Failed to verify OTP.';
      }

      final refreshToken = data['refresh_token'] as String;

      await client!.auth.setSession(refreshToken);

      return null;
    } catch (e) {
      return 'Network error. Please try again.';
    }
  }

  Future<String?> placeOrder(
    List<CartItem> cart,
    double subtotal,
    ShippingAddress address,
  ) async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) {
      return 'Please sign in before checkout.';
    }

    try {
      final order = await client!
          .from('orders')
          .insert({
            'user_id': user.id,
            'status': 'processing',
            'payment_status': 'paid',
            'total_amount': subtotal,
            'shipping_address': address.toJson(),
          })
          .select('id')
          .single();

      final orderId = order['id'] as String;
      await client!
          .from('order_items')
          .insert(
            cart
                .map(
                  (item) => {
                    'order_id': orderId,
                    'product_id': item.product.id,
                    'variant_id': item.variant.id,
                    'quantity': item.quantity,
                    'price': item.product.currentPrice,
                  },
                )
                .toList(),
          );
      return null;
    } on PostgrestException catch (err) {
      return err.message;
    }
  }
}
