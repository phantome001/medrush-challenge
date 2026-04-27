import 'package:flutter/material.dart';
import '../core/constants.dart';

class DisclaimerBanner extends StatelessWidget {
  const DisclaimerBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.amber.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Text(AppConstants.medicalDisclaimer, style: TextStyle(fontSize: 12)),
    );
  }
}
