import 'package:dio/dio.dart';
import '../core/constants.dart';
import 'local_storage_service.dart';

class ApiService {
  ApiService(this.storage) {
    dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {
      final token = await storage.token();
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
      handler.next(options);
    }));
  }

  final LocalStorageService storage;
  final Dio dio = Dio(BaseOptions(baseUrl: AppConstants.apiBaseUrl));

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await dio.post('/auth/login', data: {'email': email, 'password': password});
    await storage.saveToken(response.data['accessToken']);
    return response.data;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> payload) async {
    final response = await dio.post('/auth/register', data: payload);
    await storage.saveToken(response.data['accessToken']);
    return response.data;
  }

  Future<List<dynamic>> categories() async {
    try {
      final response = await dio.get('/categories');
      await storage.saveJson('cached_categories', response.data);
      return response.data;
    } on DioException {
      return storage.readList('cached_categories');
    }
  }

  Future<List<dynamic>> dailyChallenge() async {
    try {
      final response = await dio.get('/quizzes/daily-challenge');
      await storage.saveJson('cached_daily_challenge', response.data);
      await storage.saveString('last_sync', DateTime.now().toIso8601String());
      return response.data;
    } on DioException {
      final cached = await storage.readList('cached_daily_challenge');
      return cached.isEmpty ? DemoData.questions : cached;
    }
  }

  Future<List<dynamic>> questions({String? categoryId}) async {
    try {
      final response = await dio.get('/questions', queryParameters: {'categoryId': categoryId});
      await storage.saveJson('cached_questions', response.data);
      await storage.saveString('last_sync', DateTime.now().toIso8601String());
      return response.data;
    } on DioException {
      final cached = await storage.readList('cached_questions');
      return cached.isEmpty ? DemoData.questions : cached;
    }
  }

  Future<List<dynamic>> clinicalCases() async {
    try {
      final response = await dio.get('/clinical-cases');
      await storage.saveJson('cached_clinical_cases', response.data);
      await storage.saveString('last_sync', DateTime.now().toIso8601String());
      return _asList(response.data);
    } on DioException {
      final cached = await storage.readList('cached_clinical_cases');
      return cached.isEmpty ? DemoData.clinicalCases : cached;
    }
  }

  Future<List<dynamic>> leaderboard(String period) async {
    try {
      return _asList((await dio.get('/leaderboard', queryParameters: {'period': period})).data);
    } on DioException {
      return DemoData.leaderboard;
    }
  }

  Future<List<dynamic>> notifications() async {
    try {
      return _asList((await dio.get('/notifications')).data);
    } on DioException {
      return [];
    }
  }

  Future<List<dynamic>> plans() async {
    try {
      final response = await dio.get('/subscriptions/plans');
      await storage.saveJson('cached_plans', response.data);
      return _asList(response.data);
    } on DioException {
      final cached = await storage.readList('cached_plans');
      return cached.isEmpty ? DemoData.plans : cached;
    }
  }

  Future<List<dynamic>> store() async {
    try {
      return _asList((await dio.get('/store')).data);
    } on DioException {
      return [];
    }
  }

  Future<Map<String, dynamic>> studentAnalytics() async {
    try {
      final response = await dio.get('/reports/student-analytics');
      await storage.saveJson('cached_student_analytics', response.data);
      return Map<String, dynamic>.from(response.data);
    } on DioException {
      final cached = await storage.readJson('cached_student_analytics');
      return cached.isEmpty ? DemoData.studentAnalytics : cached;
    }
  }

  Future<Map<String, dynamic>> createCheckout(String planId) async {
    try {
      final response = await dio.post('/payments/checkout', data: {'planId': planId});
      return Map<String, dynamic>.from(response.data);
    } on DioException {
      return {'mode': 'offline', 'message': 'Checkout requires an internet connection or configured backend.'};
    }
  }

  Future<Map<String, dynamic>> submitResult({String? quizId, required int correctAnswers, required int totalQuestions, bool isDailyChallenge = false}) async {
    try {
      final response = await dio.post('/quizzes/submit-result', data: {
        'quizId': quizId,
        'correctAnswers': correctAnswers,
        'totalQuestions': totalQuestions,
        'isDailyChallenge': isDailyChallenge,
      });
      return Map<String, dynamic>.from(response.data);
    } on DioException {
      return {
        'score': (correctAnswers / totalQuestions * 100).round(),
        'correctAnswers': correctAnswers,
        'wrongAnswers': totalQuestions - correctAnswers,
        'xpGained': correctAnswers * 10,
        'coinsGained': correctAnswers * 2,
        'offline': true,
      };
    }
  }

  List<dynamic> _asList(dynamic data) {
    if (data is List) return data;
    if (data is Map && data['data'] is List) return data['data'] as List<dynamic>;
    return [];
  }
}

class DemoData {
  static final questions = List.generate(10, (index) => {
        'id': 'offline-$index',
        'questionText': 'Offline educational question ${index + 1}: choose the best answer.',
        'optionA': 'Option A',
        'optionB': 'Option B',
        'optionC': 'Option C',
        'optionD': 'Option D',
        'correctAnswer': ['A', 'B', 'C', 'D'][index % 4],
        'explanation': 'Offline explanation for revision. Not medical advice.',
        'difficulty': ['EASY', 'MEDIUM', 'HARD'][index % 3],
      });

  static final leaderboard = List.generate(10, (index) => {
        'rank': index + 1,
        'score': 950 - (index * 45),
        'user': {'fullName': 'Demo Student ${index + 1}', 'level': 10 - (index ~/ 2)},
      });

  static final plans = [
    {
      'id': 'offline-free',
      'name': 'Free Plan',
      'price': 0,
      'features': ['Daily challenge', 'Basic leaderboard', 'Offline demo content'],
    },
    {
      'id': 'offline-premium',
      'name': 'Student Premium',
      'price': 9.99,
      'features': ['Unlimited quizzes', 'Premium clinical cases', 'Advanced analytics'],
    },
  ];

  static final studentAnalytics = {
    'student': {
      'fullName': 'Offline Student',
      'level': 3,
      'xp': 1240,
      'coins': 320,
      'streak': 5,
      'totalQuizzes': 18,
      'accuracy': 82,
    },
    'weakCategories': [
      {'category': 'Pharmacology', 'accuracy': 62},
      {'category': 'Pathology', 'accuracy': 70},
    ],
    'byCategory': [
      {'category': 'Cardiology', 'attempts': 5, 'correct': 42, 'total': 50, 'accuracy': 84},
      {'category': 'Pharmacology', 'attempts': 4, 'correct': 25, 'total': 40, 'accuracy': 62},
    ],
    'recentResults': [],
  };

  static final clinicalCases = List.generate(4, (index) => {
        'id': 'offline-case-$index',
        'title': 'Offline Clinical Case ${index + 1}',
        'patientAge': 24 + index,
        'patientGender': index.isEven ? 'MALE' : 'FEMALE',
        'symptoms': 'Educational symptoms placeholder.',
        'history': 'Educational history placeholder.',
        'physicalExam': 'Educational physical exam placeholder.',
        'labResults': 'Lab placeholder',
        'question': 'What is the most likely diagnosis?',
        'optionA': 'Diagnosis A',
        'optionB': 'Diagnosis B',
        'optionC': 'Diagnosis C',
        'optionD': 'Diagnosis D',
        'correctAnswer': 'A',
        'explanation': 'Educational reasoning only.',
        'learningNote': 'Review this topic in course materials.',
        'specialty': 'Internal Medicine',
        'difficulty': 'EASY',
        'isPremium': false,
      });
}
