import 'package:flutter/material.dart';

import '../tickets/create_ticket_page.dart';
import '../tickets/my_tickets_page.dart';
import '../tickets/ticket_detail_page.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  static const routeName = '/home';

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  static const _pages = <Widget>[
    MyTicketsPage(),
    TicketDetailPage(),
    CreateTicketPage(),
  ];

  static const _labels = <String>['My Tickets', 'Detail', 'Create'];

  static const _icons = <IconData>[
    Icons.inbox_outlined,
    Icons.receipt_long_outlined,
    Icons.add_circle_outline_rounded,
  ];

  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final body = IndexedStack(index: _index, children: _pages);

    return Scaffold(
      body: SafeArea(child: body),
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
