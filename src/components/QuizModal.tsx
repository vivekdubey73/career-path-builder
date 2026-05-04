import { useEffect, useMemo, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useQuizGeneration } from "@/hooks/useQuizGeneration";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResult } from "./QuizResult";
import { toast } from "sonner";

interface QuizModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  topic: string;
  onPassed: () => Promise<void> | void;
  passingScore?: number;
}

export function QuizModal({ open, onOpenChange, topic, onPassed, passingScore = 2 }: QuizModalProps) {
  const { questions, loading, error, generate, reset } = useQuizGeneration();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generate when opened
  useEffect(() => {
    if (open && !questions && !loading && !error) {
      generate(topic);
    }
    if (!open) {
      // reset on close
      reset();
      setCurrent(0);
      setAnswers([]);
      setSelected(null);
      setSubmitted(false);
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const total = questions?.length ?? 0;
  const isLast = current === total - 1;
  const progress = useMemo(() => (total ? ((current + (selected !== null ? 1 : 0)) / total) * 100 : 0), [current, selected, total]);

  const score = useMemo(() => {
    if (!questions || !submitted) return 0;
    return questions.reduce((a, q, i) => a + (answers[i] === q.correctIndex ? 1 : 0), 0);
  }, [questions, answers, submitted]);

  const passed = submitted && score >= passingScore;

  // After passing, run onPassed and auto-close
  useEffect(() => {
    if (!passed) return;
    let cancelled = false;
    (async () => {
      try {
        setSaving(true);
        await onPassed();
        if (cancelled) return;
        setTimeout(() => onOpenChange(false), 2000);
      } catch (e) {
        toast.error("Failed to mark complete. Please try again.");
      } finally {
        if (!cancelled) setSaving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passed]);

  const handleNext = () => {
    if (selected === null || !questions) return;
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    if (isLast) {
      setSubmitted(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const handleRetry = () => {
    reset();
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setSubmitted(false);
    generate(topic);
  };

  const handleRetryFetch = () => {
    reset();
    generate(topic);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden bg-card rounded-3xl border-border [&>button.absolute]:hidden"
      >
        <DialogTitle className="sr-only">Quick Quiz</DialogTitle>
        <DialogDescription className="sr-only">
          Answer the questions correctly to mark this roadmap step as complete.
        </DialogDescription>
        {/* Header with progress */}
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-display text-sm font-bold">Quick Quiz</span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center tap-scale"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {questions && !submitted && (
            <>
              <Progress value={progress} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {current + 1} / {total}
              </p>
            </>
          )}
        </div>

        <div className="px-5 py-5 min-h-[260px]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Generating quiz for this topic...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-semibold mb-1">Could not generate quiz.</p>
              <p className="text-xs text-muted-foreground mb-4">{error}</p>
              <button
                onClick={handleRetryFetch}
                className="h-10 px-5 rounded-full bg-gradient-primary text-primary-foreground font-semibold tap-scale"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && questions && !submitted && (
            <QuizQuestion
              q={questions[current]}
              index={current}
              total={total}
              selected={selected}
              onSelect={setSelected}
            />
          )}

          {!loading && !error && questions && submitted && (
            <QuizResult
              passed={passed}
              score={score}
              total={total}
              questions={questions}
              answers={answers}
              onRetry={handleRetry}
            />
          )}
        </div>

        {!loading && !error && questions && !submitted && (
          <div className="px-5 pb-5">
            <button
              onClick={handleNext}
              disabled={selected === null}
              className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-semibold shadow-glow tap-scale disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isLast ? "Submit Quiz" : "Next"}
            </button>
          </div>
        )}

        {saving && (
          <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
