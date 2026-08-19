import 'dart:async';
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

enum AuthMode { phoneOtp, emailPassword }
enum AuthStep { phone, otp }

class _AccountTabState extends State<AccountTab> {
  AuthMode mode = AuthMode.phoneOtp;
  AuthStep step = AuthStep.phone;
  bool isSignUp = false;
  bool busy = false;
  int resendCooldown = 0;
  Timer? cooldownTimer;

  final phoneController = TextEditingController();
  final otpController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final nameController = TextEditingController();

  @override
  void dispose() {
    phoneController.dispose();
    otpController.dispose();
    emailController.dispose();
    passwordController.dispose();
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
    final phone = phoneController.text.trim();
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter phone number')));
      return;
    }
    setState(() => busy = true);
    final message = await store.sendOtp(phone);
    setState(() => busy = false);
    if (!mounted) return;
    if (message != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } else {
      setState(() => step = AuthStep.otp);
      startResendCooldown();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('OTP sent to your phone!')));
    }
  }

  Future<void> handleVerifyOtp(ZarwintoStore store) async {
    final code = otpController.text.trim();
    if (code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter OTP code')));
      return;
    }
    setState(() => busy = true);
    final message = await store.verifyOtp(
      phoneController.text.trim(),
      code,
      isSignUp ? nameController.text.trim() : null,
    );
    setState(() => busy = false);
    if (!mounted) return;
    if (message != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Signed in successfully!')));
    }
  }

  Future<void> handleEmailAuth(ZarwintoStore store) async {
    final email = emailController.text.trim();
    final password = passwordController.text.trim();
    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter email and password')));
      return;
    }
    setState(() => busy = true);
    final message = isSignUp
        ? await store.signUp(email, password, nameController.text.trim())
        : await store.signIn(email, password);
    setState(() => busy = false);
    if (!mounted) return;
    if (message != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(isSignUp ? 'Account created successfully!' : 'Welcome back!')),
      );
    }
  }

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
            const ZarwintoHeader(title: 'Account'),
            const SizedBox(height: 18),
            if (profile != null) ...[
              _buildProfileCard(store, profile),
              const SizedBox(height: 16),
              _buildMenuSection(store),
            ] else
              _buildAuthCard(store),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard(ZarwintoStore store, UserProfile profile) {
    final displayName = profile.fullName.isNotEmpty ? profile.fullName : 'Zarwinto Member';
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
                      Text(
                        displayName,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
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

  Widget _buildAuthCard(ZarwintoStore store) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isSignUp ? 'Create Account' : 'Welcome to Zarwinto',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      isSignUp = !isSignUp;
                      step = AuthStep.phone;
                    });
                  },
                  child: Text(isSignUp ? 'Sign In' : 'Sign Up'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              isSignUp
                  ? 'Sign up to manage orders, save addresses, and get special drops.'
                  : 'Sign in to access your orders and saved wishlist.',
              style: const TextStyle(color: ZarwintoColors.muted, fontSize: 13),
            ),
            const SizedBox(height: 16),

            // Mode Selector: Phone OTP vs Email
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: const Center(child: Text('Phone OTP')),
                    selected: mode == AuthMode.phoneOtp,
                    onSelected: (_) => setState(() {
                      mode = AuthMode.phoneOtp;
                      step = AuthStep.phone;
                    }),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ChoiceChip(
                    label: const Center(child: Text('Email & Password')),
                    selected: mode == AuthMode.emailPassword,
                    onSelected: (_) => setState(() => mode = AuthMode.emailPassword),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            if (mode == AuthMode.phoneOtp) ...[
              if (isSignUp && step == AuthStep.phone) ...[
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: HugeIcon(icon: HugeIcons.strokeRoundedUser02, size: 20, color: ZarwintoColors.muted),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              if (step == AuthStep.phone) ...[
                TextField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number (10 digits)',
                    prefixIcon: HugeIcon(icon: HugeIcons.strokeRoundedCall, size: 20, color: ZarwintoColors.muted),
                    hintText: '9876543210',
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: busy ? null : () => handleSendOtp(store),
                  child: busy
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Send Verification OTP'),
                ),
              ] else ...[
                Text(
                  'OTP sent to ${phoneController.text}',
                  style: const TextStyle(color: ZarwintoColors.muted, fontSize: 13),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: otpController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Enter 6-digit OTP',
                    prefixIcon: HugeIcon(icon: HugeIcons.strokeRoundedLock, size: 20, color: ZarwintoColors.muted),
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: busy ? null : () => handleVerifyOtp(store),
                  child: busy
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Verify & Sign In'),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TextButton(
                      onPressed: () => setState(() => step = AuthStep.phone),
                      child: const Text('Change Phone'),
                    ),
                    TextButton(
                      onPressed: resendCooldown > 0 ? null : () => handleSendOtp(store),
                      child: Text(resendCooldown > 0 ? 'Resend in ${resendCooldown}s' : 'Resend OTP'),
                    ),
                  ],
                ),
              ],
            ] else ...[
              if (isSignUp) ...[
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: HugeIcon(icon: HugeIcons.strokeRoundedUser02, size: 20, color: ZarwintoColors.muted),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  prefixIcon: HugeIcon(icon: HugeIcons.strokeRoundedMail01, size: 20, color: ZarwintoColors.muted),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  prefixIcon: HugeIcon(icon: HugeIcons.strokeRoundedLock, size: 20, color: ZarwintoColors.muted),
                ),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: busy ? null : () => handleEmailAuth(store),
                child: busy
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(isSignUp ? 'Create Account' : 'Sign In'),
              ),
            ],
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
