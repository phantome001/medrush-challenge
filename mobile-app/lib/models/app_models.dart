class UserProfile {
  UserProfile({
    required this.id,
    required this.fullName,
    required this.email,
    required this.level,
    required this.xp,
    required this.coins,
    required this.streak,
    required this.bestStreak,
    required this.totalQuizzes,
    required this.totalCorrectAnswers,
    required this.totalWrongAnswers,
    required this.subscriptionStatus,
    this.specialty,
    this.studyYear,
    this.institution,
  });

  final String id;
  final String fullName;
  final String email;
  final int level;
  final int xp;
  final int coins;
  final int streak;
  final int bestStreak;
  final int totalQuizzes;
  final int totalCorrectAnswers;
  final int totalWrongAnswers;
  final String subscriptionStatus;
  final String? specialty;
  final String? studyYear;
  final String? institution;

  double get accuracy {
    final total = totalCorrectAnswers + totalWrongAnswers;
    if (total == 0) return 0;
    return totalCorrectAnswers / total * 100;
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        id: json['id'] ?? '',
        fullName: json['fullName'] ?? 'Student',
        email: json['email'] ?? '',
        level: json['level'] ?? 1,
        xp: json['xp'] ?? 0,
        coins: json['coins'] ?? 0,
        streak: json['streak'] ?? 0,
        bestStreak: json['bestStreak'] ?? 0,
        totalQuizzes: json['totalQuizzes'] ?? 0,
        totalCorrectAnswers: json['totalCorrectAnswers'] ?? 0,
        totalWrongAnswers: json['totalWrongAnswers'] ?? 0,
        subscriptionStatus: json['subscriptionStatus'] ?? 'FREE',
        specialty: json['specialty'],
        studyYear: json['studyYear'],
        institution: json['institution'],
      );
}

class Category {
  Category({required this.id, required this.name, required this.description, required this.color, required this.questionCount});
  final String id;
  final String name;
  final String description;
  final String color;
  final int questionCount;

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        description: json['description'] ?? '',
        color: json['color'] ?? '#2563eb',
        questionCount: json['_count']?['questions'] ?? 0,
      );
}

class Question {
  Question({
    required this.id,
    required this.questionText,
    required this.options,
    required this.correctAnswer,
    required this.explanation,
    required this.difficulty,
    this.imageUrl,
  });

  final String id;
  final String questionText;
  final List<String> options;
  final String correctAnswer;
  final String explanation;
  final String difficulty;
  final String? imageUrl;

  factory Question.fromJson(Map<String, dynamic> json) => Question(
        id: json['id'] ?? '',
        questionText: json['questionText'] ?? '',
        options: [json['optionA'] ?? '', json['optionB'] ?? '', json['optionC'] ?? '', json['optionD'] ?? ''],
        correctAnswer: json['correctAnswer'] ?? 'A',
        explanation: json['explanation'] ?? '',
        difficulty: json['difficulty'] ?? 'EASY',
        imageUrl: json['imageUrl'],
      );
}

class ClinicalCaseItem {
  ClinicalCaseItem({
    required this.id,
    required this.title,
    required this.patientAge,
    required this.patientGender,
    required this.symptoms,
    required this.history,
    required this.physicalExam,
    required this.question,
    required this.options,
    required this.explanation,
    required this.learningNote,
    required this.specialty,
    required this.difficulty,
    required this.isPremium,
    this.labResults,
  });

  final String id;
  final String title;
  final int patientAge;
  final String patientGender;
  final String symptoms;
  final String history;
  final String physicalExam;
  final String? labResults;
  final String question;
  final List<String> options;
  final String explanation;
  final String learningNote;
  final String specialty;
  final String difficulty;
  final bool isPremium;

  factory ClinicalCaseItem.fromJson(Map<String, dynamic> json) => ClinicalCaseItem(
        id: json['id'] ?? '',
        title: json['title'] ?? '',
        patientAge: json['patientAge'] ?? 0,
        patientGender: json['patientGender'] ?? '',
        symptoms: json['symptoms'] ?? '',
        history: json['history'] ?? '',
        physicalExam: json['physicalExam'] ?? '',
        labResults: json['labResults'],
        question: json['question'] ?? '',
        options: [json['optionA'] ?? '', json['optionB'] ?? '', json['optionC'] ?? '', json['optionD'] ?? ''],
        explanation: json['explanation'] ?? '',
        learningNote: json['learningNote'] ?? '',
        specialty: json['specialty'] ?? '',
        difficulty: json['difficulty'] ?? 'EASY',
        isPremium: json['isPremium'] ?? false,
      );
}
