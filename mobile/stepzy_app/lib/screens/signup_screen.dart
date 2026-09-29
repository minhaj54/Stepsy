import 'dart:async';
import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import '../providers/zarwinto_store.dart';
import '../core/phone.dart';

enum AuthStep { phone, otp }

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key, this.initialPhone});

  final String? initialPhone;

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  AuthStep step = AuthStep.phone;
  bool busy = false;
  int resendCooldown = 0;
  Timer? cooldownTimer;
  String? errorMessage;
  bool isNewUser = false;

  final phoneController = TextEditingController();
  final otpController = TextEditingController();
  final nameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.initialPhone != null && widget.initialPhone!.isNotEmpty) {
      phoneController.text = widget.initialPhone!;
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (widget.initialPhone == null || widget.initialPhone!.isEmpty) {
      final routeArgs = ModalRoute.of(context)?.settings.arguments;
      if (routeArgs is String && routeArgs.isNotEmpty && phoneController.text.isEmpty) {
        phoneController.text = routeArgs;
      }
    }
  }

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
    final phone = phoneController.text.trim();
    final fullName = nameController.text.trim();
    if (fullName.isEmpty) {
      setState(() {
        errorMessage = 'Please enter your full name';
      });
      return;
    }
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
    final result = await store.sendOtp(phone, fullName: fullName);
    setState(() => busy = false);
    if (!mounted) return;
    if (result.$1 != null) {
      setState(() => errorMessage = result.$1);
    } else {
      setState(() {
        step = AuthStep.otp;
        isNewUser = result.$2;
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
      fullName: nameController.text.trim(),
    );
    setState(() => busy = false);
    if (!mounted) return;
    if (result.$1 != null) {
      setState(() => errorMessage = result.$1);
    } else {
      _navigateToProfile();
    }
  }

  void _navigateToProfile() {
    final store = ZarwintoScope.of(context, listen: false);
    store.setActiveTab(3);
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
              if (step == AuthStep.phone) _buildPhoneForm(store) else _buildOtpForm(store),
              const SizedBox(height: 24),
              _buildLoginLink(),
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
          'Join Zarwinto',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: ZarwintoColors.foreground),
        ),
        const SizedBox(height: 8),
        const Text(
          'Create your account and start shopping',
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
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Full Name',
            hintText: 'Your name',
            prefixIcon: HugeIcon(icon: HugeIcons.strokeRoundedUser02, size: 20, color: ZarwintoColors.muted),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: 'Mobile Number',
            hintText: 'Enter your phone number',
            hintStyle: TextStyle(color: Colors.grey),
            prefixIcon: HugeIcon(icon: HugeIcons.strokeRoundedCall, size: 20, color: ZarwintoColors.muted),
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'We will send you a one-time SMS to verify your number',
          style: TextStyle(fontSize: 12, color: ZarwintoColors.muted, height: 1.4),
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: busy ? null : () => handleSendOtp(store),
          child: busy
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Text('Send OTP'),
        ),
      ],
    );
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
            color: isNewUser
                ? ZarwintoColors.success.withValues(alpha: .08)
                : ZarwintoColors.info.withValues(alpha: .08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isNewUser
                  ? ZarwintoColors.success.withValues(alpha: .2)
                  : ZarwintoColors.info.withValues(alpha: .2),
            ),
          ),
          child: Row(
            children: [
              HugeIcon(
                icon: isNewUser
                    ? HugeIcons.strokeRoundedUserAdd01
                    : HugeIcons.strokeRoundedCheckmarkCircle02,
                color: isNewUser ? ZarwintoColors.success : ZarwintoColors.info,
                size: 18,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  isNewUser
                      ? 'Welcome! OTP sent to +91 ${phoneController.text.replaceAll(RegExp(r'\D'), '').substring(
                          phoneController.text.replaceAll(RegExp(r'\D'), '').length > 10
                              ? phoneController.text.replaceAll(RegExp(r'\D'), '').length - 10
                              : 0,
                        )}'
                      : 'OTP sent to +91 ${phoneController.text.replaceAll(RegExp(r'\D'), '').substring(
                          phoneController.text.replaceAll(RegExp(r'\D'), '').length > 10
                              ? phoneController.text.replaceAll(RegExp(r'\D'), '').length - 10
                              : 0,
                        )}',
                  style: TextStyle(
                    color: isNewUser ? ZarwintoColors.success : ZarwintoColors.info,
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
              : Text(isNewUser ? 'Verify & Create Account' : 'Verify & Sign In'),
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

  Widget _buildLoginLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text('Already have an account? ', style: TextStyle(color: ZarwintoColors.muted, fontSize: 14)),
        TextButton(
          onPressed: () {
            Navigator.of(context).pushNamed('/login');
          },
          child: const Text('Sign in', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
        ),
      ],
    );
  }
}
