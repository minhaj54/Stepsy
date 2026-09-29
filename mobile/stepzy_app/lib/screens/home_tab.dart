import 'package:carousel_slider/carousel_slider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:shimmer/shimmer.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/common.dart';
import '../widgets/product_card.dart';
import 'category_products_screen.dart';
import 'search_screen.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  final ScrollController _scrollController = ScrollController();
  bool _isScrolledNearBottom = false;

  @override
  void initState() {
    super.initState();
    ZarwintoScope.of(context, listen: false).addListener(_onStoreChanged);
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    ZarwintoScope.of(context, listen: false).removeListener(_onStoreChanged);
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent - 300) {
      if (!_isScrolledNearBottom) {
        setState(() => _isScrolledNearBottom = true);
        final store = ZarwintoScope.of(context, listen: false);
        store.loadMoreProducts();
      }
    } else {
      if (_isScrolledNearBottom) {
        setState(() => _isScrolledNearBottom = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context, listen: false);

    return AnimatedBuilder(
      animation: store,
      builder: (context, child) {
        final featured = store.featuredProducts();
        final newArrivals = store.newArrivals();
        final bestSellers = store.bestSellers();
        final allProducts = store.products;

        return SafeArea(
          child: RefreshIndicator(
            color: ZarwintoColors.primary,
            onRefresh: store.refresh,
            child: store.loading && store.products.isEmpty
                ? _HomeShimmer()
                : ListView(
                    controller: _scrollController,
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
                    children: [
                      _HomeHeader(store: store),
                      const SizedBox(height: 20),
                      if (store.banners.isEmpty)
                        _BannerShimmer()
                      else
                        _HomeBannerCarousel(store: store),
                      const SizedBox(height: 24),
                      if (store.categories.isEmpty)
                        _CategoryShimmer()
                      else
                        _CategoryRow(store: store),
                      const SizedBox(height: 28),
                      if (featured.isEmpty && allProducts.isEmpty)
                        _ProductSectionShimmer(title: 'Featured')
                      else if (featured.isNotEmpty)
                        _ProductSection(
                          title: 'Featured',
                          subtitle: 'Editor\'s picks',
                          products: featured,
                          onSeeAll: () => store.setActiveTab(1),
                        ),
                      const SizedBox(height: 28),
                      if (newArrivals.isEmpty && allProducts.isEmpty)
                        _ProductSectionShimmer(title: 'New Arrivals')
                      else if (newArrivals.isNotEmpty)
                        _ProductSection(
                          title: 'New Arrivals',
                          subtitle: 'Fresh drops just landed..',
                          products: newArrivals,
                          onSeeAll: () => store.setActiveTab(1),
                        ),
                      const SizedBox(height: 28),
                      if (bestSellers.isEmpty && allProducts.isEmpty)
                        _ProductSectionShimmer(title: 'Best Sellers', isGrid: true)
                      else if (bestSellers.isNotEmpty)
                        _ProductSection(
                          title: 'Best Sellers',
                          subtitle: 'Most loved by shoppers..',
                          products: bestSellers,
                          isGrid: true,
                          onSeeAll: () => store.setActiveTab(1),
                        ),
                      if (store.loadingMore)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          child: _LoadingMoreShimmer(),
                        ),
                    ],
                  ),
          ),
        );
      },
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader({required this.store});

  final ZarwintoStore store;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _HeaderIconButton(
          icon: const HugeIcon(icon: HugeIcons.strokeRoundedMenu01, color: ZarwintoColors.foreground, size: 20),
          onTap: () {
            Scaffold.of(context).openDrawer();
          },
        ),
        const Spacer(),
        Text(
          'Zarwinto',
          style: ZarwintoTypography.h3.copyWith(fontSize: 22),
        ),
        const Spacer(),
        _HeaderIconButton(
          icon: const HugeIcon(icon: HugeIcons.strokeRoundedSearch01, color: ZarwintoColors.foreground, size: 20),
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const SearchScreen()),
            );
          },
        ),
        const SizedBox(width: 10),
        _HeaderIconButton(
          icon: const HugeIcon(icon: HugeIcons.strokeRoundedNotification01, color: ZarwintoColors.foreground, size: 20),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('No new notifications')),
            );
          },
        ),
      ],
    );
  }
}

class _HeaderIconButton extends StatelessWidget {
  const _HeaderIconButton({required this.icon, required this.onTap});

  final Widget icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: ZarwintoColors.white,
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: ZarwintoColors.border),
          ),
          child: icon,
        ),
      ),
    );
  }
}

class _HomeBannerCarousel extends StatefulWidget {
  const _HomeBannerCarousel({required this.store});

  final ZarwintoStore store;

  @override
  State<_HomeBannerCarousel> createState() => _HomeBannerCarouselState();
}

class _HomeBannerCarouselState extends State<_HomeBannerCarousel> {
  int _current = 0;

  @override
  Widget build(BuildContext context) {
    final banners = widget.store.banners;

    if (banners.isEmpty) {
      return _FallbackHeroBanner(onShop: () => widget.store.setActiveTab(1));
    }

    return Column(
      children: [
        CarouselSlider.builder(
          itemCount: banners.length,
          options: CarouselOptions(
            height: 180,
            viewportFraction: 1,
            autoPlay: banners.length > 1,
            autoPlayInterval: const Duration(seconds: 5),
            enlargeCenterPage: false,
            onPageChanged: (index, reason) {
              setState(() {
                _current = index;
              });
            },
          ),
          itemBuilder: (context, index, _) {
            final banner = banners[index];
            return GestureDetector(
              onTap: () => widget.store.setActiveTab(1),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                clipBehavior: Clip.antiAlias,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: ZarwintoColors.border),
                ),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (banner.imageUrl.isNotEmpty)
                      ZarwintoRemoteImage(url: banner.imageUrl, seed: banner.id)
                    else
                      Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF6366F1), Color(0xFF312E81)],
                          ),
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (banner.title.isNotEmpty)
                            Text(
                              banner.title,
                              style: ZarwintoTypography.h3.copyWith(
                                color: Colors.white,
                                fontSize: 22,
                              ),
                            ),
                          if (banner.subtitle.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(
                              banner.subtitle,
                              style: ZarwintoTypography.caption.copyWith(
                                color: Colors.white70,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            banners.length,
            (index) => AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: _current == index ? 24 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: _current == index ? ZarwintoColors.primary : Colors.grey.shade300,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _FallbackHeroBanner extends StatelessWidget {
  const _FallbackHeroBanner({required this.onShop});

  final VoidCallback onShop;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 180,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF6366F1), Color(0xFF312E81)],
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            bottom: -10,
            child: HugeIcon(icon: HugeIcons.strokeRoundedBasketball01,
              size: 140,
              color: Colors.white.withValues(alpha: 0.12),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Step into something new',
                  style: ZarwintoTypography.h3.copyWith(color: Colors.white),
                ),
                const SizedBox(height: 8),
                Text(
                  'Premium footwear, delivered fast.',
                  style: ZarwintoTypography.caption.copyWith(color: Colors.white70),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryRow extends StatelessWidget {
  const _CategoryRow({required this.store});

  final ZarwintoStore store;

  @override
  Widget build(BuildContext context) {
    final categories = store.categories;
    debugPrint('[CategoryRow] categories count=${categories.length}');
    if (categories.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Category', style: ZarwintoTypography.title),
        const SizedBox(height: 16),
        SizedBox(
          height: 110,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              final category = categories[index];
              return GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => CategoryProductsScreen(
                        categoryName: category.name,
                        categorySlug: category.slug,
                      ),
                    ),
                  );
                },
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: ZarwintoColors.border, width: 2),
                        image: category.image.isNotEmpty
                            ? DecorationImage(
                                image: CachedNetworkImageProvider(category.image),
                                fit: BoxFit.cover,
                              )
                            : null,
                        color: ZarwintoColors.surface,
                      ),
                      child: category.image.isEmpty
                          ? HugeIcon(icon: HugeIcons.strokeRoundedGridView, color: ZarwintoColors.primary.withValues(alpha: 0.7))
                          : null,
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: 72,
                      child: Text(
                        category.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: ZarwintoTypography.small.copyWith(
                          color: ZarwintoColors.foreground,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _ProductSection extends StatelessWidget {
  const _ProductSection({
    required this.title,
    required this.subtitle,
    required this.products,
    required this.onSeeAll,
    this.isGrid = false,
  });

  final String title;
  final String subtitle;
  final List<Product> products;
  final VoidCallback onSeeAll;
  final bool isGrid;

  @override
  Widget build(BuildContext context) {
    final displayProducts = products;
    if (displayProducts.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: ZarwintoTypography.title),
                  const SizedBox(height: 2),
                  Text(subtitle, style: ZarwintoTypography.caption),
                ],
              ),
            ),
            TextButton(onPressed: onSeeAll, child: const Text('See all')),
          ],
        ),
        const SizedBox(height: 12),
        if (isGrid)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: displayProducts.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.75,
              crossAxisSpacing: 14,
              mainAxisSpacing: 14,
            ),
            itemBuilder: (context, index) => ProductCard(displayProducts[index]),
          )
        else
          SizedBox(
            height: 250,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: displayProducts.length,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                return SizedBox(
                  width: 170,
                  child: ProductCard(displayProducts[index]),
                );
              },
            ),
          ),
      ],
    );
  }
}

// Shimmer placeholders

const _shimmerBase = Color(0xFFE8E8E8);
const _shimmerHighlight = Color(0xFFF5F5F5);

class _HomeShimmer extends StatelessWidget {
  const _HomeShimmer();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
      children: const [
        _ShimmerHeader(),
        SizedBox(height: 20),
        _ShimmerBanner(),
        SizedBox(height: 24),
        _ShimmerCategories(),
        SizedBox(height: 28),
        _ShimmerProductSection(title: 'Featured', subtitle: "Editor's picks", isGrid: false),
        SizedBox(height: 28),
        _ShimmerProductSection(title: 'New Arrivals', subtitle: 'Fresh drops just landed..', isGrid: false),
        SizedBox(height: 28),
        _ShimmerProductSection(title: 'Best Sellers', subtitle: 'Most loved by shoppers..', isGrid: true),
      ],
    );
  }
}

class _ShimmerHeader extends StatelessWidget {
  const _ShimmerHeader();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: _shimmerBase,
      highlightColor: _shimmerHighlight,
      child: Row(
        children: [
          _shimmerCircle(44),
          const Spacer(),
          _shimmerRect(width: 80, height: 22),
          const Spacer(),
          Row(
            children: [
              _shimmerCircle(44),
              const SizedBox(width: 10),
              _shimmerCircle(44),
            ],
          ),
        ],
      ),
    );
  }
}

class _ShimmerBanner extends StatelessWidget {
  const _ShimmerBanner();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: _shimmerBase,
      highlightColor: _shimmerHighlight,
      child: Container(
        height: 180,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );
  }
}

class _ShimmerCategories extends StatelessWidget {
  const _ShimmerCategories();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: _shimmerBase,
      highlightColor: _shimmerHighlight,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _shimmerRect(width: 90, height: 18),
          const SizedBox(height: 16),
          SizedBox(
            height: 110,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 5,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                return Column(
                  children: [
                    _shimmerCircle(72),
                    const SizedBox(height: 8),
                    _shimmerRect(width: 72, height: 12),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ShimmerProductSection extends StatelessWidget {
  const _ShimmerProductSection({
    required this.title,
    required this.subtitle,
    required this.isGrid,
  });

  final String title;
  final String subtitle;
  final bool isGrid;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Shimmer.fromColors(
          baseColor: _shimmerBase,
          highlightColor: _shimmerHighlight,
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _shimmerRect(width: 120, height: 20),
                    const SizedBox(height: 4),
                    _shimmerRect(width: 160, height: 14),
                  ],
                ),
              ),
              _shimmerRect(width: 60, height: 20),
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (isGrid)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 6,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.75,
              crossAxisSpacing: 14,
              mainAxisSpacing: 14,
            ),
            itemBuilder: (context, index) {
              return Shimmer.fromColors(
                baseColor: _shimmerBase,
                highlightColor: _shimmerHighlight,
                child: _ProductCardShimmer(),
              );
            },
          )
        else
          SizedBox(
            height: 250,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 4,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                return Shimmer.fromColors(
                  baseColor: _shimmerBase,
                  highlightColor: _shimmerHighlight,
                  child: _ProductCardShimmer(isHorizontal: true),
                );
              },
            ),
          ),
      ],
    );
  }
}

class _ProductCardShimmer extends StatelessWidget {
  const _ProductCardShimmer({this.isHorizontal = false});

  final bool isHorizontal;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: isHorizontal ? 170 : double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _shimmerRect(width: double.infinity, height: 14),
                const SizedBox(height: 6),
                _shimmerRect(width: 80, height: 12),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: _shimmerRect(width: double.infinity, height: 16)),
                    _shimmerCircle(26),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BannerShimmer extends StatelessWidget {
  const _BannerShimmer();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: _shimmerBase,
      highlightColor: _shimmerHighlight,
      child: Container(
        height: 180,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );
  }
}

class _CategoryShimmer extends StatelessWidget {
  const _CategoryShimmer();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: _shimmerBase,
      highlightColor: _shimmerHighlight,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _shimmerRect(width: 90, height: 18),
          const SizedBox(height: 16),
          SizedBox(
            height: 110,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 5,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                return Column(
                  children: [
                    _shimmerCircle(72),
                    const SizedBox(height: 8),
                    _shimmerRect(width: 72, height: 12),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductSectionShimmer extends StatelessWidget {
  const _ProductSectionShimmer({required this.title, this.isGrid = false});

  final String title;
  final bool isGrid;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Shimmer.fromColors(
          baseColor: _shimmerBase,
          highlightColor: _shimmerHighlight,
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _shimmerRect(width: 120, height: 20),
                    const SizedBox(height: 4),
                    _shimmerRect(width: 160, height: 14),
                  ],
                ),
              ),
              _shimmerRect(width: 60, height: 20),
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (isGrid)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 6,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.75,
              crossAxisSpacing: 14,
              mainAxisSpacing: 14,
            ),
            itemBuilder: (context, index) {
              return Shimmer.fromColors(
                baseColor: _shimmerBase,
                highlightColor: _shimmerHighlight,
                child: _ProductCardShimmer(),
              );
            },
          )
        else
          SizedBox(
            height: 250,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 4,
              separatorBuilder: (_, __) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                return Shimmer.fromColors(
                  baseColor: _shimmerBase,
                  highlightColor: _shimmerHighlight,
                  child: _ProductCardShimmer(isHorizontal: true),
                );
              },
            ),
          ),
      ],
    );
  }
}

class _LoadingMoreShimmer extends StatelessWidget {
  const _LoadingMoreShimmer();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: _shimmerBase,
      highlightColor: _shimmerHighlight,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _shimmerProductCard(width: 170, height: 250),
          const SizedBox(width: 14),
          _shimmerProductCard(width: 170, height: 250),
        ],
      ),
    );
  }
}

Widget _shimmerCircle(double size) {
  return Container(
    width: size,
    height: size,
    decoration: const BoxDecoration(
      color: Colors.white,
      shape: BoxShape.circle,
    ),
  );
}

Widget _shimmerRect({required double width, required double height}) {
  return Container(
    width: width,
    height: height,
    decoration: const BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.all(Radius.circular(6)),
    ),
  );
}

Widget _shimmerProductCard({required double width, required double height}) {
  return Container(
    width: width,
    height: height,
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
    ),
  );
}
