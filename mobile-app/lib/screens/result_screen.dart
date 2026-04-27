import 'package:flutter/material.dart';

class ResultScreen extends StatelessWidget {
  const ResultScreen({super.key, required this.score, required this.total, required this.result});
  final int score;
  final int total;
  final Map<String, dynamic> result;

  @override
  Widget build(BuildContext context) {
    final wrong = total - score;
    final share = 'I scored $score/$total in MedRush Challenge. Can you beat me?';
    return Scaffold(
      appBar: AppBar(title: const Text('Result')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Icon(Icons.emoji_events, size: 96, color: score == total ? Colors.amber : Theme.of(context).colorScheme.primary),
          Center(child: Text('$score/$total', style: Theme.of(context).textTheme.displayMedium?.copyWith(fontWeight: FontWeight.bold))),
          const SizedBox(height: 16),
          _row('Correct answers', score),
          _row('Wrong answers', wrong),
          _row('XP gained', result['xpGained'] ?? (score * 10 + 50)),
          _row('Coins gained', result['coinsGained'] ?? (score * 2)),
          _row('New level', result['level'] ?? 'Calculated automatically'),
          const SizedBox(height: 20),
          Text(score == total ? 'Perfect score. Excellent revision work.' : 'Keep practicing. Every challenge builds mastery.', textAlign: TextAlign.center),
          const SizedBox(height: 20),
          OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.share), label: Text(share)),
        ],
      ),
    );
  }

  Widget _row(String label, Object value) => ListTile(title: Text(label), trailing: Text('$value', style: const TextStyle(fontWeight: FontWeight.bold)));
}
