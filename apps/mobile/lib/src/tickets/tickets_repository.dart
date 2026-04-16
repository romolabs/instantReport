import '../core/network/api_client.dart';
import 'ticket_models.dart';

class TicketsRepository {
  TicketsRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  Future<List<MobileTicketSummary>> fetchMyTickets(String token) async {
    final payload = await _apiClient.getJsonList('/tickets', token: token);

    return payload
        .whereType<Map<String, dynamic>>()
        .map(MobileTicketSummary.fromJson)
        .toList(growable: false);
  }
}
