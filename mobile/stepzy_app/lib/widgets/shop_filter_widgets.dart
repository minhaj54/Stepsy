import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../providers/zarwinto_store.dart';

class AppBarActionButton extends StatelessWidget {
  const AppBarActionButton({
    super.key,
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

class FilterBottomSheet extends StatefulWidget {
  const FilterBottomSheet({
    super.key,
    required this.store,
    required this.initialCategory,
    required this.initialBrand,
    required this.initialGender,
    required this.initialSort,
    required this.initialColors,
    required this.initialPriceRange,
    required this.minPrice,
    required this.maxPrice,
    required this.onApply,
    this.hideCategoryFilter = false,
  });

  final ZarwintoStore store;
  final String initialCategory;
  final String initialBrand;
  final String initialGender;
  final String initialSort;
  final Set<String> initialColors;
  final RangeValues initialPriceRange;
  final double minPrice;
  final double maxPrice;
  final bool hideCategoryFilter;
  final Function(String category, String brand, String gender, String sort, Set<String> colors, RangeValues priceRange) onApply;

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  late String _category;
  late String _brand;
  late String _gender;
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
    _gender = widget.initialGender;
    _sort = widget.initialSort;
    _colors = Set<String>.from(widget.initialColors);
    _priceRange = widget.initialPriceRange;
  }

  int get _selectedCount =>
      (_category.isNotEmpty && !widget.hideCategoryFilter ? 1 : 0) +
      (_brand.isNotEmpty ? 1 : 0) +
      (_gender.isNotEmpty ? 1 : 0) +
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
                                if (!widget.hideCategoryFilter) _category = '';
                                _brand = '';
                                _gender = '';
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
                      _buildSectionTitle('Gender'),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          GenderOption(
                            label: 'Male',
                            value: 'male',
                            icon: HugeIcons.strokeRoundedUser02,
                            isSelected: _gender == 'male',
                            onTap: () => setState(() => _gender = 'male'),
                          ),
                          const SizedBox(width: 10),
                          GenderOption(
                            label: 'Female',
                            value: 'female',
                            icon: HugeIcons.strokeRoundedUser,
                            isSelected: _gender == 'female',
                            onTap: () => setState(() => _gender = 'female'),
                          ),
                          const SizedBox(width: 10),
                          GenderOption(
                            label: 'Unisex',
                            value: 'unisex',
                            icon: HugeIcons.strokeRoundedUserGroup,
                            isSelected: _gender == 'unisex',
                            onTap: () => setState(() => _gender = 'unisex'),
                          ),
                        ],
                      ),
                      if (!widget.hideCategoryFilter) ...[
                        const SizedBox(height: 24),
                        _buildSectionTitle('Category'),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            FilterChipWidget(
                              label: 'All',
                              isSelected: _category.isEmpty,
                              onTap: () => setState(() => _category = ''),
                            ),
                            ...widget.store.categories.map(
                              (cat) => FilterChipWidget(
                                label: cat.name,
                                isSelected: _category == cat.slug,
                                onTap: () =>
                                    setState(() => _category = cat.slug),
                              ),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 24),
                      _buildSectionTitle('Brand'),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          FilterChipWidget(
                            label: 'All',
                            isSelected: _brand.isEmpty,
                            onTap: () => setState(() => _brand = ''),
                          ),
                          ...widget.store.brands.map(
                            (brd) => FilterChipWidget(
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
                          FilterChipWidget(
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
                      widget.onApply(_category, _brand, _gender, _sort, _colors, _priceRange);
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
      (color) => ColorFilterChipWidget(
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

class FilterChipWidget extends StatelessWidget {
  const FilterChipWidget({
    super.key,
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

class ColorFilterChipWidget extends StatelessWidget {
  const ColorFilterChipWidget({
    super.key,
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
                color: parseColor(label),
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

  Color parseColor(String name) {
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

class GenderOption extends StatelessWidget {
  const GenderOption({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final String value;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? ZarwintoColors.primary : ZarwintoColors.background,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? ZarwintoColors.primary : ZarwintoColors.border,
            ),
          ),
          child: Column(
            children: [
              HugeIcon(
                icon: icon,
                size: 20,
                color: isSelected ? Colors.white : ZarwintoColors.foregroundSecondary,
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  color: isSelected ? Colors.white : ZarwintoColors.foregroundSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ActiveFilterChip extends StatelessWidget {
  const ActiveFilterChip({super.key, required this.label, required this.onRemove});

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
