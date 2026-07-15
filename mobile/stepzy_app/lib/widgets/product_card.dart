import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../providers/whishkhu_store.dart';
import '../screens/product_detail.dart';
import 'common.dart';

class ProductCard extends StatelessWidget {
  const ProductCard(this.product, {super.key});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final store = WhishkhuScope.of(context);
    final saved = store.wishlist.contains(product.id);
    final money = NumberFormat.simpleCurrency();

    return InkWell(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ProductDetailPage(product: product)),
      ),
      borderRadius: BorderRadius.circular(18),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: ColoredBox(
                          color: Colors.black26,
                          child: WhishkhuRemoteImage(
                            url: product.images.first,
                            seed: 'prod_${product.id}',
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: IconButton.filledTonal(
                        onPressed: () => store.toggleWishlist(product.id),
                        icon: Icon(
                          saved ? Icons.favorite : Icons.favorite_border,
                        ),
                        color: saved
                            ? WhishkhuColors.accent
                            : WhishkhuColors.foreground,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Text(product.brandName, style: mutedStyle.copyWith(fontSize: 12)),
              const SizedBox(height: 4),
              Text(
                product.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.star, size: 15, color: WhishkhuColors.accent),
                  Text(
                    ' ${product.rating}',
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const Spacer(),
                  Text(
                    money.format(product.currentPrice),
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
