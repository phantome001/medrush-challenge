import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/app_providers.dart';
import '../widgets/med_card.dart';

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.watch(apiProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Student Analytics')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: api.studentAnalytics(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final data = snapshot.data!;
          final student = Map<String, dynamic>.from(data['student'] ?? {});
          final weakCategories = List<Map<String, dynamic>>.from((data['weakCategories'] ?? []).map((item) => Map<String, dynamic>.from(item)));
          final byCategory = List<Map<String, dynamic>>.from((data['byCategory'] ?? []).map((item) => Map<String, dynamic>.from(item)));
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              MedCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(student['fullName'] ?? 'Student', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('Level ${student['level'] ?? 1} • XP ${student['xp'] ?? 0} • Coins ${student['coins'] ?? 0}'),
                  Text('Accuracy ${student['accuracy'] ?? 0}% • Streak ${student['streak'] ?? 0} days'),
                ]),
              ),
              const SizedBox(height: 12),
              Text('Focus areas', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              if (weakCategories.isEmpty) const MedCard(child: Text('No weak categories yet. Complete more quizzes to unlock insights.')),
              ...weakCategories.map((category) => MedCard(
                    child: ListTile(
                      leading: const Icon(Icons.track_changes),
                      title: Text(category['category'] ?? 'Category'),
                      subtitle: Text('Accuracy ${category['accuracy'] ?? 0}%'),
                    ),
                  )),
              const SizedBox(height: 12),
              Text('Category performance', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              ...byCategory.map((category) => MedCard(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(category['category'] ?? 'Category', style: const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(value: ((category['accuracy'] ?? 0) as num).toDouble() / 100),
                      const SizedBox(height: 6),
                      Text('${category['attempts'] ?? 0} attempts • ${category['correct'] ?? 0}/${category['total'] ?? 0} correct'),
                    ]),
                  )),
            ],
          );
        },
      ),
    );
  }
}
