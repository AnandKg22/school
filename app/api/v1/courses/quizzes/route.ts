import { NextResponse } from "next/server";
import { MOCK_QUIZZES } from "@/lib/school-mock";
import { Quiz } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");
    const moduleId = searchParams.get("module_id");
    const quizId = searchParams.get("id");

    if (quizId) {
      const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);
      if (!quiz) {
        return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, quiz });
    }

    let filtered = MOCK_QUIZZES;
    if (courseId) {
      filtered = filtered.filter((q) => q.course_id === courseId);
    }
    if (moduleId) {
      filtered = filtered.filter((q) => q.module_id === moduleId);
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      quizzes: filtered,
    });
  } catch (error: any) {
    console.error("Quizzes GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { course_id, module_id, title, description, questions, points_reward } = body;

    if (!course_id || !title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (course_id, title, questions)" },
        { status: 400 }
      );
    }

    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      course_id,
      module_id: module_id || "mod_01",
      title,
      description: description || "Module comprehension assessment",
      passing_percentage: 80,
      questions,
      points_reward: points_reward || 150,
    };

    MOCK_QUIZZES.push(newQuiz);

    return NextResponse.json({
      success: true,
      quiz: newQuiz,
    });
  } catch (error: any) {
    console.error("Quizzes POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
