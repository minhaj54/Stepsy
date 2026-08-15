import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart' hide Category;
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/phone.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../models/brand.dart';
import '../models/user_profile.dart';
import '../models/cart_item.dart';
import '../models/shipping_address.dart';
import '../models/order.dart';
import '../models/address.dart';
import '../models/coupon.dart';
import '../models/banner.dart';
import '../models/review.dart';
import '../models/testimonial.dart';
import '../data/mock_data.dart';
import '../core/constants.dart';

class ZarwintoRepository {
  ZarwintoRepository(this.client);

  SupabaseClient? client;

  /// Called after Supabase.initialize() completes to inject the live client.
  void setClient(SupabaseClient? newClient) {
    client = newClient;
  }

  Future<CatalogData> loadCatalog() async {
    if (client == null) {
      return CatalogData(mockProducts, mockCategories, mockBrands);
    }

    try {
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
            .order('created_at', ascending: false),
      ]);

      final brandRows = responses[0] as List<dynamic>;
      final categoryRows = responses[1] as List<dynamic>;
      final productRows = responses[2] as List<dynamic>;

      final fetchedProducts = productRows
          .map((row) => Product.fromSupabase(row as Map<String, dynamic>))
          .toList();
      final fetchedCategories = categoryRows
          .map((row) => Category.fromJson(row as Map<String, dynamic>))
          .toList();
      final fetchedBrands = brandRows
          .map((row) => Brand.fromJson(row as Map<String, dynamic>))
          .toList();

      return CatalogData(
        fetchedProducts.isNotEmpty ? fetchedProducts : mockProducts,
        fetchedCategories.isNotEmpty ? fetchedCategories : mockCategories,
        fetchedBrands.isNotEmpty ? fetchedBrands : mockBrands,
      );
    } catch (err) {
      return CatalogData(mockProducts, mockCategories, mockBrands);
    }
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
    if (zarwintoApiBaseUrl.isEmpty) {
      return 'ZARWINTO_API_BASE_URL is not configured for this build.';
    }
    try {
      final normalizedPhone = normalizePhone(phone);
      final response = await http.post(
        Uri.parse('$zarwintoApiBaseUrl/api/auth/send-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': normalizedPhone}),
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
    if (client == null) {
      return 'Supabase is not configured for this build.';
    }
    try {
      final normalizedPhone = normalizePhone(phone);
      final response = await client!.auth.verifyOTP(
        phone: normalizedPhone,
        token: code.trim(),
        type: OtpType.sms,
      );

      if (response.session == null) {
        return 'Failed to verify OTP.';
      }

      if (fullName != null && fullName.isNotEmpty) {
        await client!.auth.updateUser(UserAttributes(data: {'full_name': fullName.trim()}));
        await client!
            .from('users')
            .update({'full_name': fullName.trim()})
            .eq('id', response.user!.id);
      }

      return null;
    } on AuthException catch (err) {
      return err.message;
    } on ArgumentError catch (err) {
      return err.message?.toString() ?? 'Invalid phone number.';
    } catch (_) {
      return 'Network error. Please try again.';
    }
  }

  String _generateOrderId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final random = Random();
    final suffix = List.generate(9, (_) => chars[random.nextInt(chars.length)]).join();
    return 'ord_$suffix';
  }

  Future<String?> _createOrder({
    required List<CartItem> cart,
    required ShippingAddress address,
    required String paymentMethod,
    String? couponCode,
    double discountAmount = 0,
  }) async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return null;
    if (cart.isEmpty) return null;

    final orderId = _generateOrderId();
    final isOnline = paymentMethod != 'cod';
    final internalPaymentMethod = paymentMethod.startsWith('cashfree')
        ? paymentMethod
        : (paymentMethod == 'cod' ? 'cod' : 'prepaid');

    final orderTotal = cart.fold<double>(
      0,
      (sum, item) => sum + item.product.currentPrice * item.quantity,
    );

    final status = isOnline ? 'pending' : 'processing';
    final paymentStatus = isOnline
        ? 'unpaid'
        : (paymentMethod == 'cod' ? 'cod_pending' : 'paid');

    try {
      await _saveAddressIfNeeded(user.id, address);

      await client!.from('orders').insert({
        'id': orderId,
        'user_id': user.id,
        'status': status,
        'payment_status': paymentStatus,
        'payment_method': internalPaymentMethod,
        'total_amount': orderTotal - discountAmount,
        'shipping_address': address.toJson(),
        'coupon_code': couponCode,
        'discount_amount': discountAmount,
      });

      await client!.from('order_items').insert(
        cart
            .map(
              (item) => {
                'order_id': orderId,
                'product_id': item.product.id,
                'variant_id': item.variant.id,
                'quantity': item.quantity,
                'price': item.product.currentPrice,
                'color': item.color ?? item.variant.color,
              },
            )
            .toList(),
      );

      for (final item in cart) {
        final variantRow = await client!
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.variant.id)
            .maybeSingle();
        if (variantRow != null) {
          final currentStock = variantRow['stock_quantity'] as int? ?? 0;
          await client!
              .from('product_variants')
              .update({'stock_quantity': max(0, currentStock - item.quantity)})
              .eq('id', item.variant.id);
        }
      }

      return orderId;
    } on PostgrestException catch (err) {
      debugPrint('[Repository] createOrder error: ${err.message}');
      return null;
    }
  }

  Future<void> _saveAddressIfNeeded(String userId, ShippingAddress address) async {
    final existing = await client!
        .from('addresses')
        .select('id')
        .eq('user_id', userId)
        .eq('full_name', address.fullName)
        .eq('address_line1', address.addressLine1)
        .eq('city', address.city)
        .eq('pincode', address.pincode);

    if (existing.isNotEmpty) return;

    final countRows = await client!
        .from('addresses')
        .select('id')
        .eq('user_id', userId);

    await client!.from('addresses').insert({
      'user_id': userId,
      'full_name': address.fullName,
      'phone': address.phone,
      'address_line1': address.addressLine1,
      'city': address.city,
      'state': address.state,
      'pincode': address.pincode,
      'is_default': countRows.isEmpty,
    });
  }

  Future<String?> placeOrder(
    List<CartItem> cart,
    ShippingAddress address, {
    String paymentMethod = 'cod',
    String? couponCode,
    double discountAmount = 0,
  }) async {
    return _createOrder(
      cart: cart,
      address: address,
      paymentMethod: paymentMethod,
      couponCode: couponCode,
      discountAmount: discountAmount,
    );
  }

  Future<String?> createPendingOrder(
    List<CartItem> cart,
    ShippingAddress address, {
    required String paymentMethod,
    String? couponCode,
    double discountAmount = 0,
  }) async {
    return _createOrder(
      cart: cart,
      address: address,
      paymentMethod: paymentMethod,
      couponCode: couponCode,
      discountAmount: discountAmount,
    );
  }

  Future<Order?> fetchOrder(String orderId) async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return null;

    final row = await client!
        .from('orders')
        .select('''
          *,
          order_items(
            *,
            products(title, images),
            product_variants(size, color)
          )
        ''')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (row == null) return null;
    return Order.fromJson(row);
  }

  Future<void> updateOrderShiprocketIds(
    String orderId,
    int shiprocketOrderId,
    int shipmentId,
  ) async {
    if (client == null) return;
    await client!
        .from('orders')
        .update({
          'shiprocket_order_id': shiprocketOrderId,
          'shipment_id': shipmentId,
        })
        .eq('id', orderId);
  }

  // Orders
  Future<List<Order>> loadOrders() async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return [];

    final orders = await client!
        .from('orders')
        .select('''
          *,
          order_items(
            *,
            products(title, images),
            product_variants(size, color)
          )
        ''')
        .eq('user_id', user.id)
        .order('created_at', ascending: false);

    return orders.map<Order>((row) => Order.fromJson(row)).toList();
  }

  // Addresses
  Future<List<Address>> loadAddresses() async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return [];

    final rows = await client!
        .from('addresses')
        .select()
        .eq('user_id', user.id)
        .order('is_default', ascending: false);

    return rows.map<Address>((row) => Address.fromJson(row)).toList();
  }

  Future<Address?> addAddress(Address address) async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return null;

    if (address.isDefault) {
      await client!
          .from('addresses')
          .update({'is_default': false})
          .eq('user_id', user.id);
    }

    final row = await client!
        .from('addresses')
        .insert(address.toJson())
        .select()
        .single();

    return Address.fromJson(row);
  }

  Future<void> updateAddress(Address address) async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return;

    if (address.isDefault) {
      await client!
          .from('addresses')
          .update({'is_default': false})
          .eq('user_id', user.id)
          .neq('id', address.id);
    }

    await client!
        .from('addresses')
        .update(address.toJson())
        .eq('id', address.id)
        .eq('user_id', user.id);
  }

  Future<void> deleteAddress(String addressId) async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return;

    await client!
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);
  }

  // Coupons
  Future<List<Coupon>> loadCoupons() async {
    if (client == null) return [];

    final rows = await client!
        .from('coupons')
        .select()
        .eq('active', true)
        .gte('end_date', DateTime.now().toIso8601String());

    return rows.map<Coupon>((row) => Coupon.fromJson(row)).toList();
  }

  Future<Coupon?> validateCoupon(String code, double subtotal) async {
    final rows = await client!
        .from('coupons')
        .select()
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .gte('end_date', DateTime.now().toIso8601String())
        .maybeSingle();

    if (rows == null) return null;
    final coupon = Coupon.fromJson(rows);
    return coupon.isValid && coupon.calculateDiscount(subtotal) > 0 ? coupon : null;
  }

  // Banners
  Future<List<BannerModel>> loadBanners() async {
    if (client == null) return [];

    final rows = await client!
        .from('banners')
        .select()
        .eq('is_active', true)
        .order('sort_order');

    return rows.map<BannerModel>((row) => BannerModel.fromJson(row)).toList();
  }

  // Reviews
  Future<List<Review>> loadProductReviews(String productId) async {
    if (client == null) return [];

    final rows = await client!
        .from('reviews')
        .select('''
          *,
          users(full_name)
        ''')
        .eq('product_id', productId)
        .eq('approved', true)
        .order('created_at', ascending: false);

    return rows.map<Review>((row) => Review.fromJson(row)).toList();
  }

  Future<void> addReview(Review review) async {
    final user = client?.auth.currentUser;
    if (client == null || user == null) return;

    await client!.from('reviews').insert({
      'user_id': user.id,
      'product_id': review.productId,
      'rating': review.rating,
      'review_text': review.reviewText,
      'images': review.images,
    });
  }

  // Testimonials
  Future<List<Testimonial>> loadTestimonials() async {
    if (client == null) return [];

    final rows = await client!
        .from('testimonials')
        .select()
        .order('sort_order', ascending: true)
        .order('created_at', ascending: false);

    return rows.map<Testimonial>((row) => Testimonial.fromJson(row)).toList();
  }
}
