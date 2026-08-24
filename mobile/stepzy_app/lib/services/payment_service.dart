import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../core/constants.dart';

enum PaymentResult { success, failure, cancelled }

class PaymentService {
  PaymentService(this.prefs);

  final SharedPreferences prefs;

  String get _apiBaseUrl {
    final url = const String.fromEnvironment('ZARWINTO_API_BASE_URL');
    if (url.isNotEmpty) return url;
    if (dotenv.isInitialized) {
      final envUrl = dotenv.env['ZARWINTO_API_BASE_URL'];
      if (envUrl != null && envUrl.isNotEmpty) return envUrl;
    }
    return 'http://localhost:3000';
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
        Uri.parse('$zarwintoDomain/api/cashfree/create-order'),
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

      debugPrint('[PaymentService] Create order response status: ${response.statusCode}');
      debugPrint('[PaymentService] Create order response body: ${response.body}');

      Map<String, dynamic> data;
      try {
        data = jsonDecode(response.body) as Map<String, dynamic>;
      } on FormatException {
        debugPrint('[PaymentService] Website API returned non-JSON, falling back to direct Cashfree API');
        return await _createCashfreeOrderDirect(orderId, amount, name, email, phone);
      }

      if (response.statusCode == 200 && data['success'] == true) {
        return data;
      }

      debugPrint('[PaymentService] Website API error: ${data['error'] ?? response.statusCode}, falling back to direct Cashfree API');
      return await _createCashfreeOrderDirect(orderId, amount, name, email, phone);
    } catch (e) {
      debugPrint('[PaymentService] Website API exception: $e, falling back to direct Cashfree API');
      return await _createCashfreeOrderDirect(orderId, amount, name, email, phone);
    }
  }

  Future<Map<String, dynamic>?> _createCashfreeOrderDirect(
    String orderId,
    double amount,
    String name,
    String email,
    String phone,
  ) async {
    try {
      final sanitizedPhone = phone.replaceAll(RegExp(r'\D'), '');
      final customerPhone = sanitizedPhone.length >= 10
          ? sanitizedPhone.substring(sanitizedPhone.length - 10)
          : sanitizedPhone.padLeft(10, '0');

      final headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-version': '2026-01-01',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
      };

      final body = jsonEncode({
        'order_id': orderId,
        'order_amount': amount,
        'order_currency': 'INR',
        'customer_details': {
          'customer_id': customerPhone,
          'customer_name': name,
          'customer_email': email,
          'customer_phone': customerPhone,
        },
        'order_meta': {
          'return_url': '$zarwintoDomain/checkout?status=success',
          'notify_url': '$zarwintoDomain/api/cashfree/webhook',
        },
        'payment_methods': {
          'upi': {'enabled': true},
          'card': {'enabled': true},
          'netbanking': {'enabled': true},
          'wallet': {'enabled': true},
        },
      });

      final response = await http.post(
        Uri.parse('$_cashfreeBaseUrl/orders'),
        headers: headers,
        body: body,
      );

      debugPrint('[PaymentService] Direct Cashfree create order status: ${response.statusCode}');
      debugPrint('[PaymentService] Direct Cashfree create order body: ${response.body}');

      Map<String, dynamic> data;
      try {
        data = jsonDecode(response.body) as Map<String, dynamic>;
      } on FormatException {
        debugPrint('[PaymentService] Direct Cashfree returned non-JSON');
        return null;
      }

      final cashfreeOrderId = data['order_id'] ?? data['cf_order_id'];
      final paymentSessionId = data['payment_session_id'];

      if (response.statusCode == 200 && cashfreeOrderId != null && paymentSessionId != null) {
        return {
          'success': true,
          'orderId': cashfreeOrderId,
          'paymentSessionId': paymentSessionId,
          'orderToken': data['order_token'],
        };
      }

      debugPrint('[PaymentService] Direct Cashfree create order failed: ${data['message'] ?? data['error_message'] ?? response.statusCode}');
      return null;
    } catch (e) {
      debugPrint('[PaymentService] Direct Cashfree create order error: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>?> verifyCashfreePayment(String orderId) async {
    try {
      final response = await http.get(
        Uri.parse('$zarwintoDomain/api/cashfree/verify-payment?orderId=$orderId'),
      );

      debugPrint('[PaymentService] Verify payment response status: ${response.statusCode}');
      debugPrint('[PaymentService] Verify payment response body: ${response.body}');

      Map<String, dynamic> data;
      try {
        data = jsonDecode(response.body) as Map<String, dynamic>;
      } on FormatException {
        debugPrint('[PaymentService] Website verify returned non-JSON, falling back to direct Cashfree API');
        return await _verifyCashfreePaymentDirect(orderId);
      }

      if (response.statusCode == 200 && data['success'] == true) {
        return data;
      }

      debugPrint('[PaymentService] Website verify error: ${data['error'] ?? response.statusCode}, falling back to direct Cashfree API');
      return await _verifyCashfreePaymentDirect(orderId);
    } catch (e) {
      debugPrint('[PaymentService] Website verify exception: $e, falling back to direct Cashfree API');
      return await _verifyCashfreePaymentDirect(orderId);
    }
  }

  Future<Map<String, dynamic>?> _verifyCashfreePaymentDirect(String orderId) async {
    try {
      final headers = {
        'Accept': 'application/json',
        'x-api-version': '2026-01-01',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
      };

      final response = await http.get(
        Uri.parse('$_cashfreeBaseUrl/orders/$orderId'),
        headers: headers,
      );

      debugPrint('[PaymentService] Direct Cashfree verify status: ${response.statusCode}');
      debugPrint('[PaymentService] Direct Cashfree verify body: ${response.body}');

      Map<String, dynamic> data;
      try {
        data = jsonDecode(response.body) as Map<String, dynamic>;
      } on FormatException {
        return null;
      }

      if (response.statusCode == 200 && data['order_id'] != null) {
        return data;
      }
      return null;
    } catch (e) {
      debugPrint('[PaymentService] Direct Cashfree verify error: $e');
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

  /* Shiprocket integration disabled
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
  */

  String get _cashfreeBaseUrl {
    return cashfreeIsProduction
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';
  }

  Future<PaymentResult> showCashfreeCheckout({
    required BuildContext context,
    required String paymentSessionId,
    required String orderId,
  }) async {
    if (paymentSessionId.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invalid payment session. Please try again.')),
        );
      }
      return PaymentResult.failure;
    }

    final result = await Navigator.of(context).push<PaymentResult>(
      MaterialPageRoute(
        builder: (_) => CashfreeWebViewScreen(
          paymentSessionId: paymentSessionId,
          orderId: orderId,
        ),
        fullscreenDialog: true,
      ),
    );

    if (result != null) return result;

    return PaymentResult.cancelled;
  }

  Future<bool> verifyPaymentStatus(String orderId) async {
    try {
      final result = await verifyCashfreePayment(orderId);
      if (result == null) return false;
      
      // Check mappedPaymentStatus - this is the reliable indicator
      final mappedStatus = (result['mappedPaymentStatus'] ?? '').toString().toLowerCase();
      
      if (mappedStatus != 'paid') {
        debugPrint('[PaymentService] Payment not completed. Status: $mappedStatus');
        return false;
      }
      
      debugPrint('[PaymentService] Payment verified. Status: $mappedStatus');
      return true;
    } catch (e) {
      debugPrint('[PaymentService] Verify payment status error: $e');
      return false;
    }
  }
}

class CashfreeWebViewScreen extends StatefulWidget {
  const CashfreeWebViewScreen({
    super.key,
    required this.paymentSessionId,
    required this.orderId,
  });

  final String paymentSessionId;
  final String orderId;

  @override
  State<CashfreeWebViewScreen> createState() => _CashfreeWebViewScreenState();
}

class _CashfreeWebViewScreenState extends State<CashfreeWebViewScreen> {
  late final WebViewController _controller;
  bool _checkoutCompleted = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) {
            final url = request.url;
            
            if (_checkoutCompleted) {
              return NavigationDecision.prevent;
            }

            // Only match Cashfree's actual return URLs with order_id parameter
            // This ensures we only mark as success when Cashfree redirects back
            final isCashfreeReturn = url.contains('zarwinto.com') || 
                                     url.contains('status=') ||
                                     url.contains('/checkout');
            
            if (isCashfreeReturn && 
                (url.contains('status=success') || url.contains('status=SUCCESS'))) {
              _checkoutCompleted = true;
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) {
                  Navigator.of(context).pop(PaymentResult.success);
                }
              });
              return NavigationDecision.prevent;
            }

            if (url.contains('status=failure') || 
                url.contains('status=FAILURE') ||
                url.contains('payment-failure') ||
                url.contains('payment_failure') ||
                url.contains('status=cancelled') ||
                url.contains('status=CANCELLED')) {
              _checkoutCompleted = true;
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) {
                  Navigator.of(context).pop(PaymentResult.failure);
                }
              });
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadHtmlString(_buildCheckoutHtml());
  }

  String _buildCheckoutHtml() {
    final mode = cashfreeIsProduction ? 'production' : 'sandbox';
    return '''
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    #status { 
      text-align: center; 
      color: #666; 
      font-size: 14px;
    }
    #pay-btn { 
      display: none; 
    }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <div id="status">Loading secure payment...</div>
  </div>
  <button id="pay-btn">Pay Now</button>
  
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const payBtn = document.getElementById('pay-btn');
      const status = document.getElementById('status');
      
      function initCashfree() {
        if (typeof Cashfree === 'undefined') {
          status.textContent = 'Failed to load payment gateway. Please try again.';
          return;
        }
        
        try {
          const cashfree = new Cashfree({
            mode: '$mode'
          });
          
          payBtn.disabled = false;
          status.textContent = '';
          
          payBtn.addEventListener('click', function() {
            status.textContent = 'Redirecting to payment...';
            payBtn.disabled = true;
            
            cashfree.checkout({
              paymentSessionId: '${widget.paymentSessionId}',
              redirectTarget: '_self'
            });
          });
          
          payBtn.click();
        } catch (e) {
          status.textContent = 'Error initializing payment: ' + e.message;
        }
      }
      
      if (typeof Cashfree !== 'undefined') {
        initCashfree();
      } else {
        window.addEventListener('load', function() {
          setTimeout(initCashfree, 500);
        });
      }
    });
  </script>
</body>
</html>
  ''';
  }

  Future<void> _handleBackPressed() async {
    if (_checkoutCompleted) {
      Navigator.of(context).pop(PaymentResult.cancelled);
      return;
    }
    
    _checkoutCompleted = true;
    
    if (mounted) {
      Navigator.of(context).pop(PaymentResult.cancelled);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          _handleBackPressed();
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          title: const Text('Secure Payment'),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
          leading: IconButton(
            onPressed: _handleBackPressed,
            icon: const Icon(Icons.close),
          ),
        ),
        body: SafeArea(
          child: WebViewWidget(controller: _controller),
        ),
      ),
    );
  }
}
