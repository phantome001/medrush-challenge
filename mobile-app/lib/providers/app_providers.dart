import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';
import '../services/local_storage_service.dart';

final storageProvider = Provider((ref) => LocalStorageService());
final apiProvider = Provider((ref) => ApiService(ref.watch(storageProvider)));

final localeProvider = StateProvider<Locale>((ref) => const Locale('en'));
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);
final soundProvider = StateProvider<bool>((ref) => true);
final notificationsEnabledProvider = StateProvider<bool>((ref) => true);
final offlineModeProvider = StateProvider<bool>((ref) => false);

final userProvider = StateProvider<Map<String, dynamic>?>((ref) => null);
