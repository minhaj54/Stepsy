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
    _focusNode.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch(String query) {
    if (query.isEmpty) {
      setState(() {
        _results = [];
        _isSearching = false;
      });
      return;
    }

    setState(() => _isSearching = true);

    final store = ZarwintoScope.of(context);
    final lowerQuery = query.toLowerCase();

    final results = store.products.where((product) {
      return product.title.toLowerCase().contains(lowerQuery) ||
          product.brandName.toLowerCase().contains(lowerQuery) ||
          product.description.toLowerCase().contains(lowerQuery) ||
          product.categorySlug.toLowerCase().contains(lowerQuery);
    }).toList();

    setState(() {
      _results = results;
      _isSearching = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      appBar: AppBar(
        backgroundColor: ZarwintoColors.surface,
        elevation: 0,
        title: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            color: _hasFocus ? ZarwintoColors.surface : ZarwintoColors.background,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _hasFocus ? ZarwintoColors.primary : ZarwintoColors.border,
              width: _hasFocus ? 1.5 : 1,
            ),
            boxShadow: _hasFocus
                ? [
                    BoxShadow(
                      color: ZarwintoColors.primary.withValues(alpha: 0.12),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Row(
            children: [
              AnimatedScale(
                duration: const Duration(milliseconds: 200),
                scale: _hasFocus ? 1.1 : 1.0,
                child: HugeIcon(
                  icon: HugeIcons.strokeRoundedSearch01,
                  size: 22,
                  color: _hasFocus ? ZarwintoColors.primary : ZarwintoColors.muted,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  focusNode: _focusNode,
                  autofocus: true,
                  decoration: InputDecoration(
                    hintText: 'Search shoes, brands...',
                    hintStyle: TextStyle(
                      color: ZarwintoColors.muted,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  style: TextStyle(
                    color: ZarwintoColors.foreground,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                  onChanged: _performSearch,
                ),
              ),
              if (_searchController.text.isNotEmpty)
                AnimatedScale(
                  duration: const Duration(milliseconds: 200),
                  scale: 1.0,
                  child: GestureDetector(
                    onTap: () {
                      _searchController.clear();
                      _performSearch('');
                    },
                    child: Container(
                      padding: const EdgeInsets.all(5),
                      decoration: BoxDecoration(
                        color: ZarwintoColors.primary.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: HugeIcon(
                        icon: HugeIcons.strokeRoundedCancel01,
                        size: 14,
                        color: ZarwintoColors.primary,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
      body: _searchController.text.isEmpty
          ? _buildInitialContent(store)
          : _isSearching
              ? const Center(child: CircularProgressIndicator())
              : _results.isEmpty
                  ? _buildNoResults()
                  : _buildResults(),
    );
  }

  Widget _buildInitialContent(ZarwintoStore store) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Popular Searches
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
          // Trending Now
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
