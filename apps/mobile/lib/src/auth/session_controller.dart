import 'package:flutter/foundation.dart';

import '../core/network/api_client.dart';
import 'auth_repository.dart';

class SessionController extends ChangeNotifier {
  SessionController({AuthRepository? authRepository})
    : _authRepository = authRepository ?? AuthRepository();

  final AuthRepository _authRepository;

  bool _isLoading = false;
  String? _errorMessage;
  AuthSession? _session;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  AuthSession? get session => _session;
  bool get isAuthenticated => _session != null;

  Future<bool> signIn({required String email, required String password}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _session = await _authRepository.login(email: email, password: password);
      return true;
    } on ApiException catch (error) {
      _session = null;
      _errorMessage = error.message;
      return false;
    } catch (_) {
      _session = null;
      _errorMessage = 'Unable to sign in right now.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void signOut() {
    _session = null;
    _errorMessage = null;
    _isLoading = false;
    notifyListeners();
  }
}
