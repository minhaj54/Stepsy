import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/zarwinto_drawer.dart';
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
  
  final List<Widget> _tabs = [
    HomeTab(),
    const ShopTab(),
    const CartTab(),
    const AccountTab(),
  ];

  void _onTabTapped(int value) {
    if (value == 1) {
      ZarwintoScope.of(context).shuffleShopProducts();
    }
    setState(() => index = value);
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    
    return Scaffold(
      drawer: const ZarwintoDrawer(),
      body: IndexedStack(index: index, children: _tabs),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: index,
        onTap: _onTabTapped,
        type: BottomNavigationBarType.fixed,
        items: [
          const BottomNavigationBarItem(
            icon: HugeIcon(icon: HugeIcons.strokeRoundedHome02, color: Colors.white),
            activeIcon: HugeIcon(icon: HugeIcons.strokeRoundedHome03, color: Colors.white),
            label: 'Home',
          ),
          const BottomNavigationBarItem(
            icon: HugeIcon(icon: HugeIcons.strokeRoundedStore01, color: Colors.white),
            activeIcon: HugeIcon(icon: HugeIcons.strokeRoundedStore01, color: Colors.white),
            label: 'Shop',
          ),
          BottomNavigationBarItem(
            icon: Badge.count(
              count: store.cartCount,
              isLabelVisible: store.cartCount > 0,
              child: HugeIcon(icon: HugeIcons.strokeRoundedShoppingCart01, color: Colors.white),
            ),
            activeIcon: Badge.count(
              count: store.cartCount,
              isLabelVisible: store.cartCount > 0,
              child: HugeIcon(icon: HugeIcons.strokeRoundedShoppingCart02, color: Colors.black),
            ),
            label: 'Bag',
          ),
          const BottomNavigationBarItem(
            icon: HugeIcon(icon: HugeIcons.strokeRoundedUser02, color: Colors.white),
            activeIcon: HugeIcon(icon: HugeIcons.strokeRoundedUser, color: Colors.white),
            label: 'Account',
          ),
        ],
      ),
    );
  }
}
