import 'package:flutter/material.dart';
import '../widgets/med_card.dart';
import 'quiz_screens.dart';

class FirstAidScreen extends StatelessWidget {
  const FirstAidScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const topics = ['CPR', 'Choking', 'Burns', 'Bleeding', 'Fractures', 'Shock', 'Seizures'];
    return Scaffold(
      appBar: AppBar(title: const Text('First Aid')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: topics.map((topic) => MedCard(
          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => QuizScreen(title: '$topic Quiz'))),
          child: ListTile(leading: const Icon(Icons.emergency), title: Text(topic), subtitle: const Text('Educational emergency revision')),
        )).toList(),
      ),
    );
  }
}
