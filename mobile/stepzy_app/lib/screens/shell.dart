import 'package:flutter/material.dart';
import '../providers/stepzy_store.dart';
import 'home_tab.dart';
import 'shop_tab.dart';
import 'cart_tab.dart';
import 'account_tab.dart';

class StepzyShell extends StatefulWidget {
  const StepzyShell({super.key});

  @override
  State<StepzyShell> createState() => _StepzyShellState();
}

class _StepzyShellState extends State<StepzyShell> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final store = StepzyScope.of(context);
    final tabs = [
      const HomeTab(),
      const ShopTab(),
      const CartTab(),
      const AccountTab(),
    ];

    return Scaffold(
      body: SafeArea(child: tabs[index]),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: index,
        onTap: (value) => setState(() => index = value),
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            label: 'Home',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_rounded),
            label: 'Shop',
          ),
          BottomNavigationBarItem(
            icon: Badge.count(
              count: store.cartCount,
              isLabelVisible: store.cartCount > 0,
              child: const Icon(Icons.shopping_bag_outlined),
            ),
            label: 'Cart',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            label: 'Account',
          ),
        ],
      ),
    );
  }
}
