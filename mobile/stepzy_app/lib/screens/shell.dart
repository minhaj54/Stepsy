import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/zarwinto_drawer.dart';
import 'home_tab.dart';
import 'shop_tab.dart';
import 'cart_tab.dart';
import 'account_tab.dart';
import 'checkout_page.dart';

class ZarwintoShell extends StatefulWidget {
  const ZarwintoShell({super.key});

  @override
  State<ZarwintoShell> createState() => _ZarwintoShellState();
}

class _ZarwintoShellState extends State<ZarwintoShell> {
  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final index = store.activeTab;

    final tabs = [
      HomeTab(),
      const ShopTab(),
      const CartTab(),
      const AccountTab(),
    ];

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      extendBody: true,
      drawer: const ZarwintoDrawer(),
      body: IndexedStack(index: index, children: tabs),
      bottomNavigationBar: Container(
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        height: 64,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(36),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 25,
              spreadRadius: 2,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildNavItem(store, 0, HugeIcons.strokeRoundedHome01, 'Home'),
            _buildNavItem(store, 1, HugeIcons.strokeRoundedStore01, 'Shop'),
            _buildNavItem(store, 2, HugeIcons.strokeRoundedShoppingCart01, 'Bag', badge: store.cartCount),
            _buildNavItem(store, 3, HugeIcons.strokeRoundedUser02, 'Account'),
          ],
        ),
      ),
      floatingActionButton: index == 2 && store.cart.isNotEmpty
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const CheckoutPage()),
                );
              },
              backgroundColor: ZarwintoColors.primary,
              icon: HugeIcon(icon: HugeIcons.strokeRoundedLock, color: Colors.black),
              label: const Text('Checkout'),
            )
          : null,
    );
  }

  Widget _buildNavItem(
    ZarwintoStore store,
    int i,
    IconData icon,
    String label, {
    int badge = 0,
  }) {
    final active = store.activeTab == i;
    return GestureDetector(
      onTap: () => store.setActiveTab(i),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(
          horizontal: active ? 18 : 12,
          vertical: 8,
        ),
        decoration: BoxDecoration(
          color: active ? ZarwintoColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Badge.count(
              count: badge,
              isLabelVisible: badge > 0 && i == 2,
              backgroundColor: ZarwintoColors.accent,
              child: HugeIcon(
                icon: icon,
                color: active ? Colors.white : const Color(0xFF7D7D7D),
                size: 20,
              ),
            ),
            if (active) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
