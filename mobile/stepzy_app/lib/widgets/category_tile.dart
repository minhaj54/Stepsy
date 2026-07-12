import 'package:flutter/material.dart';
import '../models/category.dart';
import 'common.dart';

class CategoryTile extends StatelessWidget {
  const CategoryTile(this.category, {super.key});

  final Category category;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 122,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Stack(
          fit: StackFit.expand,
          children: [
            StepzyRemoteImage(url: category.image, seed: 'cat_${category.id}'),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black87],
                ),
              ),
            ),
            Positioned(
              left: 12,
              right: 12,
              bottom: 12,
              child: Text(
                category.name,
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
