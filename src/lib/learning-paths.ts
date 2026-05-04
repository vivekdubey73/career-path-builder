export type Level = "Beginner" | "Intermediate" | "Advanced";

export type Stage = {
  title: string;
  description: string;
  topics: string[];
  time: string;
};

export type LearningPath = Record<Level, Stage[]>;

const make = (
  beginner: Stage[],
  intermediate: Stage[],
  advanced: Stage[],
): LearningPath => ({ Beginner: beginner, Intermediate: intermediate, Advanced: advanced });

export const LEARNING_PATHS: Record<string, LearningPath> = {
  "ai-ml": make(
    [
      { title: "Python Fundamentals", description: "Learn the core language used across AI/ML.", topics: ["Variables & types", "Loops & functions", "OOP basics", "Working with files"], time: "2 weeks" },
      { title: "Math for ML", description: "Build the math intuition that powers algorithms.", topics: ["Linear algebra", "Probability", "Statistics", "Calculus basics"], time: "3 weeks" },
      { title: "ML Basics", description: "Understand classic supervised learning.", topics: ["Regression", "Classification", "scikit-learn", "Train/test split"], time: "3 weeks" },
      { title: "First ML Project", description: "Take a dataset end-to-end.", topics: ["Data cleaning", "EDA", "Model training", "Evaluation metrics"], time: "2 weeks" },
      { title: "Deep Learning Intro", description: "Step into neural networks.", topics: ["Neural network basics", "TensorFlow / PyTorch", "MNIST classifier", "Loss & optimizers"], time: "3 weeks" },
    ],
    [
      { title: "Advanced ML Algorithms", description: "Go beyond linear models.", topics: ["Ensembles", "SVM", "XGBoost", "Hyperparameter tuning"], time: "2 weeks" },
      { title: "Deep Learning", description: "Master modern neural architectures.", topics: ["CNNs", "RNNs / LSTMs", "Transfer learning", "Regularization"], time: "3 weeks" },
      { title: "NLP Fundamentals", description: "Work with language data.", topics: ["Tokenization", "Embeddings", "Transformers", "Hugging Face"], time: "3 weeks" },
      { title: "MLOps Basics", description: "Ship models to production.", topics: ["Model deployment", "Docker", "FastAPI", "Monitoring"], time: "2 weeks" },
      { title: "Capstone Project", description: "Build a portfolio-grade project.", topics: ["End-to-end pipeline", "GitHub portfolio", "Write-up", "Demo video"], time: "4 weeks" },
    ],
    [
      { title: "LLMs & Generative AI", description: "Work with frontier model techniques.", topics: ["Fine-tuning", "RAG", "Prompt engineering", "LoRA / PEFT"], time: "3 weeks" },
      { title: "ML System Design", description: "Design models that scale.", topics: ["Scalability", "A/B testing", "Feature stores", "Online vs offline"], time: "3 weeks" },
      { title: "Research & Papers", description: "Stay at the frontier.", topics: ["Reading arXiv", "Reproducing results", "Ablations", "Benchmarks"], time: "4 weeks" },
      { title: "Open Source Contribution", description: "Contribute to real projects.", topics: ["Hugging Face", "PyTorch", "Issue triage", "PR workflow"], time: "Ongoing" },
      { title: "Build & Publish", description: "Ship and share your work.", topics: ["AI product MVP", "Research blog", "Conference talk", "Community building"], time: "Ongoing" },
    ],
  ),
  "data-sci": make(
    [
      { title: "Python & Pandas", description: "The data scientist's toolkit.", topics: ["Python basics", "Pandas", "NumPy", "Jupyter"], time: "2 weeks" },
      { title: "Statistics Foundations", description: "Reason with data.", topics: ["Descriptive stats", "Distributions", "Hypothesis testing", "Confidence intervals"], time: "3 weeks" },
      { title: "Data Visualization", description: "Tell stories with charts.", topics: ["Matplotlib", "Seaborn", "Plotly", "Dashboard basics"], time: "2 weeks" },
      { title: "SQL for Analytics", description: "Query like a pro.", topics: ["SELECT/JOIN", "Window functions", "CTEs", "Performance"], time: "2 weeks" },
      { title: "First Analysis Project", description: "Deliver insight from raw data.", topics: ["EDA", "Cleaning", "Storytelling", "Stakeholder summary"], time: "3 weeks" },
    ],
    [
      { title: "Applied ML", description: "Predictive modeling in practice.", topics: ["Regression", "Classification", "Cross-validation", "scikit-learn"], time: "3 weeks" },
      { title: "Experimentation", description: "Run trustworthy A/B tests.", topics: ["Sample sizing", "p-values", "Power", "Guardrails"], time: "2 weeks" },
      { title: "Advanced SQL & Warehousing", description: "Work with modern stacks.", topics: ["dbt", "BigQuery / Snowflake", "Modeling", "Optimization"], time: "3 weeks" },
      { title: "Causal Inference", description: "Beyond correlation.", topics: ["DiD", "Propensity scores", "Instrumental vars", "Uplift"], time: "3 weeks" },
      { title: "Capstone Analysis", description: "Drive a real decision.", topics: ["Business framing", "Modeling", "Recommendation", "Presentation"], time: "4 weeks" },
    ],
    [
      { title: "Bayesian Methods", description: "Probabilistic modeling at depth.", topics: ["PyMC", "MCMC", "Hierarchical models", "Priors"], time: "3 weeks" },
      { title: "Productionizing Models", description: "From notebook to product.", topics: ["MLflow", "Airflow", "Feature stores", "Monitoring"], time: "3 weeks" },
      { title: "Advanced Experimentation", description: "Scale rigor across an org.", topics: ["Switchback tests", "Sequential testing", "CUPED", "Meta-analysis"], time: "3 weeks" },
      { title: "Research & Influence", description: "Lead with insight.", topics: ["Whitepapers", "Internal talks", "Mentoring", "Reading groups"], time: "Ongoing" },
      { title: "Domain Specialization", description: "Become the expert.", topics: ["Pick a domain", "Deep dives", "Open source", "Publish"], time: "Ongoing" },
    ],
  ),
  "cybersec": make(
    [
      { title: "Networking & OS Basics", description: "Know what you're defending.", topics: ["TCP/IP", "DNS", "Linux CLI", "Windows internals"], time: "2 weeks" },
      { title: "Security Fundamentals", description: "Core concepts every analyst needs.", topics: ["CIA triad", "Threats & risks", "Authn vs authz", "Encryption basics"], time: "3 weeks" },
      { title: "Tools of the Trade", description: "Get hands-on.", topics: ["Wireshark", "Nmap", "Burp Suite", "Kali Linux"], time: "2 weeks" },
      { title: "Defensive Foundations", description: "Stop common attacks.", topics: ["Firewalls", "IDS/IPS", "Patching", "Hardening"], time: "3 weeks" },
      { title: "Capture The Flag", description: "Learn by doing.", topics: ["TryHackMe", "HackTheBox starter", "OWASP Juice Shop", "Write-ups"], time: "3 weeks" },
    ],
    [
      { title: "Threat Detection", description: "Find adversaries in the noise.", topics: ["SIEM (Splunk/ELK)", "Log analysis", "Alert tuning", "Use cases"], time: "3 weeks" },
      { title: "Incident Response", description: "Contain and recover fast.", topics: ["IR lifecycle", "Forensics basics", "Playbooks", "Tabletop exercises"], time: "3 weeks" },
      { title: "Web App Security", description: "Top risks in modern apps.", topics: ["OWASP Top 10", "Auth flaws", "SSRF", "API security"], time: "3 weeks" },
      { title: "Cloud Security", description: "Secure modern infrastructure.", topics: ["IAM", "VPC design", "Secrets mgmt", "CSPM"], time: "2 weeks" },
      { title: "Blue Team Project", description: "Build a mini SOC.", topics: ["ELK stack", "Detections", "Alerting", "Report"], time: "3 weeks" },
    ],
    [
      { title: "Adversary Emulation", description: "Think like the attacker.", topics: ["MITRE ATT&CK", "Red team ops", "C2 frameworks", "Evasion"], time: "3 weeks" },
      { title: "Threat Hunting", description: "Proactive detection.", topics: ["Hypothesis-driven hunts", "Sigma rules", "EDR", "Anomaly detection"], time: "3 weeks" },
      { title: "Reverse Engineering", description: "Understand malware deeply.", topics: ["Ghidra", "IDA", "Static analysis", "Dynamic analysis"], time: "4 weeks" },
      { title: "Security Research", description: "Find what no one has.", topics: ["CVE research", "Fuzzing", "Exploit dev", "Disclosure"], time: "Ongoing" },
      { title: "Leadership & Strategy", description: "Build the program.", topics: ["Risk frameworks", "Compliance", "Mentoring", "Executive comms"], time: "Ongoing" },
    ],
  ),
  "cloud": make(
    [
      { title: "Cloud Fundamentals", description: "Pick a provider and learn the basics.", topics: ["AWS/GCP/Azure overview", "IAM", "Regions & AZs", "Billing"], time: "2 weeks" },
      { title: "Compute & Storage", description: "Core building blocks.", topics: ["VMs", "Object storage", "Block storage", "Snapshots"], time: "3 weeks" },
      { title: "Networking 101", description: "Connect things safely.", topics: ["VPCs", "Subnets", "Security groups", "Load balancers"], time: "3 weeks" },
      { title: "First Deployment", description: "Ship a real app.", topics: ["Static site", "Serverless function", "Domain & TLS", "Logging"], time: "2 weeks" },
      { title: "IaC Intro", description: "Codify your infrastructure.", topics: ["Terraform basics", "State", "Modules", "CI for infra"], time: "3 weeks" },
    ],
    [
      { title: "Containers & Kubernetes", description: "Modern deploys.", topics: ["Docker", "K8s basics", "Helm", "Ingress"], time: "3 weeks" },
      { title: "CI/CD Pipelines", description: "Automate everything.", topics: ["GitHub Actions", "Build/test/deploy", "Artifacts", "Promotions"], time: "2 weeks" },
      { title: "Observability", description: "See what's happening.", topics: ["Metrics", "Logs", "Traces", "SLOs"], time: "2 weeks" },
      { title: "Reliability & Cost", description: "Make it dependable and cheap.", topics: ["Auto-scaling", "Multi-AZ", "Cost guardrails", "Right-sizing"], time: "3 weeks" },
      { title: "Reference Architecture Project", description: "Design and document a real system.", topics: ["3-tier app", "IaC", "CI/CD", "Runbooks"], time: "3 weeks" },
    ],
    [
      { title: "Multi-Region Architecture", description: "Design for global scale.", topics: ["Active-active", "Failover", "Data replication", "Latency"], time: "3 weeks" },
      { title: "Platform Engineering", description: "Build the platform others use.", topics: ["Internal dev platforms", "Golden paths", "Backstage", "Self-service"], time: "3 weeks" },
      { title: "Security & Compliance", description: "Cloud at enterprise grade.", topics: ["Zero trust", "SOC 2", "Encryption everywhere", "Audit"], time: "3 weeks" },
      { title: "FinOps & SRE", description: "Operate at scale.", topics: ["Error budgets", "Capacity planning", "Cost attribution", "Chaos engineering"], time: "Ongoing" },
      { title: "Architect & Influence", description: "Lead the design.", topics: ["RFCs", "Tech radars", "Mentoring", "Conference talks"], time: "Ongoing" },
    ],
  ),
  "fullstack": make(
    [
      { title: "HTML, CSS, JS", description: "Master the web's foundations.", topics: ["Semantic HTML", "Flexbox/Grid", "ES6+", "DOM"], time: "3 weeks" },
      { title: "React Basics", description: "Build interactive UIs.", topics: ["Components", "State & props", "Hooks", "Routing"], time: "3 weeks" },
      { title: "Backend with Node", description: "Build APIs.", topics: ["Express", "REST", "Auth basics", "Validation"], time: "3 weeks" },
      { title: "Databases", description: "Persist data.", topics: ["SQL", "Schema design", "ORMs", "Migrations"], time: "2 weeks" },
      { title: "First Full-Stack App", description: "Tie it all together.", topics: ["CRUD app", "Auth", "Deploy", "README"], time: "3 weeks" },
    ],
    [
      { title: "Advanced React", description: "Build production UIs.", topics: ["Performance", "Suspense", "State libs", "Testing"], time: "3 weeks" },
      { title: "TypeScript Everywhere", description: "Type-safe full stack.", topics: ["TS in React", "TS APIs", "Generics", "Tooling"], time: "2 weeks" },
      { title: "API Design", description: "Design APIs that age well.", topics: ["REST best practices", "GraphQL", "Versioning", "Pagination"], time: "3 weeks" },
      { title: "DevOps for Devs", description: "Ship reliably.", topics: ["Docker", "CI/CD", "Cloud deploy", "Monitoring"], time: "3 weeks" },
      { title: "Portfolio SaaS", description: "Build something real.", topics: ["Auth + payments", "Multi-tenant", "Email", "Landing page"], time: "4 weeks" },
    ],
    [
      { title: "Architecture & Scale", description: "Design for growth.", topics: ["Caching", "Queues", "Microservices", "Event-driven"], time: "3 weeks" },
      { title: "Performance Engineering", description: "Make it fast.", topics: ["Web vitals", "Bundle analysis", "DB indexes", "Profiling"], time: "3 weeks" },
      { title: "Security in Depth", description: "Protect your users.", topics: ["OWASP", "Auth/SSO", "Secrets", "Threat modeling"], time: "2 weeks" },
      { title: "Open Source", description: "Contribute and lead.", topics: ["OSS workflow", "RFCs", "Maintainership", "Mentoring"], time: "Ongoing" },
      { title: "Tech Lead Skills", description: "Grow beyond code.", topics: ["Design docs", "Code review", "Roadmaps", "Stakeholder mgmt"], time: "Ongoing" },
    ],
  ),
  "mobile": make(
    [
      { title: "Pick Your Stack", description: "Choose iOS, Android, or cross-platform.", topics: ["Swift basics", "Kotlin basics", "React Native", "Tooling"], time: "2 weeks" },
      { title: "UI Fundamentals", description: "Build screens that feel native.", topics: ["Layout", "Navigation", "Lists", "Forms"], time: "3 weeks" },
      { title: "State & Data", description: "Persist and fetch.", topics: ["Local storage", "REST", "JSON parsing", "Loading states"], time: "2 weeks" },
      { title: "First App", description: "Ship something.", topics: ["MVP scope", "App icon & splash", "TestFlight / internal testing", "Crash reporting"], time: "3 weeks" },
      { title: "Store Submission", description: "Get it published.", topics: ["Guidelines", "Privacy labels", "Screenshots", "Review tips"], time: "2 weeks" },
    ],
    [
      { title: "Advanced UI", description: "Polish and motion.", topics: ["Animations", "Gestures", "Accessibility", "Dark mode"], time: "3 weeks" },
      { title: "Architecture Patterns", description: "Maintainable codebases.", topics: ["MVVM", "Clean architecture", "DI", "Testing"], time: "3 weeks" },
      { title: "Offline & Sync", description: "Work without a network.", topics: ["Local DB", "Conflict resolution", "Background sync", "Caching"], time: "3 weeks" },
      { title: "Push & Notifications", description: "Re-engage users.", topics: ["APNs / FCM", "Deep links", "Rich notifications", "Permissions"], time: "2 weeks" },
      { title: "Polished Portfolio App", description: "Ship a flagship.", topics: ["Auth", "Payments", "Analytics", "Store launch"], time: "4 weeks" },
    ],
    [
      { title: "Performance & Memory", description: "Native-grade quality.", topics: ["Profiling", "Frame budgets", "Memory leaks", "Startup time"], time: "3 weeks" },
      { title: "Cross-Platform Mastery", description: "Share code, keep quality.", topics: ["Kotlin Multiplatform", "Shared business logic", "Native modules", "CI for mobile"], time: "3 weeks" },
      { title: "Security & Privacy", description: "Earn user trust.", topics: ["Keychain / Keystore", "Certificate pinning", "Privacy manifests", "Data minimization"], time: "3 weeks" },
      { title: "Open Source & Talks", description: "Share what you learn.", topics: ["Libraries", "Conference talks", "Blog posts", "Mentoring"], time: "Ongoing" },
      { title: "Lead a Mobile Team", description: "Beyond your own code.", topics: ["Roadmaps", "Release trains", "Hiring", "Cross-team work"], time: "Ongoing" },
    ],
  ),
  "uiux": make(
    [
      { title: "Design Foundations", description: "Train your eye.", topics: ["Typography", "Color", "Spacing", "Hierarchy"], time: "2 weeks" },
      { title: "Figma Essentials", description: "Be fast in your tool.", topics: ["Frames", "Auto layout", "Components", "Prototyping"], time: "2 weeks" },
      { title: "UX Basics", description: "Design with users in mind.", topics: ["User flows", "Personas", "Wireframes", "Heuristics"], time: "3 weeks" },
      { title: "First Case Study", description: "Tell a design story.", topics: ["Problem framing", "Process", "Final UI", "Reflection"], time: "3 weeks" },
      { title: "Portfolio Online", description: "Get seen.", topics: ["Portfolio site", "2 case studies", "About page", "Outreach"], time: "2 weeks" },
    ],
    [
      { title: "Design Systems", description: "Scale your work.", topics: ["Tokens", "Components", "Documentation", "Versioning"], time: "3 weeks" },
      { title: "Interaction & Motion", description: "Bring UIs to life.", topics: ["Microinteractions", "Easing", "Lottie", "Prototyping motion"], time: "2 weeks" },
      { title: "User Research", description: "Validate decisions.", topics: ["Interviews", "Usability tests", "Synthesis", "Insights"], time: "3 weeks" },
      { title: "Accessibility", description: "Design for everyone.", topics: ["WCAG", "Color contrast", "Keyboard nav", "Screen readers"], time: "2 weeks" },
      { title: "End-to-End Product Case", description: "Ship-ready quality.", topics: ["Discovery", "UX", "UI", "Handoff"], time: "4 weeks" },
    ],
    [
      { title: "Design Strategy", description: "Set the direction.", topics: ["North-star vision", "Roadmaps", "Workshops", "Stakeholder alignment"], time: "3 weeks" },
      { title: "Advanced Systems", description: "Org-wide impact.", topics: ["Multi-brand systems", "Theming", "Governance", "Adoption"], time: "3 weeks" },
      { title: "Research at Scale", description: "Build a research practice.", topics: ["Mixed methods", "Repos", "ResearchOps", "Insight sharing"], time: "3 weeks" },
      { title: "Influence & Writing", description: "Lead beyond your team.", topics: ["Talks", "Articles", "Critique culture", "Mentoring"], time: "Ongoing" },
      { title: "Lead a Design Team", description: "Grow others.", topics: ["Hiring", "Career ladders", "Reviews", "Strategy"], time: "Ongoing" },
    ],
  ),
  "marketing": make(
    [
      { title: "Marketing Foundations", description: "How modern marketing works.", topics: ["Funnel basics", "Channels", "Positioning", "Brand"], time: "2 weeks" },
      { title: "SEO Basics", description: "Get found on Google.", topics: ["Keywords", "On-page SEO", "Technical SEO", "Content"], time: "3 weeks" },
      { title: "Paid Ads 101", description: "Spend smart.", topics: ["Google Ads", "Meta Ads", "Targeting", "Budgets"], time: "2 weeks" },
      { title: "Email & Social", description: "Own your audience.", topics: ["Lists", "Sequences", "Social calendars", "Engagement"], time: "2 weeks" },
      { title: "First Campaign", description: "Run a real campaign.", topics: ["Goal", "Creative", "Launch", "Reporting"], time: "3 weeks" },
    ],
    [
      { title: "Analytics & Attribution", description: "Measure what matters.", topics: ["GA4", "UTMs", "Attribution models", "Dashboards"], time: "3 weeks" },
      { title: "Content & SEO at Scale", description: "Compounding growth.", topics: ["Content strategy", "Topical authority", "Internal linking", "Link building"], time: "3 weeks" },
      { title: "Performance Marketing", description: "Optimize ROAS.", topics: ["Creative testing", "Audiences", "Bidding", "Landing pages"], time: "3 weeks" },
      { title: "Lifecycle Marketing", description: "Retain and grow.", topics: ["Onboarding", "Reactivation", "Loyalty", "Referrals"], time: "2 weeks" },
      { title: "Growth Project", description: "Drive a real number.", topics: ["Hypothesis", "Experiments", "Iteration", "Case study"], time: "4 weeks" },
    ],
    [
      { title: "Growth Strategy", description: "Set the company-level plan.", topics: ["Loops", "Moats", "Pricing", "GTM"], time: "3 weeks" },
      { title: "Brand & Positioning", description: "Differentiate at depth.", topics: ["Category design", "Messaging hierarchy", "Narrative", "Voice"], time: "3 weeks" },
      { title: "Marketing Ops", description: "Scale the engine.", topics: ["Martech stack", "Data warehouse", "RevOps", "Automation"], time: "3 weeks" },
      { title: "Thought Leadership", description: "Shape the conversation.", topics: ["Long-form writing", "Talks", "Podcasts", "Community"], time: "Ongoing" },
      { title: "Lead Marketing", description: "Build the team.", topics: ["Hiring", "Org design", "Budgets", "Board updates"], time: "Ongoing" },
    ],
  ),
  "bioinfo": make(
    [
      { title: "Biology Refresher", description: "Speak the language.", topics: ["DNA / RNA / protein", "Central dogma", "Genes", "Cells"], time: "2 weeks" },
      { title: "Programming for Bio", description: "Tools you'll use daily.", topics: ["Python", "Pandas", "BioPython", "Linux CLI"], time: "3 weeks" },
      { title: "Sequence Analysis", description: "Work with sequences.", topics: ["FASTA/FASTQ", "BLAST", "Alignment", "QC"], time: "3 weeks" },
      { title: "Stats for Bio", description: "Reason about results.", topics: ["Distributions", "Multiple testing", "PCA", "Visualization"], time: "2 weeks" },
      { title: "Mini Project", description: "End-to-end pipeline.", topics: ["Public dataset", "Pipeline", "Plots", "Write-up"], time: "3 weeks" },
    ],
    [
      { title: "Genomics Workflows", description: "Modern pipelines.", topics: ["BWA / STAR", "GATK", "Snakemake / Nextflow", "Variant calling"], time: "3 weeks" },
      { title: "Transcriptomics", description: "Expression at scale.", topics: ["RNA-seq", "DESeq2", "Pathway analysis", "Visualization"], time: "3 weeks" },
      { title: "Cloud for Bio", description: "Run at scale.", topics: ["AWS / GCP", "Containers", "Cost control", "Reproducibility"], time: "2 weeks" },
      { title: "Single-Cell Analysis", description: "Cell-level insight.", topics: ["scRNA-seq", "Scanpy / Seurat", "Clustering", "Annotation"], time: "3 weeks" },
      { title: "Reproducible Project", description: "Publishable quality.", topics: ["Pipeline repo", "Docs", "Notebooks", "Review-ready"], time: "4 weeks" },
    ],
    [
      { title: "Multi-Omics Integration", description: "Combine modalities.", topics: ["Genomics + transcriptomics", "Proteomics", "Methods", "Case studies"], time: "3 weeks" },
      { title: "ML in Biology", description: "Modern modeling.", topics: ["Deep learning", "AlphaFold", "Variant effect prediction", "Benchmarks"], time: "3 weeks" },
      { title: "Pipeline Engineering", description: "Production-grade workflows.", topics: ["Nextflow at scale", "Cloud HPC", "Data management", "QC automation"], time: "3 weeks" },
      { title: "Research & Publishing", description: "Add to the literature.", topics: ["Hypothesis design", "Reproducibility", "Preprints", "Peer review"], time: "Ongoing" },
      { title: "Collaboration & Leadership", description: "Lead cross-discipline work.", topics: ["Wet-lab partnerships", "Mentoring", "Grant writing", "Talks"], time: "Ongoing" },
    ],
  ),
  "fintech": make(
    [
      { title: "Web3 Fundamentals", description: "How blockchains work.", topics: ["Hashing", "Wallets", "Transactions", "Consensus"], time: "2 weeks" },
      { title: "Solidity Basics", description: "Write your first contract.", topics: ["Types", "Functions", "Events", "Remix IDE"], time: "3 weeks" },
      { title: "Frontends for dApps", description: "Connect users to chains.", topics: ["Ethers.js / viem", "Wallet connect", "React + web3", "Networks"], time: "3 weeks" },
      { title: "Testing & Tooling", description: "Build safely.", topics: ["Hardhat / Foundry", "Unit tests", "Local chains", "Etherscan"], time: "2 weeks" },
      { title: "First dApp", description: "Ship a tiny product.", topics: ["Smart contract", "Frontend", "Testnet deploy", "Demo"], time: "3 weeks" },
    ],
    [
      { title: "DeFi Primitives", description: "How DeFi composes.", topics: ["AMMs", "Lending", "Stablecoins", "Oracles"], time: "3 weeks" },
      { title: "Security in Smart Contracts", description: "Avoid the footguns.", topics: ["Reentrancy", "Access control", "Audits", "Slither"], time: "3 weeks" },
      { title: "L2 & Scaling", description: "Where users actually are.", topics: ["Rollups", "Bridges", "Gas optimization", "Cross-chain"], time: "2 weeks" },
      { title: "Backend & Indexing", description: "Make data usable.", topics: ["The Graph", "Subgraphs", "APIs", "Caching"], time: "3 weeks" },
      { title: "Production dApp", description: "Real users, real funds.", topics: ["Auditable contracts", "Monitoring", "Upgrades", "Docs"], time: "4 weeks" },
    ],
    [
      { title: "Protocol Design", description: "Design the next primitive.", topics: ["Mechanism design", "Tokenomics", "Governance", "Incentives"], time: "3 weeks" },
      { title: "Advanced Security", description: "Be the auditor.", topics: ["Formal methods", "Fuzzing", "Invariant testing", "Audit reports"], time: "3 weeks" },
      { title: "Zero-Knowledge", description: "Cutting-edge cryptography.", topics: ["zk-SNARKs", "Circom", "ZK rollups", "Use cases"], time: "4 weeks" },
      { title: "Open Source & Research", description: "Move the space forward.", topics: ["EIPs", "Research forums", "OSS protocols", "Talks"], time: "Ongoing" },
      { title: "Found or Lead a Protocol", description: "Build something used widely.", topics: ["Vision", "Team", "Community", "Sustainability"], time: "Ongoing" },
    ],
  ),
  "game": make(
    [
      { title: "Pick an Engine", description: "Unity or Unreal — start one.", topics: ["Editor tour", "Scenes & assets", "Scripting basics", "Build & run"], time: "2 weeks" },
      { title: "Programming Basics", description: "Game-ready code.", topics: ["C# or C++ basics", "Math for games", "Collisions", "Input"], time: "3 weeks" },
      { title: "Core Mechanics", description: "Make things move.", topics: ["Player controller", "Physics", "Animations", "Audio"], time: "3 weeks" },
      { title: "First Mini Game", description: "Ship a prototype.", topics: ["Scope tightly", "Levels", "UI", "Build to platform"], time: "3 weeks" },
      { title: "Publish a Demo", description: "Get feedback.", topics: ["Itch.io", "Trailer clip", "Devlog", "Iterate"], time: "2 weeks" },
    ],
    [
      { title: "Advanced Gameplay", description: "Polish how it feels.", topics: ["Game feel", "Camera", "AI", "Tuning"], time: "3 weeks" },
      { title: "Graphics & Shaders", description: "Make it look great.", topics: ["Materials", "Shader basics", "Lighting", "Post-processing"], time: "3 weeks" },
      { title: "Tools & Pipelines", description: "Work efficiently.", topics: ["Editor tools", "Asset pipeline", "Source control", "CI builds"], time: "2 weeks" },
      { title: "Multiplayer Basics", description: "Play together.", topics: ["Networking models", "State sync", "Lag compensation", "Lobbies"], time: "3 weeks" },
      { title: "Vertical Slice", description: "Production-quality 10 minutes.", topics: ["Design doc", "Slice scope", "Polish pass", "Playtests"], time: "4 weeks" },
    ],
    [
      { title: "Engine Internals", description: "Know your tools deeply.", topics: ["ECS", "Job systems", "Memory", "Profiling"], time: "3 weeks" },
      { title: "Advanced Rendering", description: "Modern graphics.", topics: ["PBR", "Compute shaders", "Lighting models", "Optimization"], time: "3 weeks" },
      { title: "Live Ops", description: "Run a live game.", topics: ["Telemetry", "Backend services", "Updates", "Economy tuning"], time: "3 weeks" },
      { title: "Open Source & Community", description: "Share what you build.", topics: ["Tools", "Talks", "Devlogs", "Mentoring"], time: "Ongoing" },
      { title: "Ship a Real Title", description: "Take a game to market.", topics: ["Scope", "Marketing", "Storefronts", "Launch"], time: "Ongoing" },
    ],
  ),
  "pm": make(
    [
      { title: "PM Foundations", description: "What PMs actually do.", topics: ["Role basics", "Stakeholders", "Outcomes vs outputs", "Frameworks"], time: "2 weeks" },
      { title: "Discovery Skills", description: "Find the right problem.", topics: ["User interviews", "JTBD", "Problem statements", "Prioritization"], time: "3 weeks" },
      { title: "Specs & Roadmaps", description: "Communicate the plan.", topics: ["PRDs", "User stories", "Roadmap formats", "Trade-offs"], time: "2 weeks" },
      { title: "Working with Engineers & Designers", description: "Run a great team.", topics: ["Standups", "Reviews", "Estimation", "Handoffs"], time: "3 weeks" },
      { title: "First PM Case Study", description: "A portfolio piece.", topics: ["Pick a product", "Identify a problem", "Propose a solution", "Write it up"], time: "3 weeks" },
    ],
    [
      { title: "Metrics & Experimentation", description: "Decide with data.", topics: ["North-star metrics", "A/B testing", "Funnels", "Cohorts"], time: "3 weeks" },
      { title: "Strategy & Positioning", description: "Beyond features.", topics: ["Market analysis", "Competitive moats", "Pricing", "GTM"], time: "3 weeks" },
      { title: "Product Discovery", description: "Continuous discovery habits.", topics: ["Opportunity trees", "Assumption testing", "Prototypes", "Research ops"], time: "3 weeks" },
      { title: "Cross-Functional Leadership", description: "Influence without authority.", topics: ["Alignment", "Comms", "Conflict", "Stakeholders"], time: "2 weeks" },
      { title: "End-to-End Launch", description: "Ship something real.", topics: ["Plan", "Build", "Launch", "Post-mortem"], time: "4 weeks" },
    ],
    [
      { title: "Product Strategy at Scale", description: "Set multi-quarter direction.", topics: ["Vision", "Bets", "Portfolio", "Trade-offs"], time: "3 weeks" },
      { title: "Platform & Ecosystem PM", description: "Build platforms others build on.", topics: ["APIs", "Developer experience", "Marketplaces", "Partnerships"], time: "3 weeks" },
      { title: "Operating Model", description: "Make the org effective.", topics: ["OKRs", "Planning rituals", "Reviews", "Decision frameworks"], time: "3 weeks" },
      { title: "Writing & Storytelling", description: "Lead through narratives.", topics: ["Long-form memos", "Exec comms", "Talks", "Published essays"], time: "Ongoing" },
      { title: "Lead a Product Org", description: "Grow other PMs.", topics: ["Hiring", "Career frameworks", "Coaching", "Strategy reviews"], time: "Ongoing" },
    ],
  ),
};
