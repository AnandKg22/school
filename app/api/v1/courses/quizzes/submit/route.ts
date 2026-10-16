import { NextResponse } from "next/server";
import { MOCK_QUIZZES, MOCK_CERTIFICATES, MOCK_MEMBERS } from "@/lib/school-mock";
import { QuizSubmission, Certificate } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quiz_id, member_id, submitted_answers } = body;

    if (!quiz_id || !member_id || !submitted_answers) {
      return NextResponse.json(
        { success: false, error: "quiz_id, member_id, and submitted_answers are required" },
        { status: 400 }
      );
    }

    const quiz = MOCK_QUIZZES.find((q) => q.id === quiz_id);
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Evaluate answers
    let correctCount = 0;
    const questionResults = quiz.questions.map((q) => {
      const selected = submitted_answers[q.id];
      const isCorrect = selected === q.correct_index;
      if (isCorrect) correctCount++;
      return {
        question_id: q.id,
        selected_index: selected,
        correct_index: q.correct_index,
        is_correct: isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= (quiz.passing_percentage || 80);

    const submission: QuizSubmission = {
      id: `sub_${Date.now()}`,
      quiz_id,
      member_id,
      score,
      passed,
      submitted_answers,
      created_at: new Date().toISOString(),
    };

    // Update member points if passed
    let pointsAwarded = 0;
    if (passed) {
      pointsAwarded = quiz.points_reward;
      const mem = MOCK_MEMBERS.find((m) => m.id === member_id);
      if (mem) {
        mem.points += pointsAwarded;
      }
    }

    // Generate or fetch certificate if passed with high score
    let certificate: Certificate | null = null;
    if (passed) {
      const existingCert = Object.values(MOCK_CERTIFICATES).find(
        (c) => c.course_id === quiz.course_id && c.member_id === member_id
      );

      if (existingCert) {
        certificate = existingCert;
      } else {
        const mem = MOCK_MEMBERS.find((m) => m.id === member_id);
        const certId = `cert_${Date.now()}`;
        const newCert: Certificate = {
          id: certId,
          course_id: quiz.course_id,
          course_title: quiz.title.replace("Quiz: ", "").replace(" Assessment", "") + " Mastery",
          member_id,
          recipient_name: mem?.full_name || "Autonomous AI Engineer",
          recipient_avatar: mem?.avatar_url,
          certificate_number: `CERT-AK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          issued_at: new Date().toISOString(),
          verification_hash: Array.from({ length: 24 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join(""),
          grade_percentage: score,
          instructor_name: "AKSchool Technical Advisory Board",
        };
        MOCK_CERTIFICATES[certId] = newCert;
        certificate = newCert;
      }
    }

    return NextResponse.json({
      success: true,
      submission,
      score,
      passed,
      points_awarded: pointsAwarded,
      question_results: questionResults,
      certificate,
    });
  } catch (error: any) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process quiz submission" },
      { status: 500 }
    );
  }
}
