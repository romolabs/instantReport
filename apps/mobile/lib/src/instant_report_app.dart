import 'package:flutter/material.dart';

import 'auth/auth_repository.dart';
import 'auth/login_page.dart';
import 'auth/session_controller.dart';
import 'shell/app_shell.dart';
import 'theme/app_theme.dart';
import 'tickets/tickets_repository.dart';

class InstantReportApp extends StatefulWidget {
  const InstantReportApp({super.key});

  @override
  State<InstantReportApp> createState() => _InstantReportAppState();
}

class _InstantReportAppState extends State<InstantReportApp> {
  late final SessionController _sessionController;
  late final TicketsRepository _ticketsRepository;

  @override
  void initState() {
    super.initState();
    _sessionController = SessionController(authRepository: AuthRepository());
    _ticketsRepository = TicketsRepository();
  }

  @override
  void dispose() {
    _sessionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _sessionController,
      builder: (context, _) {
        return MaterialApp(
          title: 'InstantReport',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light(),
          home: _sessionController.isAuthenticated
              ? AppShell(
                  sessionController: _sessionController,
                  ticketsRepository: _ticketsRepository,
                )
              : LoginPage(sessionController: _sessionController),
        );
      },
    );
  }
}
