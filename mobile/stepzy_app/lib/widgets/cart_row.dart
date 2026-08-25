import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../models/cart_item.dart';
import '../providers/zarwinto_store.dart';
import 'common.dart';
import '../screens/product_detail.dart';

class CartRow extends StatelessWidget {
  const CartRow(this.item, {super.key});

  final CartItem item;

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);

    return Dismissible(
      key: Key(item.variant.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        decoration: BoxDecoration(
          color: ZarwintoColors.error.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(16),
        ),
        child: HugeIcon(
          icon: HugeIcons.strokeRoundedDelete01,
          size: 24,
          color: ZarwintoColors.error,
        ),
      ),
      confirmDismiss: (_) async {
        final removed = item.product.title;
        store.updateCartQuantity(item.variant.id, 0);
        if (!context.mounted) return true;
        final messenger = ScaffoldMessenger.of(context);
        messenger.clearSnackBars();
        final snackBar = SnackBar(
          content: Text('Removed $removed from your bag'),
          duration: const Duration(seconds: 2),
        );
        messenger.showSnackBar(snackBar);
        Future.delayed(const Duration(seconds: 2), messenger.hideCurrentSnackBar);
        return true;
      },
      child: Card(
        child: InkWell(
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ProductDetailPage(product: item.product),
              ),
            );
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: SizedBox(
                    width: 76,
                    height: 76,
                    child: ZarwintoRemoteImage(
                      url: item.product.images.isNotEmpty
                          ? item.product.images.first
                          : '',
                      seed: 'cart_${item.variant.id}',
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.product.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      if (item.variant.size.isNotEmpty ||
                          (item.color ?? item.variant.color).isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(
                            '${item.variant.size} / ${item.color ?? item.variant.color}'
                                .trim(),
                            style: mutedStyle,
                          ),
                        ),
                      const SizedBox(height: 8),
                      if (item.product.currentPrice < item.product.price) ...[
                        Text(
                          'MRP ${inrFormat.format(item.product.price * item.quantity)}',
                          style: TextStyle(
                            fontSize: 11,
                            color: ZarwintoColors.muted,
                            decoration: TextDecoration.lineThrough,
                            decorationThickness: 1.2,
                          ),
                        ),
                        Text(
                          'Sale Price ${inrFormat.format(item.lineTotal)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                            color: ZarwintoColors.success,
                          ),
                        ),
                      ] else
                        Text(
                          inrFormat.format(item.lineTotal),
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 15,
                          ),
                        ),
                    ],
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      onPressed: () {
                        final removed = item.product.title;
                        store.updateCartQuantity(item.variant.id, 0);
                        final messenger = ScaffoldMessenger.of(context);
                        messenger.clearSnackBars();
                        final snackBar = SnackBar(
                          content: Text('Removed $removed from your bag'),
                          duration: const Duration(seconds: 2),
                        );
                        messenger.showSnackBar(snackBar);
                        Future.delayed(const Duration(seconds: 2), messenger.hideCurrentSnackBar);
                      },
                      icon: HugeIcon(
                        icon: HugeIcons.strokeRoundedDelete01,
                        color: ZarwintoColors.muted,
                        size: 18,
                      ),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      visualDensity: VisualDensity.compact,
                      tooltip: 'Remove',
                    ),
                    const SizedBox(height: 6),
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: ZarwintoColors.border),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          InkWell(
                            onTap: item.quantity > 1
                                ? () => store.updateCartQuantity(
                                      item.variant.id,
                                      item.quantity - 1,
                                    )
                                : null,
                            borderRadius: BorderRadius.circular(8),
                            child: Padding(
                              padding: const EdgeInsets.all(4),
                              child: HugeIcon(
                                icon: HugeIcons.strokeRoundedMinusSignCircle,
                                color: item.quantity > 1
                                    ? ZarwintoColors.primary
                                    : ZarwintoColors.muted,
                                size: 18,
                              ),
                            ),
                          ),
                          SizedBox(
                            width: 28,
                            child: Text(
                              '${item.quantity}',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 15,
                              ),
                            ),
                          ),
                          InkWell(
                            onTap: () => store.updateCartQuantity(
                              item.variant.id,
                              item.quantity + 1,
                            ),
                            borderRadius: BorderRadius.circular(8),
                            child: const Padding(
                              padding: EdgeInsets.all(4),
                              child: HugeIcon(
                                icon: HugeIcons.strokeRoundedAddCircle,
                                color: ZarwintoColors.primary,
                                size: 18,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
