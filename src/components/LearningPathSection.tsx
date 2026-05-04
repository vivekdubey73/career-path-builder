import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TARGET_ROLES = [
  "Machine Learning Engineer",
  "Web Developer",
  "Data Scientist",
  "DevOps / Cloud Engineer",
  "Android Developer",
  "Full Stack Developer",
  "AI/ML Researcher",
];

const EXPERIENCE_LEVELS = [
  "Beginner (0–1 years)",
  "Intermediate (1–3 years)",
  "Advanced (3+ years)",
];

interface Phase {
  title: string;
  icon: string;
  items: string[];
}

const ML_PATH: Phase[] = [
  {
    title: "Phase 1 — Foundations (4 weeks)",
    icon: "✅",
    items: [
      "Python Programming Basics",
      "Linear Algebra & Statistics",
      "Data Manipulation with Pandas & NumPy",
    ],
  },
  {
    title: "Phase 2 — Core ML (6 weeks)",
    icon: "📘",
    items: [
      "Supervised Learning (Regression, Classification)",
      "Unsupervised Learning (Clustering, PCA)",
      "Model Evaluation & Hyperparameter Tuning",
    ],
  },
  {
    title: "Phase 3 — Advanced Topics (6 weeks)",
    icon: "🔬",
    items: [
      "Deep Learning with TensorFlow / PyTorch",
      "Natural Language Processing (NLP)",
      "Computer Vision Fundamentals",
    ],
  },
  {
    title: "Phase 4 — Industry Ready (4 weeks)",
    icon: "🚀",
    items: [
      "Build 2 end-to-end ML projects",
      "Practice on Kaggle",
      "Prepare ML interview questions",
    ],
  },
];

const WEB_DEV_PATH: Phase[] = [
  {
    title: "Phase 1 — Foundations (3 weeks)",
    icon: "✅",
    items: [
      "HTML5, CSS3, Responsive Design",
      "JavaScript ES6+ Fundamentals",
      "Git & Version Control",
    ],
  },
  {
    title: "Phase 2 — Frontend (5 weeks)",
    icon: "📘",
    items: [
      "React.js & Component Architecture",
      "State Management (Redux / Context API)",
      "REST API Integration & Fetch/Axios",
    ],
  },
  {
    title: "Phase 3 — Backend (5 weeks)",
    icon: "🔬",
    items: [
      "Node.js & Express.js",
      "Databases: MySQL & MongoDB",
      "Authentication (JWT, OAuth)",
    ],
  },
  {
    title: "Phase 4 — Industry Ready (3 weeks)",
    icon: "🚀",
    items: [
      "Deploy a full stack project on Vercel/Railway",
      "Build a portfolio with 3 projects",
      "Prepare frontend interview questions",
    ],
  },
];

const RESOURCES = [
  {
    icon: "📹",
    title: "Video Courses",
    description: "Curated from YouTube, Coursera & NPTEL",
    tag: "Free",
    to: null,
  },
  {
    icon: "📄",
    title: "Practice Problems",
    description: "Linked directly to your Coding Lab",
    tag: "Built-in",
    to: "/coding-lab",
  },
  {
    icon: "📚",
    title: "Reading Materials",
    description: "Docs, blogs, and cheatsheets per topic",
    tag: "Free",
    to: null,
  },
  {
    icon: "🏆",
    title: "Mock Interviews",
    description: "Role-specific interview question bank",
    tag: "Coming Soon",
    to: null,
  },
];

export function LearningPathSection() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    if (!targetRole) return;
    setShowResult(true);
  };

  const getPath = (): Phase[] | null => {
    if (targetRole === "Machine Learning Engineer") return ML_PATH;
    if (targetRole === "Web Developer") return WEB_DEV_PATH;
    return null;
  };

  const path = getPath();

  return (
    <div className="mt-10">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
          Get Learning Path
        </p>
        <h2 className="font-display text-2xl font-bold mt-1">
          Generate Your Personalized Learning Path
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your skills and target role to get a step-by-step roadmap.
        </p>
      </div>

      {/* Skill Input Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="current-skills" className="text-sm font-semibold">
              Your Current Skills
            </Label>
            <Input
              id="current-skills"
              placeholder="e.g. Python, SQL, Machine Learning..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="target-role" className="text-sm font-semibold">
              Your Target Role
            </Label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="experience-level" className="text-sm font-semibold">
              Experience Level
            </Label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!targetRole}
            className="rounded-full px-8 h-12 shadow-glow w-full sm:w-auto"
          >
            Generate My Learning Path
          </Button>
        </div>
      </Card>

      {/* Learning Path Output */}
      {showResult && (
        <div className="mt-8 animate-in fade-in duration-500">
          {path ? (
            <div className="relative">
              {/* Vertical timeline line */}
              <div
                className="absolute left-[18px] top-4 bottom-4 w-px bg-border"
                aria-hidden
              />
              <ol className="space-y-4">
                {path.map((phase, i) => (
                  <li
                    key={i}
                    className="animate-in fade-in slide-in-from-bottom-2"
                    style={{
                      animationDelay: `${i * 100}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <Card className="relative pl-12 pr-5 py-5 border-2 border-border">
                      {/* Timeline dot */}
                      <div className="absolute left-3 top-5 h-7 w-7 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <h3 className="font-display font-bold text-base">
                        {phase.title}
                      </h3>
                      <ul className="mt-3 space-y-2">
                        {phase.items.map((item, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="flex-shrink-0">{phase.icon}</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Your personalized learning path for{" "}
                <span className="font-semibold text-foreground">
                  {targetRole}
                </span>{" "}
                is being curated. AI-powered path generation coming soon!
                Meanwhile, explore our Coding Lab for practice questions
                tailored to your role.
              </p>
            </Card>
          )}

          {/* Recommended Resources Strip */}
          <div className="mt-8">
            <h3 className="font-display font-bold text-lg mb-4">
              Recommended Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto">
              {RESOURCES.map((res, i) => {
                const inner = (
                  <Card
                    key={i}
                    className="p-4 flex flex-col gap-2 hover:border-primary/40 transition-base cursor-pointer tap-scale min-w-[200px]"
                  >
                    <div className="text-3xl">{res.icon}</div>
                    <h4 className="font-display font-bold text-sm">
                      {res.title}
                    </h4>
                    <p className="text-xs text-muted-foreground flex-1">
                      {res.description}
                    </p>
                    <span className="inline-block self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-foreground/80">
                      {res.tag}
                    </span>
                  </Card>
                );

                if (res.to) {
                  return (
                    <div key={i} onClick={() => navigate(res.to!)}>
                      {inner}
                    </div>
                  );
                }
                return <div key={i}>{inner}</div>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
