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
import '../repositories/whishkhu_repository.dart';
import '../data/mock_data.dart';
import '../core/constants.dart';

class WhishkhuScope extends InheritedNotifier<WhishkhuStore> {
  const WhishkhuScope({
    super.key,
    required WhishkhuStore store,
    required super.child,
  }) : super(notifier: store);

  static WhishkhuStore of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<WhishkhuScope>();
    assert(scope != null, 'WhishkhuScope not found');
    return scope!.notifier!;
  }
}

class WhishkhuStore extends ChangeNotifier {
  WhishkhuStore(this.prefs)
    : repository = WhishkhuRepository(_configuredSupabaseClient());

  final SharedPreferences prefs;
  final WhishkhuRepository repository;

  bool loading = true;
  String? error;
  List<Product> products = [];
  List<Category> categories = [];
  List<Brand> brands = [];
  List<CartItem> cart = [];
  Set<String> wishlist = {};
  UserProfile? profile;

  bool get isSupabaseConfigured => repository.client != null;
  int get cartCount => cart.fold(0, (sum, item) => sum + item.quantity);
  double get subtotal => cart.fold(0, (sum, item) => sum + item.lineTotal);

  Future<void> bootstrap() async {
    _loadCart();
    await refresh();
  }

  Future<void> refresh() async {
    loading = true;
    error = null;
    notifyListeners();

    try {
      final data = await repository.loadCatalog();
      products = data.products;
      categories = data.categories;
      brands = data.brands;
      await _loadProfileAndWishlist();
    } catch (err) {
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
    _saveCart();
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
    final message = await repository.placeOrder(cart, subtotal, address);
    if (message == null) clearCart();
    return message;
  }

  Future<void> _loadProfileAndWishlist() async {
    profile = await repository.loadProfile();
    wishlist = await repository.loadWishlist();
  }

  void _loadCart() {
    final raw = prefs.getString('whishkhu_mobile_cart');
    if (raw == null) return;
    final decoded = jsonDecode(raw) as List<dynamic>;
    cart = decoded
        .map((item) => CartItem.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  void _saveCart() {
    final encoded = jsonEncode(cart.map((item) => item.toJson()).toList());
    prefs.setString('whishkhu_mobile_cart', encoded);
  }
}

SupabaseClient? _configuredSupabaseClient() {
  if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) return null;
  return Supabase.instance.client;
}
