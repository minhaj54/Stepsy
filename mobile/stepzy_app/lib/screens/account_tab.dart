import 'dart:async';
import 'package:flutter/material.dart';
import '../providers/zarwinto_store.dart';
import '../widgets/common.dart';
import '../core/theme.dart';
import '../core/constants.dart';
import '../models/user_profile.dart';
import 'orders_screen.dart';
import 'addresses_screen.dart';

class AccountTab extends StatefulWidget {
  const AccountTab({super.key});

  @override
  State<AccountTab> createState() => _AccountTabState();
}

enum AuthStep { phone, otp }

class _AccountTabState extends State<AccountTab> {
  AuthStep step = AuthStep.phone;
  bool signup = false;
  bool busy = false;
  int resendCooldown = 0;
  Timer? cooldownTimer;

  final phoneController = TextEditingController();
  final otpController = TextEditingController();
  final nameController = TextEditingController();

  @override
  void dispose() {
    phoneController.dispose();
    otpController.dispose();
    nameController.dispose();
    cooldownTimer?.cancel();
    super.dispose();
  }

  void startResendCooldown() {
    setState(() => resendCooldown = 60);
    cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (resendCooldown <= 1) {
          timer.cancel();
          resendCooldown = 0;
        } else {
          resendCooldown--;
        }
      });
    });
  }

  Future<void> handleSendOtp(ZarwintoStore store) async {
    setState(() => busy = true);
    final message = await store.sendOtp(phoneController.text.trim());
    setState(() => busy = false);
    if (!mounted) return;
    if (message != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } else {
      setState(() => step = AuthStep.otp);
      startResendCooldown();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('OTP sent successfully!')));
    }
  }

  Future<void> handleVerifyOtp(ZarwintoStore store) async {
    setState(() => busy = true);
    final message = await store.verifyOtp(
      phoneController.text.trim(),
      otpController.text.trim(),
      signup ? nameController.text.trim() : null,
    );
    setState(() => busy = false);
    if (!mounted) return;
    if (message != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Signed in successfully!')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final profile = store.profile;

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 28),
      children: [
        const ZarwintoHeader(title: 'Account'),
        const SizedBox(height: 18),
        if (!store.isSupabaseConfigured)
          const NoticeCard(
            title: 'Supabase not configured',
            body:
                'Run with SUPABASE_URL and SUPABASE_ANON_KEY dart-defines to connect live data.',
          ),
        if (zarwintoApiBaseUrl.isEmpty)
          const NoticeCard(
            title: 'API base URL not configured',
            body:
                'Run with ZARWINTO_API_BASE_URL dart-define to enable phone OTP authentication.',
          ),
        if (profile != null) ...[
          _buildProfileCard(store, profile),
          const SizedBox(height: 16),
          _buildMenuSection(store),
        ] else
          _buildAuthCard(store),
      ],
    );
  }

  Widget _buildProfileCard(ZarwintoStore store, UserProfile profile) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: ZarwintoColors.secondary,
                  backgroundImage: NetworkImage(
                    'https://i.pravatar.cc/150?u=${profile.email}',
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        profile.fullName.isEmpty ? 'Zarwinto member' : profile.fullName,
                        style: titleStyle,
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
                icon: const Icon(Icons.logout),
                label: const Text('Sign out'),
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
        icon: Icons.shopping_bag_outlined,
        title: 'My Orders',
        subtitle: 'View order history',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const OrdersScreen()),
          );
        },
      ),
      _MenuItem(
        icon: Icons.location_on_outlined,
        title: 'Addresses',
        subtitle: 'Manage delivery addresses',
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const AddressesScreen()),
          );
        },
      ),
      _MenuItem(
        icon: Icons.favorite_outline,
        title: 'Wishlist',
        subtitle: '${store.wishlist.length} items saved',
        onTap: () {
          // Navigate to wishlist - for now show a message
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Wishlist feature coming soon!')),
          );
        },
      ),
      _MenuItem(
        icon: Icons.support_agent_outlined,
        title: 'Help & Support',
        subtitle: 'Get help with your orders',
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Support feature coming soon!')),
          );
        },
      ),
      _MenuItem(
        icon: Icons.info_outline,
        title: 'About',
        subtitle: 'Version 1.0.0',
        onTap: () {
          showAboutDialog(
            context: context,
            applicationName: appName,
            applicationVersion: '1.0.0',
          );
        },
      ),
    ];

    return Card(
      child: Column(
        children: menuItems.map((item) {
          return ListTile(
            leading: Icon(item.icon, color: ZarwintoColors.primary),
            title: Text(item.title, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text(item.subtitle, style: mutedStyle),
            trailing: const Icon(Icons.chevron_right, color: ZarwintoColors.muted),
            onTap: item.onTap,
          );
        }).toList(),
      ),
    );
  }

  Widget _buildAuthCard(ZarwintoStore store) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              step == AuthStep.phone
                  ? (signup ? 'Create your account' : 'Welcome back')
                  : 'Enter verification code',
              style: titleStyle,
            ),
            const SizedBox(height: 14),
            if (step == AuthStep.phone) ...[
              if (signup) ...[
                TextField(
                  controller: nameController,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(labelText: 'Full name'),
                ),
                const SizedBox(height: 12),
              ],
              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.done,
                decoration: const InputDecoration(labelText: 'Phone number'),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: busy ? null : () => handleSendOtp(store),
                child: Text(busy ? 'Sending OTP...' : 'Send OTP'),
              ),
            ] else ...[
              TextField(
                controller: otpController,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.done,
                decoration: const InputDecoration(
                  labelText: 'OTP code',
                  hintText: '123456',
                ),
                maxLength: 6,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: busy ? null : () => handleVerifyOtp(store),
                child: Text(busy ? 'Verifying...' : 'Verify & continue'),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: busy ? null : () => setState(() => step = AuthStep.phone),
                    child: const Text('Change number'),
                  ),
                  TextButton(
                    onPressed: (resendCooldown > 0 || busy) ? null : () => handleSendOtp(store),
                    child: Text(resendCooldown > 0 ? 'Resend in $resendCooldown s' : 'Resend OTP'),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 8),
            TextButton(
              onPressed: busy ? null : () => setState(() {
                signup = !signup;
                step = AuthStep.phone;
              }),
              child: Text(
                signup
                    ? 'Already have an account? Sign in'
                    : 'New here? Create an account',
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

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
}
