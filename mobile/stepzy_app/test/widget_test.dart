import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:zarwinto_app/main.dart';

void main() {
  testWidgets('Zarwinto mobile shell renders storefront tabs', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(ZarwintoApp(prefs: prefs));
    await tester.pumpAndSettle();

    expect(find.text('Zarwinto'), findsOneWidget);
    expect(find.text('Shop by Category'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Shop'), findsOneWidget);
    expect(find.text('Cart'), findsOneWidget);
    expect(find.text('Account'), findsOneWidget);
  });
}
