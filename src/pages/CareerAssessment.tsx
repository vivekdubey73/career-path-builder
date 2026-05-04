import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCw, ArrowRight, GraduationCap, Lock, ArrowLeft, Download, PlayCircle, Clock } from "lucide-react";
import { LEARNING_PATHS, type Level } from "@/lib/learning-paths";
import { Badge } from "@/components/ui/badge";
import { LearningPathSection } from "@/components/LearningPathSection";

type MCQ = { q: string; options: string[]; correct: number };

const CAREERS: { id: string; emoji: string; title: string; desc: string }[] = [
  { id: "ai-ml", emoji: "🤖", title: "AI & Machine Learning Engineer", desc: "Build intelligent systems and models." },
  { id: "data-sci", emoji: "📊", title: "Data Scientist", desc: "Turn raw data into actionable insights." },
  { id: "cybersec", emoji: "🔐", title: "Cybersecurity Analyst", desc: "Defend systems against modern threats." },
  { id: "cloud", emoji: "☁️", title: "Cloud Architect", desc: "Design scalable cloud infrastructure." },
  { id: "fullstack", emoji: "🌐", title: "Full Stack Developer", desc: "Build end-to-end web applications." },
  { id: "mobile", emoji: "📱", title: "Mobile App Developer", desc: "Craft native and cross-platform apps." },
  { id: "uiux", emoji: "🎨", title: "UI/UX Designer", desc: "Design delightful user experiences." },
  { id: "marketing", emoji: "📈", title: "Digital Marketing Specialist", desc: "Grow brands through digital channels." },
  { id: "bioinfo", emoji: "🧬", title: "Bioinformatics Specialist", desc: "Decode biology with data and code." },
  { id: "fintech", emoji: "💹", title: "Fintech & Blockchain Developer", desc: "Build the future of finance." },
  { id: "game", emoji: "🎮", title: "Game Developer", desc: "Create immersive gaming experiences." },
  { id: "pm", emoji: "🤝", title: "Product Manager", desc: "Lead products from idea to launch." },
];

// 10 MCQs per career: Q1-3 beginner, Q4-7 intermediate, Q8-10 advanced
const QUIZZES: Record<string, MCQ[]> = {
  "ai-ml": [
    { q: "What does 'AI' stand for?", options: ["Automated Input", "Artificial Intelligence", "Advanced Internet", "Applied Iteration"], correct: 1 },
    { q: "Which of these is a popular ML library in Python?", options: ["React", "scikit-learn", "Express", "Laravel"], correct: 1 },
    { q: "Supervised learning requires:", options: ["No data", "Labeled data", "Only images", "A GPU"], correct: 1 },
    { q: "Overfitting means a model:", options: ["Generalizes well", "Memorizes training data", "Has too few parameters", "Runs too slowly"], correct: 1 },
    { q: "Which is a loss function for regression?", options: ["Cross-entropy", "MSE", "Softmax", "ReLU"], correct: 1 },
    { q: "Gradient descent is used to:", options: ["Plot graphs", "Optimize parameters", "Encrypt data", "Compile code"], correct: 1 },
    { q: "A confusion matrix is used in:", options: ["Regression", "Classification evaluation", "Clustering only", "Data ingestion"], correct: 1 },
    { q: "Transformers were introduced in which paper?", options: ["LeNet", "Attention Is All You Need", "AlexNet", "ResNet"], correct: 1 },
    { q: "What is LoRA in LLM fine-tuning?", options: ["A dataset", "Low-Rank Adaptation", "A tokenizer", "An optimizer"], correct: 1 },
    { q: "RLHF stands for:", options: ["Reinforcement Learning from Human Feedback", "Random Logic Heuristic Function", "Recurrent Long-Horizon Forecast", "Reduced Latency Hidden Features"], correct: 0 },
  ],
  "data-sci": [
    { q: "Which language is most common in data science?", options: ["COBOL", "Python", "PHP", "Perl"], correct: 1 },
    { q: "Pandas is primarily used for:", options: ["Web servers", "Data manipulation", "3D graphics", "Mobile apps"], correct: 1 },
    { q: "A median is:", options: ["Most frequent value", "Middle value", "Average", "Largest value"], correct: 1 },
    { q: "What does EDA stand for?", options: ["Exploratory Data Analysis", "Efficient Data Algorithm", "Encrypted Data Access", "Extended Data API"], correct: 0 },
    { q: "p-value < 0.05 typically means:", options: ["Result is random", "Statistically significant", "Wrong test", "No conclusion"], correct: 1 },
    { q: "Which is a dimensionality reduction technique?", options: ["PCA", "SQL", "REST", "JWT"], correct: 0 },
    { q: "A/B testing is used for:", options: ["Comparing two variants", "Sorting arrays", "Building UIs", "Compressing data"], correct: 0 },
    { q: "Which metric handles class imbalance better than accuracy?", options: ["F1 score", "RMSE", "R²", "MAE"], correct: 0 },
    { q: "Bayesian inference updates beliefs using:", options: ["Prior and likelihood", "Random forest", "K-means", "Z-test only"], correct: 0 },
    { q: "Survival analysis often uses which model?", options: ["Cox Proportional Hazards", "Linear SVM", "Naive Bayes", "Apriori"], correct: 0 },
  ],
  "cybersec": [
    { q: "What does 'phishing' attempt to do?", options: ["Speed up Wi-Fi", "Steal credentials via deception", "Encrypt files", "Patch a system"], correct: 1 },
    { q: "HTTPS uses which protocol for encryption?", options: ["TLS", "FTP", "SMTP", "ICMP"], correct: 0 },
    { q: "A strong password should be:", options: ["Short", "Long and unique", "Your birthday", "Same everywhere"], correct: 1 },
    { q: "What is a zero-day vulnerability?", options: ["A patched bug", "Unknown to vendor", "Old exploit", "A type of firewall"], correct: 1 },
    { q: "MFA stands for:", options: ["Multi-Factor Authentication", "Main Firewall Access", "Modular File Audit", "Managed Forensic Agent"], correct: 0 },
    { q: "SQL injection targets:", options: ["DNS", "Database queries", "BIOS", "GPU drivers"], correct: 1 },
    { q: "A SIEM is used for:", options: ["Security event monitoring", "Selling products", "Image editing", "Disk defrag"], correct: 0 },
    { q: "Which is symmetric encryption?", options: ["RSA", "AES", "ECC", "DSA"], correct: 1 },
    { q: "MITRE ATT&CK is a:", options: ["Firewall vendor", "Adversary tactics knowledge base", "Encryption standard", "Linux distro"], correct: 1 },
    { q: "Privilege escalation refers to:", options: ["Gaining higher access", "Backups", "Patching", "Logging"], correct: 0 },
  ],
  "cloud": [
    { q: "Which is a major cloud provider?", options: ["AWS", "Adobe", "Atlassian", "Akamai"], correct: 0 },
    { q: "IaaS stands for:", options: ["Internet as a Service", "Infrastructure as a Service", "Identity as a Service", "Index as a Service"], correct: 1 },
    { q: "S3 is used for:", options: ["Compute", "Object storage", "Networking", "Email"], correct: 1 },
    { q: "Auto-scaling helps with:", options: ["Static sites only", "Handling variable load", "Encryption", "Logging"], correct: 1 },
    { q: "A VPC is a:", options: ["Virtual Private Cloud network", "Virtual Public Container", "Vendor Provided Catalog", "Verified Push Channel"], correct: 0 },
    { q: "Which is serverless compute on AWS?", options: ["EC2", "Lambda", "RDS", "VPC"], correct: 1 },
    { q: "IaC tools include:", options: ["Terraform", "Photoshop", "Excel", "Slack"], correct: 0 },
    { q: "Multi-region active-active design improves:", options: ["Latency and availability", "Only cost", "Only security", "Nothing"], correct: 0 },
    { q: "Kubernetes is primarily a:", options: ["Container orchestrator", "Database engine", "CDN", "CI tool"], correct: 0 },
    { q: "A 'cold start' in serverless refers to:", options: ["Initial invocation latency", "Disk failure", "Cache miss in CDN", "DNS issue"], correct: 0 },
  ],
  "fullstack": [
    { q: "HTML stands for:", options: ["HyperText Markup Language", "Hyper Tool Multi Language", "High Tech Modern Lang", "Home Tag Markup Logic"], correct: 0 },
    { q: "CSS is used for:", options: ["Logic", "Styling", "Database", "Routing"], correct: 1 },
    { q: "Which runs JavaScript on the server?", options: ["Node.js", "MySQL", "Apache Hadoop", "Redis"], correct: 0 },
    { q: "REST APIs commonly use:", options: ["HTTP verbs", "Sockets only", "FTP", "SMTP"], correct: 0 },
    { q: "JSX is used in which framework?", options: ["Angular", "React", "Vue", "Svelte"], correct: 1 },
    { q: "ORMs help you:", options: ["Map objects to DB rows", "Render 3D", "Compile code", "Cache CDN"], correct: 0 },
    { q: "JWT is used for:", options: ["Stateless auth", "Image compression", "DNS", "Email"], correct: 0 },
    { q: "SSR stands for:", options: ["Server-Side Rendering", "Single State Reducer", "Secure Socket Relay", "Static Site Repo"], correct: 0 },
    { q: "Which improves Largest Contentful Paint?", options: ["Image optimization", "More cookies", "Bigger JS bundle", "Blocking scripts"], correct: 0 },
    { q: "Database indexing primarily improves:", options: ["Read performance", "Write throughput always", "Disk size", "Backup speed"], correct: 0 },
  ],
  "mobile": [
    { q: "iOS apps are typically written in:", options: ["Swift", "Ruby", "Go", "PHP"], correct: 0 },
    { q: "Android apps are commonly written in:", options: ["Kotlin", "C#", "Perl", "R"], correct: 0 },
    { q: "React Native enables:", options: ["Cross-platform mobile apps", "Only iOS apps", "Only games", "Web servers"], correct: 0 },
    { q: "An APK is a file format for:", options: ["Android packages", "iOS apps", "Web bundles", "Audio"], correct: 0 },
    { q: "Push notifications on iOS use:", options: ["APNs", "FCM only", "WebSocket", "Email"], correct: 0 },
    { q: "Jetpack Compose is for:", options: ["Declarative Android UI", "iOS layouts", "Game engines", "Backend"], correct: 0 },
    { q: "App Store review focuses on:", options: ["Guidelines compliance", "Source code style", "Server uptime", "Domain age"], correct: 0 },
    { q: "Code signing ensures:", options: ["App authenticity", "Faster downloads", "Smaller APK", "Better UX"], correct: 0 },
    { q: "Background tasks on iOS are limited by:", options: ["System budgets", "RAM only", "Screen brightness", "Carrier"], correct: 0 },
    { q: "Hermes is a JS engine optimized for:", options: ["React Native", "Node servers", "Browsers", "Deno"], correct: 0 },
  ],
  "uiux": [
    { q: "UX stands for:", options: ["User Experience", "Unified XML", "Universal Export", "Unique X-axis"], correct: 0 },
    { q: "A wireframe is a:", options: ["Low-fi layout sketch", "Final design", "Code file", "Marketing brief"], correct: 0 },
    { q: "Figma is primarily a:", options: ["Design tool", "Database", "Compiler", "CDN"], correct: 0 },
    { q: "Contrast ratio matters for:", options: ["Accessibility", "SEO only", "Backend speed", "Hosting cost"], correct: 0 },
    { q: "A persona represents:", options: ["A target user archetype", "A color palette", "A font", "A grid"], correct: 0 },
    { q: "Heuristic evaluation is by:", options: ["Expert reviewers", "Random users", "Bots only", "Customers paying"], correct: 0 },
    { q: "Fitts's Law relates to:", options: ["Target size and distance", "Color theory", "Typography only", "Animation easing"], correct: 0 },
    { q: "WCAG AA contrast minimum for normal text:", options: ["4.5:1", "1.5:1", "2:1", "10:1"], correct: 0 },
    { q: "Design tokens primarily enable:", options: ["Consistent theming at scale", "Faster servers", "Better SEO", "Smaller images"], correct: 0 },
    { q: "Atomic Design's smallest unit is:", options: ["Atoms", "Molecules", "Organisms", "Pages"], correct: 0 },
  ],
  "marketing": [
    { q: "SEO stands for:", options: ["Search Engine Optimization", "Secure Email Output", "Social Event Online", "Server Edge Origin"], correct: 0 },
    { q: "CTR means:", options: ["Click-Through Rate", "Customer Tracking Report", "Content Type Range", "Core Test Run"], correct: 0 },
    { q: "Google Ads is a:", options: ["PPC platform", "CMS", "CDN", "ERP"], correct: 0 },
    { q: "A landing page's primary goal is:", options: ["Conversion", "Hosting blog posts", "Storing images", "Email replies"], correct: 0 },
    { q: "UTM parameters help track:", options: ["Campaign sources", "Server load", "Domain age", "DNS"], correct: 0 },
    { q: "ROAS stands for:", options: ["Return on Ad Spend", "Rate of Account Sales", "Reach over Audience Size", "Random Online Ad Source"], correct: 0 },
    { q: "Lookalike audiences are based on:", options: ["Existing customer data", "Random users", "Geo only", "Time of day"], correct: 0 },
    { q: "An ideal email open rate benchmark is around:", options: ["20–30%", "1–2%", "70–90%", "0%"], correct: 0 },
    { q: "Attribution modeling helps you understand:", options: ["Channel contribution to conversions", "Server uptime", "App crashes", "Code coverage"], correct: 0 },
    { q: "Programmatic advertising uses:", options: ["Automated real-time bidding", "Manual buyers only", "TV only", "Print only"], correct: 0 },
  ],
  "bioinfo": [
    { q: "DNA is composed of nucleotides:", options: ["A, T, G, C", "A, B, C, D", "X, Y, Z, W", "U, V, W, X"], correct: 0 },
    { q: "BLAST is used for:", options: ["Sequence alignment", "Image editing", "Cloud billing", "Web hosting"], correct: 0 },
    { q: "FASTA is a:", options: ["Sequence file format", "Database server", "Compiler", "Browser"], correct: 0 },
    { q: "RNA-seq measures:", options: ["Gene expression", "DNA length only", "Cell size", "pH"], correct: 0 },
    { q: "CRISPR is used for:", options: ["Genome editing", "Image rendering", "Networking", "Encryption"], correct: 0 },
    { q: "Bioconductor is built on:", options: ["R", "Java", "PHP", "C#"], correct: 0 },
    { q: "Phylogenetic trees represent:", options: ["Evolutionary relationships", "Cell membranes", "Gene density", "Codon counts only"], correct: 0 },
    { q: "Variant calling identifies:", options: ["Differences from a reference genome", "Protein folds", "Cell lines", "Antibodies"], correct: 0 },
    { q: "AlphaFold predicts:", options: ["Protein structures", "DNA mutations", "Gene names", "Cell counts"], correct: 0 },
    { q: "Single-cell RNA-seq enables:", options: ["Cell-level expression profiling", "Bulk DNA only", "Antibody design only", "Lipid profiling"], correct: 0 },
  ],
  "fintech": [
    { q: "Blockchain is a:", options: ["Distributed ledger", "Single database", "Image format", "Web framework"], correct: 0 },
    { q: "Bitcoin uses which consensus?", options: ["Proof of Work", "Proof of Stake", "Raft", "Paxos"], correct: 0 },
    { q: "A smart contract is:", options: ["Self-executing code on chain", "A legal PDF", "An NFT image", "A wallet app"], correct: 0 },
    { q: "Ethereum's native token is:", options: ["ETH", "BTC", "SOL", "ADA"], correct: 0 },
    { q: "ERC-20 is a standard for:", options: ["Fungible tokens", "NFTs", "Wallets", "Bridges"], correct: 0 },
    { q: "DeFi stands for:", options: ["Decentralized Finance", "Defined Finance", "Default Field", "Direct Fee"], correct: 0 },
    { q: "Layer 2 solutions aim to:", options: ["Improve scalability", "Replace Layer 1", "Disable smart contracts", "Increase fees"], correct: 0 },
    { q: "An oracle in blockchain provides:", options: ["Off-chain data on-chain", "Mining hardware", "GUI wallets", "DNS"], correct: 0 },
    { q: "Zero-knowledge proofs allow:", options: ["Proving knowledge without revealing it", "Free transactions", "Infinite throughput", "Quantum mining"], correct: 0 },
    { q: "MEV refers to:", options: ["Maximal Extractable Value", "Minimum Ether Volume", "Market Equity Vector", "Mining Edge Variance"], correct: 0 },
  ],
  "game": [
    { q: "Unity primarily uses which language?", options: ["C#", "Python", "Ruby", "Go"], correct: 0 },
    { q: "Unreal Engine uses:", options: ["C++ and Blueprints", "PHP", "Swift only", "Kotlin"], correct: 0 },
    { q: "FPS in games means:", options: ["Frames Per Second", "First Person Shooter only", "File Per Second", "Function Pointer Set"], correct: 0 },
    { q: "A sprite is a:", options: ["2D image asset", "3D model only", "Audio clip", "Shader"], correct: 0 },
    { q: "Game loops typically include:", options: ["Input, update, render", "Compile, link, run", "Fetch, parse, store", "Auth, fetch, log"], correct: 0 },
    { q: "Shaders run primarily on:", options: ["GPU", "Disk", "RAM only", "Network"], correct: 0 },
    { q: "Pathfinding often uses which algorithm?", options: ["A*", "Bubble sort", "Dijkstra is never used", "Bogo sort"], correct: 0 },
    { q: "ECS stands for:", options: ["Entity Component System", "Edge Cache Store", "Event Console Stack", "Encrypted Channel Service"], correct: 0 },
    { q: "Netcode rollback is common in:", options: ["Fighting games", "Turn-based RPGs", "Solitaire", "Word games"], correct: 0 },
    { q: "Physically Based Rendering relies on:", options: ["Real-world material properties", "Hand-painted only", "8-bit palettes", "Vector fonts"], correct: 0 },
  ],
  "pm": [
    { q: "A PM's primary role is to:", options: ["Define product direction", "Write all code", "Run servers", "Sell ads"], correct: 0 },
    { q: "An MVP is a:", options: ["Minimum Viable Product", "Most Valued Player", "Major Version Patch", "Multi Vendor Plan"], correct: 0 },
    { q: "A user story format is:", options: ["As a… I want… so that…", "Given/When/Only", "If/Else/End", "Begin/End"], correct: 0 },
    { q: "OKRs stand for:", options: ["Objectives and Key Results", "Open Kanban Releases", "Operational Key Reports", "Owner Key Records"], correct: 0 },
    { q: "Backlog grooming is also called:", options: ["Refinement", "Standup", "Retrospective", "Demo"], correct: 0 },
    { q: "RICE prioritization stands for:", options: ["Reach, Impact, Confidence, Effort", "Risk, Income, Cost, Equity", "Roadmap, Idea, Cycle, Epic", "Release, Iterate, Check, Estimate"], correct: 0 },
    { q: "North Star Metric should be:", options: ["A single guiding metric of value", "All metrics combined", "Revenue only", "DAU only"], correct: 0 },
    { q: "A Kano model categorizes:", options: ["Customer satisfaction features", "Bug severities", "Server tiers", "Cost centers"], correct: 0 },
    { q: "Discovery vs delivery refers to:", options: ["Learning vs shipping", "Hiring vs firing", "Sales vs marketing", "QA vs ops"], correct: 0 },
    { q: "Jobs-to-be-Done framework focuses on:", options: ["The progress users want to make", "Daily standups", "Code reviews", "Tax filings"], correct: 0 },
  ],
};

type Step = "select" | "quiz" | "result" | "path";

export default function CareerAssessment() {
  const [step, setStep] = useState<Step>("select");
  const [careerId, setCareerId] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));
  const [selected, setSelected] = useState<number | null>(null);

  const career = CAREERS.find((c) => c.id === careerId);
  const quiz = careerId ? QUIZZES[careerId] : [];

  const startQuiz = () => {
    if (!careerId) return;
    setQIndex(0);
    setAnswers(Array(10).fill(null));
    setSelected(null);
    setStep("quiz");
  };

  const handleNext = () => {
    if (selected === null) return;
    const updated = [...answers];
    updated[qIndex] = selected;
    setAnswers(updated);
    if (qIndex + 1 >= quiz.length) {
      setStep("result");
    } else {
      setQIndex(qIndex + 1);
      setSelected(updated[qIndex + 1] ?? null);
    }
  };

  const score = answers.reduce((s, a, i) => (a !== null && a === quiz[i]?.correct ? (s as number) + 1 : (s as number)), 0) as number;

  const level: { emoji: string; name: Level; msg: string; color: string } =
    score <= 3
      ? { emoji: "🟢", name: "Beginner", msg: "We'll start from the fundamentals.", color: "text-emerald-500" }
      : score <= 6
      ? { emoji: "🟡", name: "Intermediate", msg: "You have a solid base, let's go deeper.", color: "text-amber-500" }
      : { emoji: "🔴", name: "Advanced", msg: "You're ready for expert-level content.", color: "text-rose-500" };

  const stages = careerId ? LEARNING_PATHS[careerId]?.[level.name] ?? [] : [];

  const retake = () => {
    setStep("select");
    setCareerId(null);
    setQIndex(0);
    setAnswers(Array(10).fill(null));
    setSelected(null);
  };

  return (
    <AppShell contentWidth="wide">
      <div className="px-4 lg:px-0 pt-6 pb-10">
        {step === "select" && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Career Assessment</p>
              <h1 className="font-display text-3xl font-bold mt-1">Pick a trending career to assess</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a path and we'll gauge your level with a quick 10-question test.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CAREERS.map((c) => {
                const active = c.id === careerId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCareerId(c.id)}
                    className={cn(
                      "text-left p-4 rounded-2xl border-2 bg-card transition-base tap-scale",
                      active
                        ? "border-primary shadow-glow ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <div className="text-3xl">{c.emoji}</div>
                    <div className="font-display font-bold mt-2 leading-tight">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="sticky bottom-24 lg:bottom-6 mt-8 flex justify-center">
              <Button
                size="lg"
                disabled={!careerId}
                onClick={startQuiz}
                className="rounded-full px-8 h-12 shadow-glow"
              >
                Start Knowledge Test <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "quiz" && career && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {career.emoji} {career.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Question {qIndex + 1} of {quiz.length}
                </p>
              </div>
              <Progress value={((qIndex + 1) / quiz.length) * 100} className="h-2" />
            </div>

            <Card className="p-6">
              <h2 className="font-display text-xl font-bold leading-snug">{quiz[qIndex].q}</h2>
              <div className="space-y-2 mt-5">
                {quiz[qIndex].options.map((opt, i) => {
                  const isSel = selected === i;
                  const letter = ["A", "B", "C", "D"][i];
                  return (
                    <button
                      key={i}
                      onClick={() => setSelected(i)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border-2 flex items-start gap-3 transition-base tap-scale",
                        isSel ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex-shrink-0 h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                          isSel ? "border-primary bg-primary text-primary-foreground" : "border-border",
                        )}
                      >
                        {letter}
                      </span>
                      <span className="text-sm pt-0.5">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleNext} disabled={selected === null} className="rounded-full px-6">
                  {qIndex + 1 === quiz.length ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === "result" && career && (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
            <Card className="p-6 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {career.emoji} {career.title}
              </p>
              <h1 className="font-display text-3xl font-bold mt-2">
                You scored {score} out of {quiz.length}
              </h1>
              <div className={cn("mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted font-semibold", level.color)}>
                <span className="text-lg">{level.emoji}</span>
                <span>{level.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{level.msg}</p>

              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
                <Button className="rounded-full px-6 shadow-glow" onClick={() => setStep("path")}>
                  <GraduationCap className="h-4 w-4" /> Get My Learning Path
                </Button>
                <Button variant="outline" className="rounded-full px-6" onClick={retake}>
                  <RotateCw className="h-4 w-4" /> Retake Test
                </Button>
              </div>
            </Card>

            <Card className="mt-6 p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/40">
                <h2 className="font-display font-bold">Answer summary</h2>
              </div>
              <div className="divide-y divide-border">
                {quiz.map((q, i) => {
                  const a = answers[i];
                  const correct = a === q.correct;
                  return (
                    <div key={i} className="p-4">
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center",
                            correct ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500",
                          )}
                        >
                          {correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{i + 1}. {q.q}</p>
                          <p className="text-xs mt-1">
                            <span className="text-muted-foreground">Your answer: </span>
                            <span className={correct ? "text-emerald-500 font-medium" : "text-rose-500 font-medium"}>
                              {a !== null ? q.options[a] : "—"}
                            </span>
                          </p>
                          {!correct && (
                            <p className="text-xs mt-0.5">
                              <span className="text-muted-foreground">Correct: </span>
                              <span className="text-emerald-500 font-medium">{q.options[q.correct]}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {step === "path" && career && (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between gap-2 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setStep("result")} className="rounded-full">
                <ArrowLeft className="h-4 w-4" /> Retake Test
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  const text = `${career.title} — ${level.name} Learning Path\n\n` +
                    stages.map((s, i) => `Stage ${i + 1}: ${s.title}\n${s.description}\nTopics: ${s.topics.join(", ")}\nTime: ${s.time}\n`).join("\n");
                  const blob = new Blob([text], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${career.id}-${level.name.toLowerCase()}-roadmap.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" /> Download Roadmap
              </Button>
            </div>

            <Card className="p-6 mb-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Your personalized learning path</p>
              <h1 className="font-display text-3xl font-bold mt-1 leading-tight">
                {career.emoji} {career.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={cn("text-sm", level.color)}>
                  {level.emoji} {level.name}
                </Badge>
                <span className="text-xs text-muted-foreground">{stages.length} stages • Progression-based</span>
              </div>
            </Card>

            <div className="relative">
              <div className="absolute left-[22px] top-2 bottom-2 w-px bg-border" aria-hidden />
              <ol className="space-y-4">
                {stages.map((s, i) => {
                  const isFirst = i === 0;
                  return (
                    <li key={i} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}>
                      <div
                        className={cn(
                          "relative pl-14 pr-4 py-4 rounded-2xl border-2 bg-card transition-base",
                          isFirst ? "border-primary shadow-glow" : "border-border opacity-70",
                        )}
                      >
                        <div
                          className={cn(
                            "absolute left-3 top-4 h-9 w-9 rounded-full border-2 flex items-center justify-center font-display font-bold text-sm",
                            isFirst ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {isFirst ? i + 1 : <Lock className="h-4 w-4" />}
                        </div>
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stage {i + 1}</p>
                            <h3 className="font-display font-bold text-lg leading-tight">{s.title}</h3>
                          </div>
                          <Badge
                            variant={isFirst ? "default" : "outline"}
                            className={cn("flex items-center gap-1", isFirst && "shadow-glow")}
                          >
                            {isFirst ? <PlayCircle className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            {isFirst ? "Start Here" : "Locked"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{s.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {s.topics.map((t) => (
                            <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-foreground/80">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> {s.time}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <LearningPathSection />
          </div>
        )}
      </div>
    </AppShell>
  );
}
