import 'package:flutter_test/flutter_test.dart';
import 'package:seedsec_mobile/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SeedSecApp());
    expect(find.byType(SeedSecApp), findsOneWidget);
  });
}
