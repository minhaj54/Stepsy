import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../models/brand.dart';
import '../models/cart_item.dart';
import '../models/product_variant.dart';
import '../models/user_profile.dart';
import '../models/shipping_address.dart';
import '../models/order.dart';
import '../models/address.dart';
import '../models/coupon.dart';
import '../models/banner.dart';
import '../models/review.dart';
import '../models/testimonial.dart';
import '../repositories/zarwinto_repository.dart';
import '../data/mock_data.dart';
import '../core/constants.dart';

class ZarwintoScope extends InheritedNotifier<ZarwintoStore> {
  const ZarwintoScope({
    super.key,
    required ZarwintoStore store,
    required super.child,
  }) : super(notifier: store);

  static ZarwintoStore of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<ZarwintoScope>();
    assert(scope != null, 'ZarwintoScope not found');
    return scope!.notifier!;
  }
}

class ZarwintoStore extends ChangeNotifier {
  ZarwintoStore(this.prefs)
    : repository = ZarwintoRepository(null); // client set during bootstrap

  final SharedPreferences prefs;
  final ZarwintoRepository repository;

  bool loading = true;
  String? error;
  List<Product> products = [];
  List<Category> categories = [];
  List<Brand> brands = [];
  List<CartItem> cart = [];
  Set<String> wishlist = {};
  UserProfile? profile;
  List<Order> orders = [];
  List<Address> addresses = [];
  List<Coupon> coupons = [];
  List<BannerModel> banners = [];
  List<Testimonial> testimonials = [];
  Coupon? appliedCoupon;

  bool get isSupabaseConfigured => repository.client != null;
  int get cartCount => cart.fold(0, (sum, item) => sum + item.quantity);
  double get subtotal => cart.fold(0, (sum, item) => sum + item.lineTotal);
  double get discount => appliedCoupon?.calculateDiscount(subtotal) ?? 0;
  double get total => subtotal - discount;

  Future<void> bootstrap() async {
    _loadCart();
    _loadAppliedCoupon();
    // Re-read the Supabase client now that initialization has had time to complete
    repository.setClient(_configuredSupabaseClient());
    debugPrint('[Stepzy] bootstrap() — client available: ${repository.client != null}');
    await refresh();
  }

  Future<void> refresh() async {
    loading = true;
    error = null;
    notifyListeners();

    debugPrint('[Stepzy] Supabase client available: ${repository.client != null}');

    try {
      final data = await repository.loadCatalog();
      products = data.products;
      categories = data.categories;
      brands = data.brands;
      debugPrint('[Stepzy] Loaded ${products.length} products from ${repository.client != null ? "Supabase" : "mock data"}');
      banners = await repository.loadBanners();
      coupons = await repository.loadCoupons();
      testimonials = await repository.loadTestimonials();
      await _loadProfileAndWishlist();
      await _loadOrders();
      await _loadAddresses();
    } catch (err) {
      debugPrint('[Stepzy] refresh() error: $err');
      error = err.toString();
      products = mockProducts;
      categories = mockCategories;
      brands = mockBrands;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  List<Product> featuredProducts() =>
      products.where((product) => product.featured).take(6).toList();

  List<Product> newArrivals() =>
      products.where((product) => product.newArrival).take(6).toList();

  List<Product> bestSellers() =>
      products.where((product) => product.bestSeller).take(6).toList();

  void addToCart(Product product, ProductVariant variant, {int quantity = 1}) {
    final index = cart.indexWhere((item) => item.variant.id == variant.id);
    if (index >= 0) {
      cart[index] = cart[index].copyWith(
        quantity: cart[index].quantity + quantity,
      );
    } else {
      cart.add(
        CartItem(product: product, variant: variant, quantity: quantity),
      );
    }
    _saveCart();
    notifyListeners();
  }

  void updateCartQuantity(String variantId, int quantity) {
    if (quantity <= 0) {
      cart.removeWhere((item) => item.variant.id == variantId);
    } else {
      final index = cart.indexWhere((item) => item.variant.id == variantId);
      if (index >= 0) cart[index] = cart[index].copyWith(quantity: quantity);
    }
    _saveCart();
    notifyListeners();
  }

  void clearCart() {
    cart.clear();
    appliedCoupon = null;
    _saveCart();
    _saveAppliedCoupon();
    notifyListeners();
  }

  Future<void> toggleWishlist(String productId) async {
    final wasSaved = wishlist.contains(productId);
    wasSaved ? wishlist.remove(productId) : wishlist.add(productId);
    notifyListeners();

    try {
      await repository.toggleWishlist(productId, wasSaved);
    } catch (_) {
      wasSaved ? wishlist.add(productId) : wishlist.remove(productId);
      notifyListeners();
    }
  }

  Future<String?> signIn(String email, String password) async {
    final message = await repository.signIn(email, password);
    await _loadProfileAndWishlist();
    notifyListeners();
    return message;
  }

  Future<String?> signUp(String email, String password, String fullName) async {
    final message = await repository.signUp(email, password, fullName);
    await _loadProfileAndWishlist();
    notifyListeners();
    return message;
  }

  Future<void> signOut() async {
    await repository.signOut();
    profile = null;
    wishlist.clear();
    orders.clear();
    addresses.clear();
    appliedCoupon = null;
    notifyListeners();
  }

  Future<String?> sendOtp(String phone) async {
    return await repository.sendOtp(phone);
  }

  Future<String?> verifyOtp(String phone, String code, String? fullName) async {
    final message = await repository.verifyOtp(phone, code, fullName);
    if (message == null) {
      await _loadProfileAndWishlist();
    }
    notifyListeners();
    return message;
  }

  Future<String?> placeOrder(ShippingAddress address) async {
    if (cart.isEmpty) return 'Your cart is empty.';
    final message = await repository.placeOrder(cart, total, address);
    if (message == null) {
      clearCart();
      await _loadOrders();
    }
    return message;
  }

  Future<void> _loadProfileAndWishlist() async {
    profile = await repository.loadProfile();
    wishlist = await repository.loadWishlist();
  }

  Future<void> _loadOrders() async {
    orders = await repository.loadOrders();
  }

  Future<void> _loadAddresses() async {
    addresses = await repository.loadAddresses();
  }

  Future<void> loadAddresses() async {
    await _loadAddresses();
    notifyListeners();
  }

  Future<Address?> addAddress(Address address) async {
    final newAddress = await repository.addAddress(address);
    if (newAddress != null) {
      await _loadAddresses();
    }
    return newAddress;
  }

  Future<void> updateAddress(Address address) async {
    await repository.updateAddress(address);
    await _loadAddresses();
  }

  Future<void> deleteAddress(String addressId) async {
    await repository.deleteAddress(addressId);
    await _loadAddresses();
  }

  Future<Coupon?> applyCoupon(String code) async {
    final coupon = await repository.validateCoupon(code, subtotal);
    if (coupon != null) {
      appliedCoupon = coupon;
      _saveAppliedCoupon();
    }
    notifyListeners();
    return coupon;
  }

  void removeCoupon() {
    appliedCoupon = null;
    _saveAppliedCoupon();
    notifyListeners();
  }

  Future<List<Review>> loadProductReviews(String productId) async {
    return await repository.loadProductReviews(productId);
  }

  Future<void> addReview(String productId, int rating, String reviewText, {List<String> images = const []}) async {
    await repository.addReview(Review(
      id: '',
      userId: '',
      productId: productId,
      rating: rating,
      reviewText: reviewText,
      images: images,
      createdAt: DateTime.now(),
    ));
  }

  void _loadCart() {
    final raw = prefs.getString('zarwinto_mobile_cart');
    if (raw == null) return;
    final decoded = jsonDecode(raw) as List<dynamic>;
    cart = decoded
        .map((item) => CartItem.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  void _saveCart() {
    final encoded = jsonEncode(cart.map((item) => item.toJson()).toList());
    prefs.setString('zarwinto_mobile_cart', encoded);
  }

  void _loadAppliedCoupon() {
    final raw = prefs.getString('zarwinto_applied_coupon');
    if (raw == null) return;
    try {
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      appliedCoupon = Coupon.fromJson(decoded);
    } catch (e) {
      appliedCoupon = null;
    }
  }

  void _saveAppliedCoupon() {
    if (appliedCoupon == null) {
      prefs.remove('zarwinto_applied_coupon');
    } else {
      final encoded = jsonEncode(appliedCoupon!.toJson());
      prefs.setString('zarwinto_applied_coupon', encoded);
    }
  }
}

SupabaseClient? _configuredSupabaseClient() {
  if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) return null;
  try {
    return Supabase.instance.client;
  } catch (_) {
    // Supabase.initialize() was not called or failed
    return null;
  }
}
