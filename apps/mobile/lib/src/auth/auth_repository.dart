import '../core/network/api_client.dart';

class AuthRepository {
  AuthRepository({ApiClient? apiClient})
    : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final payload = await _apiClient.postJson(
      '/auth/login',
      body: {'email': email.trim(), 'password': password},
    );

    return AuthSession.fromJson(payload);
  }

  Future<AuthenticatedUser> me(String token) async {
    final payload = await _apiClient.getJsonObject('/auth/me', token: token);
    return AuthenticatedUser.fromJson(payload);
  }
}

class AuthSession {
  const AuthSession({required this.accessToken, required this.user});

  final String accessToken;
  final AuthenticatedUser user;

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      accessToken: json['accessToken'] as String,
      user: AuthenticatedUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

class AuthenticatedUser {
  const AuthenticatedUser({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    this.department,
    this.lastLoginAt,
  });

  final String id;
  final String fullName;
  final String email;
  final String? department;
  final String role;
  final bool isActive;
  final DateTime? lastLoginAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory AuthenticatedUser.fromJson(Map<String, dynamic> json) {
    return AuthenticatedUser(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      email: json['email'] as String,
      department: json['department'] as String?,
      role: json['role'] as String,
      isActive: json['isActive'] as bool,
      lastLoginAt: _parseNullableDateTime(json['lastLoginAt']),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }
}

DateTime? _parseNullableDateTime(Object? value) {
  if (value is String && value.isNotEmpty) {
    return DateTime.parse(value);
  }

  return null;
}
