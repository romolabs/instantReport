import 'package:flutter/material.dart';

import 'auth/login_page.dart';
import 'shell/app_shell.dart';
import 'theme/app_theme.dart';

class InstantReportApp extends StatelessWidget {
  const InstantReportApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'InstantReport',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: const LoginPage(),
      routes: {AppShell.routeName: (context) => const AppShell()},
    );
  }
}
