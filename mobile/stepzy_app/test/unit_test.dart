import 'package:flutter_test/flutter_test.dart';
import 'package:zarwinto_app/models/product.dart';
import 'package:zarwinto_app/models/address.dart';
import 'package:zarwinto_app/models/coupon.dart';
import 'package:zarwinto_app/services/location_resolver.dart';

void main() {
  group('Model Serialization Tests', () {
    test('Product JSON parsing and pricing logic', () {
      final json = {
        'id': 'prod-123',
        'title': 'Air Jordan Retro High',
        'description': 'Iconic basketball shoe',
        'price': 14999.0,
        'sale_price': 11999.0,
        'is_featured': true,
        'brand_id': 'brand-nike',
        'brand_name': 'Nike',
        'category_slug': 'sneakers',
        'rating': 4.8,
        'images': ['https://example.com/shoe1.png', 'https://example.com/shoe2.png'],
        'variants': [
          {
            'id': 'var-1',
            'product_id': 'prod-123',
            'size': 'UK 9',
            'color': 'Black/Red',
            'stock': 5,
            'sku': 'AJ-001',
          }
        ],
      };

      final product = Product.fromJson(json);
      expect(product.id, 'prod-123');
      expect(product.title, 'Air Jordan Retro High');
      expect(product.currentPrice, 11999.0);
      expect(product.brandName, 'Nike');
      expect(product.variants.length, 1);
      expect(product.variants.first.size, 'UK 9');
    });

    test('Coupon calculation logic', () {
      final percentageCoupon = Coupon(
        id: 'c-1',
        code: 'STEPZY20',
        type: 'percentage',
        value: 20.0,
        startDate: DateTime.now().subtract(const Duration(days: 1)),
        endDate: DateTime.now().add(const Duration(days: 30)),
        active: true,
        minPurchase: 1000.0,
        maxDiscount: 500.0,
      );

      expect(percentageCoupon.calculateDiscount(2000.0), 400.0);
      expect(percentageCoupon.calculateDiscount(5000.0), 500.0); // Capped at maxDiscount
      expect(percentageCoupon.calculateDiscount(500.0), 0.0); // Below minPurchase
    });

    test('Address serialization and full address format', () {
      final address = Address(
        id: 'addr-1',
        userId: 'user-1',
        fullName: 'Minhaj Raza',
        phone: '9876543210',
        addressLine1: 'Flat 402, Sunshine Heights, MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true,
        createdAt: DateTime.now(),
      );

      expect(address.fullName, 'Minhaj Raza');
      expect(address.pincode, '400001');
      expect(address.fullAddress, contains('Mumbai'));
      expect(address.fullAddress, contains('400001'));
      expect(address.toJson()['pincode'], '400001');
    });
  });

  group('Location Resolver Offline Fallback', () {
    test('Resolves known Indian PIN code fallback correctly', () async {
      final loc = await LocationResolver.resolvePincode('110001');
      expect(loc, isNotNull);
      expect(loc!.stateName, 'Delhi');
    });

    test('Resolves Mumbai PIN code fallback correctly', () async {
      final loc = await LocationResolver.resolvePincode('400001');
      expect(loc, isNotNull);
      expect(loc!.stateName, 'Maharashtra');
    });
  });
}
