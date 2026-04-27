import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/app_providers.dart';
import 'home_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final email = TextEditingController(text: 'student@medrush.com');
  final password = TextEditingController(text: 'Student123456');
  bool loading = false;

  Future<void> submit() async {
    setState(() => loading = true);
    try {
      final session = await ref.read(apiProvider).login(email.text, password.text);
      ref.read(userProvider.notifier).state = session['user'];
      if (mounted) Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const HomeScreen()));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(controller: email, decoration: const InputDecoration(labelText: 'Email')),
          TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
          const SizedBox(height: 20),
          FilledButton(onPressed: loading ? null : submit, child: Text(loading ? 'Signing in...' : 'Login')),
          TextButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterScreen())), child: const Text('Create student account')),
          TextButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ForgotPasswordScreen())), child: const Text('Forgot password?')),
        ],
      ),
    );
  }
}

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final fullName = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final confirmPassword = TextEditingController();
  final institutionCode = TextEditingController(text: 'MEDU-2026');
  String specialty = 'Medicine';
  String studyYear = 'First year';

  Future<void> submit() async {
    if (password.text != confirmPassword.text) return;
    final session = await ref.read(apiProvider).register({
      'fullName': fullName.text,
      'email': email.text,
      'password': password.text,
      'institutionCode': institutionCode.text,
      'specialty': specialty,
      'studyYear': studyYear,
    });
    ref.read(userProvider.notifier).state = session['user'];
    if (mounted) Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const HomeScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(controller: fullName, decoration: const InputDecoration(labelText: 'Full name')),
          TextField(controller: email, decoration: const InputDecoration(labelText: 'Email')),
          TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Password')),
          TextField(controller: confirmPassword, obscureText: true, decoration: const InputDecoration(labelText: 'Confirm password')),
          TextField(controller: institutionCode, decoration: const InputDecoration(labelText: 'Institution code')),
          DropdownButtonFormField(value: specialty, items: ['Medicine', 'Pharmacy', 'Dentistry', 'Nursing', 'Other'].map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(), onChanged: (value) => setState(() => specialty = value!)),
          DropdownButtonFormField(value: studyYear, items: ['First year', 'Second year', 'Third year', 'Fourth year', 'Fifth year', 'Sixth year', 'Resident'].map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(), onChanged: (value) => setState(() => studyYear = value!)),
          const SizedBox(height: 20),
          FilledButton(onPressed: submit, child: const Text('Register as Student')),
          const SizedBox(height: 16),
          const Text('Email verification placeholder: connect an email provider before production launch.'),
        ],
      ),
    );
  }
}

class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forgot password')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          const TextField(decoration: InputDecoration(labelText: 'Email')),
          const SizedBox(height: 20),
          FilledButton(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ResetPasswordScreen())), child: const Text('Send reset link')),
        ]),
      ),
    );
  }
}

class ResetPasswordScreen extends StatelessWidget {
  const ResetPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reset password')),
      body: const Padding(
        padding: EdgeInsets.all(20),
        child: Column(children: [
          TextField(decoration: InputDecoration(labelText: 'Reset token')),
          TextField(decoration: InputDecoration(labelText: 'New password'), obscureText: true),
          SizedBox(height: 20),
          FilledButton(onPressed: null, child: Text('Reset password')),
        ]),
      ),
    );
  }
}
