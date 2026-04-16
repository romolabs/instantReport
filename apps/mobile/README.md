# InstantReport Mobile

Flutter client for the InstantReport help desk.

## Current Slice

- real login against `POST /auth/login`
- in-memory session state with JWT bearer auth
- live `My Tickets` list from `GET /tickets`
- placeholder create-ticket and detail follow-up screens

## Local Run

1. Start the backend API from the repo root on port `4000`.
2. From `apps/mobile`, run `flutter pub get`.
3. Launch with `flutter run`.

The app uses a local API default automatically:

- Android emulator: `http://10.0.2.2:4000/api`
- other local targets: `http://127.0.0.1:4000/api`

Override that base URL when needed:

```bash
flutter run --dart-define=INSTANTREPORT_API_BASE_URL=http://your-host:4000/api
```

## Verification

- `flutter analyze`
- `flutter test`
