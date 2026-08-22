import 'dart:async';
import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../providers/zarwinto_store.dart';
import '../core/phone.dart';

enum AuthStep { phone, otp }

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  AuthStep step = AuthStep.phone;
  bool busy = false;
  int resendCooldown = 0;
  Timer? cooldownTimer;
  String? errorMessage;
  bool isNewUser = false;

  final phoneController = TextEditingController();
  final otpController = TextEditingController();

  @override
  void dispose() {
    phoneController.dispose();
    otpController.dispose();
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
      setState(() {
        errorMessage = 'Please enter your mobile number';
      });
      return;
    }
    try {
      normalizePhone(phone);
    } on ArgumentError {
      setState(() {
        errorMessage = 'Enter a valid 10-digit mobile number';
      });
      return;
    }
    setState(() {
      busy = true;
      errorMessage = null;
    });
    final exists = await store.repository.checkUserExists(phone);
    if (!exists) {
      setState(() {
        busy = false;
        errorMessage = 'This number is not registered. Please create an account first.';
        isNewUser = true;
      });
      return;
    }
    final result = await store.sendOtp(phone);
    setState(() => busy = false);
    if (!mounted) return;
    if (result.$1 != null) {
      setState(() => errorMessage = result.$1);
    } else {
      setState(() {
        step = AuthStep.otp;
        isNewUser = false;
      });
      startResendCooldown();
    }
  }

  Future<void> handleVerifyOtp(ZarwintoStore store) async {
    final code = otpController.text.trim();
    if (code.isEmpty || code.length != 6) {
      setState(() {
        errorMessage = 'Please enter the 6-digit OTP';
      });
      return;
    }
    setState(() {
      busy = true;
      errorMessage = null;
    });
    final result = await store.verifyOtp(
      phoneController.text.trim(),
      code,
      fullName: null,
    );
    setState(() => busy = false);
    if (!mounted) return;
    if (result.$1 != null) {
      setState(() => errorMessage = result.$1);
    } else {
      _navigateToShell();
    }
  }

  void _navigateToShell() {
    Navigator.of(context).pushNamedAndRemoveUntil('/shell', (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context, listen: false);

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 40, 24, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildHeader(),
              const SizedBox(height: 40),
              if (step == AuthStep.phone) _buildPhoneForm(store)
                  else if (!isNewUser) _buildOtpForm(store)
                  else const SizedBox.shrink(),
              const SizedBox(height: 24),
              _buildSignupLink(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: ZarwintoColors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: ZarwintoColors.border),
            boxShadow: [
              BoxShadow(
                color: ZarwintoColors.primary.withValues(alpha: 0.08),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Image.asset(
              'assets/App icon/1024x1024.png',
              width: 56,
              height: 56,
              fit: BoxFit.contain,
            ),
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          'Welcome Back',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: ZarwintoColors.foreground),
        ),
        const SizedBox(height: 8),
        const Text(
          'Sign in to continue shopping',
          style: TextStyle(fontSize: 14, color: ZarwintoColors.muted, height: 1.5),
        ),
      ],
    );
  }

  Widget _buildPhoneForm(ZarwintoStore store) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (errorMessage != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: ZarwintoColors.error.withValues(alpha: .08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZarwintoColors.error.withValues(alpha: .2)),
            ),
            child: Row(
              children: [
                HugeIcon(icon: HugeIcons.strokeRoundedAlertCircle, color: ZarwintoColors.error, size: 18),
                const SizedBox(width: 10),
                Expanded(child: Text(errorMessage!, style: const TextStyle(color: ZarwintoColors.error, fontSize: 13))),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
        TextField(
          controller: phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: 'Mobile Number',
            hintText: '98765 43210',
            prefixIcon: HugeIcon(icon: HugeIcons.strokeRoundedCall, size: 20, color: ZarwintoColors.muted),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'We will send you a one-time SMS to verify your number',
          style: TextStyle(fontSize: 12, color: ZarwintoColors.muted, height: 1.4),
        ),
        const SizedBox(height: 16),
        if (isNewUser)
          FilledButton(
            onPressed: busy ? null : () => _goToSignup(store),
            child: busy
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Create Account'),
          )
        else
          FilledButton(
            onPressed: busy ? null : () => handleSendOtp(store),
            child: busy
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Send OTP'),
          ),
      ],
    );
  }

  void _goToSignup(ZarwintoStore store) {
    final phone = phoneController.text.trim();
    Navigator.of(context).pushNamed('/signup', arguments: phone);
  }

  Widget _buildOtpForm(ZarwintoStore store) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (errorMessage != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: ZarwintoColors.error.withValues(alpha: .08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ZarwintoColors.error.withValues(alpha: .2)),
            ),
            child: Row(
              children: [
                HugeIcon(icon: HugeIcons.strokeRoundedAlertCircle, color: ZarwintoColors.error, size: 18),
                const SizedBox(width: 10),
                Expanded(child: Text(errorMessage!, style: const TextStyle(color: ZarwintoColors.error, fontSize: 13))),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: ZarwintoColors.info.withValues(alpha: .08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: ZarwintoColors.info.withValues(alpha: .2)),
          ),
          child: Row(
            children: [
              HugeIcon(
                icon: HugeIcons.strokeRoundedCheckmarkCircle02,
                color: ZarwintoColors.info,
                size: 18,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'OTP sent to +91 ${phoneController.text.replaceAll(RegExp(r'\D'), '').substring(
                    phoneController.text.replaceAll(RegExp(r'\D'), '').length > 10
                        ? phoneController.text.replaceAll(RegExp(r'\D'), '').length - 10
                        : 0,
                  )}',
                  style: const TextStyle(
                    color: ZarwintoColors.info,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: otpController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: const InputDecoration(
            labelText: 'Enter 6-digit OTP',
            hintText: '123456',
            prefixIcon: HugeIcon(icon: HugeIcons.strokeRoundedLock, size: 20, color: ZarwintoColors.muted),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Please check your messages for the verification code',
          style: TextStyle(fontSize: 12, color: ZarwintoColors.muted, height: 1.4),
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: busy ? null : () => handleVerifyOtp(store),
          child: busy
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Text('Verify & Sign In'),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            TextButton(
              onPressed: () => setState(() {
                step = AuthStep.phone;
                errorMessage = null;
              }),
              child: const Text('Change Number'),
            ),
            TextButton(
              onPressed: resendCooldown > 0 || busy ? null : () => handleSendOtp(store),
              child: Text(resendCooldown > 0 ? 'Resend in ${resendCooldown}s' : 'Resend OTP'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSignupLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text('New to Zarwinto? ', style: TextStyle(color: ZarwintoColors.muted, fontSize: 14)),
        TextButton(
          onPressed: () {
            Navigator.of(context).pushNamed('/signup', arguments: phoneController.text.trim());
          },
          child: const Text('Create account', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
        ),
      ],
    );
  }
}
