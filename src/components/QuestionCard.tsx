"use client";

import { motion } from "framer-motion";
import { AnswerOption } from "@/components/AnswerOption";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  total: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  onAnswerSelect: (answer: string) => void;
}

export function QuestionCard({
  question,
  currentIndex,
  total,
  selectedAnswer,
  showFeedback,
  onAnswerSelect,
}: QuestionCardProps) {
  return (
    <motion.article
      key={question.id}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="panel-glow rounded-[30px] p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          Въпрос {currentIndex + 1}/{total}
        </p>
        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-fuchsia-300">
          {question.difficulty}
        </span>
      </div>
      <h2 className="mt-4 font-display text-2xl leading-8 text-white">
        {question.question_text}
      </h2>
      <div className="mt-5 space-y-3">
        {question.options.map((option) => (
          <AnswerOption
            key={option.id}
            optionId={option.id}
            optionText={option.text}
            isSelected={selectedAnswer === option.text}
            isCorrect={question.correct_answer === option.text}
            showFeedback={showFeedback}
            onClick={() => onAnswerSelect(option.text)}
          />
        ))}
      </div>
    </motion.article>
  );
}
