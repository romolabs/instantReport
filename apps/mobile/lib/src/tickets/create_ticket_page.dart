import 'package:flutter/material.dart';

class CreateTicketPage extends StatelessWidget {
  const CreateTicketPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Create Ticket', style: Theme.of(context).textTheme.displaySmall),
        const SizedBox(height: 8),
        Text(
          'The final version will submit this form to the backend API and support attachments.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 20),
        const _FormField(label: 'Title'),
        const SizedBox(height: 12),
        const _FormField(label: 'Description', maxLines: 5),
        const SizedBox(height: 12),
        const _FormField(label: 'Category'),
        const SizedBox(height: 12),
        const _FormField(label: 'Priority'),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.image_outlined),
          label: const Text('Attach image'),
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: () {},
          style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52)),
          child: const Text('Submit ticket'),
        ),
      ],
    );
  }
}

class _FormField extends StatelessWidget {
  const _FormField({required this.label, this.maxLines = 1});

  final String label;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return TextField(
      maxLines: maxLines,
      decoration: InputDecoration(labelText: label),
    );
  }
}
