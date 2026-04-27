import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/app_providers.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fallback = const [
      {'title': 'Daily challenge reminder', 'message': 'A new challenge is ready.'},
      {'title': 'New quiz available', 'message': 'Try the latest anatomy quiz.'},
      {'title': 'Subscription expiry reminder', 'message': 'Your premium access may expire soon.'},
      {'title': 'New badge earned', 'message': 'You unlocked a learning badge.'},
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: FutureBuilder<List<dynamic>>(
        future: ref.watch(apiProvider).notifications(),
        builder: (context, snapshot) {
          final notifications = snapshot.data ?? fallback;
          return ListView.builder(
            itemCount: notifications.length,
            itemBuilder: (context, index) => ListTile(
              leading: const Icon(Icons.notifications),
              title: Text(notifications[index]['title']),
              subtitle: Text(notifications[index]['message']),
            ),
          );
        },
      ),
    );
  }
}
