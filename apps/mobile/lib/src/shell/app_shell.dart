import 'package:flutter/material.dart';

import '../auth/session_controller.dart';
import '../tickets/create_ticket_page.dart';
import '../tickets/my_tickets_page.dart';
import '../tickets/tickets_repository.dart';

class AppShell extends StatefulWidget {
  const AppShell({
    required this.sessionController,
    required this.ticketsRepository,
    super.key,
  });

  final SessionController sessionController;
  final TicketsRepository ticketsRepository;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  static const _labels = <String>['My Tickets', 'Create'];

  static const _icons = <IconData>[
    Icons.inbox_outlined,
    Icons.add_circle_outline_rounded,
  ];

  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final user = widget.sessionController.session?.user;
    final pages = <Widget>[
      MyTicketsPage(
        sessionController: widget.sessionController,
        ticketsRepository: widget.ticketsRepository,
      ),
      const CreateTicketPage(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(_labels[_index]),
        actions: [
          if (user != null)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Center(
                child: Text(
                  user.fullName,
                  style: Theme.of(context).textTheme.labelLarge,
                ),
              ),
            ),
          IconButton(
            onPressed: widget.sessionController.signOut,
            tooltip: 'Sign out',
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: SafeArea(
        child: IndexedStack(index: _index, children: pages),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) {
          setState(() => _index = value);
        },
        destinations: List.generate(
          _labels.length,
          (index) => NavigationDestination(
            icon: Icon(_icons[index]),
            selectedIcon: Icon(_icons[index]),
            label: _labels[index],
          ),
        ),
      ),
    );
  }
}
