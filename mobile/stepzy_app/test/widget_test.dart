import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:stepzy_app/main.dart';

void main() {
  testWidgets('Stepzy mobile shell renders storefront tabs', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(StepzyApp(prefs: prefs));
    await tester.pumpAndSettle();

    expect(find.text('Stepzy'), findsOneWidget);
    expect(find.text('Shop by Category'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Shop'), findsOneWidget);
    expect(find.text('Cart'), findsOneWidget);
    expect(find.text('Account'), findsOneWidget);
  });
}
