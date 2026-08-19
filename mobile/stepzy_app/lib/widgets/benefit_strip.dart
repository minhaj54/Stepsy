import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../core/theme.dart';

class BenefitStrip extends StatelessWidget {
  const BenefitStrip({super.key});

  @override
  Widget build(BuildContext context) {
    final benefits = [
      (HugeIcons.strokeRoundedTruck, 'Express'),
      (HugeIcons.strokeRoundedSecurityCheck, 'Secure'),
      (HugeIcons.strokeRoundedRefresh, 'Returns'),
      (HugeIcons.strokeRoundedFlash, 'Authentic'),
    ];

    return Row(
      children: benefits
          .map(
            (benefit) => Expanded(
              child: Column(
                children: [
                  HugeIcon(icon: benefit.$1, color: ZarwintoColors.primary),
                  const SizedBox(height: 6),
                  Text(
                    benefit.$2,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}
