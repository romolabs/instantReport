import 'package:flutter/material.dart';

import '../auth/session_controller.dart';
import 'ticket_detail_page.dart';
import 'ticket_models.dart';
import 'tickets_repository.dart';

class MyTicketsPage extends StatefulWidget {
  const MyTicketsPage({
    required this.sessionController,
    required this.ticketsRepository,
    super.key,
  });

  final SessionController sessionController;
  final TicketsRepository ticketsRepository;

  @override
  State<MyTicketsPage> createState() => _MyTicketsPageState();
}

class _MyTicketsPageState extends State<MyTicketsPage> {
  List<MobileTicketSummary> _tickets = const [];
  String? _errorMessage;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTickets();
  }

  Future<void> _loadTickets() async {
    final token = widget.sessionController.session?.accessToken;

    if (token == null) {
      setState(() {
        _tickets = const [];
        _errorMessage = 'Sign in again to load your tickets.';
        _isLoading = false;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final tickets = await widget.ticketsRepository.fetchMyTickets(token);

      if (!mounted) {
        return;
      }

      setState(() {
        _tickets = tickets;
        _isLoading = false;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _errorMessage = error.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.sessionController.session?.user;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('My Tickets', style: Theme.of(context).textTheme.displaySmall),
        const SizedBox(height: 8),
        Text(
          user == null
              ? 'Open work will appear here after you sign in.'
              : 'Live tickets for ${user.fullName}. This list is loaded from the InstantReport API.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 20),
        if (_isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: 40),
              child: CircularProgressIndicator(),
            ),
          )
        else if (_errorMessage != null)
          _MessageCard(
            title: 'Unable to load tickets',
            message: _errorMessage!,
            actionLabel: 'Try again',
            onPressed: _loadTickets,
          )
        else if (_tickets.isEmpty)
          _MessageCard(
            title: 'No tickets yet',
            message:
                'Once you submit your first request, it will appear here with its latest workflow state.',
            actionLabel: 'Refresh',
            onPressed: _loadTickets,
          )
        else
          ..._tickets.map(
            (ticket) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _TicketCard(
                ticket: ticket,
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => TicketDetailPage(ticket: ticket),
                    ),
                  );
                },
              ),
            ),
          ),
      ],
    );
  }
}

class _TicketCard extends StatelessWidget {
  const _TicketCard({required this.ticket, required this.onTap});

  final MobileTicketSummary ticket;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      ticket.ticketNumber,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                  _StatusChip(label: ticket.statusLabel),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                ticket.title,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _MetaChip(label: ticket.categoryName),
                  _MetaChip(
                    label: ticket.priorityLabel,
                    color: scheme.primaryContainer,
                  ),
                  if (ticket.assignedToName != null)
                    _MetaChip(label: 'Assigned: ${ticket.assignedToName}'),
                  _MetaChip(label: 'Updated ${ticket.updatedAgo}'),
                ],
              ),
            ],
          ),
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

class _MessageCard extends StatelessWidget {
  const _MessageCard({
    required this.title,
    required this.message,
    required this.actionLabel,
    required this.onPressed,
  });

  final String title;
  final String message;
  final String actionLabel;
  final Future<void> Function() onPressed;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(onPressed: onPressed, child: Text(actionLabel)),
          ],
        ),
      ),
    );
  }
}
