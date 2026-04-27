import 'package:flutter/material.dart';

class BadgesScreen extends StatelessWidget {
  const BadgesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const badges = ['Anatomy Master', 'Diagnosis Hero', 'First Aid Beginner', '7-Day Streak', '30-Day Streak', 'Pharmacology Rookie', 'Clinical Thinker', 'Top 10 Student'];
    return Scaffold(
      appBar: AppBar(title: const Text('Badges')),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: badges.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12),
        itemBuilder: (context, index) => Card(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.emoji_events, size: 44, color: index < 3 ? Colors.amber : Colors.grey),
            const SizedBox(height: 8),
            Text(badges[index], textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold)),
          ]),
        ),
      ),
    );
  }
}
