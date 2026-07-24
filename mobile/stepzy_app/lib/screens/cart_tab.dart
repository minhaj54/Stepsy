import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/common.dart';
import '../widgets/cart_row.dart';
import '../widgets/checkout_sheet.dart';
import '../core/theme.dart';

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
          content: Text('Coupon applied! ${coupon.displayValue}'),
          backgroundColor: ZarwintoColors.success,
        ),
      );
      _couponController.clear();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid or expired coupon'),
          backgroundColor: ZarwintoColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final money = NumberFormat.simpleCurrency();

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 28),
      children: [
        const ZarwintoHeader(title: 'My Bag'),
        const SizedBox(height: 18),
        if (store.cart.isEmpty)
          const EmptyState('Your cart is ready for its first pair.')
        else ...[
          ...store.cart.map((item) => CartRow(item)),
          const SizedBox(height: 16),
          
          // Coupon Section
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.local_offer_outlined, color: ZarwintoColors.primary, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Apply Coupon',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
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
                            hintText: 'Enter coupon code',
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
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              store.removeCoupon();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Coupon removed')),
                              );
                            },
                            child: const Text('Remove', style: TextStyle(fontSize: 12)),
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
          
          // Price Summary
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                children: [
                  PriceLine(
                    label: 'Subtotal',
                    value: money.format(store.subtotal),
                  ),
                  if (store.discount > 0) ...[
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const Text('Discount', style: TextStyle(fontWeight: FontWeight.w700)),
                        const Spacer(),
                        Text(
                          '-${money.format(store.discount)}',
                          style: const TextStyle(fontWeight: FontWeight.w700, color: ZarwintoColors.success),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 10),
                  const PriceLine(label: 'Shipping', value: 'Calculated next'),
                  const Divider(height: 28),
                  PriceLine(
                    label: 'Total',
                    value: money.format(store.total),
                    emphasis: true,
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () => showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: ZarwintoColors.card,
                      builder: (_) => const CheckoutSheet(),
                    ),
                    icon: const Icon(Icons.lock_outline),
                    label: const Text('Proceed to Checkout'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}
