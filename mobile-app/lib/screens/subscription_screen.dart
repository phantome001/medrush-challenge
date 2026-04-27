import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/app_providers.dart';
import '../widgets/med_card.dart';

class SubscriptionScreen extends ConsumerWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.watch(apiProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Subscription')),
      body: FutureBuilder<List<dynamic>>(
        future: api.plans(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final plans = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: plans.map((plan) {
              final item = Map<String, dynamic>.from(plan);
              final features = List<String>.from(item['features'] ?? []);
              return MedCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(item['name'] ?? 'Plan', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                Text('\$${item['price'] ?? 0}', style: Theme.of(context).textTheme.headlineSmall),
                ...features.map((feature) => ListTile(dense: true, leading: const Icon(Icons.check_circle), title: Text(feature))),
                const Text('Stripe-ready checkout is available when backend Stripe keys are configured.'),
                const SizedBox(height: 8),
                FilledButton(
                  onPressed: () async {
                    final result = await api.createCheckout(item['id']);
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? result['checkoutUrl'] ?? 'Checkout created')));
                  },
                  child: const Text('Start checkout'),
                ),
              ]));
            }).toList(),
          );
        },
      ),
    );
  }
}
