import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';
import 'shell.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int activeIndex = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 12),
            // Top Status Bar Simulation Spacer
            Expanded(
              flex: 5,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Diagonal "ZARWINTO" Watermark background
                  Positioned(
                    top: 10,
                    left: 20,
                    right: 20,
                    child: Transform.rotate(
                      angle: -0.32, // Sleek diagonal tilt
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ZARWINTO',
                            style: TextStyle(
                              fontSize: 100,
                              fontWeight: FontWeight.w900,
                              height: 0.85,
                              letterSpacing: 4,
                              foreground: Paint()
                                ..style = PaintingStyle.stroke
                                ..strokeWidth = 2.5
                                ..color = const Color(0xFFC2CBC0).withValues(alpha: 0.8),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Padding(
                            padding: const EdgeInsets.only(left: 70),
                            child: Text(
                              'SHOES',
                              style: TextStyle(
                                fontSize: 100,
                                fontWeight: FontWeight.w900,
                                height: 0.85,
                                letterSpacing: 4,
                                foreground: Paint()
                                  ..style = PaintingStyle.stroke
                                  ..strokeWidth = 2.5
                                  ..color = const Color(0xFFC2CBC0).withValues(alpha: 0.8),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Hanging Shoe Laces Simulation Lines
                  Positioned(
                    top: 0,
                    left: MediaQuery.of(context).size.width * 0.35,
                    child: Container(
                      width: 1.5,
                      height: 190,
                      color: Colors.black26,
                    ),
                  ),
                  Positioned(
                    top: 0,
                    right: MediaQuery.of(context).size.width * 0.32,
                    child: Container(
                      width: 1.5,
                      height: 230,
                      color: Colors.black26,
                    ),
                  ),

                  // Main Suspended Shoe Visual
                  Positioned.fill(
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Transform.rotate(
                          angle: -0.15,
                          child: Image.network(
                            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
                            height: 310,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) => HugeIcon(icon: 
                              HugeIcons.strokeRoundedBasketball01,
                              size: 180,
                              color: Colors.black12,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Typography & Description Section
            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 28.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const Text(
                      'Step into Style\nWith Zarwinto',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        height: 1.15,
                        color: ZarwintoColors.foreground,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Premium footwear delivered to your doorstep.\nDiscover the latest trends in shoes and sneakers.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Color(0xFF7A7A7A),
                        fontSize: 14,
                        height: 1.45,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Page Indicator Carousel Dots
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildDot(0),
                        const SizedBox(width: 6),
                        _buildDot(1),
                        const SizedBox(width: 6),
                        _buildDot(2),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Full width "Get Started" CTA button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: FilledButton(
                        style: FilledButton.styleFrom(
                          backgroundColor: Colors.black,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        onPressed: () {
                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(builder: (_) => const ZarwintoShell()),
                          );
                        },
                        child: const Text(
                          'Get Started',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDot(int index) {
    final bool isActive = activeIndex == index;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: isActive ? 24 : 8,
      height: 8,
      decoration: BoxDecoration(
        color: isActive ? Colors.black : const Color(0xFFD1D1D6),
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
