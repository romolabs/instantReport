import 'package:flutter/material.dart';

class MyTicketsPage extends StatelessWidget {
  const MyTicketsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return _ScreenScaffold(
      title: 'My Tickets',
      subtitle: 'Tickets submitted by the current user will appear here.',
      child: Column(
        children: const [
          _TicketCard(
            number: 'IR-2026-001',
            title: 'Printer not connecting',
            status: 'Open',
            category: 'Hardware',
            priority: 'High',
          ),
          SizedBox(height: 12),
          _TicketCard(
            number: 'IR-2026-002',
            title: 'Password reset request',
            status: 'In progress',
            category: 'Access',
            priority: 'Medium',
          ),
        ],
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  const _TicketCard({
    required this.number,
    required this.title,
    required this.status,
    required this.category,
    required this.priority,
  });

  final String number;
  final String title;
  final String status;
  final String category;
  final String priority;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    number,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                _StatusChip(label: status),
              ],
            ),
            const SizedBox(height: 10),
            Text(title, style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _MetaChip(label: category),
                _MetaChip(label: priority, color: scheme.primaryContainer),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Chip(label: Text(label), side: BorderSide.none);
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.label, this.color});

  final String label;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(label),
      backgroundColor:
          color ?? Theme.of(context).colorScheme.surfaceContainerHighest,
      side: BorderSide.none,
    );
  }
}

class _ScreenScaffold extends StatelessWidget {
  const _ScreenScaffold({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(title, style: Theme.of(context).textTheme.displaySmall),
        const SizedBox(height: 8),
        Text(
          subtitle,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 20),
        child,
      ],
    );
  }
}
