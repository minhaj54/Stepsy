import 'dart:async';
import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../providers/zarwinto_store.dart';
import '../core/theme.dart';
import '../models/product.dart';
import '../widgets/product_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  Timer? _debounce;
  List<Product> _results = [];
  bool _isSearching = false;
  bool _hasFocus = false;
  final List<String> _popularSearches = [
    'Sneakers',
    'Volt',
    'Leather',
    'Waterproof',
    'Boots',
    'AeroStride',
    'ApexCraft',
    'Running',
    'Casual',
  ];

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() => _hasFocus = _focusNode.hasFocus);
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _focusNode.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch(String query) {
    if (_debounce?.isActive ?? false) _debounce?.cancel();

    if (query.isEmpty) {
      setState(() {
        _results = [];
        _isSearching = false;
      });
      return;
    }

    _debounce = Timer(const Duration(milliseconds: 500), () async {
      setState(() => _isSearching = true);

      final store = ZarwintoScope.of(context, listen: false);
      try {
        final results = await store.searchProducts(query);
        if (mounted) {
          setState(() {
            _results = results;
            _isSearching = false;
          });
        }
      } catch (e) {
        debugPrint('[Search] Error: $e');
        if (mounted) {
          setState(() => _isSearching = false);
        }
      }
    });
  }

  void _clearSearch() {
    _searchController.clear();
    _performSearch('');
    _focusNode.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 10,
              left: 16,
              right: 16,
              bottom: 10,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeOut,
                    height: 48,
                    decoration: BoxDecoration(
                      color: _hasFocus
                          ? ZarwintoColors.background
                          : ZarwintoColors.background.withValues(alpha: 0.96),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _hasFocus
                            ? ZarwintoColors.primary.withValues(alpha: 0.45)
                            : ZarwintoColors.border.withValues(alpha: 0.7),
                        width: 1,
                      ),
                      boxShadow: _hasFocus
                          ? [
                        BoxShadow(
                          color: ZarwintoColors.primary.withValues(alpha: 0.08),
                          blurRadius: 12,
                          offset: const Offset(0, 3),
                        ),
                      ]
                          : [],
                    ),
                    child: Row(
                      children: [
                        const SizedBox(width: 15),

                        // Search icon
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: _hasFocus
                                ? ZarwintoColors.primary.withValues(alpha: 0.10)
                                : Colors.transparent,
                            shape: BoxShape.circle,
                          ),
                          child: HugeIcon(
                            icon: HugeIcons.strokeRoundedSearch01,
                            size: 18,
                            color: _hasFocus
                                ? ZarwintoColors.primary
                                : ZarwintoColors.muted,
                          ),
                        ),

                        const SizedBox(width: 8),

                        // Text field
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            focusNode: _focusNode,
                            autofocus: true,
                            textInputAction: TextInputAction.search,
                            decoration: InputDecoration(
                              hintText: 'Search shoes, brands...',
                              hintStyle: TextStyle(
                                color: ZarwintoColors.muted.withValues(alpha: 0.8),
                                fontSize: 14.5,
                                fontWeight: FontWeight.w500,
                              ),
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.zero,
                            ),
                            style: TextStyle(
                              color: ZarwintoColors.foreground,
                              fontSize: 14.5,
                              fontWeight: FontWeight.w600,
                            ),
                            cursorColor: ZarwintoColors.primary,
                            onChanged: _performSearch,
                          ),
                        ),

                        // Clear button
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 150),
                          transitionBuilder: (child, animation) {
                            return ScaleTransition(
                              scale: animation,
                              child: child,
                            );
                          },
                          child: _searchController.text.isNotEmpty
                              ? GestureDetector(
                            key: const ValueKey('clear'),
                            onTap: _clearSearch,
                            behavior: HitTestBehavior.opaque,
                            child: Padding(
                              padding: const EdgeInsets.only(
                                left: 6,
                                right: 10,
                              ),
                              child: Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  color: ZarwintoColors.muted.withValues(
                                    alpha: 0.10,
                                  ),
                                  shape: BoxShape.circle,
                                ),
                                child: HugeIcon(
                                  icon: HugeIcons.strokeRoundedCancel01,
                                  size: 13,
                                  color: ZarwintoColors.muted,
                                ),
                              ),
                            ),
                          )
                              : const SizedBox(
                            key: ValueKey('empty'),
                            width: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Cancel
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 180),
                  transitionBuilder: (child, animation) {
                    return FadeTransition(
                      opacity: animation,
                      child: SizeTransition(
                        sizeFactor: animation,
                        axis: Axis.horizontal,
                        child: child,
                      ),
                    );
                  },
                  child: _hasFocus
                      ? Padding(
                    key: const ValueKey('cancel'),
                    padding: const EdgeInsets.only(left: 8),
                      child: GestureDetector(
                        onTap: () {
                          _focusNode.unfocus();
                          if (mounted) {
                            Navigator.of(context).pop();
                          }
                        },
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 10,
                        ),
                        child: Text(
                          'Cancel',
                          style: TextStyle(
                            color: ZarwintoColors.primary,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  )
                      : const SizedBox(
                    key: ValueKey('no-cancel'),
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: _searchController.text.isEmpty
                ? _buildInitialContent(store)
                : _isSearching
                    ? const Center(child: CircularProgressIndicator())
                    : _results.isEmpty
                        ? _buildNoResults()
                        : _buildResults(),
          ),
        ],
      ),
    );
  }

  Widget _buildInitialContent(ZarwintoStore store) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              HugeIcon(
                icon: HugeIcons.strokeRoundedFlash,
                size: 18,
                color: ZarwintoColors.primary,
              ),
              const SizedBox(width: 8),
              Text(
                'Popular Searches',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: ZarwintoColors.foreground,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: _popularSearches
                .map(
                  (search) => _SearchChip(
                    label: search,
                    onTap: () {
                      _searchController.text = search;
                      _performSearch(search);
                    },
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              HugeIcon(
                icon: HugeIcons.strokeRoundedFlash,
                size: 18,
                color: ZarwintoColors.accent,
              ),
              const SizedBox(width: 8),
              Text(
                'Trending Now',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: ZarwintoColors.foreground,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.75,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: store.products.take(4).length,
            itemBuilder: (context, index) {
              final product = store.products[index];
              return ProductCard(product);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildNoResults() {
    return Center(
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
            'No results found',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: ZarwintoColors.foreground,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Try different keywords',
            style: TextStyle(
              fontSize: 13,
              color: ZarwintoColors.muted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResults() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              '${_results.length} results for "${_searchController.text}"',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: ZarwintoColors.foregroundSecondary,
              ),
            ),
          ),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.75,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: _results.length,
            itemBuilder: (context, index) {
              return ProductCard(_results[index]);
            },
          ),
        ),
      ],
    );
  }
}

class _SearchChip extends StatelessWidget {
  const _SearchChip({
    required this.label,
    required this.onTap,
  });

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: ZarwintoColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: ZarwintoColors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: ZarwintoColors.foregroundSecondary,
          ),
        ),
      ),
    );
  }
}
