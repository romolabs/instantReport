import 'package:flutter/foundation.dart';

const _apiBaseUrlFromDefine = String.fromEnvironment(
  'INSTANTREPORT_API_BASE_URL',
);

class ApiConfig {
  const ApiConfig._();

  static String get baseUrl {
    if (_apiBaseUrlFromDefine.isNotEmpty) {
      return _trimTrailingSlash(_apiBaseUrlFromDefine);
    }

    final host = !kIsWeb && defaultTargetPlatform == TargetPlatform.android
        ? '10.0.2.2'
        : '127.0.0.1';

    return 'http://$host:4000/api';
  }

  static String buildUrl(String path) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    return '$baseUrl$normalizedPath';
  }

  static String _trimTrailingSlash(String value) {
    if (value.endsWith('/')) {
      return value.substring(0, value.length - 1);
    }

    return value;
  }
}
