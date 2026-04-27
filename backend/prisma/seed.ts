import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const categories = [
  "Anatomy",
  "Physiology",
  "Pathology",
  "Pharmacology",
  "Microbiology",
  "First Aid",
  "Clinical Cases",
  "Surgery",
  "Internal Medicine",
  "Pediatrics",
  "Gynecology"
];

const badgeSeeds = [
  ["First Quiz Completed", "Complete your first quiz", "first_quiz"],
  ["10 Quizzes Completed", "Complete 10 quizzes", "ten_quizzes"],
  ["100 Correct Answers", "Answer 100 questions correctly", "hundred_correct"],
  ["7-Day Streak", "Keep learning for 7 days", "seven_streak"],
  ["30-Day Streak", "Keep learning for 30 days", "thirty_streak"],
  ["Anatomy Master", "Show anatomy excellence", "anatomy_master"],
  ["Clinical Thinker", "Practice clinical reasoning", "clinical_thinker"],
  ["First Aid Hero", "Master first aid basics", "first_aid_hero"],
  ["Diagnosis Hero", "Solve diagnosis challenges", "clinical_thinker"],
  ["Top 10 Student", "Reach top leaderboard ranks", "hundred_correct"]
];

const medicalQuestionBank = [
  {
    category: "Anatomy",
    question: "Which chamber pumps blood into the pulmonary artery?",
    options: ["Right ventricle", "Left ventricle", "Right atrium", "Left atrium"],
    correct: "A",
    explanation: "The right ventricle pumps deoxygenated blood through the pulmonary artery to the lungs."
  },
  {
    category: "Physiology",
    question: "Which hormone lowers blood glucose by increasing cellular uptake?",
    options: ["Glucagon", "Cortisol", "Insulin", "Aldosterone"],
    correct: "C",
    explanation: "Insulin promotes glucose uptake and storage, lowering blood glucose in educational physiology contexts."
  },
  {
    category: "Pathology",
    question: "Which process best describes programmed cell death?",
    options: ["Necrosis", "Apoptosis", "Hyperplasia", "Metaplasia"],
    correct: "B",
    explanation: "Apoptosis is regulated programmed cell death with minimal inflammation."
  },
  {
    category: "Pharmacology",
    question: "Which class of drugs blocks beta-adrenergic receptors?",
    options: ["ACE inhibitors", "Beta blockers", "Calcium supplements", "Antihistamines"],
    correct: "B",
    explanation: "Beta blockers antagonize beta-adrenergic receptors and are studied in cardiovascular pharmacology."
  },
  {
    category: "Microbiology",
    question: "Which organism is classically associated with acid-fast staining?",
    options: ["Staphylococcus aureus", "Mycobacterium tuberculosis", "Candida albicans", "Escherichia coli"],
    correct: "B",
    explanation: "Mycobacteria have mycolic acid-rich cell walls and are acid-fast organisms."
  },
  {
    category: "First Aid",
    question: "In basic life support training, what should be checked first before CPR?",
    options: ["Scene safety", "Blood glucose", "Medication list", "Family history"],
    correct: "A",
    explanation: "Educational first aid algorithms begin with scene safety before assessment."
  }
];

const clinicalCaseSeeds = [
  {
    title: "Chest pain after exertion",
    patientAge: 58,
    patientGender: "MALE" as const,
    symptoms: "Pressure-like chest discomfort during exertion with shortness of breath.",
    history: "Hypertension and smoking history in an educational vignette.",
    physicalExam: "Stable vital signs, no focal neurological deficit.",
    labResults: "ECG and troponin placeholders for class discussion.",
    question: "What is the most likely educational diagnosis pattern?",
    optionA: "Stable angina pattern",
    optionB: "Migraine",
    optionC: "Otitis media",
    optionD: "Appendicitis",
    correctAnswer: "A",
    explanation: "Exertional pressure-like discomfort is a classic educational pattern for stable angina.",
    learningNote: "Review coronary circulation, risk factors, and emergency red flags.",
    specialty: "Internal Medicine"
  },
  {
    title: "Child with barking cough",
    patientAge: 4,
    patientGender: "FEMALE" as const,
    symptoms: "Barking cough and mild inspiratory stridor in a pediatric scenario.",
    history: "Recent viral upper respiratory symptoms.",
    physicalExam: "Mild respiratory distress without cyanosis in this educational case.",
    labResults: "Imaging placeholder.",
    question: "Which condition best fits this teaching vignette?",
    optionA: "Croup pattern",
    optionB: "Renal colic",
    optionC: "Gout",
    optionD: "Cataract",
    correctAnswer: "A",
    explanation: "Barking cough with stridor is a classic croup teaching pattern.",
    learningNote: "Review pediatric airway assessment and escalation triggers.",
    specialty: "Pediatrics"
  },
  {
    title: "Right lower quadrant pain",
    patientAge: 22,
    patientGender: "OTHER" as const,
    symptoms: "Migratory abdominal pain with nausea in an educational case.",
    history: "No prior abdominal surgery.",
    physicalExam: "Localized right lower quadrant tenderness in the vignette.",
    labResults: "CBC placeholder.",
    question: "Which diagnosis is most consistent for revision?",
    optionA: "Appendicitis pattern",
    optionB: "Tension headache",
    optionC: "Asthma",
    optionD: "Otitis externa",
    correctAnswer: "A",
    explanation: "Migratory abdominal pain and RLQ tenderness is a classic appendicitis learning pattern.",
    learningNote: "Review abdominal pain differentials and urgent referral principles.",
    specialty: "Surgery"
  }
];

async function main() {
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.quizResult.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.clinicalCase.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.subscriptionPlan.deleteMany();

  const [freePlan, premiumPlan, institutionPlan] = await Promise.all([
    prisma.subscriptionPlan.create({
      data: {
        name: "Free",
        price: 0,
        durationDays: 30,
        maxStudents: 50,
        maxTeachers: 1,
        features: ["Limited daily challenges", "Limited categories", "Basic leaderboard"]
      }
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: "Student Premium",
        price: 9.99,
        durationDays: 30,
        maxStudents: 1,
        maxTeachers: 0,
        features: ["Unlimited quizzes", "Premium clinical cases", "Advanced analytics", "No ads"]
      }
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: "Institution Pro",
        price: 499,
        durationDays: 365,
        maxStudents: 1000,
        maxTeachers: 100,
        features: ["Admin dashboard", "Teacher accounts", "Student management", "Private leaderboard", "Custom branding"]
      }
    })
  ]);

  const institutionA = await prisma.institution.create({
    data: {
      name: "MedRush University",
      email: "admin@medrush-university.edu",
      phone: "+10000000001",
      country: "United States",
      city: "Boston",
      address: "100 Learning Ave",
      institutionCode: "MEDU-2026",
      subscriptionPlanId: institutionPlan.id,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxStudents: 1000,
      maxTeachers: 100,
      primaryColor: "#2563eb",
      secondaryColor: "#10b981"
    }
  });

  const institutionB = await prisma.institution.create({
    data: {
      name: "Global Health Academy",
      email: "hello@globalhealth.edu",
      phone: "+10000000002",
      country: "France",
      city: "Paris",
      institutionCode: "GHAC-2026",
      subscriptionPlanId: freePlan.id,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      maxStudents: 200,
      maxTeachers: 20,
      primaryColor: "#0ea5e9",
      secondaryColor: "#22c55e"
    }
  });

  await prisma.user.create({
    data: {
      fullName: "MedRush Super Admin",
      email: "admin@medrush.com",
      passwordHash: await hashPassword("Admin123456"),
      role: Role.SUPER_ADMIN,
      subscriptionStatus: "ACTIVE"
    }
  });

  const teacher = await prisma.user.create({
    data: {
      fullName: "Dr. Sarah Teacher",
      email: "teacher@medrush.com",
      passwordHash: await hashPassword("Teacher123456"),
      role: Role.TEACHER,
      institutionId: institutionA.id,
      specialty: "Medicine",
      subscriptionStatus: "ACTIVE"
    }
  });

  for (let i = 2; i <= 3; i += 1) {
    await prisma.user.create({
      data: {
        fullName: `Teacher ${i}`,
        email: `teacher${i}@medrush.com`,
        passwordHash: await hashPassword("Teacher123456"),
        role: Role.TEACHER,
        institutionId: i % 2 === 0 ? institutionA.id : institutionB.id,
        specialty: i % 2 === 0 ? "Pharmacy" : "Nursing",
        subscriptionStatus: "ACTIVE"
      }
    });
  }

  await prisma.user.create({
    data: {
      fullName: "Test Student",
      email: "student@medrush.com",
      passwordHash: await hashPassword("Student123456"),
      role: Role.STUDENT,
      institutionId: institutionA.id,
      specialty: "Medicine",
      studyYear: "Third year",
      xp: 840,
      level: 2,
      coins: 140,
      streak: 6,
      bestStreak: 9,
      totalCorrectAnswers: 82,
      totalWrongAnswers: 18,
      totalQuizzes: 12,
      subscriptionStatus: "ACTIVE"
    }
  });

  for (let i = 2; i <= 20; i += 1) {
    await prisma.user.create({
      data: {
        fullName: `Student ${i}`,
        email: `student${i}@medrush.com`,
        passwordHash: await hashPassword("Student123456"),
        role: Role.STUDENT,
        institutionId: i % 2 === 0 ? institutionA.id : institutionB.id,
        specialty: ["Medicine", "Pharmacy", "Dentistry", "Nursing"][i % 4],
        studyYear: ["First year", "Second year", "Third year", "Fourth year", "Fifth year", "Sixth year", "Resident"][i % 7],
        xp: i * 120,
        level: Math.max(1, Math.floor(i / 4)),
        coins: i * 8,
        streak: i % 9,
        bestStreak: i % 12,
        totalCorrectAnswers: i * 7,
        totalWrongAnswers: i,
        totalQuizzes: i,
        subscriptionStatus: i % 3 === 0 ? "ACTIVE" : "FREE"
      }
    });
  }

  const categoryRecords = [];
  for (const [index, name] of categories.entries()) {
    categoryRecords.push(
      await prisma.category.create({
        data: {
          name,
          description: `${name} educational revision questions`,
          icon: name.toLowerCase().replaceAll(" ", "-"),
          color: ["#2563eb", "#10b981", "#8b5cf6", "#f97316"][index % 4]
        }
      })
    );
  }

  const quizzes = [];
  for (let i = 0; i < 10; i += 1) {
    quizzes.push(
      await prisma.quiz.create({
        data: {
          title: `${categoryRecords[i].name} Rush Quiz`,
          description: `Fast revision challenge for ${categoryRecords[i].name}`,
          categoryId: categoryRecords[i].id,
          institutionId: i % 3 === 0 ? institutionA.id : null,
          difficulty: ["EASY", "MEDIUM", "HARD"][i % 3] as "EASY" | "MEDIUM" | "HARD",
          isPremium: i % 4 === 0,
          timeLimit: 60,
          status: "PUBLISHED",
          createdBy: teacher.id
        }
      })
    );
  }

  for (let i = 1; i <= 100; i += 1) {
    const category = categoryRecords[i % categoryRecords.length];
    const quiz = quizzes[i % quizzes.length];
    const bankItem = medicalQuestionBank.find((item) => item.category === category.name) ?? medicalQuestionBank[i % medicalQuestionBank.length];
    await prisma.question.create({
      data: {
        quizId: quiz.id,
        categoryId: category.id,
        questionText: `${bankItem.question} (${category.name} review ${i})`,
        optionA: bankItem.options[0],
        optionB: bankItem.options[1],
        optionC: bankItem.options[2],
        optionD: bankItem.options[3],
        correctAnswer: bankItem.correct,
        explanation: `${bankItem.explanation} This is for education only, not clinical advice.`,
        difficulty: ["EASY", "MEDIUM", "HARD"][i % 3] as "EASY" | "MEDIUM" | "HARD",
        isPremium: i % 5 === 0,
        tags: [category.name.toLowerCase(), "revision"]
      }
    });
  }

  for (let i = 1; i <= 30; i += 1) {
    const seedCase = clinicalCaseSeeds[i % clinicalCaseSeeds.length];
    await prisma.clinicalCase.create({
      data: {
        title: `${seedCase.title} #${i}`,
        patientAge: seedCase.patientAge,
        patientGender: seedCase.patientGender,
        symptoms: seedCase.symptoms,
        history: seedCase.history,
        physicalExam: seedCase.physicalExam,
        labResults: seedCase.labResults,
        question: seedCase.question,
        optionA: seedCase.optionA,
        optionB: seedCase.optionB,
        optionC: seedCase.optionC,
        optionD: seedCase.optionD,
        correctAnswer: seedCase.correctAnswer,
        explanation: `${seedCase.explanation} Not medical advice.`,
        learningNote: seedCase.learningNote,
        specialty: seedCase.specialty,
        difficulty: ["EASY", "MEDIUM", "HARD"][i % 3] as "EASY" | "MEDIUM" | "HARD",
        isPremium: i % 4 === 0,
        institutionId: i % 3 === 0 ? institutionA.id : null,
        createdBy: teacher.id
      }
    });
  }

  for (const [name, description, condition] of badgeSeeds) {
    await prisma.badge.create({ data: { name, description, icon: name.toLowerCase().replaceAll(" ", "-"), condition } });
  }

  await prisma.payment.create({
    data: {
      institutionId: institutionA.id,
      amount: 499,
      method: "Manual bank transfer",
      status: "PAID",
      transactionReference: "MR-DEMO-001",
      notes: "Seed payment"
    }
  });

  await prisma.institution.update({ where: { id: institutionA.id }, data: { subscriptionPlanId: premiumPlan.id } });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
