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
      className="panel-glow rounded-[28px] p-6 lg:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Въпрос {currentIndex + 1}/{total}
          </p>
          <span className="badge-pink mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold">
            {question.difficulty}
          </span>
        </div>
      </div>

      <h2 className="mt-4 font-display text-[1.55rem] leading-8 text-white lg:text-[1.8rem] lg:leading-9">
        {question.question_text}
      </h2>

      <div className="mt-6 space-y-4">
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
