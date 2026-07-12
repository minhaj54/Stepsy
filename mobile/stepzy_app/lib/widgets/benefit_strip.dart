import 'package:flutter/material.dart';
import '../core/theme.dart';

class BenefitStrip extends StatelessWidget {
  const BenefitStrip({super.key});

  @override
  Widget build(BuildContext context) {
    final benefits = [
      (Icons.local_shipping_outlined, 'Express'),
      (Icons.verified_user_outlined, 'Secure'),
      (Icons.sync_outlined, 'Returns'),
      (Icons.bolt_outlined, 'Authentic'),
    ];

    return Row(
      children: benefits
          .map(
            (benefit) => Expanded(
              child: Column(
                children: [
                  Icon(benefit.$1, color: StepzyColors.primary),
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
