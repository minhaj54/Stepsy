import 'dart:async';
import 'package:flutter/material.dart';
import '../providers/stepzy_store.dart';
import '../widgets/common.dart';
import '../core/theme.dart';
import '../core/constants.dart';

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

  Future<void> handleSendOtp(StepzyStore store) async {
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

  Future<void> handleVerifyOtp(StepzyStore store) async {
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
    final store = StepzyScope.of(context);
    final profile = store.profile;

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 28),
      children: [
        const StepzyHeader(title: 'Account'),
        const SizedBox(height: 18),
        if (!store.isSupabaseConfigured)
          const NoticeCard(
            title: 'Supabase not configured',
            body:
                'Run with SUPABASE_URL and SUPABASE_ANON_KEY dart-defines to connect live data.',
          ),
        if (stepzyApiBaseUrl.isEmpty)
          const NoticeCard(
            title: 'API base URL not configured',
            body:
                'Run with STEPZY_API_BASE_URL dart-define to enable phone OTP authentication.',
          ),
        if (profile != null)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 30,
                        backgroundColor: StepzyColors.panel,
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
                              profile.fullName.isEmpty
                                  ? 'Stepzy member'
                                  : profile.fullName,
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
          )
        else
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    step == AuthStep.phone
                        ? (signup ? 'Create your Stepzy account' : 'Welcome back')
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
          ),
      ],
    );
  }
}
