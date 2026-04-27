# MedRush Mobile App

Flutter Android/iOS app with Riverpod, Dio, SharedPreferences, dark mode, light mode, and English/Arabic/French localization.

## Run

```bash
flutter pub get
flutter run
```

Set API URL in `lib/core/constants.dart`:

- Android emulator: `http://10.0.2.2:4000/api`
- iOS simulator: `http://localhost:4000/api`
- Real device: your machine LAN URL

## Build Android APK

```bash
flutter build apk --release
```

## Prepare iOS

```bash
flutter build ios --release
```

Then configure signing in Xcode.
