import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface QuizQ {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function useQuizGeneration() {
  const [questions, setQuestions] = useState<QuizQ[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildFallbackQuiz = (topic: string): QuizQ[] => {
    const cleanTopic = topic.replace(/\s*\([^)]*\)\s*/g, "").trim() || "this topic";
    const topicKey = cleanTopic.toLowerCase();

    const quizBank: Record<string, QuizQ[]> = {
      "master git & github": [
        {
          question: "Which Git command is used to create a new branch and switch to it immediately?",
          options: ["git branch -d feature", "git checkout -b feature", "git merge feature", "git status -b feature"],
          correctIndex: 1,
          explanation: "git checkout -b feature creates the branch and checks it out in one step.",
        },
        {
          question: "What is the main purpose of a pull request on GitHub?",
          options: ["Delete unused branches automatically", "Review and discuss code before merging", "Install project dependencies", "Reset the repository history"],
          correctIndex: 1,
          explanation: "Pull requests let teammates review, comment on, test, and approve code before it is merged.",
        },
        {
          question: "What does git status help you check?",
          options: ["Your staged, unstaged, and untracked changes", "The speed of your internet connection", "The number of GitHub followers", "The license price of Git"],
          correctIndex: 0,
          explanation: "git status shows the current working tree state, including staged and unstaged changes.",
        },
      ],
      "javascript fundamentals": [
        {
          question: "Which keyword declares a block-scoped variable in JavaScript?",
          options: ["var", "let", "def", "scope"],
          correctIndex: 1,
          explanation: "let and const are block-scoped; var is function-scoped.",
        },
        {
          question: "What is the result of calling a function argument named callback?",
          options: ["It reloads the page", "It executes a function passed into another function", "It converts JSON to CSS", "It creates a database table"],
          correctIndex: 1,
          explanation: "A callback is a function passed as an argument and executed later by another function.",
        },
        {
          question: "Which method converts a JSON string into a JavaScript object?",
          options: ["JSON.parse()", "JSON.stringify()", "Object.toJSON()", "parse.Object()"],
          correctIndex: 0,
          explanation: "JSON.parse() reads a JSON string and returns the matching JavaScript value or object.",
        },
      ],
      "build a personal portfolio site": [
        {
          question: "What should a strong developer portfolio show first?",
          options: ["Only a long biography", "Clear projects with live links and outcomes", "Hidden contact information", "Random animations without context"],
          correctIndex: 1,
          explanation: "Recruiters and engineers need to quickly see what you built, how it works, and why it matters.",
        },
        {
          question: "Why is responsive design important for a portfolio?",
          options: ["It makes the site work well on phones and desktops", "It removes all images", "It blocks search engines", "It prevents deployment"],
          correctIndex: 0,
          explanation: "A portfolio may be opened on any device, so layout and readability must adapt.",
        },
        {
          question: "Which item is most useful to include for each project?",
          options: ["A live demo or repository link", "Only the project color palette", "A private password", "Unrelated screenshots"],
          correctIndex: 0,
          explanation: "Live demos and repositories let reviewers verify your work and technical ability.",
        },
      ],
      "data structures & algorithms": [
        {
          question: "Which data structure follows Last In, First Out behavior?",
          options: ["Queue", "Stack", "Graph", "Hash map"],
          correctIndex: 1,
          explanation: "A stack removes the most recently added item first, like a pile of plates.",
        },
        {
          question: "What does Big O notation describe?",
          options: ["Code color theme", "How runtime or memory grows with input size", "The number of files in a project", "Git branch names"],
          correctIndex: 1,
          explanation: "Big O explains how an algorithm scales as the input becomes larger.",
        },
        {
          question: "Which structure is commonly used for fast key-value lookup?",
          options: ["Hash map", "Plain queue only", "Call stack", "CSS grid"],
          correctIndex: 0,
          explanation: "Hash maps provide average-case constant-time lookup by key.",
        },
      ],
      "react framework deep dive": [
        {
          question: "What is React state used for?",
          options: ["Managing data that can change and re-render UI", "Writing SQL migrations", "Compressing images", "Changing Git history"],
          correctIndex: 0,
          explanation: "State stores changing UI data; React re-renders when state updates.",
        },
        {
          question: "Which hook runs side effects after render?",
          options: ["useMemo", "useEffect", "useId", "useRefOnly"],
          correctIndex: 1,
          explanation: "useEffect is used for side effects like fetching data, subscriptions, or syncing external state.",
        },
        {
          question: "Why should list items in React have stable keys?",
          options: ["To help React identify changed items efficiently", "To make text uppercase", "To disable events", "To create CSS variables"],
          correctIndex: 0,
          explanation: "Stable keys help React match list items across renders and avoid incorrect UI updates.",
        },
      ],
    };

    const matchedKey = Object.keys(quizBank).find((key) => topicKey.includes(key));
    if (matchedKey) return quizBank[matchedKey];

    return [
      {
        question: `What is the best way to show real understanding of ${cleanTopic}?`,
        options: [
          "Memorize definitions without practicing",
          "Complete a small hands-on task and explain what happened",
          "Skip examples and only read summaries",
          "Move to the next topic without review",
        ],
        correctIndex: 1,
        explanation: "Real understanding is proven by applying the idea in practice and explaining the result clearly.",
      },
      {
        question: `When learning ${cleanTopic}, what should you focus on first?`,
        options: [
          "The core concept and why it is used",
          "Advanced edge cases before basics",
          "Unrelated tools from another topic",
          "Only the final answer, not the process",
        ],
        correctIndex: 0,
        explanation: "Starting with the core purpose makes the rest of the topic easier to understand and apply.",
      },
      {
        question: `If you make a mistake while working on ${cleanTopic}, what is the strongest next step?`,
        options: [
          "Ignore the mistake and continue",
          "Guess randomly until it works",
          "Break the problem down, test a small example, and review the concept",
          "Stop practicing the topic completely",
        ],
        correctIndex: 2,
        explanation: "Debugging with a smaller example helps you find the exact gap and turn the mistake into learning.",
      },
    ];
  };

  const generate = useCallback(async (topic: string) => {
    setLoading(true);
    setError(null);
    setQuestions(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { topic },
      });
      if (error) throw error;
      if (!data?.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid quiz response");
      }
      setQuestions(data.questions as QuizQ[]);
    } catch (e) {
      console.warn("AI quiz generation failed, using fallback quiz:", e);
      setQuestions(buildFallbackQuiz(topic));
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setQuestions(null);
    setError(null);
    setLoading(false);
  }, []);

  return { questions, loading, error, generate, reset };
}
