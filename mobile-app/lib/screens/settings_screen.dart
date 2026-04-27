import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/app_providers.dart';
import 'auth_screens.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    final themeMode = ref.watch(themeModeProvider);
    final sound = ref.watch(soundProvider);
    final notifications = ref.watch(notificationsEnabledProvider);
    final offlineMode = ref.watch(offlineModeProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          ListTile(
            title: const Text('Language'),
            trailing: DropdownButton<String>(
              value: locale.languageCode,
              items: const [DropdownMenuItem(value: 'en', child: Text('English')), DropdownMenuItem(value: 'ar', child: Text('Arabic')), DropdownMenuItem(value: 'fr', child: Text('French'))],
              onChanged: (value) => ref.read(localeProvider.notifier).state = Locale(value!),
            ),
          ),
          SwitchListTile(title: const Text('Dark mode'), value: themeMode == ThemeMode.dark, onChanged: (value) => ref.read(themeModeProvider.notifier).state = value ? ThemeMode.dark : ThemeMode.light),
          SwitchListTile(title: const Text('Sound on/off'), value: sound, onChanged: (value) => ref.read(soundProvider.notifier).state = value),
          SwitchListTile(title: const Text('Notifications on/off'), value: notifications, onChanged: (value) => ref.read(notificationsEnabledProvider.notifier).state = value),
          SwitchListTile(title: const Text('Offline demo mode'), subtitle: const Text('Use cached/demo questions when internet is unavailable'), value: offlineMode, onChanged: (value) => ref.read(offlineModeProvider.notifier).state = value),
          ListTile(title: const Text('Change password'), trailing: const Icon(Icons.chevron_right), onTap: () {}),
          const ListTile(title: Text('Privacy policy'), subtitle: Text('Privacy policy text placeholder')),
          const ListTile(title: Text('Terms of use'), subtitle: Text('Terms of use text placeholder')),
          const ListTile(title: Text('About app'), subtitle: Text('MedRush Challenge v1.0')),
          ListTile(
            title: const Text('Logout'),
            leading: const Icon(Icons.logout),
            onTap: () async {
              await ref.read(storageProvider).clear();
              ref.read(userProvider.notifier).state = null;
              if (context.mounted) Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const LoginScreen()), (_) => false);
            },
          ),
        ],
      ),
    );
  }
}
