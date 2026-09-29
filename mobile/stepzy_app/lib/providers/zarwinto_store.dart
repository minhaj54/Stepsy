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
import '../core/constants.dart';

class ZarwintoScope extends InheritedNotifier<ZarwintoStore> {
  const ZarwintoScope({
    super.key,
    required ZarwintoStore store,
    required super.child,
  }) : super(notifier: store);

  static ZarwintoStore of(BuildContext context, {bool listen = true}) {
    final scope = listen
        ? context.dependOnInheritedWidgetOfExactType<ZarwintoScope>()
        : context.getInheritedWidgetOfExactType<ZarwintoScope>();
    assert(scope != null, 'ZarwintoScope not found in widget tree');
    return scope!.notifier!;
  }
}

class ZarwintoStore extends ChangeNotifier {
  ZarwintoStore(this.prefs)
    : repository = ZarwintoRepository(null); // client set during bootstrap

  final SharedPreferences prefs;
  final ZarwintoRepository repository;

  bool loading = true;
  bool loadingMore = false;
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
  int activeTab = 0;
  Map<String, String> colors = {};
  List<String> recentlyViewedIds = [];
  List<Review> _currentProductReviews = [];
  bool _loadingReviews = false;

  static const int _productPageSize = 8;
  int _productOffset = 0;
  bool _hasMoreProducts = true;

  bool get isSupabaseConfigured => repository.client != null;
  bool get isLoadingMore => loadingMore;
  bool get hasMoreProducts => _hasMoreProducts;
  int get cartCount => cart.fold(0, (sum, item) => sum + item.quantity);
  double get subtotal => cart.fold(0, (sum, item) => sum + item.lineTotal);
  double get discount => appliedCoupon?.calculateDiscount(subtotal) ?? 0;
  double get total => subtotal - discount;

  List<Product> get recentlyViewedProducts =>
      recentlyViewedIds
          .map((id) => products.firstWhere((p) => p.id == id, orElse: () => products.first))
          .toList();

  List<Review> get currentProductReviews => _currentProductReviews;
  bool get loadingReviews => _loadingReviews;

  void addToRecentlyViewed(String productId) {
    recentlyViewedIds.remove(productId);
    recentlyViewedIds.insert(0, productId);
    if (recentlyViewedIds.length > 10) {
      recentlyViewedIds = recentlyViewedIds.sublist(0, 10);
    }
    notifyListeners();
  }

  void setCurrentProductReviews(List<Review> reviews) {
    _currentProductReviews = reviews;
    _loadingReviews = false;
    notifyListeners();
  }

  void setLoadingReviews(bool loading) {
    _loadingReviews = loading;
    notifyListeners();
  }

  Future<void> bootstrap() async {
    _loadCart();
    _loadAppliedCoupon();
    _loadCachedBanners();
    repository.setClient(_configuredSupabaseClient());
    debugPrint('[Zarwinto] bootstrap() — client available: ${repository.client != null}');
    debugPrint('[Zarwinto] bootstrap() — supabaseUrl: $supabaseUrl');
    debugPrint('[Zarwinto] bootstrap() — supabaseAnonKey present: $supabaseAnonKey.isNotEmpty');
    await _loadEssentialData();
    _loadBackgroundData();
  }

  Future<void> _loadEssentialData() async {
    loading = true;
    error = null;
    _productOffset = 0;
    _hasMoreProducts = true;
    notifyListeners();

    debugPrint('[Zarwinto] _loadEssentialData() started');

    try {
      debugPrint('[Zarwinto] _loadEssentialData() — loading catalog (first page)...');
      // Load a larger set of products initially (e.g., 50) to ensure Home page sections 
      // (Featured, New Arrivals, etc.) have enough variety to display.
      final data = await repository.loadCatalog(productLimit: 50);
      products = data.products;
      _shopProducts = products.toList();
      categories = data.categories;
      brands = data.brands;
      _productOffset = products.length;
      _hasMoreProducts = products.length >= 50;
      debugPrint('[Zarwinto] _loadEssentialData() — catalog loaded: ${products.length} products, ${categories.length} categories');

      // Ensure we have enough variety for home page sections
      try {
        debugPrint('[Zarwinto] _loadEssentialData() — fetching home sections data...');
        final featured = await repository.fetchFeaturedProducts(limit: 5);
        final newArrivals = await repository.fetchNewArrivals(limit: 5);
        final bestSellers = await repository.fetchBestSellers(limit: 6);
        
        final allSectionProducts = [...featured, ...newArrivals, ...bestSellers];
        for (final p in allSectionProducts) {
          if (!products.any((existing) => existing.id == p.id)) {
            products.add(p);
          }
        }
        debugPrint('[Zarwinto] _loadEssentialData() — home sections data loaded');
      } catch (e) {
        debugPrint('[Zarwinto] _loadEssentialData() — home sections fetch failed: $e');
      }

      if (repository.client != null) {
        debugPrint('[Zarwinto] _loadEssentialData() — loading banners...');
        banners = await repository.loadBanners();
        _saveBannersToCache();
        debugPrint('[Zarwinto] _loadEssentialData() — loaded ${banners.length} banners');
      } else {
        debugPrint(
          '[Zarwinto] _loadEssentialData() — Supabase unavailable; using ${banners.length} cached banners',
        );
      }

      if (repository.client?.auth.currentUser != null) {
        debugPrint('[Zarwinto] _loadEssentialData() — active session found, loading profile...');
        await _loadProfileAndWishlist();
        debugPrint('[Zarwinto] _loadEssentialData() — profile loaded: ${profile != null}');
      }

      debugPrint('[Zarwinto] _loadEssentialData() — essential data complete');
    } catch (err) {
      debugPrint('[Zarwinto] _loadEssentialData() error: $err');
      error = err.toString();
    } finally {
      loading = false;
      notifyListeners();
      debugPrint('[Zarwinto] _loadEssentialData() finished — loading=false');
    }
  }

  Future<void> _loadBackgroundData() async {
    debugPrint('[Zarwinto] _loadBackgroundData() started');

    try {
      debugPrint('[Zarwinto] _loadBackgroundData() — loading colors...');
      colors = await repository.fetchColors();
      debugPrint('[Zarwinto] _loadBackgroundData() — loaded ${colors.length} colors');

      debugPrint('[Zarwinto] _loadBackgroundData() — loading coupons...');
      coupons = await repository.loadCoupons();
      debugPrint('[Zarwinto] _loadBackgroundData() — loaded ${coupons.length} coupons');

      debugPrint('[Zarwinto] _loadBackgroundData() — loading testimonials...');
      testimonials = await repository.loadTestimonials();
      debugPrint('[Zarwinto] _loadBackgroundData() — loaded ${testimonials.length} testimonials');

      debugPrint('[Zarwinto] _loadBackgroundData() — loading profile and wishlist...');
      await _loadProfileAndWishlist();
      debugPrint('[Zarwinto] _loadBackgroundData() — profile loaded: ${profile != null}');

      debugPrint('[Zarwinto] _loadBackgroundData() — loading orders...');
      try {
        await _loadOrders();
        debugPrint('[Zarwinto] _loadBackgroundData() — loaded ${orders.length} orders');
      } catch (e) {
        debugPrint('[Zarwinto] _loadBackgroundData() — orders load failed: $e');
      }

      debugPrint('[Zarwinto] _loadBackgroundData() — loading addresses...');
      try {
        await _loadAddresses();
        debugPrint('[Zarwinto] _loadBackgroundData() — loaded ${addresses.length} addresses');
      } catch (e) {
        debugPrint('[Zarwinto] _loadBackgroundData() — addresses load failed: $e');
      }
    } catch (err) {
      debugPrint('[Zarwinto] _loadBackgroundData() error: $err');
    }

    debugPrint('[Zarwinto] _loadBackgroundData() complete');
    notifyListeners();
  }

  Future<void> refresh() async {
    await _loadEssentialData();
    _loadBackgroundData();
  }

  Future<void> loadMoreProducts({String? categorySlug, String? brandId, String? gender, bool reset = false}) async {
    if (loadingMore || repository.client == null) return;
    if (!reset && !_hasMoreProducts) return;

    if (reset) {
      _productOffset = 0;
      _hasMoreProducts = true;
      _shopProducts = [];
      notifyListeners();
    }

    loadingMore = true;
    notifyListeners();

    try {
      debugPrint('[Zarwinto] loadMoreProducts() — offset=$_productOffset reset=$reset');
      final more = await repository.fetchMoreProducts(
        _productOffset, 
        _productPageSize,
        categorySlug: categorySlug,
        brandId: brandId,
        gender: gender,
      );
      
      if (more.isEmpty) {
        _hasMoreProducts = false;
      } else {
        if (reset) {
          _shopProducts = more;
        } else {
          _shopProducts = [..._shopProducts, ...more];
        }
        
        // Also update the global products list if not already present
        for (final p in more) {
          if (!products.any((existing) => existing.id == p.id)) {
            products.add(p);
          }
        }
        
        _productOffset = _shopProducts.length;
        _hasMoreProducts = more.length >= _productPageSize;
      }
      
      debugPrint('[Zarwinto] loadMoreProducts() — total shop products now: ${_shopProducts.length}, hasMore=$_hasMoreProducts');
    } catch (err) {
      debugPrint('[Zarwinto] loadMoreProducts() error: $err');
    } finally {
      loadingMore = false;
      notifyListeners();
    }
  }

  Future<List<Product>> getProductsByCategory(String categorySlug, {int offset = 0, int limit = 8}) async {
    return repository.fetchProductsByCategory(categorySlug, offset: offset, limit: limit);
  }

  Future<List<Product>> searchProducts(String query) async {
    return repository.searchProducts(query);
  }

  List<Product> featuredProducts() =>
      products.where((product) => product.featured).take(5).toList()..shuffle();

  List<Product> newArrivals() =>
      products.where((product) => product.newArrival).take(5).toList()..shuffle();

  List<Product> bestSellers() =>
      products.where((product) => product.bestSeller).take(6).toList()..shuffle();

  List<Product> _shopProducts = [];
  
  List<Product> get shopProducts => _shopProducts;
  
  void shuffleShopProducts() {
    _shopProducts = products.toList()..shuffle();
    notifyListeners();
  }

  void addToCart(
    Product product,
    ProductVariant variant, {
    int quantity = 1,
    String? selectedColor,
  }) {
    final index = cart.indexWhere((item) => item.variant.id == variant.id);
    if (index >= 0) {
      cart[index] = cart[index].copyWith(
        quantity: cart[index].quantity + quantity,
      );
    } else {
      cart.add(
        CartItem(
          product: product,
          variant: variant,
          quantity: quantity,
          color: selectedColor,
        ),
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

  Future<void> updateProfile({String? fullName, String? phone}) async {
    await repository.updateProfile(fullName: fullName, phone: phone);
    await _loadProfileAndWishlist();
    notifyListeners();
  }

  Future<(String?, bool)> sendOtp(String phone, {String? fullName}) async {
    final result = await repository.sendOtp(phone, fullName: fullName);
    notifyListeners();
    return result;
  }

  Future<(String?, int)> verifyOtp(
    String phone,
    String code, {
    String? fullName,
  }) async {
    final result = await repository.verifyOtp(phone, code, fullName: fullName);
    if (result.$1 == null) {
      await _loadProfileAndWishlist();
    }
    notifyListeners();
    return result;
  }

  void setActiveTab(int tab) {
    activeTab = tab;
    notifyListeners();
  }

  Future<String?> placeOrder(
    ShippingAddress address, {
    String paymentMethod = 'cod',
  }) async {
    if (cart.isEmpty) return null;
    if (profile == null) return null;

    final orderId = await repository.placeOrder(
      cart,
      address,
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon?.code,
      discountAmount: discount,
    );

    if (orderId != null) {
      clearCart();
      await loadOrders();
    }
    return orderId;
  }

  Future<String?> createPendingOrder(
    ShippingAddress address, {
    required String paymentMethod,
  }) async {
    if (cart.isEmpty) return null;
    if (profile == null) return null;

    return repository.createPendingOrder(
      cart,
      address,
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon?.code,
      discountAmount: discount,
    );
  }

  Future<String?> createConfirmedOrder(
    ShippingAddress address, {
    required String paymentMethod,
  }) async {
    if (cart.isEmpty) return null;
    if (profile == null) return null;

    return repository.createConfirmedOrder(
      cart,
      address,
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon?.code,
      discountAmount: discount,
    );
  }

  Future<Order?> fetchOrder(String orderId) async {
    return repository.fetchOrder(orderId);
  }

  Future<void> cancelOrder(String orderId, String reason) async {
    try {
      await repository.cancelOrder(orderId, reason);
      await _loadOrders();
      notifyListeners();
    } catch (e) {
      debugPrint('[Zarwinto] cancelOrder failed: $e');
      rethrow;
    }
  }

  Future<void> loadOrders() async {
    await _loadOrders();
    notifyListeners();
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
    final reviews = await repository.loadProductReviews(productId);
    final resolved = reviews.map(_resolveReviewName).toList();
    setCurrentProductReviews(resolved);
    return resolved;
  }

  String? _myDisplayName() {
    if (profile?.fullName.trim().isNotEmpty == true)
      return profile!.fullName.trim();
    final me = repository.client?.auth.currentUser;
    final meta = me?.userMetadata;
    final fromMeta =
        (meta?['full_name'] as String?) ?? (meta?['display_name'] as String?);
    if (fromMeta != null && fromMeta.trim().isNotEmpty) return fromMeta.trim();
    final phone = me?.phone;
    if (phone != null && phone.isNotEmpty) return phone;
    return null;
  }

  Review _resolveReviewName(Review r) {
    final name = r.userName?.trim();
    if (name != null && name.isNotEmpty) return r;
    // The `users(full_name)` join can be null because the `users` table RLS
    // only allows reading your own profile. For the current user's own
    // reviews, fall back to the locally known name.
    final me = repository.client?.auth.currentUser;
    if (r.userId != me?.id) return r;
    final fallback = _myDisplayName();
    if (fallback != null && fallback.isNotEmpty) {
      return Review(
        id: r.id,
        userId: r.userId,
        productId: r.productId,
        rating: r.rating,
        reviewText: r.reviewText,
        images: r.images,
        approved: r.approved,
        createdAt: r.createdAt,
        userName: fallback,
      );
    }
    return r;
  }

  Future<void> addReview(
    String productId,
    int rating,
    String reviewText, {
    List<String> images = const [],
  }) async {
    final me = repository.client?.auth.currentUser;
    await repository.addReview(
      Review(
        id: '',
        userId: me?.id ?? '',
        productId: productId,
        rating: rating,
        reviewText: reviewText,
        images: images,
        createdAt: DateTime.now(),
        userName: _myDisplayName(),
      ),
    );
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

  static const _bannerCacheKey = 'zarwinto_banners_cache';

  void _loadCachedBanners() {
    final raw = prefs.getString(_bannerCacheKey);
    if (raw == null) return;
    try {
      final decoded = jsonDecode(raw) as List<dynamic>;
      banners = decoded
          .map((item) => BannerModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (e) {
      banners = [];
    }
  }

  void _saveBannersToCache() {
    final encoded = jsonEncode(banners.map((b) => b.toJson()).toList());
    prefs.setString(_bannerCacheKey, encoded);
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
  debugPrint('[Zarwinto] _configuredSupabaseClient() called');
  debugPrint(
    '[Zarwinto] supabaseUrl=$supabaseUrl, supabaseAnonKey=${supabaseAnonKey.isNotEmpty ? "present" : "missing"}',
  );
  if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
    debugPrint(
      '[Zarwinto] _configuredSupabaseClient() returning null: credentials empty',
    );
    return null;
  }
  try {
    final client = Supabase.instance.client;
    debugPrint(
      '[Zarwinto] _configuredSupabaseClient() returning Supabase.instance.client',
    );
    return client;
  } catch (e) {
    debugPrint('[Zarwinto] _configuredSupabaseClient() error: $e');
    return null;
  }
}
