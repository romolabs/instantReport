class MobileTicketSummary {
  const MobileTicketSummary({
    required this.id,
    required this.ticketNumber,
    required this.title,
    required this.status,
    required this.priority,
    required this.categoryName,
    required this.updatedAt,
    this.assignedToName,
  });

  final String id;
  final String ticketNumber;
  final String title;
  final String status;
  final String priority;
  final String categoryName;
  final DateTime updatedAt;
  final String? assignedToName;

  String get statusLabel => _labelize(status);

  String get priorityLabel => _labelize(priority);

  String get updatedAgo {
    final now = DateTime.now();
    final difference = now.difference(updatedAt.toLocal());

    if (difference.inMinutes < 1) {
      return 'just now';
    }

    if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    }

    if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    }

    return '${difference.inDays}d ago';
  }

  factory MobileTicketSummary.fromJson(Map<String, dynamic> json) {
    final category = json['category'] as Map<String, dynamic>? ?? const {};
    final assignedTo = json['assignedTo'] as Map<String, dynamic>?;

    return MobileTicketSummary(
      id: json['id'] as String,
      ticketNumber: json['ticketNumber'] as String,
      title: json['title'] as String,
      status: json['status'] as String,
      priority: json['priority'] as String,
      categoryName: category['name'] as String? ?? 'Uncategorized',
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      assignedToName: assignedTo?['fullName'] as String?,
    );
  }
}

String _labelize(String value) {
  return value
      .toLowerCase()
      .split('_')
      .map((part) => '${part[0].toUpperCase()}${part.substring(1)}')
      .join(' ');
}
