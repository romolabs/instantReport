import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? httpClient})
    : _httpClient = httpClient ?? http.Client();

  final http.Client _httpClient;

  Future<Map<String, dynamic>> postJson(
    String path, {
    required Map<String, dynamic> body,
    String? token,
  }) async {
    final response = await _httpClient.post(
      Uri.parse(ApiConfig.buildUrl(path)),
      headers: _buildHeaders(token: token),
      body: jsonEncode(body),
    );

    return _decodeJsonObject(response);
  }

  Future<List<dynamic>> getJsonList(String path, {String? token}) async {
    final response = await _httpClient.get(
      Uri.parse(ApiConfig.buildUrl(path)),
      headers: _buildHeaders(token: token),
    );

    final decoded = _decodeJson(response);
    if (decoded is List<dynamic>) {
      return decoded;
    }

    throw ApiException('Unexpected response from server');
  }

  Future<Map<String, dynamic>> getJsonObject(
    String path, {
    String? token,
  }) async {
    final response = await _httpClient.get(
      Uri.parse(ApiConfig.buildUrl(path)),
      headers: _buildHeaders(token: token),
    );

    return _decodeJsonObject(response);
  }

  Map<String, String> _buildHeaders({String? token}) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  dynamic _decodeJson(http.Response response) {
    final payload = response.body.isEmpty
        ? null
        : jsonDecode(response.body) as Object?;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        _extractMessage(payload) ?? 'Request failed',
        statusCode: response.statusCode,
      );
    }

    return payload;
  }

  Map<String, dynamic> _decodeJsonObject(http.Response response) {
    final decoded = _decodeJson(response);
    if (decoded is Map<String, dynamic>) {
      return decoded;
    }

    throw ApiException('Unexpected response from server');
  }

  String? _extractMessage(Object? payload) {
    if (payload is Map<String, dynamic>) {
      final message = payload['message'];
      if (message is String && message.isNotEmpty) {
        return message;
      }

      if (message is List && message.isNotEmpty) {
        final first = message.first;
        if (first is String && first.isNotEmpty) {
          return first;
        }
      }
    }

    return null;
  }
}
