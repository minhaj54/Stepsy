import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/theme.dart';
import '../models/cart_item.dart';
import '../providers/whishkhu_store.dart';
import 'common.dart';

class CartRow extends StatelessWidget {
  const CartRow(this.item, {super.key});

  final CartItem item;

  @override
  Widget build(BuildContext context) {
    final store = WhishkhuScope.of(context);
    final money = NumberFormat.simpleCurrency();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                width: 76,
                height: 76,
                child: WhishkhuRemoteImage(
                  url: item.product.images.isNotEmpty ? item.product.images.first : '',
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
                  ),
                  Text(
                    '${item.variant.size} / ${item.variant.color}',
                    style: mutedStyle,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    money.format(item.lineTotal),
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ],
              ),
            ),
            Column(
              children: [
                IconButton(
                  onPressed: () => store.updateCartQuantity(
                    item.variant.id,
                    item.quantity + 1,
                  ),
                  icon: const Icon(Icons.add_circle_outline),
                ),
                Text(
                  '${item.quantity}',
                  style: const TextStyle(fontWeight: FontWeight.w900),
                ),
                IconButton(
                  onPressed: () => store.updateCartQuantity(
                    item.variant.id,
                    item.quantity - 1,
                  ),
                  icon: const Icon(Icons.remove_circle_outline),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
