import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/app_providers.dart';
import '../widgets/med_card.dart';
import 'analytics_screen.dart';
import 'badges_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider) ?? {};
    final correct = user['totalCorrectAnswers'] ?? 0;
    final wrong = user['totalWrongAnswers'] ?? 0;
    final accuracy = correct + wrong == 0 ? 0 : (correct / (correct + wrong) * 100).round();
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          CircleAvatar(radius: 44, child: Text((user['fullName'] ?? 'S').toString().substring(0, 1))),
          const SizedBox(height: 12),
          Center(child: Text(user['fullName'] ?? 'Student', style: Theme.of(context).textTheme.headlineSmall)),
          Center(child: Text('${user['specialty'] ?? 'Medicine'} • ${user['studyYear'] ?? 'Study year'}')),
          const SizedBox(height: 16),
          MedCard(child: Wrap(spacing: 16, runSpacing: 16, children: [
            _metric('Institution', user['institution'] ?? 'MedRush University'),
            _metric('Level', user['level'] ?? 1),
            _metric('Total XP', user['xp'] ?? 0),
            _metric('Coins', user['coins'] ?? 0),
            _metric('Current streak', user['streak'] ?? 0),
            _metric('Best streak', user['bestStreak'] ?? 0),
            _metric('Quizzes', user['totalQuizzes'] ?? 0),
            _metric('Correct', correct),
            _metric('Accuracy', '$accuracy%'),
          ])),
          const SizedBox(height: 12),
          FilledButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const BadgesScreen())), child: const Text('Badges and achievements')),
          const SizedBox(height: 8),
          OutlinedButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AnalyticsScreen())), child: const Text('View analytics and weak areas')),
        ],
      ),
    );
  }

  Widget _metric(String label, Object value) => SizedBox(width: 140, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label, style: const TextStyle(color: Colors.grey)), Text('$value', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18))]));
}
