import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../providers/zarwinto_store.dart';
import '../screens/wishlist_screen.dart';
import '../widgets/common.dart';

class ProductDisplayBox extends StatelessWidget {
  const ProductDisplayBox({
    super.key,
    required this.product,
    required this.selectedIndex,
  });

  final Product product;
  final int selectedIndex;

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final saved = store.wishlist.contains(product.id);
    final hasDiscount = product.salePrice != null && product.salePrice! < product.price;
    final discountPercent = hasDiscount
        ? ((product.price - product.salePrice!) / product.price * 100).round()
        : 0;
    final selectedImage = product.images.isNotEmpty
        ? product.images[selectedIndex % product.images.length]
        : '';

    return Container(
      decoration: BoxDecoration(
        color: ZarwintoColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ZarwintoColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Stack(
        children: [
          AspectRatio(
            aspectRatio: 0.85,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: ZarwintoRemoteImage(
                url: selectedImage,
                seed: 'prod_${product.id}_$selectedIndex',
              ),
            ),
          ),
          if (hasDiscount)
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: ZarwintoColors.discountText,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: ZarwintoColors.discountText.withValues(alpha: 0.25),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  '-$discountPercent%',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
          Positioned(
            top: 12,
            right: 12,
            child: GestureDetector(
              onTap: () => toggleWishlistWithFeedback(
                context,
                store,
                product.id,
                onGoToWishlist: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const WishlistScreen()),
                ),
              ),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: saved ? ZarwintoColors.error : Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: saved ? ZarwintoColors.error : ZarwintoColors.border,
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: HugeIcon(
                  icon: saved
                      ? HugeIcons.strokeRoundedHeartAdd
                      : HugeIcons.strokeRoundedHeartRemove,
                  size: 16,
                  color: saved ? Colors.white : ZarwintoColors.muted,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
