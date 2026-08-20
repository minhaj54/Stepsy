import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/common.dart';
import '../core/theme.dart';
import '../models/user_profile.dart';
import 'orders_screen.dart';
import 'addresses_screen.dart';
import 'wishlist_screen.dart';
import 'help_center_screen.dart';
import 'privacy_screen.dart';
import 'terms_screen.dart';
import 'about_screen.dart';

class AccountTab extends StatefulWidget {
  const AccountTab({super.key});

  @override
  State<AccountTab> createState() => _AccountTabState();
}

class _AccountTabState extends State<AccountTab> {
  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final profile = store.profile;

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
          children: [
            const ZarwintoHeader(title: 'My account'),
            const SizedBox(height: 18),
            if (profile != null) ...[
              _buildProfileCard(store, profile),
              const SizedBox(height: 16),
              _buildMenuSection(store),
            ] else
              _buildSignInPrompt(),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard(ZarwintoStore store, UserProfile profile) {
    final displayName = profile.fullName.isNotEmpty ? profile.fullName : 'Zarwinto Member';

    void showEditProfileSheet() {
      final nameCtrl = TextEditingController(text: profile.fullName);
      final phoneCtrl = TextEditingController(text: profile.phone);
      bool saving = false;
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (ctx) => StatefulBuilder(
          builder: (ctx, setModal) => Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(context).viewInsets.bottom + 20,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: ZarwintoColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text('Edit Profile',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                const SizedBox(height: 14),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: FilledButton(
                    onPressed: saving
                        ? null
                        : () async {
                            setModal(() => saving = true);
                            await store.updateProfile(
                              fullName: nameCtrl.text,
                              phone: phoneCtrl.text,
                            );
                            if (mounted) Navigator.pop(ctx);
                          },
                    child: Text(saving ? 'Saving...' : 'Save Changes'),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: ZarwintoColors.primary.withValues(alpha: 0.15),
                  child: Text(
                    displayName.isNotEmpty ? displayName[0].toUpperCase() : 'Z',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: ZarwintoColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              displayName,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                            ),
                          ),
                          IconButton(
                            onPressed: showEditProfileSheet,
                            icon: const Icon(Icons.edit, size: 18, color: ZarwintoColors.muted),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      if (profile.phone.isNotEmpty)
                        Text(profile.phone, style: mutedStyle),
                      if (profile.email.isNotEmpty && profile.phone.isEmpty)
                        Text(profile.email, style: mutedStyle),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: store.signOut,
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: ZarwintoColors.border),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: HugeIcon(icon: HugeIcons.strokeRoundedLogout01, size: 18, color: ZarwintoColors.muted),
                label: const Text('Sign Out', style: TextStyle(color: ZarwintoColors.foreground)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuSection(ZarwintoStore store) {
    final menuItems = [
      _MenuItem(
        icon: HugeIcon(icon: HugeIcons.strokeRoundedShoppingBag01, color: ZarwintoColors.primary, size: 20),
        title: 'My Orders',
        subtitle: 'View and track all past orders',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const OrdersScreen()),
          );
        },
      ),
      _MenuItem(
        icon: HugeIcon(icon: HugeIcons.strokeRoundedLocation01, color: ZarwintoColors.primary, size: 20),
        title: 'Delivery Addresses',
        subtitle: 'Manage saved shipping addresses',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const AddressesScreen()),
          );
        },
      ),
      _MenuItem(
        icon: HugeIcon(icon: HugeIcons.strokeRoundedHeartRemove, color: ZarwintoColors.primary, size: 20),
        title: 'Wishlist',
        subtitle: '${store.wishlist.length} saved pairs',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const WishlistScreen()),
          );
        },
      ),
      _MenuItem(
        icon: HugeIcon(icon: HugeIcons.strokeRoundedHeadphones, color: ZarwintoColors.primary, size: 20),
        title: 'Help & FAQ Center',
        subtitle: 'Delivery, returns, and support FAQs',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const HelpCenterScreen()),
          );
        },
      ),
      _MenuItem(
        icon: HugeIcon(icon: HugeIcons.strokeRoundedShield01, color: ZarwintoColors.primary, size: 20),
        title: 'Privacy Policy',
        subtitle: 'Data security and terms',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const PrivacyScreen()),
          );
        },
      ),
      _MenuItem(
        icon: HugeIcon(icon: HugeIcons.strokeRoundedFile01, color: ZarwintoColors.primary, size: 20),
        title: 'Terms of Service',
        subtitle: 'Marketplace conditions',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const TermsScreen()),
          );
        },
      ),
      _MenuItem(
        icon: HugeIcon(icon: HugeIcons.strokeRoundedInformationCircle, color: ZarwintoColors.primary, size: 20),
        title: 'About Zarwinto',
        subtitle: 'Version 1.0.0',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const AboutScreen()),
          );
        },
      ),
    ];

    return Card(
      child: Column(
        children: menuItems.map((item) {
          return ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: ZarwintoColors.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: item.icon,
            ),
            title: Text(item.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
            subtitle: Text(item.subtitle, style: mutedStyle),
            trailing: HugeIcon(icon: HugeIcons.strokeRoundedArrowRight01, color: ZarwintoColors.muted),
            onTap: item.onTap,
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSignInPrompt() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: ZarwintoColors.primary.withValues(alpha: .1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: HugeIcon(icon: HugeIcons.strokeRoundedUser02, color: ZarwintoColors.primary, size: 28),
            ),
            const SizedBox(height: 16),
            Text(
              'Sign in to your account',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              'Access orders, wishlist, and more',
              style: const TextStyle(color: ZarwintoColors.muted, fontSize: 13),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  Navigator.of(context).pushNamed('/login');
                },
                child: const Text('Sign In'),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () {
                  Navigator.of(context).pushNamed('/signup');
                },
                child: const Text('Create Account'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuItem {
  const _MenuItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final Widget icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
}
