import 'package:flutter/material.dart';

class AppLocalizations {
  AppLocalizations(this.locale);
  final Locale locale;

  static const supportedLocales = [Locale('en'), Locale('ar'), Locale('fr')];

  static final _values = {
    'en': {
      'welcome': 'Welcome to MedRush Challenge',
      'daily': 'Daily Challenge',
      'clinical': 'Clinical Cases',
      'leaderboard': 'Leaderboard',
      'profile': 'Profile',
      'settings': 'Settings',
      'subscription': 'Subscription',
    },
    'ar': {
      'welcome': 'مرحباً بك في تحدي ميد رش',
      'daily': 'التحدي اليومي',
      'clinical': 'حالات سريرية',
      'leaderboard': 'لوحة الترتيب',
      'profile': 'الملف الشخصي',
      'settings': 'الإعدادات',
      'subscription': 'الاشتراك',
    },
    'fr': {
      'welcome': 'Bienvenue dans MedRush Challenge',
      'daily': 'Défi quotidien',
      'clinical': 'Cas cliniques',
      'leaderboard': 'Classement',
      'profile': 'Profil',
      'settings': 'Paramètres',
      'subscription': 'Abonnement',
    }
  };

  String t(String key) => _values[locale.languageCode]?[key] ?? _values['en']![key] ?? key;

  static AppLocalizations of(BuildContext context) => Localizations.of<AppLocalizations>(context, AppLocalizations)!;
}

class AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en', 'ar', 'fr'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async => AppLocalizations(locale);

  @override
  bool shouldReload(covariant LocalizationsDelegate<AppLocalizations> old) => false;
}
