import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/product_card.dart';
import '../core/theme.dart';
import 'search_screen.dart';

const _productsPerPage = 6;

class ShopTab extends StatefulWidget {
  const ShopTab({super.key});

  @override
  State<ShopTab> createState() => _ShopTabState();
}

class _ShopTabState extends State<ShopTab> {
  String query = '';
  String category = '';
  String brand = '';
  String sort = 'newest';
  int currentPage = 1;
  final Set<String> selectedColors = {};
  RangeValues priceRange = const RangeValues(0, 10000);

  bool get _hasActiveFilters {
    final bounds = _priceBounds;
    return category.isNotEmpty ||
        brand.isNotEmpty ||
        selectedColors.isNotEmpty ||
        priceRange.start > bounds.min ||
        priceRange.end < bounds.max;
  }

  ({double min, double max}) get _priceBounds {
    final store = ZarwintoScope.of(context, listen: false);
    if (store.products.isEmpty) return (min: 0, max: 10000);
    final prices = store.products.map((p) => p.currentPrice);
    final min = prices.reduce((a, b) => a < b ? a : b);
    final max = prices.reduce((a, b) => a > b ? a : b);
    return (min: min.floorToDouble(), max: max.ceilToDouble());
  }

  Future<void> _handleRefresh(ZarwintoStore store) async {
    await Future.delayed(const Duration(milliseconds: 500));
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final bounds = _priceBounds;
    if (priceRange.start < bounds.min) priceRange = RangeValues(bounds.min, priceRange.end);
    if (priceRange.end > bounds.max) priceRange = RangeValues(priceRange.start, bounds.max);

    final filtered = store.products.where((product) {
      final matchesQuery =
          query.isEmpty ||
          product.title.toLowerCase().contains(query.toLowerCase()) ||
          product.brandName.toLowerCase().contains(query.toLowerCase());
      final matchesCategory =
          category.isEmpty || product.categorySlug == category;
      final matchesBrand = brand.isEmpty || product.brandId == brand;
      final matchesColor = selectedColors.isEmpty ||
          product.variants.any((v) => selectedColors.contains(v.color));
      final matchesPrice = product.currentPrice >= priceRange.start &&
          product.currentPrice <= priceRange.end;
      return matchesQuery && matchesCategory && matchesBrand && matchesColor && matchesPrice;
    }).toList();

    filtered.sort((a, b) {
      if (sort == 'price-low') return a.currentPrice.compareTo(b.currentPrice);
      if (sort == 'price-high') return b.currentPrice.compareTo(a.currentPrice);
      if (sort == 'rating') return b.rating.compareTo(a.rating);
      return b.createdAt.compareTo(a.createdAt);
    });

    final totalPages = (filtered.length / _productsPerPage).ceil().clamp(0, 1 << 30);
    if (currentPage > totalPages && totalPages > 0) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => currentPage = totalPages);
      });
    }
    final start = (currentPage - 1) * _productsPerPage;
    final paginated = filtered.skip(start).take(_productsPerPage).toList();

    final activeFilterCount = [
      if (category.isNotEmpty) 1,
      if (brand.isNotEmpty) 1,
      if (selectedColors.isNotEmpty) 1,
      if (priceRange.start > bounds.min || priceRange.end < bounds.max) 1,
    ].length;

    return Column(
      children: [
        _buildAppBar(context, store, activeFilterCount),
        if (_hasActiveFilters) _buildActiveFilterBar(context, store),
        Expanded(
          child: RefreshIndicator(
            color: ZarwintoColors.primary,
            onRefresh: () => _handleRefresh(store),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              child: filtered.isEmpty
                  ? _buildEmptyState(context)
                  : ListView(
                      key: ValueKey('page-$currentPage-$category-$brand-$sort'),
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 120),
                      children: [
                        const SizedBox(height: 12),
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.72,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: paginated.length,
                          itemBuilder: (context, index) => _StaggeredEntry(
                            index: index,
                            child: ProductCard(paginated[index]),
                          ),
                        ),
                        if (totalPages > 1) _buildPagination(context, totalPages),
                        const SizedBox(height: 24),
                      ],
                    ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAppBar(BuildContext context, ZarwintoStore store, int activeFilterCount) {
    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 8,
        left: 16,
        right: 16,
        bottom: 12,
      ),
      decoration: BoxDecoration(
        color: ZarwintoColors.surface,
        border: Border(bottom: BorderSide(color: ZarwintoColors.border)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Text(
              'Shop',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    fontSize: 26,
                    color: ZarwintoColors.foreground,
                  ),
            ),
          ),
          _AppBarActionButton(
            icon: HugeIcon(
              icon: HugeIcons.strokeRoundedSearch01,
              size: 18,
              color: ZarwintoColors.foreground,
            ),
            label: 'Search',
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SearchScreen()),
              );
            },
          ),
          const SizedBox(width: 10),
          _AppBarActionButton(
            icon: HugeIcon(
              icon: HugeIcons.strokeRoundedSlidersHorizontal,
              size: 18,
              color: ZarwintoColors.foreground,
            ),
            label: 'Filter',
            badgeCount: activeFilterCount,
            onTap: () => _showFilterBottomSheet(context, store),
          ),
          const SizedBox(width: 10),
          _AppBarActionButton(
            icon: HugeIcon(
              icon: HugeIcons.strokeRoundedShoppingCart01,
              size: 18,
              color: ZarwintoColors.foreground,
            ),
            label: 'Bag',
            badgeCount: store.cartCount,
            onTap: () {
              store.setActiveTab(2);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildActiveFilterBar(BuildContext context, ZarwintoStore store) {
    final chips = <Widget>[];

    if (category.isNotEmpty) {
      final match = store.categories.where((c) => c.slug == category);
      final label = match.isNotEmpty ? match.first.name : category;
      chips.add(_ActiveFilterChip(
        label: label,
        onRemove: () => setState(() {
          category = '';
          currentPage = 1;
        }),
      ));
    }
    if (brand.isNotEmpty) {
      final match = store.brands.where((b) => b.id == brand);
      final label = match.isNotEmpty ? match.first.name : brand;
      chips.add(_ActiveFilterChip(
        label: label,
        onRemove: () => setState(() {
          brand = '';
          currentPage = 1;
        }),
      ));
    }
    for (final color in selectedColors) {
      chips.add(_ActiveFilterChip(
        label: color,
        onRemove: () => setState(() {
          selectedColors.remove(color);
          currentPage = 1;
        }),
      ));
    }
    final bounds = _priceBounds;
    if (priceRange.start > bounds.min || priceRange.end < bounds.max) {
      chips.add(_ActiveFilterChip(
        label: '₹${priceRange.start.toInt()} - ₹${priceRange.end.toInt()}',
        onRemove: () => setState(() {
          priceRange = RangeValues(bounds.min, bounds.max);
          currentPage = 1;
        }),
      ));
    }

    return Container(
      color: ZarwintoColors.surface,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            ...chips,
            GestureDetector(
              onTap: () => setState(() {
                category = '';
                brand = '';
                selectedColors.clear();
                priceRange = RangeValues(bounds.min, bounds.max);
                currentPage = 1;
              }),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 4),
                child: Text(
                  'Clear all',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: ZarwintoColors.primary,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context, ZarwintoStore store) {
    final bounds = _priceBounds;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _FilterBottomSheet(
        store: store,
        initialCategory: category,
        initialBrand: brand,
        initialSort: sort,
        initialColors: Set<String>.from(selectedColors),
        initialPriceRange: priceRange,
        minPrice: bounds.min,
        maxPrice: bounds.max,
        onApply: (cat, brd, srt, colors, range) {
          setState(() {
            category = cat;
            brand = brd;
            sort = srt;
            selectedColors
              ..clear()
              ..addAll(colors);
            priceRange = range;
            currentPage = 1;
          });
        },
      ),
    );
  }

  Widget _buildPagination(BuildContext context, int totalPages) {
    final pages = _buildPageNumbers(currentPage, totalPages);
    final pageButtons = <Widget>[];
    for (final p in pages) {
      if (pageButtons.isNotEmpty) {
        pageButtons.add(const SizedBox(width: 6));
      }
      pageButtons.add(_PageNumberButton(
        page: p,
        isActive: p == currentPage,
        onTap: () => setState(() => currentPage = p),
      ));
    }

    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Row(
        children: [
          _PageButton(
            icon: HugeIcons.strokeRoundedArrowLeft01,
            isActive: currentPage > 1,
            onTap: currentPage > 1
                ? () => setState(() => currentPage--)
                : null,
          ),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: pageButtons,
            ),
          ),
          _PageButton(
            icon: HugeIcons.strokeRoundedArrowRight01,
            isActive: currentPage < totalPages,
            isReversed: true,
            onTap: currentPage < totalPages
                ? () => setState(() => currentPage++)
                : null,
          ),
        ],
      ),
    );
  }

  List<int> _buildPageNumbers(int current, int total) {
    if (total <= 5) {
      return List.generate(total, (i) => i + 1);
    }

    final pages = <int>[];
    pages.add(1);

    if (current > 3) pages.add(-1);

    final start = (current - 1).clamp(2, total - 1);
    final end = (current + 1).clamp(2, total - 1);

    for (var i = start; i <= end; i++) {
      if (!pages.contains(i)) pages.add(i);
    }

    if (current < total - 2) pages.add(-1);
    if (!pages.contains(total)) pages.add(total);

    return pages;
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      key: const ValueKey('empty-state'),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: ZarwintoColors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(24),
            ),
            child: HugeIcon(
              icon: HugeIcons.strokeRoundedSearchRemove,
              size: 36,
              color: ZarwintoColors.primary,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'No products found',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: ZarwintoColors.foreground,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            _hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Check back soon — new drops are on the way',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: ZarwintoColors.muted,
            ),
          ),
          if (_hasActiveFilters) ...[
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                setState(() {
                  category = '';
                  brand = '';
                  sort = 'newest';
                  currentPage = 1;
                });
              },
              icon: HugeIcon(
                icon: HugeIcons.strokeRoundedRefresh,
                size: 18,
                color: Colors.white,
              ),
              label: const Text('Reset Filters'),
              style: ElevatedButton.styleFrom(
                backgroundColor: ZarwintoColors.primary,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _StaggeredEntry extends StatefulWidget {
  const _StaggeredEntry({required this.index, required this.child});

  final int index;
  final Widget child;

  @override
  State<_StaggeredEntry> createState() => _StaggeredEntryState();
}

class _StaggeredEntryState extends State<_StaggeredEntry>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fade;
  late final Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
    );
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _slide = Tween<Offset>(
      begin: const Offset(0, 0.04),
      end: Offset.zero,
    ).animate(_fade);

    final delay = Duration(milliseconds: 25 * (widget.index % 6));
    Future.delayed(delay, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fade,
      child: SlideTransition(position: _slide, child: widget.child),
    );
  }
}

class _ActiveFilterChip extends StatelessWidget {
  const _ActiveFilterChip({required this.label, required this.onRemove});

  final String label;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.only(left: 12, right: 6, top: 6, bottom: 6),
      decoration: BoxDecoration(
        color: ZarwintoColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: ZarwintoColors.primary.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: ZarwintoColors.primary,
            ),
          ),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onRemove,
            child: HugeIcon(
              icon: HugeIcons.strokeRoundedCancel01,
              size: 14,
              color: ZarwintoColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _AppBarActionButton extends StatelessWidget {
  const _AppBarActionButton({
    required this.icon,
    required this.label,
    this.badgeCount = 0,
    required this.onTap,
  });

  final Widget icon;
  final String label;
  final int badgeCount;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: badgeCount > 0 ? '$label, $badgeCount active' : label,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: ZarwintoColors.background,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: ZarwintoColors.border),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              SizedBox(width: 20, height: 20, child: icon),
              if (badgeCount > 0)
                Positioned(
                  right: -4,
                  top: -4,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(
                      color: ZarwintoColors.accent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints:
                        const BoxConstraints(minWidth: 18, minHeight: 18),
                    child: Text(
                      '$badgeCount',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FilterBottomSheet extends StatefulWidget {
  const _FilterBottomSheet({
    required this.store,
    required this.initialCategory,
    required this.initialBrand,
    required this.initialSort,
    required this.initialColors,
    required this.initialPriceRange,
    required this.minPrice,
    required this.maxPrice,
    required this.onApply,
  });

  final ZarwintoStore store;
  final String initialCategory;
  final String initialBrand;
  final String initialSort;
  final Set<String> initialColors;
  final RangeValues initialPriceRange;
  final double minPrice;
  final double maxPrice;
  final Function(String category, String brand, String sort, Set<String> colors, RangeValues priceRange) onApply;

  @override
  State<_FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<_FilterBottomSheet> {
  late String _category;
  late String _brand;
  late String _sort;
  late Set<String> _colors;
  late RangeValues _priceRange;

  static const _sortOptions = [
    ('newest', 'Newest'),
    ('price-low', 'Price ↑'),
    ('price-high', 'Price ↓'),
    ('rating', 'Rating'),
  ];

  @override
  void initState() {
    super.initState();
    _category = widget.initialCategory;
    _brand = widget.initialBrand;
    _sort = widget.initialSort;
    _colors = Set<String>.from(widget.initialColors);
    _priceRange = widget.initialPriceRange;
  }

  int get _selectedCount =>
      (_category.isNotEmpty ? 1 : 0) +
      (_brand.isNotEmpty ? 1 : 0) +
      (_colors.isNotEmpty ? 1 : 0) +
      (_priceRange.start > widget.minPrice || _priceRange.end < widget.maxPrice ? 1 : 0);

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.62,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: ZarwintoColors.surface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: ZarwintoColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                child: Row(
                  children: [
                    Text(
                      'Filters',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: ZarwintoColors.foreground,
                      ),
                    ),
                    if (_selectedCount > 0) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: ZarwintoColors.primary,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '$_selectedCount',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                    const Spacer(),
                    TextButton(
                      onPressed: _selectedCount == 0 && _sort == 'newest'
                          ? null
                          : () {
                              setState(() {
                                _category = '';
                                _brand = '';
                                _colors.clear();
                                _priceRange = RangeValues(widget.minPrice, widget.maxPrice);
                                _sort = 'newest';
                              });
                            },
                      child: Text(
                        'Clear All',
                        style: TextStyle(
                          color: ZarwintoColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSectionTitle('Category'),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _FilterChip(
                            label: 'All',
                            isSelected: _category.isEmpty,
                            onTap: () => setState(() => _category = ''),
                          ),
                          ...widget.store.categories.map(
                            (cat) => _FilterChip(
                              label: cat.name,
                              isSelected: _category == cat.slug,
                              onTap: () =>
                                  setState(() => _category = cat.slug),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      _buildSectionTitle('Brand'),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _FilterChip(
                            label: 'All',
                            isSelected: _brand.isEmpty,
                            onTap: () => setState(() => _brand = ''),
                          ),
                          ...widget.store.brands.map(
                            (brd) => _FilterChip(
                              label: brd.name,
                              isSelected: _brand == brd.id,
                              onTap: () => setState(() => _brand = brd.id),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      _buildSectionTitle('Colors'),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _FilterChip(
                            label: 'All',
                            isSelected: _colors.isEmpty,
                            onTap: () => setState(() => _colors.clear()),
                          ),
                          ..._buildColorChips(),
                        ],
                      ),
                      const SizedBox(height: 24),
                      _buildSectionTitle('Price Range'),
                      const SizedBox(height: 10),
                      RangeSlider(
                        values: _priceRange,
                        min: widget.minPrice,
                        max: widget.maxPrice,
                        divisions: 20,
                        labels: RangeLabels(
                          '₹${_priceRange.start.toInt()}',
                          '₹${_priceRange.end.toInt()}',
                        ),
                        onChanged: (values) {
                          setState(() => _priceRange = values);
                        },
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '₹${_priceRange.start.toInt()}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: ZarwintoColors.foregroundSecondary,
                              ),
                            ),
                            Text(
                              '₹${_priceRange.end.toInt()}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: ZarwintoColors.foregroundSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                       _buildSectionTitle('Sort By'),
                       const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: ZarwintoColors.background,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: ZarwintoColors.border),
                        ),
                        child: Row(
                          children: _sortOptions.map((opt) {
                            final isSelected = _sort == opt.$1;
                            return Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _sort = opt.$1),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 180),
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? ZarwintoColors.primary
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(9),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    opt.$2,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: isSelected
                                          ? Colors.white
                                          : ZarwintoColors.foregroundSecondary,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Container(
                padding: EdgeInsets.fromLTRB(
                  20,
                  12,
                  20,
                  12 + MediaQuery.of(context).padding.bottom,
                ),
                decoration: BoxDecoration(
                  color: ZarwintoColors.surface,
                  border: Border(top: BorderSide(color: ZarwintoColors.border)),
                ),
                child: SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () {
                      widget.onApply(_category, _brand, _sort, _colors, _priceRange);
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ZarwintoColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(
                      _selectedCount > 0
                          ? 'Show Results'
                          : 'Apply Filters',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  List<Widget> _buildColorChips() {
    final colors = widget.store.products
        .expand((p) => p.variants.map((v) => v.color.trim()))
        .toSet()
        .toList()
      ..sort();
    return colors.map(
      (color) => _ColorFilterChip(
        label: color,
        isSelected: _colors.contains(color),
        onTap: () {
          setState(() {
            if (_colors.contains(color)) {
              _colors.remove(color);
            } else {
              _colors.add(color);
            }
          });
        },
      ),
    ).toList();
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w700,
        color: ZarwintoColors.foregroundSecondary,
        letterSpacing: 0.5,
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? ZarwintoColors.primary : ZarwintoColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? ZarwintoColors.primary : ZarwintoColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : ZarwintoColors.foregroundSecondary,
          ),
        ),
      ),
    );
  }
}

class _ColorFilterChip extends StatelessWidget {
  const _ColorFilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? ZarwintoColors.primary : ZarwintoColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? ZarwintoColors.primary : ZarwintoColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                color: _parseColor(label),
                shape: BoxShape.circle,
                border: Border.all(color: ZarwintoColors.border, width: 1),
              ),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : ZarwintoColors.foregroundSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _parseColor(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('black')) return const Color(0xFF18181B);
    if (lower.contains('white')) return const Color(0xFFFAFAFA);
    if (lower.contains('red')) return const Color(0xFFEF4444);
    if (lower.contains('blue')) return const Color(0xFF3B82F6);
    if (lower.contains('green')) return const Color(0xFF22C55E);
    if (lower.contains('yellow')) return const Color(0xFFEAB308);
    if (lower.contains('orange')) return const Color(0xFFF97316);
    if (lower.contains('pink')) return const Color(0xFFEC4899);
    if (lower.contains('purple')) return const Color(0xFFA855F7);
    if (lower.contains('grey') || lower.contains('gray')) return const Color(0xFF71717A);
    if (lower.contains('brown')) return const Color(0xFF8B5E3C);
    if (lower.contains('navy')) return const Color(0xFF1E3A8A);
    if (lower.contains('tan')) return const Color(0xFFD2B48C);
    return const Color(0xFF9CA3AF);
  }
}

class _PageButton extends StatelessWidget {
  const _PageButton({
    required this.icon,
    required this.isActive,
    required this.onTap,
    this.isReversed = false,
  });

  final IconData icon;
  final bool isActive;
  final VoidCallback? onTap;
  final bool isReversed;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 2),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        decoration: BoxDecoration(
          color: isActive ? ZarwintoColors.primary : ZarwintoColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isActive ? ZarwintoColors.primary : ZarwintoColors.border,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (!isReversed)
              HugeIcon(
                icon: icon,
                size: 16,
                color: isActive ? Colors.white : ZarwintoColors.muted,
              ),
            if (!isReversed) const SizedBox(width: 4),
            Text(
              isReversed ? 'Next' : 'Prev',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isActive ? Colors.white : ZarwintoColors.muted,
              ),
            ),
            if (isReversed) ...[
              const SizedBox(width: 4),
              HugeIcon(
                icon: icon,
                size: 16,
                color: isActive ? Colors.white : ZarwintoColors.muted,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _PageNumberButton extends StatelessWidget {
  const _PageNumberButton({
    required this.page,
    required this.isActive,
    required this.onTap,
  });

  final int page;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    if (page == -1) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 2),
        child: Text(
          '...',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: ZarwintoColors.muted,
          ),
        ),
      );
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: 32,
        height: 32,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isActive ? ZarwintoColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: isActive ? null : Border.all(color: ZarwintoColors.border),
        ),
        child: Text(
          '$page',
          style: TextStyle(
            fontSize: 13,
            fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
            color: isActive ? Colors.white : ZarwintoColors.foregroundSecondary,
          ),
        ),
      ),
    );
  }
}
