import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQ } from "@/hooks/useQuizGeneration";

interface Props {
  q: QuizQ;
  index: number;
  total: number;
  selected: number | null;
  onSelect: (i: number) => void;
  reveal?: boolean;
}

export function QuizQuestion({ q, index, total, selected, onSelect, reveal }: Props) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
          Question {index + 1} of {total}
        </p>
        <h3 className="font-display text-lg font-bold leading-snug mt-1">{q.question}</h3>
      </div>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const letter = ["A", "B", "C", "D"][i];
          const isSelected = selected === i;
          const isCorrect = i === q.correctIndex;
          const showCorrect = reveal && isCorrect;
          const showWrong = reveal && isSelected && !isCorrect;

          return (
            <button
              key={i}
              onClick={() => !reveal && onSelect(i)}
              disabled={reveal}
              className={cn(
                "w-full text-left p-3 rounded-xl border-2 flex items-start gap-3 transition-base tap-scale",
                !reveal && isSelected && "border-primary bg-primary/5",
                !reveal && !isSelected && "border-border hover:border-primary/40",
                showCorrect && "border-accent bg-accent-soft/40",
                showWrong && "border-destructive bg-destructive/10",
                reveal && !isCorrect && !isSelected && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                  !reveal && isSelected && "border-primary bg-primary text-primary-foreground",
                  !reveal && !isSelected && "border-border",
                  showCorrect && "border-accent bg-accent text-accent-foreground",
                  showWrong && "border-destructive bg-destructive text-destructive-foreground",
                )}
              >
                {showCorrect ? <Check className="h-3.5 w-3.5" /> : showWrong ? <X className="h-3.5 w-3.5" /> : letter}
              </span>
              <span className="text-sm pt-0.5">{opt}</span>
            </button>
          );
        })}
      </div>

      {reveal && (
        <div className="rounded-xl bg-muted/60 border border-border p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Explanation
          </p>
          <p className="text-xs text-foreground/85 leading-relaxed">{q.explanation}</p>
        </div>
      )}
    </div>
  );
}
