import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/benefit_strip.dart';
import '../widgets/common.dart';
import '../widgets/product_card.dart';
import 'search_screen.dart';
import 'wishlist_screen.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: ZarwintoColors.primary,
          onRefresh: store.refresh,
          child: store.loading && store.products.isEmpty
              ? _HomeShimmer()
              : ListView(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
                  children: [
                    _HomeHeader(store: store),
                    const SizedBox(height: 20),
                    _HomeBannerCarousel(store: store),
                    const SizedBox(height: 20),
                    const BenefitStrip(),
                    const SizedBox(height: 24),
                    _CategoryRow(store: store),
                    const SizedBox(height: 28),
                    _ProductSection(
                      title: 'Featured Footwear',
                      subtitle: 'Curated picks from our catalog',
                      products: store.featuredProducts(),
                      onSeeAll: () => store.setActiveTab(1),
                    ),
                    const SizedBox(height: 28),
                    _ProductSection(
                      title: 'New Arrivals',
                      subtitle: 'Fresh drops just landed',
                      products: store.newArrivals(),
                      onSeeAll: () => store.setActiveTab(1),
                    ),
                    const SizedBox(height: 28),
                    _ProductSection(
                      title: 'Best Sellers',
                      subtitle: 'Most loved by shoppers',
                      products: store.bestSellers(),
                      onSeeAll: () => store.setActiveTab(1),
                    ),
                    if (store.testimonials.isNotEmpty) ...[
                      const SizedBox(height: 28),
                      _TestimonialsSection(testimonials: store.testimonials),
                    ],
                  ],
                ),
        ),
      ),
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader({required this.store});

  final ZarwintoStore store;

  @override
  Widget build(BuildContext context) {
    final name = store.profile?.fullName.trim();
    final displayName = (name != null && name.isNotEmpty) ? name.split(' ').first : 'Guest';

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome back',
                style: ZarwintoTypography.caption.copyWith(
                  color: ZarwintoColors.foregroundSecondary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                displayName,
                style: ZarwintoTypography.h3.copyWith(fontSize: 22),
              ),
            ],
          ),
        ),
        _HeaderIconButton(
          icon: Icons.search_rounded,
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const SearchScreen()),
            );
          },
        ),
        const SizedBox(width: 10),
        _HeaderIconButton(
          icon: Icons.favorite_border_rounded,
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const WishlistScreen()),
            );
          },
        ),
      ],
    );
  }
}

class _HeaderIconButton extends StatelessWidget {
  const _HeaderIconButton({required this.icon, required this.onTap});

  final IconData icon;
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
          child: Icon(icon, size: 20, color: ZarwintoColors.foreground),
        ),
      ),
    );
  }
}

class _HomeBannerCarousel extends StatelessWidget {
  const _HomeBannerCarousel({required this.store});

  final ZarwintoStore store;

  @override
  Widget build(BuildContext context) {
    final banners = store.banners;

    if (banners.isEmpty) {
      return _FallbackHeroBanner(onShop: () => store.setActiveTab(1));
    }

    return CarouselSlider.builder(
      itemCount: banners.length,
      options: CarouselOptions(
        height: 180,
        viewportFraction: 1,
        autoPlay: banners.length > 1,
        autoPlayInterval: const Duration(seconds: 5),
        enlargeCenterPage: false,
      ),
      itemBuilder: (context, index, _) {
        final banner = banners[index];
        return GestureDetector(
          onTap: () => store.setActiveTab(1),
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
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [
                        Colors.black.withValues(alpha: 0.65),
                        Colors.black.withValues(alpha: 0.15),
                      ],
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
                      const SizedBox(height: 14),
                      FilledButton(
                        onPressed: () => store.setActiveTab(1),
                        style: FilledButton.styleFrom(
                          minimumSize: const Size(0, 40),
                          padding: const EdgeInsets.symmetric(horizontal: 18),
                        ),
                        child: const Text('Shop Now'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
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
            child: Icon(
              Icons.sports_basketball,
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
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: onShop,
                  style: FilledButton.styleFrom(
                    backgroundColor: ZarwintoColors.accent,
                    minimumSize: const Size(0, 40),
                  ),
                  child: const Text('Explore Shop'),
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
    if (categories.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Shop by Category', style: ZarwintoTypography.title),
        const SizedBox(height: 4),
        Text(
          'Find the perfect pair for every moment',
          style: ZarwintoTypography.caption,
        ),
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
                onTap: () => store.setActiveTab(1),
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
                                image: NetworkImage(category.image),
                                fit: BoxFit.cover,
                              )
                            : null,
                        color: ZarwintoColors.surface,
                      ),
                      child: category.image.isEmpty
                          ? Icon(Icons.category_outlined, color: ZarwintoColors.primary.withValues(alpha: 0.7))
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
  });

  final String title;
  final String subtitle;
  final List<Product> products;
  final VoidCallback onSeeAll;

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) return const SizedBox.shrink();

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
        SizedBox(
          height: 280,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: products.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              return SizedBox(
                width: 170,
                child: ProductCard(products[index]),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _TestimonialsSection extends StatelessWidget {
  const _TestimonialsSection({required this.testimonials});

  final List testimonials;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('What shoppers say', style: ZarwintoTypography.title),
        const SizedBox(height: 12),
        SizedBox(
          height: 150,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: testimonials.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final item = testimonials[index];
              return Container(
                width: 280,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: ZarwintoColors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: ZarwintoColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundColor: ZarwintoColors.primary.withValues(alpha: 0.15),
                          child: Text(
                            item.initials,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 11,
                              color: ZarwintoColors.primary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                              Text(item.product, style: ZarwintoTypography.small),
                            ],
                          ),
                        ),
                        Row(
                          children: List.generate(
                            5,
                            (i) => Icon(
                              i < item.rating ? Icons.star_rounded : Icons.star_outline_rounded,
                              size: 14,
                              color: ZarwintoColors.accent,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Expanded(
                      child: Text(
                        '"${item.review}"',
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: ZarwintoTypography.caption.copyWith(
                          color: ZarwintoColors.foreground,
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

class _HomeShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Shimmer.fromColors(
          baseColor: Colors.grey.shade300,
          highlightColor: Colors.grey.shade100,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(height: 20, width: 140, color: Colors.white),
              const SizedBox(height: 8),
              Container(height: 28, width: 180, color: Colors.white),
              const SizedBox(height: 24),
              Container(height: 180, width: double.infinity, color: Colors.white),
              const SizedBox(height: 24),
              Container(height: 80, width: double.infinity, color: Colors.white),
              const SizedBox(height: 24),
              Container(height: 280, width: double.infinity, color: Colors.white),
            ],
          ),
        ),
      ],
    );
  }
}
