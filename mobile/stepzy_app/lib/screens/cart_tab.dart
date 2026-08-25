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

          final remainingForFreeShipping = 0.0;
          final progress = 1.0;

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
                        const SizedBox(height: 10),
                        PriceLine(
                          label: 'Estimated Shipping',
                          value: 'FREE',
                        ),
                        const Divider(height: 28),
                        PriceLine(
                          label: 'Estimated Total',
                          value: inrFormat.format(store.total),
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
