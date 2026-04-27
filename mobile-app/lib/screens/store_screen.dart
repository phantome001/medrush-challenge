import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/app_providers.dart';
import '../widgets/med_card.dart';

class StoreScreen extends ConsumerWidget {
  const StoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Store')),
      body: FutureBuilder<List<dynamic>>(
        future: ref.watch(apiProvider).store(),
        builder: (context, snapshot) {
          final fallback = [
            {'name': 'Premium quiz packs', 'cost': 250},
            {'name': 'Avatar frames', 'cost': 100},
            {'name': 'Themes', 'cost': 150},
            {'name': 'Badge styles', 'cost': 200},
          ];
          final items = snapshot.data ?? fallback;
          return ListView(padding: const EdgeInsets.all(16), children: items.map((item) => MedCard(child: ListTile(
            leading: const Icon(Icons.shopping_bag),
            title: Text(item['name']),
            subtitle: Text('${item['cost']} coins'),
            trailing: FilledButton(onPressed: () {}, child: const Text('Unlock')),
          ))).toList());
        },
      ),
    );
  }
}
