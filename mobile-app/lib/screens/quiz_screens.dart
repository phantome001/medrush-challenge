import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/app_models.dart';
import '../providers/app_providers.dart';
import '../widgets/med_card.dart';
import 'result_screen.dart';

class QuizCategoriesScreen extends ConsumerWidget {
  const QuizCategoriesScreen({super.key, this.initialCategory});
  final String? initialCategory;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.watch(apiProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Quiz Categories')),
      body: FutureBuilder<List<dynamic>>(
        future: api.categories(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final categories = snapshot.data!.map((json) => Category.fromJson(json)).toList();
          return ListView(
            padding: const EdgeInsets.all(16),
            children: categories.map((category) => MedCard(
              onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => QuizScreen(categoryId: category.id, title: category.name))),
              child: ListTile(
                leading: const Icon(Icons.quiz),
                title: Text(category.name),
                subtitle: Text('${category.questionCount} questions • Mixed difficulty'),
                trailing: category.name == initialCategory ? const Icon(Icons.lock_open) : const Icon(Icons.chevron_right),
              ),
            )).toList(),
          );
        },
      ),
    );
  }
}

class DailyChallengeScreen extends StatelessWidget {
  const DailyChallengeScreen({super.key});

  @override
  Widget build(BuildContext context) => const QuizScreen(title: 'Daily Challenge', daily: true);
}

class AnatomyQuizScreen extends StatelessWidget {
  const AnatomyQuizScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const filters = ['Cardiovascular system', 'Respiratory system', 'Nervous system', 'Digestive system', 'Musculoskeletal system', 'Endocrine system'];
    return Scaffold(
      appBar: AppBar(title: const Text('Anatomy Quiz')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Wrap(spacing: 8, children: filters.map((filter) => Chip(label: Text(filter))).toList()),
          const SizedBox(height: 16),
          FilledButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const QuizScreen(title: 'Anatomy Quiz'))), child: const Text('Start anatomy quiz')),
          const SizedBox(height: 16),
          const Placeholder(fallbackHeight: 160),
          const SizedBox(height: 8),
          const Text('Image placeholder support for anatomy questions.'),
        ],
      ),
    );
  }
}

class QuizScreen extends ConsumerStatefulWidget {
  const QuizScreen({super.key, required this.title, this.categoryId, this.daily = false});
  final String title;
  final String? categoryId;
  final bool daily;

  @override
  ConsumerState<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends ConsumerState<QuizScreen> {
  int index = 0;
  int correct = 0;
  String? selected;

  @override
  Widget build(BuildContext context) {
    final api = ref.watch(apiProvider);
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: FutureBuilder<List<dynamic>>(
        future: widget.daily ? api.dailyChallenge() : api.questions(categoryId: widget.categoryId),
        builder: (context, snapshot) {
          if (snapshot.hasError) return Center(child: Text('Unable to load quiz. Offline fallback was not available.\n${snapshot.error}'));
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final questions = snapshot.data!.map((json) => Question.fromJson(json)).toList();
          if (questions.isEmpty) return const Center(child: Text('No questions available offline or online yet.'));
          final question = questions[index];
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              LinearProgressIndicator(value: (index + 1) / questions.length),
              const SizedBox(height: 12),
              Text('Question ${index + 1}/${questions.length} • Score $correct • Timer 60s'),
              const SizedBox(height: 16),
              Text(question.questionText, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              if (question.imageUrl != null) const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Placeholder(fallbackHeight: 160)),
              const SizedBox(height: 16),
              ...List.generate(question.options.length, (optionIndex) {
                final label = ['A', 'B', 'C', 'D'][optionIndex];
                final isSelected = selected == label;
                final isCorrect = question.correctAnswer == label;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(backgroundColor: selected == null ? null : isCorrect ? Colors.green.withValues(alpha: .15) : isSelected ? Colors.red.withValues(alpha: .15) : null),
                    onPressed: selected == null ? () => setState(() {
                      selected = label;
                      if (isCorrect) correct += 1;
                    }) : null,
                    child: Align(alignment: Alignment.centerLeft, child: Text('$label. ${question.options[optionIndex]}')),
                  ),
                );
              }),
              if (selected != null) MedCard(child: Text('Explanation: ${question.explanation}')),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: selected == null ? null : () async {
                  if (index == questions.length - 1) {
                    Map<String, dynamic> result;
                    try {
                      result = await api.submitResult(correctAnswers: correct, totalQuestions: questions.length, isDailyChallenge: widget.daily);
                    } catch (_) {
                      result = {
                        'score': ((correct / questions.length) * 100).round(),
                        'correctAnswers': correct,
                        'wrongAnswers': questions.length - correct,
                        'xpGained': correct * 10 + 50,
                        'coinsGained': correct * 2,
                      };
                    }
                    if (context.mounted) Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => ResultScreen(score: correct, total: questions.length, result: result)));
                  } else {
                    setState(() {
                      index += 1;
                      selected = null;
                    });
                  }
                },
                child: Text(index == questions.length - 1 ? 'Finish' : 'Next'),
              )
            ],
          );
        },
      ),
    );
  }
}
