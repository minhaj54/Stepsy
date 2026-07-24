import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../providers/zarwinto_store.dart';
import '../screens/product_detail.dart';
import 'common.dart';

class ProductCard extends StatelessWidget {
  const ProductCard(this.product, {super.key});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final saved = store.wishlist.contains(product.id);
    final money = NumberFormat.simpleCurrency();
    final hasDiscount = product.salePrice != null && product.salePrice! < product.price;
    final discountPercent = hasDiscount 
        ? ((product.price - product.salePrice!) / product.price * 100).round() 
        : 0;

    return InkWell(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ProductDetailPage(product: product)),
      ),
      borderRadius: BorderRadius.circular(16),
      child: Card(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with badges
            Expanded(
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                      child: ColoredBox(
                        color: ZarwintoColors.background,
                        child: ZarwintoRemoteImage(
                          url: product.images.isNotEmpty ? product.images.first : '',
                          seed: 'prod_${product.id}',
                        ),
                      ),
                    ),
                  ),
                  // Sale badge
                  if (hasDiscount)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: ZarwintoColors.error,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '-$discountPercent%',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  // Wishlist button
                  Positioned(
                    top: 8,
                    right: 8,
                    child: IconButton.filledTonal(
                      onPressed: () => store.toggleWishlist(product.id),
                      icon: Icon(
                        saved ? Icons.favorite : Icons.favorite_border,
                        size: 18,
                      ),
                      color: saved
                          ? ZarwintoColors.accent
                          : ZarwintoColors.foreground,
                      iconSize: 18,
                    ),
                  ),
                ],
              ),
            ),
            // Product info
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.brandName,
                    style: mutedStyle.copyWith(fontSize: 11, fontWeight: FontWeight.w500),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.star, size: 14, color: ZarwintoColors.accent),
                      const SizedBox(width: 4),
                      Text(
                        '${product.rating}',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                      ),
                      const Spacer(),
                      if (hasDiscount) ...[
                        Text(
                          money.format(product.price),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            decoration: TextDecoration.lineThrough,
                            color: ZarwintoColors.muted,
                          ),
                        ),
                        const SizedBox(width: 6),
                      ],
                      Text(
                        money.format(product.currentPrice),
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                          color: ZarwintoColors.primary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
