import 'package:flutter/material.dart';
import '../providers/zarwinto_store.dart';
import 'home_tab.dart';
import 'shop_tab.dart';
import 'cart_tab.dart';
import 'account_tab.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int index = 0;
  
  final List<Widget> _tabs = const [
    HomeTab(),
    ShopTab(),
    CartTab(),
    AccountTab(),
  ];

  void _onTabTapped(int value) {
    setState(() => index = value);
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    
    return Scaffold(
      body: IndexedStack(index: index, children: _tabs),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: index,
        onTap: _onTabTapped,
        type: BottomNavigationBarType.fixed,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_outlined),
            activeIcon: Icon(Icons.grid_view_rounded),
            label: 'Shop',
          ),
          BottomNavigationBarItem(
            icon: Badge.count(
              count: store.cartCount,
              isLabelVisible: store.cartCount > 0,
              child: const Icon(Icons.shopping_bag_outlined),
            ),
            activeIcon: Badge.count(
              count: store.cartCount,
              isLabelVisible: store.cartCount > 0,
              child: const Icon(Icons.shopping_bag_rounded),
            ),
            label: 'Bag',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outlined),
            activeIcon: Icon(Icons.person_rounded),
            label: 'Account',
          ),
        ],
      ),
    );
  }
}
