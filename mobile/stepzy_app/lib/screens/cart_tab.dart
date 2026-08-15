import 'package:flutter/material.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/common.dart';
import '../widgets/cart_row.dart';
import '../core/theme.dart';
import 'checkout_page.dart';

class CartTab extends StatefulWidget {
  const CartTab({super.key});

  @override
  State<CartTab> createState() => _CartTabState();
}

class _CartTabState extends State<CartTab> {
  final _couponController = TextEditingController();
  bool _applyingCoupon = false;

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  Future<void> _applyCoupon(ZarwintoStore store) async {
    if (_couponController.text.trim().isEmpty) return;

    setState(() => _applyingCoupon = true);
    final coupon = await store.applyCoupon(_couponController.text.trim());
    setState(() => _applyingCoupon = false);

    if (!mounted) return;

    if (coupon != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Coupon applied! ${coupon.displayValue} discount added.'),
          backgroundColor: ZarwintoColors.success,
        ),
      );
      _couponController.clear();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid or expired coupon code'),
          backgroundColor: ZarwintoColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final freeShippingThreshold = 999.0;
    final remainingForFreeShipping = freeShippingThreshold - store.subtotal;
    final progress = (store.subtotal / freeShippingThreshold).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
          children: [
            const ZarwintoHeader(title: 'My Bag'),
            const SizedBox(height: 18),
            if (store.cart.isEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
                  child: Column(
                    children: [
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: ZarwintoColors.primary.withValues(alpha: 0.08),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.shopping_bag_outlined,
                          size: 36,
                          color: ZarwintoColors.muted,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Your shopping bag is empty',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Explore our latest drops and find your next pair.',
                        style: TextStyle(color: ZarwintoColors.muted, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      FilledButton(
                        onPressed: () => store.setActiveTab(1),
                        style: FilledButton.styleFrom(
                          minimumSize: const Size(160, 44),
                        ),
                        child: const Text('Start Shopping'),
                      ),
                    ],
                  ),
                ),
              )
            else ...[
              // Free Shipping Progress Bar
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: ZarwintoColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          remainingForFreeShipping <= 0 ? Icons.check_circle : Icons.local_shipping_outlined,
                          size: 18,
                          color: remainingForFreeShipping <= 0 ? ZarwintoColors.success : ZarwintoColors.primary,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            remainingForFreeShipping <= 0
                                ? 'Congratulations! You unlocked FREE Delivery 🎉'
                                : 'Add ${inrFormat.format(remainingForFreeShipping)} more to get FREE Delivery',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: remainingForFreeShipping <= 0 ? ZarwintoColors.success : ZarwintoColors.foreground,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progress,
                        minHeight: 6,
                        backgroundColor: ZarwintoColors.background,
                        valueColor: AlwaysStoppedAnimation(
                          remainingForFreeShipping <= 0 ? ZarwintoColors.success : ZarwintoColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Cart Items List
              ...store.cart.map((item) => CartRow(item)),
              const SizedBox(height: 16),

              // Coupon Section
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.local_offer_outlined, color: ZarwintoColors.primary, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Apply Coupon Code',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _couponController,
                              decoration: InputDecoration(
                                hintText: 'Enter promo code (e.g. SAVE10)',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(color: ZarwintoColors.border),
                                ),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                              textCapitalization: TextCapitalization.characters,
                            ),
                          ),
                          const SizedBox(width: 10),
                          ElevatedButton(
                            onPressed: _applyingCoupon ? null : () => _applyCoupon(store),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ZarwintoColors.foreground,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: _applyingCoupon
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : const Text('Apply'),
                          ),
                        ],
                      ),
                      if (store.appliedCoupon != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: ZarwintoColors.success.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: ZarwintoColors.success.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.check_circle, color: ZarwintoColors.success, size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  '${store.appliedCoupon!.code} - ${store.appliedCoupon!.displayValue}',
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                ),
                              ),
                              TextButton(
                                onPressed: () {
                                  store.removeCoupon();
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Coupon removed')),
                                  );
                                },
                                child: const Text('Remove', style: TextStyle(fontSize: 12, color: ZarwintoColors.error)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Price Summary Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    children: [
                      PriceLine(
                        label: 'Bag Subtotal',
                        value: inrFormat.format(store.subtotal),
                      ),
                      if (store.discount > 0) ...[
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Text('Coupon Discount', style: TextStyle(fontWeight: FontWeight.w700)),
                            const Spacer(),
                            Text(
                              '-${inrFormat.format(store.discount)}',
                              style: const TextStyle(fontWeight: FontWeight.w700, color: ZarwintoColors.success),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 10),
                      PriceLine(
                        label: 'Estimated Shipping',
                        value: store.total > freeShippingThreshold ? 'FREE' : inrFormat.format(99),
                      ),
                      const Divider(height: 28),
                      PriceLine(
                        label: 'Estimated Total',
                        value: inrFormat.format(store.total + (store.total > freeShippingThreshold ? 0 : 99)),
                        emphasis: true,
                      ),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const CheckoutPage()),
                          );
                        },
                        icon: const Icon(Icons.lock_outline_rounded, size: 18),
                        label: const Text('Proceed to Checkout'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
