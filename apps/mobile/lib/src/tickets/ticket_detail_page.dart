import 'package:flutter/material.dart';

class TicketDetailPage extends StatelessWidget {
  const TicketDetailPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Ticket Detail', style: Theme.of(context).textTheme.displaySmall),
        const SizedBox(height: 8),
        Text(
          'This page will eventually show the full timeline, comments, attachments, and resolution summary.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 20),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'IR-2026-001',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  'Printer not connecting',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Status: Open\nAssigned to: Unassigned\nPriority: High\nCategory: Hardware',
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        const _Section(title: 'Attachments', emptyText: 'No attachments yet.'),
        const SizedBox(height: 12),
        const _Section(title: 'Timeline', emptyText: 'No activity yet.'),
      ],
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.emptyText});

  final String title;
  final String emptyText;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 10),
            Text(
              emptyText,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
