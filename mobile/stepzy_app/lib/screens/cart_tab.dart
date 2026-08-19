import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/common.dart';
import '../widgets/cart_row.dart';
import '../core/theme.dart';
import '../widgets/z_button.dart';
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
    final code = _couponController.text.trim();
    if (code.isEmpty) return;

    setState(() => _applyingCoupon = true);
    final coupon = await store.applyCoupon(code);
    setState(() => _applyingCoupon = false);

    if (!mounted) return;

    if (coupon != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content:
              Text('Coupon applied! ${coupon.displayValue} discount added.'),
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

  void _confirmClearCart(ZarwintoStore store) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Clear your bag?'),
        content: const Text(
          'This will remove all items from your shopping bag.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: ZarwintoColors.error,
            ),
            onPressed: () {
              store.clearCart();
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Your bag is now empty')),
              );
            },
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final freeShippingThreshold = 999.0;

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      appBar: AppBar(
        title: const Text('My Bag'),
        backgroundColor: ZarwintoColors.background,
        foregroundColor: ZarwintoColors.foreground,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        actions: [
          ListenableBuilder(
            listenable: store,
            builder: (context, _) => store.cart.isNotEmpty
                ? TextButton(
                    onPressed: () => _confirmClearCart(store),
                    child: Text(
                      'Clear All',
                      style: TextStyle(color: ZarwintoColors.error),
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
      body: ListenableBuilder(
        listenable: store,
        builder: (context, _) {
          if (store.cart.isEmpty) {
            return _EmptyBag(store: store);
          }

          final remainingForFreeShipping =
              freeShippingThreshold - store.subtotal;
          final progress =
              (store.subtotal / freeShippingThreshold).clamp(0.0, 1.0);

          return RefreshIndicator(
            color: ZarwintoColors.primary,
            onRefresh: store.refresh,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
              children: [
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
                          HugeIcon(
                            icon: remainingForFreeShipping <= 0
                                ? HugeIcons.strokeRoundedCheckmarkCircle02
                                : HugeIcons.strokeRoundedTruck,
                            size: 18,
                            color: remainingForFreeShipping <= 0
                                ? ZarwintoColors.success
                                : ZarwintoColors.primary,
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
                                color: remainingForFreeShipping <= 0
                                    ? ZarwintoColors.success
                                    : ZarwintoColors.foreground,
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
                            remainingForFreeShipping <= 0
                                ? ZarwintoColors.success
                                : ZarwintoColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Cart Items List
                ...store.cart.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: CartRow(item),
                    )),
                const SizedBox(height: 4),

                // Coupon Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            HugeIcon(
                              icon: HugeIcons.strokeRoundedTag01,
                              color: ZarwintoColors.primary,
                              size: 20,
                            ),
                            SizedBox(width: 8),
                            Text(
                              'Apply Coupon Code',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                              ),
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
                                    borderSide: const BorderSide(
                                      color: ZarwintoColors.border,
                                    ),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 10,
                                  ),
                                ),
                                textCapitalization: TextCapitalization.characters,
                              ),
                            ),
                            const SizedBox(width: 10),
                            ElevatedButton(
                              onPressed: _applyingCoupon
                                  ? null
                                  : () => _applyCoupon(store),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: ZarwintoColors.foreground,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 12,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              child: _applyingCoupon
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Text('Apply'),
                            ),
                          ],
                        ),
                        if (store.appliedCoupon != null) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: ZarwintoColors.success
                                  .withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: ZarwintoColors.success
                                    .withValues(alpha: 0.3),
                              ),
                            ),
                            child: Row(
                              children: [
                                HugeIcon(
                                  icon: HugeIcons
                                      .strokeRoundedCheckmarkCircle02,
                                  color: ZarwintoColors.success,
                                  size: 18,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    '${store.appliedCoupon!.code} - ${store.appliedCoupon!.displayValue}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                                TextButton(
                                  onPressed: () {
                                    store.removeCoupon();
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Coupon removed'),
                                      ),
                                    );
                                  },
                                  child: const Text(
                                    'Remove',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: ZarwintoColors.error,
                                    ),
                                  ),
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
                              const Text('Coupon Discount',
                                  style: TextStyle(fontWeight: FontWeight.w700)),
                              const Spacer(),
                              Text(
                                '-${inrFormat.format(store.discount)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  color: ZarwintoColors.success,
                                ),
                              ),
                            ],
                          ),
                        ],
                        const SizedBox(height: 10),
                        PriceLine(
                          label: 'Estimated Shipping',
                          value: store.total > freeShippingThreshold
                              ? 'FREE'
                              : inrFormat.format(99),
                        ),
                        const Divider(height: 28),
                        PriceLine(
                          label: 'Estimated Total',
                          value: inrFormat.format(store.total +
                              (store.total > freeShippingThreshold ? 0 : 99)),
                          emphasis: true,
                        ),
                        const SizedBox(height: 16),
                        ZButton.primary(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => const CheckoutPage(),
                              ),
                            );
                          },
                          label: 'Proceed to Checkout',
                          icon: HugeIcons.strokeRoundedLock,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _EmptyBag extends StatelessWidget {
  const _EmptyBag({required this.store});

  final ZarwintoStore store;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 96,
              height: 96,
              decoration: BoxDecoration(
                color: ZarwintoColors.primary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: HugeIcon(
                icon: HugeIcons.strokeRoundedShoppingBag01,
                size: 44,
                color: ZarwintoColors.muted,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Your shopping bag is empty',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
            ),
            const SizedBox(height: 6),
            const Text(
              'Explore our latest drops and find your next pair.',
              style: TextStyle(color: ZarwintoColors.muted, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 22),
            SizedBox(
              width: 200,
              child: ZButton.primary(
                onPressed: () => store.setActiveTab(1),
                label: 'Start Shopping',
                icon: HugeIcons.strokeRoundedShoppingBag01,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
