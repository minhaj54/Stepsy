import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme.dart';
import '../providers/zarwinto_store.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _bgOpacity;
  late final Animation<double> _logoScale;
  late final Animation<double> _logoOpacity;
  late final Animation<double> _wordmarkOpacity;
  late final Animation<double> _taglineOpacity;
  late final Animation<double> _taglineSlide;
  bool _showLoading = false;
  bool _reducedMotion = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1600),
      vsync: this,
    );

    _bgOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.2, curve: Curves.easeOut),
      ),
    );

    _logoScale = Tween<double>(begin: 0.92, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.15, 0.55, curve: Curves.easeOut),
      ),
    );

    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.15, 0.55, curve: Curves.easeOut),
      ),
    );

    _wordmarkOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.45, 0.75, curve: Curves.easeOut),
      ),
    );

    _taglineOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.65, 0.95, curve: Curves.easeOut),
      ),
    );

    _taglineSlide = Tween<double>(begin: 8.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.65, 0.95, curve: Curves.easeOut),
      ),
    );

    _controller.addStatusListener(_onAnimationStatusChanged);
    _controller.forward();
    _waitForBootstrap();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final reducedMotion = MediaQuery.of(context).disableAnimations;
    if (reducedMotion != _reducedMotion) {
      _reducedMotion = reducedMotion;
      _controller.duration = reducedMotion ? Duration.zero : const Duration(milliseconds: 1600);
      if (!reducedMotion && _controller.status == AnimationStatus.completed) {
        _controller.forward(from: 0.0);
      }
    }
  }

  void _onAnimationStatusChanged(AnimationStatus status) {
    if (status == AnimationStatus.completed && mounted) {
      final store = ZarwintoScope.of(context, listen: false);
      if (store.loading) {
        setState(() => _showLoading = true);
      }
    }
  }

  @override
  void dispose() {
    _controller.removeStatusListener(_onAnimationStatusChanged);
    _controller.dispose();
    super.dispose();
  }

  Future<void> _waitForBootstrap() async {
    final store = ZarwintoScope.of(context, listen: false);
    while (store.loading && mounted) {
      await Future.delayed(const Duration(milliseconds: 150));
    }
    if (!mounted) return;
    _navigate(store);
  }

  void _navigate(ZarwintoStore store) {
    Navigator.of(context).pushReplacementNamed('/shell');
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final logoSize = size.width < 360 ? 72.0 : size.width < 400 ? 84.0 : 96.0;

    return Scaffold(
      body: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
            return Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white,
                    const Color(0xFFF4F4F5),
                  ],
                ),
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Positioned.fill(
                    child: Opacity(
                      opacity: _bgOpacity.value * 0.35,
                      child: SvgPicture.asset(
                        'assets/onboarding/bg_element.svg',
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Transform.scale(
                          scale: _reducedMotion ? 1.0 : _logoScale.value,
                          child: Opacity(
                            opacity: _reducedMotion ? 1.0 : _logoOpacity.value,
                            child: SvgPicture.asset(
                              'assets/onboarding/logo.svg',
                              width: logoSize,
                              height: logoSize,
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),
                        Opacity(
                          opacity: _reducedMotion ? 1.0 : _wordmarkOpacity.value,
                          child: Text(
                            'Zarwinto',
                            style: GoogleFonts.inter(
                              fontSize: logoSize * 0.4,
                              fontWeight: FontWeight.w700,
                              color: ZarwintoColors.foreground,
                              letterSpacing: 0.5,
                              height: 1.1,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Opacity(
                          opacity: _reducedMotion ? 1.0 : _taglineOpacity.value,
                          child: Transform.translate(
                            offset: Offset(0, _reducedMotion ? 0.0 : _taglineSlide.value),
                            child: Text(
                              'Step into the right choice',
                              style: GoogleFonts.inter(
                                fontSize: logoSize * 0.18,
                                fontWeight: FontWeight.w500,
                                color: ZarwintoColors.muted,
                                letterSpacing: 0.3,
                                height: 1.5,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                Positioned(
                  bottom: 48,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: _LoadingIndicator(visible: _showLoading),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _LoadingIndicator extends StatelessWidget {
  final bool visible;

  const _LoadingIndicator({required this.visible});

  @override
  Widget build(BuildContext context) {
    if (!visible) return const SizedBox.shrink();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (index) {
        return AnimatedContainer(
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeInOut,
          width: 6,
          height: 6,
          margin: const EdgeInsets.symmetric(horizontal: 3),
                  decoration: BoxDecoration(
                    color: ZarwintoColors.primary.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(3),
                  ),
        );
      }),
    );
  }
}
