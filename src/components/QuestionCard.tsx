"use client";

import { motion } from "framer-motion";
import { AnswerOption } from "@/components/AnswerOption";
import { Badge } from "@/components/ui/Badge";
import { NeonCard } from "@/components/ui/NeonCard";
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
    >
      <NeonCard as="article" padding="md" className="lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mh-label">Въпрос {currentIndex + 1}/{total}</p>
            <Badge tone="purple" className="mt-3">
              {question.difficulty}
            </Badge>
          </div>
        </div>

        <h2 className="mt-5 font-display text-[1.7rem] leading-8 text-white lg:text-[2rem] lg:leading-10">
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
      </NeonCard>
    </motion.article>
  );
}
