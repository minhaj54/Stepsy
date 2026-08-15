import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../models/product_variant.dart';
import '../providers/zarwinto_store.dart';
import '../services/location_resolver.dart';
import '../widgets/common.dart';
import 'checkout_page.dart';

class ProductDetailPage extends StatefulWidget {
  const ProductDetailPage({super.key, required this.product});

  final Product product;

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage> {
  int selectedImageIndex = 0;
  String? selectedSize;
  String? selectedColor;
  int quantity = 1;
  final _pincodeController = TextEditingController();
  String? _deliveryEstimate;
  bool _checkingPincode = false;

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    if (p.variants.isNotEmpty) {
      selectedSize = p.variants.first.size;
      selectedColor = p.variants.first.color;
    }
  }

  @override
  void dispose() {
    _pincodeController.dispose();
    super.dispose();
  }

  ProductVariant? get _selectedVariant {
    final variants = widget.product.variants;
    if (variants.isEmpty) return null;
    return variants.firstWhere(
      (v) => (selectedSize == null || v.size == selectedSize) &&
             (selectedColor == null || v.color == selectedColor),
      orElse: () => variants.first,
    );
  }

  void _checkPincodeDelivery() async {
    final pin = _pincodeController.text.trim();
    if (pin.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 6-digit PIN code')),
      );
      return;
    }

    setState(() => _checkingPincode = true);
    final loc = await LocationResolver.resolvePincode(pin);
    setState(() => _checkingPincode = false);

    if (loc != null && mounted) {
      setState(() {
        _deliveryEstimate = 'Standard delivery to ${loc.cityName ?? loc.stateName ?? pin} in 3–5 business days.';
      });
    } else if (mounted) {
      setState(() {
        _deliveryEstimate = 'Standard delivery to $pin in 3–5 business days.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final product = widget.product;
    final isFavorite = store.wishlist.contains(product.id);
    final hasDiscount = product.salePrice != null && product.salePrice! < product.price;
    final discountPercent = hasDiscount
        ? (((product.price - product.salePrice!) / product.price) * 100).round()
        : 0;

    final availableSizes = product.variants.map((v) => v.size).toSet().toList();
    final availableColors = product.variants.map((v) => v.color).where((c) => c.isNotEmpty).toSet().toList();

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: Padding(
          padding: const EdgeInsets.only(left: 16.0),
          child: Center(
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: ZarwintoColors.border),
              ),
              child: IconButton(
                padding: EdgeInsets.zero,
                icon: const Icon(Icons.arrow_back, color: Colors.black, size: 20),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: ZarwintoColors.border),
                ),
                child: IconButton(
                  padding: EdgeInsets.zero,
                  icon: Icon(
                    isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: isFavorite ? ZarwintoColors.error : Colors.black,
                    size: 20,
                  ),
                  onPressed: () => store.toggleWishlist(product.id),
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                // 3D Podium & Image Presentation
                SizedBox(
                  height: 250,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Positioned(
                        bottom: 20,
                        child: Container(
                          width: 240,
                          height: 70,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: const BorderRadius.all(Radius.elliptical(240, 70)),
                            border: Border.all(color: ZarwintoColors.border, width: 1.5),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.04),
                                blurRadius: 15,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        top: 0,
                        bottom: 30,
                        child: Hero(
                          tag: 'product_img_${product.id}',
                          child: Image.network(
                            product.images.isNotEmpty
                                ? product.images[selectedImageIndex % product.images.length]
                                : '',
                            width: 260,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) => const Icon(
                              Icons.sports_basketball,
                              size: 140,
                              color: Colors.black12,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Multi-angle Thumbnail Row
                if (product.images.length > 1) ...[
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      product.images.length,
                      (index) {
                        final isSelected = selectedImageIndex == index;
                        return GestureDetector(
                          onTap: () => setState(() => selectedImageIndex = index),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: 54,
                            height: 54,
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected ? ZarwintoColors.primary : ZarwintoColors.border,
                                width: isSelected ? 2 : 1,
                              ),
                            ),
                            child: Image.network(
                              product.images[index],
                              fit: BoxFit.contain,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],

                const SizedBox(height: 20),

                // Brand & Title
                if (product.brandName.isNotEmpty)
                  Text(
                    product.brandName.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: ZarwintoColors.primary,
                      letterSpacing: 1.2,
                    ),
                  ),
                const SizedBox(height: 4),
                Text(
                  product.title,
                  style: ZarwintoTypography.h3.copyWith(fontSize: 22),
                ),
                const SizedBox(height: 10),

                // Price & Quantity
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      inrFormat.format(product.currentPrice),
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: ZarwintoColors.foreground,
                      ),
                    ),
                    if (hasDiscount) ...[
                      const SizedBox(width: 8),
                      Text(
                        inrFormat.format(product.price),
                        style: const TextStyle(
                          fontSize: 16,
                          color: ZarwintoColors.muted,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: ZarwintoColors.discountText.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '$discountPercent% OFF',
                          style: const TextStyle(
                            color: ZarwintoColors.discountText,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                    const Spacer(),
                    // Quantity Stepper
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: ZarwintoColors.border),
                      ),
                      child: Row(
                        children: [
                          GestureDetector(
                            onTap: () {
                              if (quantity > 1) setState(() => quantity--);
                            },
                            child: const Padding(
                              padding: EdgeInsets.all(4.0),
                              child: Icon(Icons.remove, size: 16),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            child: Text(
                              '$quantity',
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                            ),
                          ),
                          GestureDetector(
                            onTap: () => setState(() => quantity++),
                            child: const Padding(
                              padding: EdgeInsets.all(4.0),
                              child: Icon(Icons.add, size: 16),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Size Selector
                if (availableSizes.isNotEmpty) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Select Size (UK/IN)',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                      ),
                      Text(
                        '${availableSizes.length} sizes available',
                        style: const TextStyle(color: ZarwintoColors.muted, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: availableSizes.map((size) {
                      final isSelected = selectedSize == size;
                      return GestureDetector(
                        onTap: () => setState(() => selectedSize = size),
                        child: Container(
                          width: 64,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? ZarwintoColors.foreground : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? ZarwintoColors.foreground : ZarwintoColors.border,
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: Text(
                            size,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: isSelected ? Colors.white : ZarwintoColors.foreground,
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
                ],

                // Color Selector
                if (availableColors.isNotEmpty) ...[
                  const Text(
                    'Available Colors',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: availableColors.map((color) {
                      final isSelected = selectedColor == color;
                      return GestureDetector(
                        onTap: () => setState(() => selectedColor = color),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? ZarwintoColors.primary.withValues(alpha: 0.1) : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? ZarwintoColors.primary : ZarwintoColors.border,
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: Text(
                            color,
                            style: TextStyle(
                              color: isSelected ? ZarwintoColors.primary : ZarwintoColors.foreground,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),
                ],

                // Pincode Delivery Check
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: ZarwintoColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.local_shipping_outlined, size: 20, color: ZarwintoColors.primary),
                          SizedBox(width: 8),
                          Text(
                            'Delivery Options & Pincode Check',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _pincodeController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                hintText: 'Enter 6-digit Pincode',
                                isDense: true,
                                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          ElevatedButton(
                            onPressed: _checkingPincode ? null : _checkPincodeDelivery,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ZarwintoColors.foreground,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: _checkingPincode
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : const Text('Check'),
                          ),
                        ],
                      ),
                      if (_deliveryEstimate != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          _deliveryEstimate!,
                          style: const TextStyle(color: ZarwintoColors.success, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Description
                const Text(
                  'Product Description',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(
                  product.description.isNotEmpty ? product.description : 'Premium quality shoes designed for maximum comfort, durability, and style.',
                  style: const TextStyle(
                    color: ZarwintoColors.foregroundSecondary,
                    fontSize: 14,
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),

          // Bottom Sticky Action Bar
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: ZarwintoColors.border)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Row(
              children: [
                // Add to Cart Button
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: ZarwintoColors.primary, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        final variant = _selectedVariant;
                        if (variant == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('No variant available for this selection')),
                          );
                          return;
                        }
                        store.addToCart(product, variant, quantity: quantity);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${product.title} added to bag!'),
                            action: SnackBarAction(
                              label: 'View Bag',
                              textColor: Colors.white,
                              onPressed: () => store.setActiveTab(2),
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.shopping_bag_outlined, color: ZarwintoColors.primary, size: 20),
                      label: const Text(
                        'Add to Bag',
                        style: TextStyle(fontWeight: FontWeight.w700, color: ZarwintoColors.primary),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Buy Now Button
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: ZarwintoColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        final variant = _selectedVariant;
                        if (variant == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('No variant available for this selection')),
                          );
                          return;
                        }
                        store.addToCart(product, variant, quantity: quantity);
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const CheckoutPage()),
                        );
                      },
                      child: const Text(
                        'Buy Now',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
