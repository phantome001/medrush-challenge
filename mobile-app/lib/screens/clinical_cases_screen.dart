import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants.dart';
import '../models/app_models.dart';
import '../providers/app_providers.dart';
import '../widgets/disclaimer_banner.dart';
import '../widgets/med_card.dart';

class ClinicalCasesScreen extends ConsumerWidget {
  const ClinicalCasesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Clinical Cases')),
      body: FutureBuilder<List<dynamic>>(
        future: ref.watch(apiProvider).clinicalCases(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final cases = snapshot.data!.map((json) => ClinicalCaseItem.fromJson(json)).toList();
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const DisclaimerBanner(),
              const SizedBox(height: 12),
              ...cases.map((item) => MedCard(
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ClinicalCaseDetailScreen(item: item))),
                child: ListTile(
                  title: Text(item.title),
                  subtitle: Text('${item.difficulty} • ${item.specialty} • 8 min'),
                  trailing: item.isPremium ? const Chip(label: Text('Premium')) : const Icon(Icons.chevron_right),
                ),
              )),
            ],
          );
        },
      ),
    );
  }
}

class ClinicalCaseDetailScreen extends StatefulWidget {
  const ClinicalCaseDetailScreen({super.key, required this.item});
  final ClinicalCaseItem item;

  @override
  State<ClinicalCaseDetailScreen> createState() => _ClinicalCaseDetailScreenState();
}

class _ClinicalCaseDetailScreenState extends State<ClinicalCaseDetailScreen> {
  String? selected;

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    return Scaffold(
      appBar: AppBar(title: Text(item.title)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const DisclaimerBanner(),
          MedCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Patient: ${item.patientAge} years • ${item.patientGender}'),
            Text('Symptoms: ${item.symptoms}'),
            Text('Medical history: ${item.history}'),
            Text('Physical signs: ${item.physicalExam}'),
            Text('Lab results: ${item.labResults ?? 'Placeholder'}'),
          ])),
          const SizedBox(height: 12),
          Text(item.question, style: Theme.of(context).textTheme.titleLarge),
          ...List.generate(item.options.length, (index) {
            final label = ['A', 'B', 'C', 'D'][index];
            return RadioListTile(value: label, groupValue: selected, onChanged: (value) => setState(() => selected = value), title: Text('$label. ${item.options[index]}'));
          }),
          if (selected != null) MedCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Explanation: ${item.explanation}'),
            const SizedBox(height: 8),
            Text('Learning note: ${item.learningNote}'),
            const SizedBox(height: 8),
            const Text(AppConstants.medicalDisclaimer, style: TextStyle(fontSize: 12)),
          ])),
        ],
      ),
    );
  }
}
