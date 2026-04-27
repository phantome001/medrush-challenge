import 'package:flutter/material.dart';
import '../widgets/med_card.dart';

class SubscriptionScreen extends StatelessWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final plans = [
      ('Free Plan', ['Limited daily challenges', 'Limited categories', 'Basic leaderboard'], 'Subscribe'),
      ('Student Premium', ['Unlimited quizzes', 'Premium clinical cases', 'Advanced analytics', 'No ads'], 'Upgrade'),
      ('Institution Plan', ['Admin dashboard', 'Teacher accounts', 'Student management', 'Private leaderboard', 'Custom branding'], 'Contact admin'),
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('Subscription')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: plans.map((plan) => MedCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(plan.$1, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
          ...plan.$2.map((feature) => ListTile(dense: true, leading: const Icon(Icons.check_circle), title: Text(feature))),
          const Text('Payment-ready: status and subscription expiry are tracked. Stripe, PayPal, or local payments can be connected later.'),
          const SizedBox(height: 8),
          FilledButton(onPressed: () {}, child: Text(plan.$3)),
        ]))).toList(),
      ),
    );
  }
}
