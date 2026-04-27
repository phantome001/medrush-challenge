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
      return (await dio.get('/clinical-cases')).data;
    } on DioException {
      return DemoData.clinicalCases;
    }
  }

  Future<List<dynamic>> leaderboard(String period) async => (await dio.get('/leaderboard', queryParameters: {'period': period})).data;

  Future<List<dynamic>> notifications() async => (await dio.get('/notifications')).data;

  Future<List<dynamic>> plans() async => (await dio.get('/subscriptions/plans')).data;

  Future<List<dynamic>> store() async => (await dio.get('/store')).data;

  Future<Map<String, dynamic>> submitResult({String? quizId, required int correctAnswers, required int totalQuestions, bool isDailyChallenge = false}) async {
    final response = await dio.post('/quizzes/submit-result', data: {
      'quizId': quizId,
      'correctAnswers': correctAnswers,
      'totalQuestions': totalQuestions,
      'isDailyChallenge': isDailyChallenge,
    });
    return response.data;
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
