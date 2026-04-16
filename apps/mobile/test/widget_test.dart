import 'package:flutter_test/flutter_test.dart';

import 'package:instant_report_mobile/src/instant_report_app.dart';

void main() {
  testWidgets('shows the login screen on launch', (WidgetTester tester) async {
    await tester.pumpWidget(const InstantReportApp());

    expect(find.text('InstantReport'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);
  });
}
