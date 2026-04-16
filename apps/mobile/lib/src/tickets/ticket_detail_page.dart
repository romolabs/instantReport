import 'package:flutter/material.dart';

import 'ticket_models.dart';

class TicketDetailPage extends StatelessWidget {
  const TicketDetailPage({this.ticket, super.key});

  final MobileTicketSummary? ticket;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ticket Detail')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'Ticket Detail',
            style: Theme.of(context).textTheme.displaySmall,
          ),
          const SizedBox(height: 8),
          Text(
            ticket == null
                ? 'This screen will eventually show the full timeline, comments, attachments, and resolution summary.'
                : 'This early mobile slice opens from the live ticket list. Full ticket history and actions come next.',
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
                    ticket?.ticketNumber ?? 'Ticket preview',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    ticket?.title ?? 'A selected ticket will appear here.',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    ticket == null
                        ? 'Open a ticket from the live list to carry its summary into this screen.'
                        : 'Status: ${ticket!.statusLabel}\nPriority: ${ticket!.priorityLabel}\nCategory: ${ticket!.categoryName}\nUpdated: ${ticket!.updatedAgo}\nAssigned to: ${ticket!.assignedToName ?? 'Unassigned'}',
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          const _Section(
            title: 'Attachments',
            emptyText:
                'Attachment previews will arrive with the detail API integration.',
          ),
          const SizedBox(height: 12),
          const _Section(
            title: 'Timeline',
            emptyText:
                'Comment history and status events will appear in the next mobile slice.',
          ),
        ],
      ),
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
