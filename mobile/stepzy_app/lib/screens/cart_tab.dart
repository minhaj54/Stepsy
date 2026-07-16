import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/common.dart';
import '../widgets/cart_row.dart';
import '../widgets/checkout_sheet.dart';
import '../core/theme.dart';

class CartTab extends StatelessWidget {
  const CartTab({super.key});

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final money = NumberFormat.simpleCurrency();

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 28),
      children: [
        const ZarwintoHeader(title: 'Bag'),
        const SizedBox(height: 18),
        if (store.cart.isEmpty)
          const EmptyState('Your cart is ready for its first pair.')
        else ...[
          ...store.cart.map((item) => CartRow(item)),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                children: [
                  PriceLine(
                    label: 'Subtotal',
                    value: money.format(store.subtotal),
                  ),
                  const SizedBox(height: 10),
                  const PriceLine(label: 'Shipping', value: 'Calculated next'),
                  const Divider(height: 28),
                  PriceLine(
                    label: 'Total',
                    value: money.format(store.subtotal),
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
                    label: const Text('Checkout'),
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
