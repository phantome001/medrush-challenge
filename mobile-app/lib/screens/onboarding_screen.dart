import 'package:flutter/material.dart';
import 'auth_screens.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final controller = PageController();
  int index = 0;
  final pages = const [
    ('Welcome to MedRush Challenge', 'Learn and revise medical concepts through fast, game-like quizzes.'),
    ('Daily challenges and clinical cases', 'Practice diagnosis reasoning, first aid, anatomy, and core sciences.'),
    ('Compete with classmates', 'Earn XP, coins, badges, streaks, and rank higher in leaderboards.'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Expanded(
                child: PageView.builder(
                  controller: controller,
                  onPageChanged: (value) => setState(() => index = value),
                  itemCount: pages.length,
                  itemBuilder: (context, pageIndex) {
                    final page = pages[pageIndex];
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.school, size: 120),
                        const SizedBox(height: 32),
                        Text(page.$1, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        Text(page.$2, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyLarge),
                      ],
                    );
                  },
                ),
              ),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(pages.length, (dot) => Container(width: 10, height: 10, margin: const EdgeInsets.all(4), decoration: BoxDecoration(shape: BoxShape.circle, color: dot == index ? Theme.of(context).colorScheme.primary : Colors.grey.shade300)))),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () {
                  if (index == pages.length - 1) {
                    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
                  } else {
                    controller.nextPage(duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
                  }
                },
                child: Text(index == pages.length - 1 ? 'Get Started' : 'Next'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
