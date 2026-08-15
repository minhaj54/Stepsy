import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:zarwinto_app/main.dart';

void main() {
  testWidgets('Stepzy onboarding and storefront navigation test', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(ZarwintoApp(prefs: prefs));
    await tester.pump();

    // Verify Onboarding Screen renders
    expect(find.text('Get Started'), findsOneWidget);

    // Tap Get Started to enter main shell
    await tester.tap(find.text('Get Started'));
    await tester.pumpAndSettle();

    // Verify bottom navigation bar items render
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Shop'), findsOneWidget);
    expect(find.text('Bag'), findsOneWidget);
    expect(find.text('Account'), findsOneWidget);
  });
}
