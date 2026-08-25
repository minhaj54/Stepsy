import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpaymentgateway/cfpaymentgatewayservice.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfsession/cfsession.dart';
import 'package:flutter_cashfree_pg_sdk/api/cfpayment/cfwebcheckoutpayment.dart';
import 'package:flutter_cashfree_pg_sdk/utils/cfenums.dart';
import 'package:flutter_cashfree_pg_sdk/utils/cfexceptions.dart';
import 'package:flutter_cashfree_pg_sdk/api/cferrorresponse/cferrorresponse.dart';
import '../core/constants.dart';

enum PaymentResult { success, failure, cancelled }

class PaymentService {
  PaymentService(this.prefs);

  final SharedPreferences prefs;
  final cfPaymentGatewayService = CFPaymentGatewayService();

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

    final completer = Completer<PaymentResult>();

    void verifyPayment(String cfOrderId) {
      if (!completer.isCompleted) {
        completer.complete(PaymentResult.success);
      }
    }

    void onError(CFErrorResponse errorResponse, String cfOrderId) {
      debugPrint(
        '[PaymentService] Native checkout error: ${errorResponse.getMessage()} (code: ${errorResponse.getCode()})',
      );
      if (!completer.isCompleted) {
        completer.complete(PaymentResult.failure);
      }
    }

    cfPaymentGatewayService.setCallback(verifyPayment, onError);

    try {
      final environment = cashfreeIsProduction ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
      final session = CFSessionBuilder()
          .setEnvironment(environment)
          .setOrderId(orderId)
          .setPaymentSessionId(paymentSessionId)
          .build();

      final webCheckout = CFWebCheckoutPaymentBuilder()
          .setSession(session)
          .build();

      cfPaymentGatewayService.doPayment(webCheckout);
    } on CFException catch (e) {
      debugPrint('[PaymentService] Cashfree native exception: ${e.message}');
      if (!completer.isCompleted) {
        completer.complete(PaymentResult.failure);
      }
    } catch (e) {
      debugPrint('[PaymentService] Cashfree native error: $e');
      if (!completer.isCompleted) {
        completer.complete(PaymentResult.failure);
      }
    }

    try {
      return await completer.future.timeout(
        const Duration(minutes: 10),
        onTimeout: () => PaymentResult.cancelled,
      );
    } on TimeoutException {
      return PaymentResult.cancelled;
    }
  }

  Future<bool> verifyPaymentStatus(String orderId) async {
    try {
      final result = await verifyCashfreePayment(orderId);
      if (result == null) return false;

      final mappedStatus = (result['mappedPaymentStatus'] ?? '').toString().toLowerCase();
      if (mappedStatus.isNotEmpty) {
        if (mappedStatus == 'paid') {
          debugPrint('[PaymentService] Payment verified via backend. Status: $mappedStatus');
          return true;
        }
        debugPrint('[PaymentService] Payment not completed via backend. Status: $mappedStatus');
        return false;
      }

      final orderStatus = (result['order_status'] ?? '').toString().toUpperCase();
      if (orderStatus == 'PAID' || orderStatus == 'SUCCESS') {
        debugPrint('[PaymentService] Payment verified via direct API order_status. Status: $orderStatus');
        return true;
      }

      final payments = result['payments'] as List<dynamic>?;
      if (payments != null && payments.isNotEmpty) {
        final paymentStatus = (payments[0]['payment_status'] ?? '').toString().toUpperCase();
        if (paymentStatus == 'PAID' || paymentStatus == 'SUCCESS') {
          debugPrint('[PaymentService] Payment verified via direct API payments. Status: $paymentStatus');
          return true;
        }
      }

      debugPrint('[PaymentService] Payment not completed. Order status: $orderStatus');
      return false;
    } catch (e) {
      debugPrint('[PaymentService] Verify payment status error: $e');
      return false;
    }
  }
}
