import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/app_providers.dart';

class LeaderboardScreen extends ConsumerStatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  ConsumerState<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends ConsumerState<LeaderboardScreen> with SingleTickerProviderStateMixin {
  late final TabController controller = TabController(length: 5, vsync: this);
  final periods = ['DAILY', 'WEEKLY', 'MONTHLY', 'INSTITUTION', 'GLOBAL'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Leaderboard'), bottom: TabBar(controller: controller, isScrollable: true, tabs: const [Tab(text: 'Daily'), Tab(text: 'Weekly'), Tab(text: 'Monthly'), Tab(text: 'Institution'), Tab(text: 'Global')])),
      body: TabBarView(
        controller: controller,
        children: periods.map((period) => FutureBuilder<List<dynamic>>(
          future: ref.watch(apiProvider).leaderboard(period),
          builder: (context, snapshot) {
            if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
            return ListView.builder(
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                final user = snapshot.data![index];
                return ListTile(
                  leading: CircleAvatar(child: Text('${user['rank'] ?? index + 1}')),
                  title: Text(user['fullName'] ?? 'Student'),
                  subtitle: Text('XP ${user['xp']} • Level ${user['level']}'),
                  trailing: const Icon(Icons.military_tech),
                );
              },
            );
          },
        )).toList(),
      ),
    );
  }
}
