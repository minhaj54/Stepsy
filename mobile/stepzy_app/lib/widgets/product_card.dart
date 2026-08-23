import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../providers/zarwinto_store.dart';
import '../screens/product_detail.dart';
import '../screens/wishlist_screen.dart';
import 'common.dart';

class ProductCard extends StatelessWidget {
  const ProductCard(this.product, {super.key});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final saved = store.wishlist.contains(product.id);
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
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              flex: 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ColoredBox(
                    color: ZarwintoColors.background,
                    child: ZarwintoRemoteImage(
                      url: product.images.isNotEmpty ? product.images.first : '',
                      seed: 'prod_${product.id}',
                    ),
                  ),
                  if (hasDiscount)
                    Positioned(
                      top: 6,
                      left: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: ZarwintoColors.error,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '-$discountPercent%',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  Positioned(
                    top: 6,
                    right: 6,
                    child: GestureDetector(
                      onTap: () => toggleWishlistWithFeedback(
                        context,
                        store,
                        product.id,
                        onGoToWishlist: () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const WishlistScreen(),
                          ),
                        ),
                      ),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 26,
                        height: 26,
                        decoration: BoxDecoration(
                          color: saved ? ZarwintoColors.accent : Colors.white,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: saved ? ZarwintoColors.accent : Colors.grey.shade300,
                            width: 1.2,
                          ),
                        ),
                        child: HugeIcon(
                          icon: saved
                              ? HugeIcons.strokeRoundedHeartAdd
                              : HugeIcons.strokeRoundedHeartRemove,
                          size: 13,
                          color: saved ? Colors.white : Colors.grey.shade600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      product.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        height: 1.25,
                      ),
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            product.brandName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              color: ZarwintoColors.muted,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        if (product.rating > 0) ...[
                          const SizedBox(width: 4),
                          HugeIcon(
                            icon: HugeIcons.strokeRoundedStar,
                            size: 12,
                            color: Colors.amber.shade600,
                          ),
                          const SizedBox(width: 1),
                          Text(
                            product.rating.toStringAsFixed(1),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: ZarwintoColors.foregroundSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                hasDiscount
                                    ? inrFormat.format(product.salePrice)
                                    : inrFormat.format(product.currentPrice),
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                  color: ZarwintoColors.primary,
                                ),
                              ),
                              if (hasDiscount)
                                Text(
                                  inrFormat.format(product.price),
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                    decoration: TextDecoration.lineThrough,
                                    color: ZarwintoColors.muted,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        Container(
                          width: 26,
                          height: 26,
                          decoration: BoxDecoration(
                            color: ZarwintoColors.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: HugeIcon(
                            icon: HugeIcons.strokeRoundedArrowRight01,
                            size: 13,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
