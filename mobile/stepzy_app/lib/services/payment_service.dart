import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:http/http.dart' as http;
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/theme.dart';
import '../core/constants.dart';
import '../models/cart_item.dart';

class PaymentService {
  PaymentService(this.prefs);

  final SharedPreferences prefs;

  String get _apiBaseUrl {
    final url = prefs.getString('zarwinto_api_base_url') ?? 'http://localhost:3000';
    if (url.contains('localhost') && defaultTargetPlatform == TargetPlatform.android) {
      return url.replaceFirst('localhost', '10.0.2.2');
    }
    return url;
  }

  Future<Map<String, dynamic>?> createCashfreeOrder({
    required String orderId,
    required double amount,
    required String name,
    required String email,
    required String phone,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_apiBaseUrl/api/cashfree/create-order'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'orderId': orderId,
          'amount': amount,
          'customerDetails': {
            'name': name,
            'email': email,
            'phone': phone,
          },
        }),
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['success'] == true) {
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<Map<String, dynamic>?> verifyCashfreePayment(String orderId) async {
    try {
      final response = await http.get(
        Uri.parse('$_apiBaseUrl/api/cashfree/verify-payment?orderId=$orderId'),
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['success'] == true) {
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<void> sendOrderAlert(String orderId) async {
    try {
      await http.post(
        Uri.parse('$_apiBaseUrl/api/notifications/order-alert'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'orderId': orderId}),
      );
    } catch (e) {
      // ignore
    }
  }

  Future<Map<String, dynamic>?> syncOrderWithShiprocket({
    required String orderId,
    required List<CartItem> cartItems,
    required Map<String, dynamic> shippingAddress,
    required String paymentMethod,
    required double subtotal,
    required double discount,
    required double shippingCost,
    required String fullName,
    required String phone,
    required String email,
  }) async {
    try {
      const defaultLength = 20.0;
      const defaultBreadth = 12.0;
      const defaultHeight = 8.0;
      const defaultWeight = 0.5;
      const maxLength = 60.0;
      const maxBreadth = 45.0;
      const maxHeight = 45.0;

      double totalQuantity = 0;
      double maxLengthVal = defaultLength;
      double maxBreadthVal = defaultBreadth;
      double maxHeightVal = defaultHeight;
      double totalWeight = 0;

      for (final item in cartItems) {
        final qty = item.quantity;
        totalQuantity += qty;

        final pLength = (item.product.lengthCm ?? defaultLength).toDouble();
        final pBreadth = (item.product.breadthCm ?? defaultBreadth).toDouble();
        final pHeight = (item.product.heightCm ?? defaultHeight).toDouble();
        final pWeight = item.product.weightKg ?? defaultWeight;

        maxLengthVal = max(maxLengthVal, pLength);
        maxBreadthVal = max(maxBreadthVal, pBreadth);
        maxHeightVal = max(maxHeightVal, pHeight);

        totalWeight += pWeight * qty;
      }

      final length = min(maxLengthVal * totalQuantity, maxLength);
      final breadth = min(maxBreadthVal, maxBreadth);
      final height = min(maxHeightVal, maxHeight);
      final weight = max(totalWeight, 0.1);

      final sanitized = phone.replaceAll(RegExp(r'\D'), '');
      final sanitizedPhone = sanitized.length > 10 ? sanitized.substring(sanitized.length - 10) : sanitized;

      final nameParts = fullName.trim().split(' ');
      final billingCustomerName = nameParts.isNotEmpty ? nameParts.first : fullName.trim();
      final billingLastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

      final orderItems = cartItems.map((item) {
        return {
          'name': item.product.title,
          'sku': item.variant.id,
          'units': item.quantity,
          'selling_price': item.product.currentPrice,
          'discount': 0,
          'tax': 0,
        };
      }).toList();

      final shiprocketOrder = {
        'order_id': orderId,
        'order_date': DateTime.now().toIso8601String().split('T')[0],
        'pickup_location': shiprocketPickupLocation,
        'channel_id': '',
        'comment': '',
        'billing_customer_name': billingCustomerName,
        'billing_last_name': billingLastName,
        'billing_address': shippingAddress['addressLine1'] ?? '',
        'billing_address_2': '',
        'billing_city': shippingAddress['city'] ?? '',
        'billing_pincode': '${shippingAddress['pincode'] ?? ''}',
        'billing_state': shippingAddress['state'] ?? '',
        'billing_country': 'India',
        'billing_email': email.isNotEmpty ? email : 'customer@example.com',
        'billing_phone': sanitizedPhone,
        'shipping_is_billing': 1,
        'order_items': orderItems,
        'payment_method': paymentMethod == 'cod' ? 'COD' : 'Prepaid',
        'shipping_charges': shippingCost,
        'giftwrap_charges': 0,
        'transaction_charges': 0,
        'total_discount': discount,
        'sub_total': max(0, subtotal - discount),
        'length': length,
        'breadth': breadth,
        'height': height,
        'weight': weight,
      };

      final response = await http.post(
        Uri.parse('$_apiBaseUrl/api/shiprocket/orders'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'order': shiprocketOrder}),
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode == 200 && data['status'] == 1) {
        debugPrint('[PaymentService] Shiprocket order synced: $orderId');
        return data['data'] as Map<String, dynamic>;
      }

      debugPrint('[PaymentService] Shiprocket sync failed: ${data['error'] ?? response.statusCode}');
      return null;
    } catch (e) {
      debugPrint('[PaymentService] Shiprocket sync error: $e');
      return null;
    }
  }

  Widget buildCashfreeCheckout({
    required String paymentSessionId,
    required VoidCallback onSuccess,
    required VoidCallback onError,
  }) {
    final checkoutUrl = 'https://sandbox.cashfree.com/pg/checkout?paymentSessionId=$paymentSessionId';

    return WebViewScreen(
      initialUrl: checkoutUrl,
      onSuccess: onSuccess,
      onError: onError,
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({
    super.key,
    required this.initialUrl,
    required this.onSuccess,
    required this.onError,
  });

  final String initialUrl;
  final VoidCallback onSuccess;
  final VoidCallback onError;

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() => _loading = true),
          onPageFinished: (_) => setState(() => _loading = false),
          onNavigationRequest: (request) {
            final url = request.url;
            if (url.contains('/checkout?status=success') ||
                url.contains('/payment-success') ||
                url.contains('/order-success')) {
              widget.onSuccess();
              return NavigationDecision.prevent;
            }
            if (url.contains('/checkout?status=failure') ||
                url.contains('/payment-failure') ||
                url.contains('/order-failure')) {
              widget.onError();
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.initialUrl));
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Secure Payment'),
          backgroundColor: ZarwintoColors.background,
          foregroundColor: ZarwintoColors.foreground,
          leading: IconButton(
            onPressed: widget.onError,
            icon: const HugeIcon(icon: HugeIcons.strokeRoundedCancel01, color: ZarwintoColors.foreground),
          ),
        ),
        body: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_loading)
              const Center(
                child: CircularProgressIndicator(color: ZarwintoColors.primary),
              ),
          ],
        ),
      ),
    );
  }
}
