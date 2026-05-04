export type NodeStatus = "pending" | "done" | "in-progress" | "skip";
export type NodeKind = "must" | "optional" | "alt";

export interface RoadmapNode {
  id: string;
  title: string;
  kind: NodeKind;
  description: string;
  resources: { label: string; url: string }[];
}

export interface RoadmapSection {
  id: string;
  title: string;
  nodes: RoadmapNode[];
}

export interface RoadmapDef {
  id: string;
  title: string;
  emoji: string;
  description: string;
  sections: RoadmapSection[];
}

const r = (label: string, url: string) => ({ label, url });

export const ROADMAPS: RoadmapDef[] = [
  {
    id: "frontend",
    title: "Frontend Developer",
    emoji: "🎨",
    description: "Build beautiful, fast, accessible web interfaces with modern tooling.",
    sections: [
      {
        id: "internet",
        title: "Internet",
        nodes: [
          { id: "fe-internet", title: "How the Internet Works", kind: "must", description: "DNS, HTTP, hosting, browsers.", resources: [r("MDN: How the web works", "https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_the_Web_works")] },
          { id: "fe-http", title: "HTTP / HTTPS", kind: "must", description: "Methods, status codes, cookies, CORS.", resources: [r("MDN HTTP", "https://developer.mozilla.org/en-US/docs/Web/HTTP")] },
        ],
      },
      {
        id: "html",
        title: "HTML",
        nodes: [
          { id: "fe-html-basics", title: "HTML Basics", kind: "must", description: "Tags, attributes, semantic structure.", resources: [r("freeCodeCamp HTML", "https://www.freecodecamp.org/learn/2022/responsive-web-design/")] },
          { id: "fe-html-a11y", title: "Accessibility (a11y)", kind: "must", description: "ARIA, keyboard, contrast, semantics.", resources: [r("web.dev Accessibility", "https://web.dev/learn/accessibility")] },
          { id: "fe-html-seo", title: "SEO Basics", kind: "optional", description: "Meta tags, semantic HTML, perf.", resources: [r("Google SEO Starter", "https://developers.google.com/search/docs/fundamentals/seo-starter-guide")] },
        ],
      },
      {
        id: "css",
        title: "CSS",
        nodes: [
          { id: "fe-css-basics", title: "CSS Basics", kind: "must", description: "Selectors, box model, specificity.", resources: [r("MDN CSS", "https://developer.mozilla.org/en-US/docs/Learn/CSS")] },
          { id: "fe-css-flex", title: "Flexbox & Grid", kind: "must", description: "Modern layout systems.", resources: [r("CSS Tricks Flex", "https://css-tricks.com/snippets/css/a-guide-to-flexbox/")] },
          { id: "fe-css-tw", title: "Tailwind CSS", kind: "optional", description: "Utility-first CSS framework.", resources: [r("Tailwind Docs", "https://tailwindcss.com/docs")] },
          { id: "fe-css-sass", title: "Sass / SCSS", kind: "alt", description: "CSS preprocessor.", resources: [r("Sass Docs", "https://sass-lang.com/documentation/")] },
        ],
      },
      {
        id: "js",
        title: "JavaScript",
        nodes: [
          { id: "fe-js-basics", title: "JS Fundamentals", kind: "must", description: "Syntax, types, control flow.", resources: [r("JavaScript.info", "https://javascript.info/")] },
          { id: "fe-js-dom", title: "DOM & Events", kind: "must", description: "Manipulate the DOM, handle events.", resources: [r("MDN DOM", "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model")] },
          { id: "fe-js-fetch", title: "Fetch & Promises", kind: "must", description: "Async, await, REST calls.", resources: [r("MDN Fetch", "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API")] },
          { id: "fe-ts", title: "TypeScript", kind: "optional", description: "Typed JS for large apps.", resources: [r("TS Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html")] },
        ],
      },
      {
        id: "framework",
        title: "Framework",
        nodes: [
          { id: "fe-react", title: "React", kind: "must", description: "Component-based UI library.", resources: [r("react.dev", "https://react.dev/learn")] },
          { id: "fe-vue", title: "Vue", kind: "alt", description: "Approachable progressive framework.", resources: [r("Vue.js", "https://vuejs.org/guide/introduction.html")] },
          { id: "fe-svelte", title: "Svelte", kind: "alt", description: "Compile-time reactive framework.", resources: [r("Svelte Tutorial", "https://svelte.dev/tutorial")] },
        ],
      },
      {
        id: "tools",
        title: "Tooling & Deploy",
        nodes: [
          { id: "fe-git", title: "Git & GitHub", kind: "must", description: "Version control essentials.", resources: [r("GitHub Skills", "https://skills.github.com/")] },
          { id: "fe-vite", title: "Vite / Build tools", kind: "must", description: "Modern dev server & bundling.", resources: [r("Vite", "https://vitejs.dev/guide/")] },
          { id: "fe-test", title: "Testing", kind: "optional", description: "Vitest, Playwright, Cypress.", resources: [r("Vitest", "https://vitest.dev/")] },
        ],
      },
    ],
  },
  {
    id: "backend",
    title: "Backend Developer",
    emoji: "⚙️",
    description: "Design APIs, databases and scalable services.",
    sections: [
      { id: "be-lang", title: "Language", nodes: [
        { id: "be-node", title: "Node.js", kind: "must", description: "JS runtime for servers.", resources: [r("Node Docs", "https://nodejs.org/en/learn")] },
        { id: "be-py", title: "Python", kind: "alt", description: "Versatile backend language.", resources: [r("Python Docs", "https://docs.python.org/3/tutorial/")] },
        { id: "be-go", title: "Go", kind: "alt", description: "Fast, simple, concurrent.", resources: [r("Go Tour", "https://go.dev/tour/")] },
      ]},
      { id: "be-api", title: "APIs", nodes: [
        { id: "be-rest", title: "REST", kind: "must", description: "Standard HTTP API design.", resources: [r("REST API Tutorial", "https://restfulapi.net/")] },
        { id: "be-graphql", title: "GraphQL", kind: "optional", description: "Query language for APIs.", resources: [r("GraphQL", "https://graphql.org/learn/")] },
      ]},
      { id: "be-db", title: "Databases", nodes: [
        { id: "be-sql", title: "PostgreSQL", kind: "must", description: "Relational DB, SQL.", resources: [r("PostgreSQL Tutorial", "https://www.postgresqltutorial.com/")] },
        { id: "be-mongo", title: "MongoDB", kind: "alt", description: "Document NoSQL DB.", resources: [r("MongoDB University", "https://learn.mongodb.com/")] },
        { id: "be-redis", title: "Redis", kind: "optional", description: "In-memory cache & queues.", resources: [r("Redis", "https://redis.io/docs/latest/")] },
      ]},
      { id: "be-auth", title: "Auth & Security", nodes: [
        { id: "be-jwt", title: "JWT / OAuth", kind: "must", description: "Token-based auth.", resources: [r("JWT.io", "https://jwt.io/introduction")] },
        { id: "be-owasp", title: "OWASP Top 10", kind: "must", description: "Common web vulns.", resources: [r("OWASP", "https://owasp.org/www-project-top-ten/")] },
      ]},
      { id: "be-deploy", title: "Deployment", nodes: [
        { id: "be-docker", title: "Docker", kind: "must", description: "Containerization.", resources: [r("Docker Get Started", "https://docs.docker.com/get-started/")] },
        { id: "be-ci", title: "CI/CD", kind: "optional", description: "Automated build & deploy.", resources: [r("GitHub Actions", "https://docs.github.com/actions")] },
      ]},
    ],
  },
  {
    id: "devops",
    title: "DevOps / Cloud",
    emoji: "☁️",
    description: "Automate, scale, and operate reliable cloud infrastructure.",
    sections: [
      { id: "do-os", title: "OS & Networking", nodes: [
        { id: "do-linux", title: "Linux Basics", kind: "must", description: "Shell, processes, permissions.", resources: [r("Linux Journey", "https://linuxjourney.com/")] },
        { id: "do-net", title: "Networking", kind: "must", description: "DNS, TCP/IP, load balancers.", resources: [r("Computer Networking", "https://www.geeksforgeeks.org/computer-network-tutorials/")] },
      ]},
      { id: "do-cloud", title: "Cloud", nodes: [
        { id: "do-aws", title: "AWS", kind: "must", description: "EC2, S3, IAM basics.", resources: [r("AWS Skill Builder", "https://explore.skillbuilder.aws/")] },
        { id: "do-gcp", title: "GCP", kind: "alt", description: "Google Cloud essentials.", resources: [r("GCP Docs", "https://cloud.google.com/docs")] },
      ]},
      { id: "do-iac", title: "IaC & Containers", nodes: [
        { id: "do-tf", title: "Terraform", kind: "must", description: "Infrastructure as code.", resources: [r("Terraform Learn", "https://developer.hashicorp.com/terraform/tutorials")] },
        { id: "do-k8s", title: "Kubernetes", kind: "must", description: "Container orchestration.", resources: [r("Kubernetes Basics", "https://kubernetes.io/docs/tutorials/kubernetes-basics/")] },
      ]},
      { id: "do-obs", title: "Observability", nodes: [
        { id: "do-prom", title: "Prometheus + Grafana", kind: "must", description: "Metrics & dashboards.", resources: [r("Prometheus", "https://prometheus.io/docs/introduction/overview/")] },
        { id: "do-elk", title: "ELK / Loki", kind: "optional", description: "Centralized logs.", resources: [r("Grafana Loki", "https://grafana.com/docs/loki/latest/")] },
      ]},
    ],
  },
  {
    id: "fullstack",
    title: "Full Stack",
    emoji: "🧩",
    description: "Combine frontend, backend and deployment to ship complete products.",
    sections: [
      { id: "fs-fe", title: "Frontend Core", nodes: [
        { id: "fs-html", title: "HTML / CSS / JS", kind: "must", description: "Web foundation.", resources: [r("MDN", "https://developer.mozilla.org/en-US/docs/Learn")] },
        { id: "fs-react", title: "React + Tailwind", kind: "must", description: "Modern UI stack.", resources: [r("react.dev", "https://react.dev/learn")] },
      ]},
      { id: "fs-be", title: "Backend Core", nodes: [
        { id: "fs-node", title: "Node + Express", kind: "must", description: "REST API server.", resources: [r("Express", "https://expressjs.com/")] },
        { id: "fs-pg", title: "PostgreSQL", kind: "must", description: "Relational DB.", resources: [r("PG Tutorial", "https://www.postgresqltutorial.com/")] },
      ]},
      { id: "fs-meta", title: "Meta-frameworks", nodes: [
        { id: "fs-next", title: "Next.js", kind: "optional", description: "Full-stack React framework.", resources: [r("Next.js Learn", "https://nextjs.org/learn")] },
      ]},
      { id: "fs-deploy", title: "Deploy", nodes: [
        { id: "fs-vercel", title: "Vercel / Netlify", kind: "must", description: "Frontend hosting.", resources: [r("Vercel Docs", "https://vercel.com/docs")] },
        { id: "fs-docker", title: "Docker", kind: "optional", description: "Containerize backend.", resources: [r("Docker", "https://docs.docker.com/get-started/")] },
      ]},
    ],
  },
  {
    id: "dsa",
    title: "DSA & Competitive Programming",
    emoji: "🧠",
    description: "Master data structures, algorithms and problem-solving.",
    sections: [
      { id: "dsa-basic", title: "Foundations", nodes: [
        { id: "dsa-bigo", title: "Big-O & Complexity", kind: "must", description: "Time/space analysis.", resources: [r("Big-O Cheat Sheet", "https://www.bigocheatsheet.com/")] },
        { id: "dsa-arr", title: "Arrays & Strings", kind: "must", description: "Two pointers, sliding window.", resources: [r("NeetCode", "https://neetcode.io/roadmap")] },
      ]},
      { id: "dsa-ds", title: "Data Structures", nodes: [
        { id: "dsa-ll", title: "Linked Lists", kind: "must", description: "Singly, doubly, cycle detection.", resources: [r("LeetCode LL", "https://leetcode.com/tag/linked-list/")] },
        { id: "dsa-tree", title: "Trees & Graphs", kind: "must", description: "BFS/DFS, traversals.", resources: [r("Visualgo", "https://visualgo.net/")] },
        { id: "dsa-heap", title: "Heaps & Tries", kind: "optional", description: "Priority queues, prefix trees.", resources: [r("CP Algorithms", "https://cp-algorithms.com/")] },
      ]},
      { id: "dsa-algo", title: "Algorithms", nodes: [
        { id: "dsa-dp", title: "Dynamic Programming", kind: "must", description: "Memoization, tabulation.", resources: [r("DP Patterns", "https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns")] },
        { id: "dsa-greedy", title: "Greedy & Backtracking", kind: "must", description: "Decision-making algorithms.", resources: [r("CP Algorithms", "https://cp-algorithms.com/")] },
      ]},
      { id: "dsa-cp", title: "Practice", nodes: [
        { id: "dsa-lc", title: "LeetCode 150", kind: "must", description: "Curated interview list.", resources: [r("LeetCode 150", "https://leetcode.com/studyplan/top-interview-150/")] },
        { id: "dsa-cf", title: "Codeforces", kind: "optional", description: "Competitive contests.", resources: [r("Codeforces", "https://codeforces.com/")] },
      ]},
    ],
  },
  {
    id: "ai-ml",
    title: "AI / Machine Learning",
    emoji: "🤖",
    description: "From math foundations to building real ML & LLM systems.",
    sections: [
      { id: "ml-math", title: "Math", nodes: [
        { id: "ml-linalg", title: "Linear Algebra", kind: "must", description: "Vectors, matrices, eigenvalues.", resources: [r("3Blue1Brown", "https://www.3blue1brown.com/topics/linear-algebra")] },
        { id: "ml-prob", title: "Probability & Stats", kind: "must", description: "Distributions, Bayes.", resources: [r("Khan Academy", "https://www.khanacademy.org/math/statistics-probability")] },
      ]},
      { id: "ml-py", title: "Python Stack", nodes: [
        { id: "ml-numpy", title: "NumPy / Pandas", kind: "must", description: "Data wrangling.", resources: [r("Pandas Docs", "https://pandas.pydata.org/docs/getting_started/index.html")] },
        { id: "ml-sk", title: "scikit-learn", kind: "must", description: "Classical ML models.", resources: [r("scikit-learn", "https://scikit-learn.org/stable/tutorial/")] },
      ]},
      { id: "ml-dl", title: "Deep Learning", nodes: [
        { id: "ml-pytorch", title: "PyTorch", kind: "must", description: "Modern DL framework.", resources: [r("PyTorch Tutorials", "https://pytorch.org/tutorials/")] },
        { id: "ml-tf", title: "TensorFlow", kind: "alt", description: "Alternative DL framework.", resources: [r("TF Guides", "https://www.tensorflow.org/learn")] },
      ]},
      { id: "ml-llm", title: "LLMs & GenAI", nodes: [
        { id: "ml-hf", title: "Hugging Face", kind: "must", description: "Transformers, datasets.", resources: [r("HF Course", "https://huggingface.co/learn")] },
        { id: "ml-rag", title: "RAG & Agents", kind: "optional", description: "Retrieval-augmented apps.", resources: [r("LangChain", "https://python.langchain.com/docs/get_started/introduction")] },
      ]},
    ],
  },
  {
    id: "mobile",
    title: "Android / iOS",
    emoji: "📱",
    description: "Ship native and cross-platform mobile apps.",
    sections: [
      { id: "mob-cross", title: "Cross-platform", nodes: [
        { id: "mob-rn", title: "React Native", kind: "must", description: "JS-based cross-platform.", resources: [r("React Native", "https://reactnative.dev/docs/getting-started")] },
        { id: "mob-flutter", title: "Flutter", kind: "alt", description: "Dart-based UI toolkit.", resources: [r("Flutter Docs", "https://docs.flutter.dev/")] },
      ]},
      { id: "mob-android", title: "Android", nodes: [
        { id: "mob-kotlin", title: "Kotlin + Jetpack Compose", kind: "must", description: "Modern Android UI.", resources: [r("Android Devs", "https://developer.android.com/courses")] },
      ]},
      { id: "mob-ios", title: "iOS", nodes: [
        { id: "mob-swift", title: "Swift + SwiftUI", kind: "must", description: "Apple's modern stack.", resources: [r("Swift.org", "https://www.swift.org/getting-started/")] },
      ]},
      { id: "mob-deploy", title: "Publishing", nodes: [
        { id: "mob-store", title: "Play Store / App Store", kind: "must", description: "Release & review process.", resources: [r("Play Console", "https://developer.android.com/distribute/console")] },
      ]},
    ],
  },
  {
    id: "system-design",
    title: "System Design",
    emoji: "🏗️",
    description: "Design scalable, reliable distributed systems.",
    sections: [
      { id: "sd-foundations", title: "Foundations", nodes: [
        { id: "sd-basics", title: "Scalability Basics", kind: "must", description: "Vertical vs horizontal scaling.", resources: [r("System Design Primer", "https://github.com/donnemartin/system-design-primer")] },
        { id: "sd-cap", title: "CAP Theorem", kind: "must", description: "Tradeoffs in distributed systems.", resources: [r("CAP Theorem", "https://www.ibm.com/topics/cap-theorem")] },
      ]},
      { id: "sd-data", title: "Data Layer", nodes: [
        { id: "sd-cache", title: "Caching", kind: "must", description: "Redis, CDN, browser cache.", resources: [r("Cache Strategies", "https://aws.amazon.com/caching/")] },
        { id: "sd-shard", title: "Sharding & Replication", kind: "must", description: "Scale databases.", resources: [r("MongoDB Sharding", "https://www.mongodb.com/docs/manual/sharding/")] },
      ]},
      { id: "sd-comm", title: "Communication", nodes: [
        { id: "sd-mq", title: "Message Queues", kind: "must", description: "Kafka, RabbitMQ.", resources: [r("Kafka Quickstart", "https://kafka.apache.org/quickstart")] },
        { id: "sd-grpc", title: "gRPC / WebSockets", kind: "optional", description: "Realtime & RPC.", resources: [r("gRPC", "https://grpc.io/docs/what-is-grpc/introduction/")] },
      ]},
      { id: "sd-case", title: "Case Studies", nodes: [
        { id: "sd-url", title: "Design URL Shortener", kind: "must", description: "Classic interview problem.", resources: [r("System Design Interview", "https://github.com/donnemartin/system-design-primer#system-design-interview-questions-with-solutions")] },
        { id: "sd-feed", title: "Design News Feed", kind: "optional", description: "Push vs pull, ranking.", resources: [r("News Feed Design", "https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/social_graph/README.md")] },
      ]},
    ],
  },
];

export const getRoadmap = (id: string) => ROADMAPS.find((r) => r.id === id);

const KEY = (id: string) => `rize.roadmap.progress.${id}`;

export type ProgressMap = Record<string, NodeStatus>;

export const loadProgress = (roadmapId: string): ProgressMap => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY(roadmapId)) || "{}");
  } catch {
    return {};
  }
};

export const saveProgress = (roadmapId: string, p: ProgressMap) => {
  localStorage.setItem(KEY(roadmapId), JSON.stringify(p));
};