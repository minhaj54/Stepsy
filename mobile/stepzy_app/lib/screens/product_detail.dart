import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:hugeicons/hugeicons.dart';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart' as path_provider;
import '../core/theme.dart';
import '../models/product.dart';
import '../models/product_variant.dart';
import '../models/review.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/common.dart';
import '../widgets/product_card.dart';
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
  bool _specExpanded = false;
  bool _descExpanded = false;
  int _selectedInfoTab = 0;
  final TransformationController _zoomController = TransformationController();

  @override
  void initState() {
    super.initState();
    final store = ZarwintoScope.of(context, listen: false);
    store.addToRecentlyViewed(widget.product.id);
    store.loadProductReviews(widget.product.id);

    final p = widget.product;
    if (p.variants.isNotEmpty) {
      selectedSize = p.variants.first.size;
      selectedColor = p.variants.first.color;
    }
  }

  @override
  void dispose() {
    _zoomController.dispose();
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

  int get _selectedVariantStock => _selectedVariant?.stockQuantity ?? 0;

  double get _originalMrp => widget.product.price;
  double get _sellingPrice => widget.product.currentPrice;
  double get _discountPercent =>
      _originalMrp <= 0 ? 0 : ((_originalMrp - _sellingPrice) / _originalMrp) * 100;
  double get _youSave => _originalMrp - _sellingPrice;

  Map<int, int> _buildRatingDistribution(List<Review> reviews) {
    final Map<int, int> dist = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    for (final r in reviews) {
      final star = r.rating.clamp(1, 5);
      dist[star] = (dist[star] ?? 0) + 1;
    }
    return dist;
  }

  bool _sharing = false;

  void _shareProduct() async {
    if (_sharing) return;
    final product = widget.product;
    final shareText =
        'Check out ${product.title} by ${product.brandName} at ${inrFormat.format(_sellingPrice)} (${_discountPercent.toStringAsFixed(0)}% OFF) on Zarwinto!\n\nGrab it now on the Zarwinto app.';
    final subject = '${product.title} by ${product.brandName}';

    setState(() => _sharing = true);
    try {
      final images = product.images;
      if (images.isNotEmpty) {
        final url = images[selectedImageIndex % images.length];
        final response = await http.get(Uri.parse(url));
        if (response.statusCode == 200 && response.bodyBytes.isNotEmpty) {
          final dir = await path_provider.getTemporaryDirectory();
          final file = File('${dir.path}/zarwinto_${product.id}.jpg');
          await file.writeAsBytes(response.bodyBytes);
          await Share.shareXFiles(
            [XFile(file.path, mimeType: 'image/jpeg')],
            text: shareText,
            subject: subject,
          );
          return;
        }
      }
    } catch (e) {
      debugPrint('[ProductDetail] share with image failed: $e');
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
    await Share.share(shareText, subject: subject);
  }

  void _onAddToBag() {
    final store = ZarwintoScope.of(context);
    final variant = _selectedVariant;
    if (variant == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No variant available for this selection')),
      );
      return;
    }
    if (_selectedVariantStock <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Out of stock')));
      return;
    }
    store.addToCart(widget.product, variant, quantity: quantity);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${widget.product.title} added to bag!'),
        action: SnackBarAction(
          label: 'VIEW BAG',
          textColor: Colors.white,
          onPressed: () => store.setActiveTab(2),
        ),
      ),
    );
  }

  void _onBuyNow() {
    final store = ZarwintoScope.of(context);
    final variant = _selectedVariant;
    if (variant == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No variant available for this selection')),
      );
      return;
    }
    if (_selectedVariantStock <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Out of stock')));
      return;
    }
    store.addToCart(widget.product, variant, quantity: quantity);
    Navigator.push(context, MaterialPageRoute(builder: (_) => const CheckoutPage()));
  }

  void _showWriteReviewSheet() {
    final store = ZarwintoScope.of(context, listen: false);

    // Reviews require a signed-in account. If the user isn't logged in,
    // show a prompt that takes them to the Account tab to sign in.
    if (store.profile == null) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (ctx) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: ZarwintoColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: ZarwintoColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: HugeIcon(
                  icon: HugeIcons.strokeRoundedUser02,
                  size: 32,
                  color: ZarwintoColors.primary,
                ),
              ),
              const SizedBox(height: 16),
              const Text('Sign in to review',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              const Text(
                'You need an account to share your rating and review.',
                textAlign: TextAlign.center,
                style: TextStyle(color: ZarwintoColors.muted, fontSize: 14),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    store.setActiveTab(3);
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: ZarwintoColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Sign In / Sign Up',
                      style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                ),
              ),
            ],
          ),
        ),
      );
      return;
    }

    final ratingCtrl = ValueNotifier<int>(5);
    final reviewCtrl = TextEditingController();
    final isSubmitting = ValueNotifier<bool>(false);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: ZarwintoColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Write a Review',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text('Share your experience with ${widget.product.title}',
                  style: const TextStyle(color: ZarwintoColors.muted, fontSize: 13)),
              const SizedBox(height: 14),
              Center(
                child: ValueListenableBuilder(
                  valueListenable: ratingCtrl,
                  builder: (ctx, rating, child) => Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      final active = index < rating;
                      return GestureDetector(
                        onTap: () => ratingCtrl.value = index + 1,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: Icon(
                            active ? Icons.star_rounded : Icons.star_outline_rounded,
                            color: active ? ZarwintoColors.accent : ZarwintoColors.muted,
                            size: 38,
                          ),
                        ),
                      );
                    }),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              ValueListenableBuilder(
                valueListenable: ratingCtrl,
                builder: (ctx, rating, _) => Center(
                  child: Text(
                    ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating],
                    style: const TextStyle(
                      color: ZarwintoColors.foreground,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: reviewCtrl,
                maxLines: 4,
                minLines: 3,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  hintText: 'Tell others what you think about this product...',
                  filled: true,
                  fillColor: ZarwintoColors.background,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.all(14),
                ),
              ),
              const SizedBox(height: 16),
              ValueListenableBuilder(
                valueListenable: isSubmitting,
                builder: (ctx, submitting, _) => SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: FilledButton(
                    onPressed: submitting
                        ? null
                        : () async {
                            final text = reviewCtrl.text.trim();
                            if (text.isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Please write your review first')),
                              );
                              return;
                            }
                            isSubmitting.value = true;
                            try {
                              await store.addReview(
                                widget.product.id,
                                ratingCtrl.value,
                                text,
                              );
                              if (mounted) {
                                await store.loadProductReviews(widget.product.id);
                                setState(() {});
                                Navigator.pop(ctx);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Thanks! Your review was posted.'),
                                    backgroundColor: ZarwintoColors.success,
                                  ),
                                );
                              }
                            } catch (e) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Could not submit review: $e')),
                                );
                              }
                            } finally {
                              isSubmitting.value = false;
                            }
                          },
                    style: FilledButton.styleFrom(
                      backgroundColor: ZarwintoColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: submitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Submit Review',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openImageViewer() {
    final images = widget.product.images;
    if (images.isEmpty) return;
    final controller = PageController(initialPage: selectedImageIndex);
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        barrierColor: Colors.black,
        pageBuilder: (ctx, anim, secAnim) => Scaffold(
          backgroundColor: Colors.transparent,
          body: Stack(
            children: [
              PageView.builder(
                controller: controller,
                itemCount: images.length,
                itemBuilder: (ctx, i) => InteractiveViewer(
                  minScale: 1,
                  maxScale: 4,
                  child: Center(
                    child: Image.network(
                      images[i],
                      fit: BoxFit.contain,
                      loadingBuilder: (context, child, progress) {
                        if (progress == null) return child;
                        return const Center(
                          child: SizedBox(
                            width: 32,
                            height: 32,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) => const Icon(
                        Icons.image_not_supported_outlined,
                        size: 80,
                        color: Colors.white54,
                      ),
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 40,
                left: 16,
                child: IconButton(
                  onPressed: () => Navigator.pop(ctx),
                  icon: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.4),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, color: Colors.white, size: 24),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImageGallery() {
    final images = widget.product.images;
    final hasMultiple = images.length > 1;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: ZarwintoColors.border, width: 1),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: AspectRatio(
                aspectRatio: 1.0,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    GestureDetector(
                      onTap: _openImageViewer,
                      child: InteractiveViewer(
                        transformationController: _zoomController,
                        minScale: 1,
                        maxScale: 4,
                        child: Hero(
                        tag: 'product_img_${widget.product.id}',
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(18),
                            child: Image.network(
                              images.isNotEmpty ? images[selectedImageIndex % images.length] : '',
                              fit: BoxFit.cover,
                              width: double.infinity,
                              height: double.infinity,
                            loadingBuilder: (context, child, progress) {
                              if (progress == null) return child;
                              return const Center(
                                child: SizedBox(
                                  width: 32,
                                  height: 32,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) => const Icon(
                              Icons.image_not_supported_outlined,
                              size: 80,
                              color: ZarwintoColors.muted,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                    ),
                ],
              ),
            ),
          ),
        ),
        ),
        if (hasMultiple)
          SizedBox(
            width: double.infinity,
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: WrapAlignment.center,
                  children: List.generate(images.length, (index) {
                    final isSelected = selectedImageIndex == index;
                    return GestureDetector(
                      onTap: () => setState(() => selectedImageIndex = index),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isSelected ? ZarwintoColors.primary : ZarwintoColors.border,
                            width: isSelected ? 2 : 1,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            images[index],
                            fit: BoxFit.cover,
                            errorBuilder: (ctx, err, stk) => Container(
                              color: ZarwintoColors.background,
                              child: const Icon(Icons.image, size: 24, color: ZarwintoColors.muted),
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildPriceBlock() {
    final hasDiscount = _originalMrp > _sellingPrice;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  inrFormat.format(_sellingPrice),
                  style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: ZarwintoColors.foreground),
                ),
                const SizedBox(width: 10),
                if (hasDiscount)
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              inrFormat.format(_originalMrp),
                              style: const TextStyle(
                                fontSize: 14,
                                color: ZarwintoColors.muted,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: ZarwintoColors.discountText.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                '${_discountPercent.toStringAsFixed(0)}% OFF',
                                style: const TextStyle(
                                  color: ZarwintoColors.discountText,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'You save ${inrFormat.format(_youSave)}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: ZarwintoColors.success,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          _buildQuantityStepper(),
        ],
      ),
    );
  }

  Widget _buildTitleBlock() {
    final product = widget.product;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
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
          Text(product.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, height: 1.3)),
        ],
      ),
    );
  }

  /// India follows UK shoe sizing. The stored variant `size` is treated as the
  /// EU size; we surface the UK equivalent to customers.
  String _ukLabel(String size) {
    final eu = int.tryParse(size);
    if (eu == null) return size;
    final uk = eu - 33;
    return uk > 0 ? '$uk' : size;
  }

  List<Map<String, String>> _sizeGuideRows() {
    const ukStart = 3;
    const ukEnd = 13;
    return List.generate(ukEnd - ukStart + 1, (i) {
      final uk = ukStart + i;
      final eu = uk + 33;
      final us = uk + 1;
      final cm = eu * 0.667 - 1.5;
      return {
        'uk': '$uk',
        'eu': '$eu',
        'us': '$us',
        'cm': cm.toStringAsFixed(1),
      };
    });
  }

  void _showSizeGuide() {
    final rows = _sizeGuideRows();

    Widget cell(String text, {bool header = false, bool highlight = false}) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        alignment: Alignment.center,
        child: Text(
          text,
          style: TextStyle(
            fontWeight: header ? FontWeight.w800 : (highlight ? FontWeight.w700 : FontWeight.w400),
            fontSize: 13,
            color: highlight && !header
                ? ZarwintoColors.primary
                : (header ? ZarwintoColors.foreground : ZarwintoColors.foregroundSecondary),
          ),
        ),
      );
    }

    Widget step(String index, String text) {
      return Expanded(
        child: Column(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: const BoxDecoration(
                color: ZarwintoColors.primary,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(index,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
              ),
            ),
            const SizedBox(height: 8),
            Text(text,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 11, color: ZarwintoColors.muted, height: 1.3)),
          ],
        ),
      );
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.86,
        minChildSize: 0.5,
        maxChildSize: 0.96,
        builder: (ctx2, scrollCtrl) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: ListView(
            controller: scrollCtrl,
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: ZarwintoColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: ZarwintoColors.primary.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(Icons.straighten, color: ZarwintoColors.primary, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Size Guide', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                        SizedBox(height: 2),
                        Text('India follows UK sizing',
                            style: TextStyle(fontSize: 13, color: ZarwintoColors.muted)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text('Conversion Chart',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: ZarwintoColors.border),
                  borderRadius: BorderRadius.circular(14),
                ),
                clipBehavior: Clip.antiAlias,
                child: Table(
                  border: TableBorder.symmetric(
                    inside: BorderSide(color: ZarwintoColors.border),
                  ),
                  children: [
                    TableRow(
                      decoration: BoxDecoration(color: ZarwintoColors.background),
                      children: [
                        cell('UK', header: true, highlight: true),
                        cell('EU', header: true),
                        cell('US', header: true),
                        cell('CM', header: true),
                      ],
                    ),
                    ...rows.map((row) => TableRow(
                      children: [
                        cell(row['uk']!, highlight: true),
                        cell(row['eu']!),
                        cell(row['us']!),
                        cell(row['cm']!),
                      ],
                    )),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              const Text('How to measure your foot',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              Row(
                children: [
                  step('1', 'Place foot on paper against a wall'),
                  step('2', 'Mark heel & longest toe'),
                  step('3', 'Measure length in cm'),
                ],
              ),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: ZarwintoColors.info.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, size: 18, color: ZarwintoColors.info),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'If you are between two sizes, we recommend going a size up for the best fit.',
                        style: TextStyle(fontSize: 12.5, color: ZarwintoColors.info),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton.icon(
                  onPressed: () => Navigator.pop(ctx),
                  icon: const Icon(Icons.check_circle_outline),
                  label: const Text('Got it'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSizeSelector() {
    final availableSizes = widget.product.variants.map((v) => v.size).toSet().toList();
    if (availableSizes.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('Select Size',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: ZarwintoColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('UK',
                        style: TextStyle(
                            color: ZarwintoColors.primary,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5)),
                  ),
                ],
              ),
              TextButton.icon(
                onPressed: _showSizeGuide,
                icon: const Icon(Icons.straighten, size: 16, color: ZarwintoColors.primary),
                label: const Text('Size Guide',
                    style: TextStyle(color: ZarwintoColors.primary, fontWeight: FontWeight.w600, fontSize: 12)),
                style: TextButton.styleFrom(
                  visualDensity: VisualDensity.compact,
                  padding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: availableSizes.map((size) {
              final isSelected = selectedSize == size;
              final variantStock = widget.product.variants
                  .firstWhere((v) => v.size == size, orElse: () => widget.product.variants.first)
                  .stockQuantity;
              final isOutOfStock = variantStock <= 0;
              return GestureDetector(
                onTap: isOutOfStock ? null : () => setState(() => selectedSize = size),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  width: 58,
                  height: 50,
                  decoration: BoxDecoration(
                    color: isOutOfStock
                        ? ZarwintoColors.background
                        : isSelected ? ZarwintoColors.foreground : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isOutOfStock
                          ? ZarwintoColors.border
                          : isSelected ? ZarwintoColors.foreground : ZarwintoColors.border,
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _ukLabel(size),
                        style: TextStyle(
                          color: isOutOfStock
                              ? ZarwintoColors.muted
                              : isSelected ? Colors.white : ZarwintoColors.foreground,
                          fontWeight: FontWeight.w800,
                          fontSize: 15,
                          decoration: isOutOfStock ? TextDecoration.lineThrough : null,
                        ),
                      ),
                      Text(
                        'UK',
                        style: TextStyle(
                          color: isOutOfStock
                              ? ZarwintoColors.muted
                              : isSelected ? Colors.white.withValues(alpha: 0.8) : ZarwintoColors.muted,
                          fontSize: 9,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  static const Map<String, String> _colorHex = {
    'Red': '#E53935',
    'Black': '#1C1C1E',
    'White': '#F2F2F2',
    'Blue': '#1E88E5',
    'Navy': '#1A237E',
    'Green': '#43A047',
    'Neon Green': '#76FF03',
    'Teal/Green': '#00897B',
    'Orange': '#FB8C00',
    'Yellow': '#FDD835',
    'White/Grey': '#ECEFF1',
    'Tan': '#D2B48C',
    'Brown': '#795548',
    'Grey': '#9E9E9E',
    'Gray': '#9E9E9E',
    'Pink': '#EC407A',
    'Purple': '#8E24AA',
    'Gold': '#FFD54F',
    'Silver': '#C0C0C0',
    'Rose Gold': '#B76E79',
    'Beige': '#D6C3A3',
    'Maroon': '#800000',
  };

  Color _colorValue(String name) {
    final store = ZarwintoScope.of(context, listen: false);
    final hex = store.colors[name.trim()] ?? _colorHex[name.trim()];
    if (hex != null) return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    final h = name.trim().hashCode;
    return Color(0xFF000000 | (h & 0x00FFFFFF));
  }

  Widget _colorDot(String name, double size) {
    final parts = name.split(RegExp(r'\s*/\s*'));
    final child = parts.length == 2
        ? Row(
            children: [
              Expanded(child: Container(color: _colorValue(parts[0]))),
              Expanded(child: Container(color: _colorValue(parts[1]))),
            ],
          )
        : Container(color: _colorValue(name));
    return ClipOval(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black.withValues(alpha: 0.15)),
        ),
        child: child,
      ),
    );
  }

  Widget _buildColorSelector() {
    // Prefer the product-level colorways uploaded from the admin panel.
    // Fall back to variant colors if a product has none defined.
    final rawColors = widget.product.colors.isNotEmpty
        ? widget.product.colors
        : widget.product.variants.map((v) => v.color).where((c) => c.isNotEmpty).toList();
    // Treat empty values and the literal "Default" as having no real colourway.
    final availableColors = rawColors
        .where((c) => c.trim().isNotEmpty && c.trim().toLowerCase() != 'default')
        .toSet()
        .toList();

    // No real colour options → just display "Default".
    if (availableColors.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Text('Color', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
            Text('Default',
                style: TextStyle(fontSize: 13, color: ZarwintoColors.muted, fontWeight: FontWeight.w600)),
          ],
        ),
      );
    }
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Select Color', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
              if (selectedColor != null)
                Text(selectedColor!,
                    style: const TextStyle(fontSize: 13, color: ZarwintoColors.muted, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: availableColors.map((color) {
              final isSelected = selectedColor == color;
              final lower = color.trim().toLowerCase();
              final hasVariant = widget.product.variants
                  .any((v) => v.color.trim().toLowerCase() == lower);
              // Only treat as out of stock when a matching variant exists
              // and all of its stock is zero. Colors without a matching
              // variant are considered available (admin colorways).
              final stock = widget.product.variants
                  .where((v) => v.color.trim().toLowerCase() == lower)
                  .fold(0, (sum, v) => sum + v.stockQuantity);
              final isOutOfStock = hasVariant && stock <= 0;
              return GestureDetector(
                onTap: isOutOfStock ? null : () => setState(() => selectedColor = color),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? ZarwintoColors.primary
                        : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? ZarwintoColors.primary : ZarwintoColors.border,
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: ZarwintoColors.primary.withValues(alpha: 0.25),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _colorDot(color, 18),
                      const SizedBox(width: 8),
                      Text(
                        color,
                        style: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : ZarwintoColors.foreground,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          decoration: isOutOfStock ? TextDecoration.lineThrough : null,
                        ),
                      ),
                      if (isSelected) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.check_circle_rounded,
                            color: Colors.white, size: 14),
                      ],
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildQuantityStepper() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ZarwintoColors.border),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: quantity > 1 ? () => setState(() => quantity--) : null,
            icon: const Icon(Icons.remove, size: 18),
            visualDensity: VisualDensity.compact,
          ),
          Container(
            width: 36,
            alignment: Alignment.center,
            child: Text('$quantity', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
          ),
          IconButton(
            onPressed: quantity < _selectedVariantStock ? () => setState(() => quantity++) : null,
            icon: const Icon(Icons.add, size: 18),
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }

  Widget _buildSpecifications() {
    final specs = widget.product.specifications;
    if (specs.isEmpty) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZarwintoColors.border),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            title: const Text('Product Details', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
          trailing: Icon(
            _specExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
            color: ZarwintoColors.muted,
          ),
          onExpansionChanged: (expanded) => setState(() => _specExpanded = expanded),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: specs.entries.map((entry) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 120,
                          child: Text(entry.key,
                              style: const TextStyle(fontSize: 13, color: ZarwintoColors.muted, fontWeight: FontWeight.w500)),
                        ),
                        Expanded(
                          child: Text(entry.value,
                              style: const TextStyle(fontSize: 13, color: ZarwintoColors.foreground, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
      ),
    );
  }

  Widget _buildInfoTabs() {
    final desc = widget.product.description;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZarwintoColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.all(8),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: ZarwintoColors.background,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                _infoTabButton('Description', 0),
                _infoTabButton('Delivery', 1),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
            child: _selectedInfoTab == 0
                ? _buildDescriptionContent(desc)
                : _buildDeliveryContent(),
          ),
        ],
      ),
    );
  }

  Widget _infoTabButton(String label, int index) {
    final selected = _selectedInfoTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedInfoTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: selected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: selected ? ZarwintoColors.foreground : ZarwintoColors.muted,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDescriptionContent(String desc) {
    if (desc.isEmpty) {
      return const Text(
        'No description available for this product.',
        style: TextStyle(fontSize: 14, color: ZarwintoColors.muted, height: 1.5),
      );
    }
    final isLong = desc.length > 140;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          desc,
          maxLines: _descExpanded ? null : 3,
          overflow: _descExpanded ? null : TextOverflow.ellipsis,
          style: const TextStyle(
            fontSize: 14,
            color: ZarwintoColors.foregroundSecondary,
            height: 1.6,
          ),
        ),
        if (isLong)
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () => setState(() => _descExpanded = !_descExpanded),
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _descExpanded ? 'Read less' : 'Read more',
                    style: const TextStyle(
                      color: ZarwintoColors.primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                  Icon(
                    _descExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    size: 16,
                    color: ZarwintoColors.primary,
                  ),
                ],
              ),
            ),
          ),
        if (widget.product.specifications.isNotEmpty) ...[
          const SizedBox(height: 16),
          const Text('Key Highlights',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          ...widget.product.specifications.entries.map((e) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.check_circle, size: 16, color: ZarwintoColors.success),
                  const SizedBox(width: 8),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(
                          fontSize: 13,
                          color: ZarwintoColors.foreground,
                          height: 1.4,
                        ),
                        children: [
                          TextSpan(text: '${e.key}: ', style: const TextStyle(fontWeight: FontWeight.w700)),
                          TextSpan(text: e.value),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ],
    );
  }

  Widget _buildDeliveryContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ZarwintoColors.success.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: ZarwintoColors.success.withValues(alpha: 0.2)),
          ),
          child: const Row(
            children: [
              Icon(Icons.local_shipping_outlined, color: ZarwintoColors.success, size: 20),
              SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Free Delivery',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                    SizedBox(height: 2),
                    Text('Free standard delivery. No minimum purchase required.',
                        style: TextStyle(fontSize: 12, color: ZarwintoColors.muted, height: 1.3)),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _deliveryRow(Icons.schedule_outlined, 'Estimated Delivery',
            'Usually delivered within 4–7 business days depending on your location.'),
        const SizedBox(height: 14),
        _deliveryRow(Icons.swap_horiz_outlined, 'Easy Returns',
            '10 days return & exchange applicable on this product.'),
        const SizedBox(height: 14),
        _deliveryRow(Icons.lock_outline, 'Secure Packaging',
            'Shoes are carefully packed to arrive in perfect condition.'),
      ],
    );
  }

  Widget _deliveryRow(IconData icon, String title, String body) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: ZarwintoColors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 18, color: ZarwintoColors.primary),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: ZarwintoColors.foreground)),
              const SizedBox(height: 2),
              Text(body,
                  style: const TextStyle(fontSize: 13, color: ZarwintoColors.muted, height: 1.4)),
            ],
          ),
        ),
      ],
    );
  }


  Widget _buildRatingsReviewsSection() {
    final store = ZarwintoScope.of(context, listen: false);
    final reviews = store.currentProductReviews;
    final product = widget.product;
    final totalReviews = reviews.isNotEmpty ? reviews.length : product.reviewsCount;
    final avgRating = product.rating;
    final distribution = _buildRatingDistribution(reviews);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
              const Text('Ratings & Reviews', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
              const Spacer(),
              TextButton.icon(
                onPressed: _showWriteReviewSheet,
                icon: const Icon(Icons.edit, size: 16, color: ZarwintoColors.primary),
                label: const Text('Write Review',
                    style: TextStyle(color: ZarwintoColors.primary, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Column(
                children: [
                  Text(avgRating.toStringAsFixed(1),
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900)),
                  Row(
                    children: List.generate(5, (i) {
                      return Icon(Icons.star_rounded, size: 16,
                          color: i < avgRating.round() ? ZarwintoColors.accent : ZarwintoColors.border);
                    }),
                  ),
                  Text('$totalReviews Reviews',
                      style: const TextStyle(fontSize: 12, color: ZarwintoColors.muted)),
                ],
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  children: [5, 4, 3, 2, 1].map((star) {
                    final count = distribution[star] ?? 0;
                    final pct = totalReviews > 0 ? count / totalReviews : 0.0;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          Text('$star', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Stack(
                              children: [
                                Container(
                                  height: 6,
                                  decoration: BoxDecoration(
                                    color: ZarwintoColors.background,
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                ),
                                FractionallySizedBox(
                                  widthFactor: pct,
                                  alignment: Alignment.centerLeft,
                                  child: Container(
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: ZarwintoColors.accent,
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),
                          SizedBox(
                            width: 24,
                            child: Text('$count',
                                style: const TextStyle(fontSize: 11, color: ZarwintoColors.muted),
                                textAlign: TextAlign.end),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReviewsList() {
    final store = ZarwintoScope.of(context, listen: false);
    final reviews = store.currentProductReviews;
    final isLoading = store.loadingReviews;
    if (isLoading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 20),
        child: Center(child: SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))),
      );
    }
    if (reviews.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Center(
          child: Text('No reviews yet. Be the first to review!',
              style: TextStyle(color: ZarwintoColors.muted, fontSize: 14)),
        ),
      );
    }
    return Column(
      children: reviews.map((review) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: ZarwintoColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: ZarwintoColors.primary.withValues(alpha: 0.1),
                    child: Text(
                      (review.userName ?? 'U').substring(0, 1).toUpperCase(),
                      style: const TextStyle(color: ZarwintoColors.primary, fontWeight: FontWeight.w700, fontSize: 12),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(review.userName ?? 'User',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                        Row(
                          children: [
                            ...List.generate(5, (i) {
                              return Icon(Icons.star_rounded, size: 12,
                                  color: i < review.rating ? ZarwintoColors.accent : ZarwintoColors.border);
                            }),
                            const SizedBox(width: 6),
                            Text(review.formattedDate,
                                style: const TextStyle(fontSize: 11, color: ZarwintoColors.muted)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              if (review.reviewText.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(review.reviewText,
                    style: const TextStyle(fontSize: 13, color: ZarwintoColors.foregroundSecondary, height: 1.4)),
              ],
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildYouMayAlsoLike() {
    final store = ZarwintoScope.of(context);
    final current = widget.product;
    final related = store.products
        .where((p) => p.id != current.id)
        .where((p) =>
            p.categorySlug == current.categorySlug || p.brandId == current.brandId)
        .toList();
    final fallback = (related.isNotEmpty
            ? related
            : store.products.where((p) => p.id != current.id).toList())
        .take(5)
        .toList();
    if (fallback.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 6),
          child: const Text('You may also like',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
        ),
        SizedBox(
          height: 290,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: fallback.length,
            itemBuilder: (ctx, index) {
              return Container(
                width: 162,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                child: ProductCard(fallback[index]),
              );
            },
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final product = widget.product;
    final isFavorite = store.wishlist.contains(product.id);
    final isInStock = _selectedVariantStock > 0;
    final showLowStock = isInStock && _selectedVariantStock <= 5;

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: Container(
          margin: const EdgeInsets.only(left: 12),
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
        title: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: ZarwintoColors.border),
          ),
          child: const Text('Details',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: ZarwintoColors.foreground)),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: ZarwintoColors.border),
            ),
            child: IconButton(
              padding: EdgeInsets.zero,
              icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: isFavorite ? ZarwintoColors.error : Colors.black, size: 20),
              onPressed: () => store.toggleWishlist(product.id),
            ),
          ),
          Container(
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: ZarwintoColors.border),
            ),
            child: IconButton(
              padding: EdgeInsets.zero,
              onPressed: _sharing ? null : _shareProduct,
              icon: _sharing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.share_outlined, color: Colors.black, size: 20),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.only(bottom: 16),
              children: [
                _buildImageGallery(),
                const SizedBox(height: 4),
                Container(
                  decoration: BoxDecoration(
                    color: ZarwintoColors.background,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildTitleBlock(),
                      const SizedBox(height: 8),
                      _buildPriceBlock(),
                      if (product.variants.isNotEmpty) ...[
                        _buildSizeSelector(),
                        _buildColorSelector(),
                      ],
                      if (showLowStock)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: ZarwintoColors.warning.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.warning_amber_rounded, color: ZarwintoColors.warning, size: 16),
                                const SizedBox(width: 8),
                                Text('Only $_selectedVariantStock left in stock!',
                                    style: const TextStyle(color: ZarwintoColors.warning, fontSize: 12, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ),
                      const SizedBox(height: 8),
                      _buildSpecifications(),
                      _buildInfoTabs(),
                      _buildYouMayAlsoLike(),
                      _buildRatingsReviewsSection(),
                      _buildReviewsList(),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: ZarwintoColors.border)),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4)),
              ],
            ),
              child: Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 52,
                      child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: ZarwintoColors.primary, width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: isInStock ? _onAddToBag : null,
                      icon: const Icon(Icons.shopping_bag_outlined, color: ZarwintoColors.primary, size: 20),
                      label: Text(
                        isInStock ? 'Add to Bag' : 'Out of Stock',
                        style: const TextStyle(fontWeight: FontWeight.w700, color: ZarwintoColors.primary),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: ZarwintoColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: isInStock ? _onBuyNow : null,
                      child: const Text('Buy Now',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
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
