import { CheckCircle2, XCircle, RotateCw } from "lucide-react";
import type { QuizQ } from "@/hooks/useQuizGeneration";
import { QuizQuestion } from "./QuizQuestion";

interface Props {
  passed: boolean;
  score: number;
  total: number;
  questions: QuizQ[];
  answers: number[];
  onRetry: () => void;
}

export function QuizResult({ passed, score, total, questions, answers, onRetry }: Props) {
  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center py-2">
        {passed ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-accent-soft flex items-center justify-center mb-3">
              <CheckCircle2 className="h-9 w-9 text-accent" />
            </div>
            <h3 className="font-display text-xl font-bold">Well done!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You scored {score}/{total}. Topic marked as complete.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <XCircle className="h-9 w-9 text-destructive" />
            </div>
            <h3 className="font-display text-xl font-bold">Not quite!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You scored {score}/{total}. Review the topic and try again.
            </p>
          </>
        )}
      </div>

      {!passed && (
        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
          {questions.map((q, i) => (
            <QuizQuestion
              key={i}
              q={q}
              index={i}
              total={questions.length}
              selected={answers[i] ?? null}
              onSelect={() => {}}
              reveal
            />
          ))}
        </div>
      )}

      {!passed && (
        <button
          onClick={onRetry}
          className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-semibold shadow-glow tap-scale flex items-center justify-center gap-2"
        >
          <RotateCw className="h-4 w-4" /> Try again with new questions
        </button>
      )}
    </div>
  );
}
