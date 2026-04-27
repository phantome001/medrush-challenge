import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme.dart';
import '../localization/app_localizations.dart';
import '../providers/app_providers.dart';
import '../widgets/disclaimer_banner.dart';
import '../widgets/med_card.dart';
import '../widgets/section_title.dart';
import 'analytics_screen.dart';
import 'badges_screen.dart';
import 'clinical_cases_screen.dart';
import 'first_aid_screen.dart';
import 'leaderboard_screen.dart';
import 'notifications_screen.dart';
import 'profile_screen.dart';
import 'quiz_screens.dart';
import 'settings_screen.dart';
import 'store_screen.dart';
import 'subscription_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final user = ref.watch(userProvider) ?? {};
    final offlineMode = ref.watch(offlineModeProvider);
    final modes = [
      (t.t('daily'), Icons.flash_on, const DailyChallengeScreen()),
      ('Clinical Cases', Icons.medical_information, const ClinicalCasesScreen()),
      ('Anatomy Quiz', Icons.accessibility_new, const AnatomyQuizScreen()),
      ('First Aid Quiz', Icons.emergency, const FirstAidScreen()),
      ('Pharmacology Quiz', Icons.medication, const QuizCategoriesScreen(initialCategory: 'Pharmacology')),
      ('Pathology Quiz', Icons.biotech, const QuizCategoriesScreen(initialCategory: 'Pathology')),
      ('Leaderboard', Icons.leaderboard, const LeaderboardScreen()),
      ('Analytics', Icons.analytics, const AnalyticsScreen()),
      ('Profile', Icons.person, const ProfileScreen()),
      ('Store', Icons.store, const StoreScreen()),
      ('Settings', Icons.settings, const SettingsScreen()),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('MedRush Challenge'),
        actions: [
          IconButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const NotificationsScreen())), icon: const Icon(Icons.notifications)),
          IconButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SubscriptionScreen())), icon: const Icon(Icons.workspace_premium)),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Hi, ${user['fullName'] ?? 'Student'}', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          if (offlineMode)
            MedCard(
              color: Colors.orange,
              child: const ListTile(
                leading: Icon(Icons.cloud_off, color: Colors.white),
                title: Text('Offline demo mode', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                subtitle: Text('Cached and bundled educational data will be used.', style: TextStyle(color: Colors.white70)),
              ),
            ),
          MedCard(
            color: AppTheme.blue,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Level ${user['level'] ?? 1}', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              LinearProgressIndicator(value: ((user['xp'] ?? 120) % 500) / 500, backgroundColor: Colors.white24, color: AppTheme.green),
              const SizedBox(height: 12),
              Text('XP ${user['xp'] ?? 0} • Coins ${user['coins'] ?? 0} • Streak ${user['streak'] ?? 0} days', style: const TextStyle(color: Colors.white)),
              Text('Subscription: ${user['subscriptionStatus'] ?? 'FREE'}', style: const TextStyle(color: Colors.white70)),
            ]),
          ),
          const SizedBox(height: 12),
          const DisclaimerBanner(),
          const SectionTitle('Continue learning'),
          MedCard(
            onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const DailyChallengeScreen())),
            child: const ListTile(
              leading: Icon(Icons.timer),
              title: Text('Daily challenge card'),
              subtitle: Text('10 random questions with XP, coins, and streak rewards.'),
            ),
          ),
          const SectionTitle('Quick modes'),
          GridView.builder(
            physics: const NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            itemCount: modes.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 1.25, crossAxisSpacing: 12, mainAxisSpacing: 12),
            itemBuilder: (context, index) {
              final mode = modes[index];
              return MedCard(
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => mode.$3)),
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(mode.$2, size: 32, color: Theme.of(context).colorScheme.primary),
                  const SizedBox(height: 8),
                  Text(mode.$1, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold)),
                ]),
              );
            },
          ),
          TextButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const BadgesScreen())), child: const Text('View badges and achievements')),
        ],
      ),
    );
  }
}
