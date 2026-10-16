"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  GraduationCap,
} from "lucide-react";
import { Quiz } from "../lib/types";

interface QuizModalProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
  onPassed?: (quizId: string, score: number) => void;
  onClaimCertificate?: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onPassed,
  onClaimCertificate,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !quiz) return null;

  const currentQ = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentIdx === totalQuestions - 1;

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  // Score calculation
  let correctCount = 0;
  quiz.questions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correct_index) {
      correctCount++;
    }
  });
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = scorePercentage >= quiz.passing_percentage;

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (isPassed && onPassed) {
      onPassed(quiz.id, scorePercentage);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
  };

  const allAnswered = quiz.questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Academy Assessment
              </span>
              <h3 className="text-base font-bold text-slate-100 line-clamp-1">
                {quiz.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 transition-all duration-300"
            style={{
              width: `${((currentIdx + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isSubmitted ? (
            <>
              {/* Question Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>
                    Question {currentIdx + 1} of {totalQuestions}
                  </span>
                  <span className="text-indigo-400">
                    Pass criteria: {quiz.passing_percentage}%
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-slate-100 leading-snug">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 text-sm ${
                        isSelected
                          ? "bg-indigo-600/15 border-indigo-500 text-indigo-200 shadow-sm shadow-indigo-500/10"
                          : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/30"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-400 text-white"
                            : "border-slate-700 text-slate-400"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Results View */
            <div className="space-y-6 animate-in fade-in duration-200">
              <div
                className={`p-6 rounded-3xl border text-center ${
                  isPassed
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                <div className="inline-flex p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-3">
                  {isPassed ? (
                    <Trophy className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <RotateCcw className="w-8 h-8 text-rose-400" />
                  )}
                </div>
                <h4 className="text-2xl font-bold mb-1">
                  {isPassed ? "Assessment Passed!" : "Assessment Failed"}
                </h4>
                <p className="text-sm opacity-90 max-w-md mx-auto">
                  {isPassed
                    ? `Congratulations! You scored ${scorePercentage}% (Threshold: ${quiz.passing_percentage}%). You have earned +${quiz.points_reward} reputation points!`
                    : `You scored ${scorePercentage}%, but this module requires ${quiz.passing_percentage}% to pass. Review the explanations below and try again.`}
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Question Breakdown & Explanations
                </h5>
                {quiz.questions.map((q, idx) => {
                  const userChoice = selectedAnswers[q.id];
                  const wasCorrect = userChoice === q.correct_index;
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-200 text-sm">
                          {idx + 1}. {q.question}
                        </span>
                        {wasCorrect ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-semibold shrink-0">
                            <XCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400">
                        <strong className="text-slate-300">Correct Answer:</strong>{" "}
                        {q.options[q.correct_index]}
                      </p>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-start gap-2">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          {!isSubmitted ? (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {isLastQuestion ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-tight shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Submit Assessment
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs transition-all"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Quiz
              </button>

              <div className="flex items-center gap-2">
                {isPassed && onClaimCertificate && (
                  <button
                    onClick={onClaimCertificate}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Claim Certificate
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
