import { Course, AssessmentHistoryItem } from "../types";

export interface CourseAssignmentModule {
  id: string;
  title: string;
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  recommendedQuestionCount: number;
  description: string;
  estimatedMinutes: number;
  moduleTitle: string;
  keyCompetencies: string[];
}

export const SEED_COURSE_ASSESSMENTS: AssessmentHistoryItem[] = [
  // Full Stack Development Track (fullstack-core-101)
  {
    id: "fs-eval-1",
    title: "React 19 Server Actions & Optimistic State Assessment",
    topic: "React 19 Server Actions & Optimistic State",
    courseId: "fullstack-core-101",
    courseTitle: "Modern Full-Stack Development: React 19, Node.js & Scalable APIs",
    date: "2026-09-14",
    score: 96,
    totalPoints: 100,
    percentage: 96,
    letterGrade: "A",
    openEndedFeedback: {
      score: 96,
      letterGrade: "A",
      summaryFeedback: "Superb mastery of React 19 optimistic UI rollbacks and transition boundaries. Provided elegant state preservation mechanisms under simulated network degradation.",
      strengths: [
        "Flawless implementation of optimistic rollback snapshots",
        "Clear differentiation between useActionState and client-side useState",
        "Proper handling of pending transition indicators"
      ],
      areasForImprovement: [
        "Include idempotent request headers (Idempotency-Key) on network retries"
      ],
      suggestedReviewTopics: [
        "React 19 useOptimistic hook with WebSocket broadcasts",
        "Stale-While-Revalidate client caching"
      ]
    }
  },
  {
    id: "fs-eval-2",
    title: "Express REST Microservices & JWT Security Audit",
    topic: "Express REST Microservices & JWT Security",
    courseId: "fullstack-core-101",
    courseTitle: "Modern Full-Stack Development: React 19, Node.js & Scalable APIs",
    date: "2026-09-11",
    score: 91,
    totalPoints: 100,
    percentage: 91,
    letterGrade: "A-",
    openEndedFeedback: {
      score: 91,
      letterGrade: "A-",
      summaryFeedback: "Strong comprehension of cryptographic signing algorithms (RS256 vs HS256), token rotation strategies, and route guard middleware order.",
      strengths: [
        "Correct implementation of asymmetric token verification",
        "HttpOnly cookie security flags and CSRF mitigation discussion"
      ],
      areasForImprovement: [
        "Elaborate on Redis-backed distributed token revocation lists"
      ],
      suggestedReviewTopics: [
        "OAuth2 Authorization Code Flow with PKCE",
        "Rate-limiting algorithms with leaky-bucket Redis scripts"
      ]
    }
  },
  {
    id: "fs-eval-3",
    title: "PostgreSQL ACID Transactions & Connection Pool Optimization",
    topic: "PostgreSQL ACID Transactions & Connection Pooling",
    courseId: "fullstack-core-101",
    courseTitle: "Modern Full-Stack Development: React 19, Node.js & Scalable APIs",
    date: "2026-09-08",
    score: 88,
    totalPoints: 100,
    percentage: 88,
    letterGrade: "B+",
    openEndedFeedback: {
      score: 88,
      letterGrade: "B+",
      summaryFeedback: "Solid architectural understanding of isolation levels (Read Committed vs Serializable) and connection pool exhaustion prevention.",
      strengths: [
        "Accurate identification of Phantom Reads vs Non-Repeatable Reads",
        "Clean transaction rollback blocks with pg client error traps"
      ],
      areasForImprovement: [
        "Discuss PgBouncer transaction pooling limitations with prepared statements"
      ],
      suggestedReviewTopics: [
        "B-Tree and GIN Index performance tuning on high-frequency tables"
      ]
    }
  },

  // Cloud-Native DevOps Track (cloud-devops-301)
  {
    id: "devops-eval-1",
    title: "Kubernetes Health Probes & Graceful SIGTERM Shutdown",
    topic: "Kubernetes Health Probes & Graceful Shutdowns",
    courseId: "cloud-devops-301",
    courseTitle: "Cloud-Native DevOps & Distributed Systems",
    date: "2026-09-13",
    score: 94,
    totalPoints: 100,
    percentage: 94,
    letterGrade: "A",
    openEndedFeedback: {
      score: 94,
      letterGrade: "A",
      summaryFeedback: "Exemplary explanation of preStop hooks, kubelet endpoint deregistration propagation delay, and Node.js server.close() mechanics during pod eviction.",
      strengths: [
        "Precise timing sequence between iptables updates and container SIGTERM",
        "Clean YAML definitions for startup, liveness, and readiness probes"
      ],
      areasForImprovement: [
        "Specify pod disruption budget (PDB) considerations for single-node maintenance"
      ],
      suggestedReviewTopics: [
        "Kube-proxy IPVS mode connection draining",
        "Envoy active health checking vs passive outlier detection"
      ]
    }
  },
  {
    id: "devops-eval-2",
    title: "Zero-Downtime Rolling Deployments & Blue-Green Architectures",
    topic: "Zero-Downtime Rolling Updates & Blue-Green Deployments",
    courseId: "cloud-devops-301",
    courseTitle: "Cloud-Native DevOps & Distributed Systems",
    date: "2026-09-10",
    score: 89,
    totalPoints: 100,
    percentage: 89,
    letterGrade: "B+",
    openEndedFeedback: {
      score: 89,
      letterGrade: "B+",
      summaryFeedback: "Solid calculation of maxSurge and maxUnavailable percentages during high-traffic continuous delivery rollouts.",
      strengths: [
        "Clear risk analysis of schema migrations during dual-version rolling windows",
        "Proper rollback triggers based on Prometheus HTTP 5xx error spikes"
      ],
      areasForImprovement: [
        "Include canary traffic split algorithms via Service Mesh virtual services"
      ],
      suggestedReviewTopics: [
        "Argo Rollouts automated analysis with metric providers"
      ]
    }
  },
  {
    id: "devops-eval-3",
    title: "Ingress Controllers & In-Flight TLS Termination",
    topic: "Ingress Controllers & In-Flight TLS Termination",
    courseId: "cloud-devops-301",
    courseTitle: "Cloud-Native DevOps & Distributed Systems",
    date: "2026-09-06",
    score: 92,
    totalPoints: 100,
    percentage: 92,
    letterGrade: "A-",
    openEndedFeedback: {
      score: 92,
      letterGrade: "A-",
      summaryFeedback: "Thorough architectural breakdown of NGINX / Traefik ingress routing, SNI multiplexing, and automatic cert-manager Let's Encrypt renewal.",
      strengths: [
        "Comprehensive SSL cipher hardening configuration",
        "Clear explanation of HTTP/2 multiplexing performance gains"
      ],
      areasForImprovement: [
        "Discuss mutual TLS (mTLS) performance overhead across service-to-service links"
      ],
      suggestedReviewTopics: [
        "Gateway API standard vs legacy Ingress v1"
      ]
    }
  },

  // Generative AI Track (genai-arch-101)
  {
    id: "genai-eval-1",
    title: "Hybrid RAG & Reciprocal Rank Fusion Architecture",
    topic: "Hybrid RAG & Reciprocal Rank Fusion",
    courseId: "genai-arch-101",
    courseTitle: "Architecting Generative AI & Large Language Model Systems",
    date: "2026-09-13",
    score: 92,
    totalPoints: 100,
    percentage: 92,
    letterGrade: "A",
    openEndedFeedback: {
      score: 92,
      letterGrade: "A",
      summaryFeedback: "Outstanding grasp of reciprocal rank weighting and parent-child document trees. Thorough explanation of sparse/dense trade-offs.",
      strengths: [
        "Clear differentiation between BM25 lexical search and dense cosine ranking",
        "Concrete discussion of cross-encoder rerank latency vs bi-encoder speed"
      ],
      areasForImprovement: [
        "Mention memory consumption overhead of hybrid index caching"
      ],
      suggestedReviewTopics: [
        "Quantized Vector Embeddings (HNSW with product quantization)",
        "Streaming Rerank pipelines with early stopping"
      ]
    }
  },
  {
    id: "genai-eval-2",
    title: "Hierarchical Context Windows & Semantic Chunking Evaluation",
    topic: "Hierarchical Context Windows & Semantic Chunking",
    courseId: "genai-arch-101",
    courseTitle: "Architecting Generative AI & Large Language Model Systems",
    date: "2026-09-09",
    score: 95,
    totalPoints: 100,
    percentage: 95,
    letterGrade: "A",
    openEndedFeedback: {
      score: 95,
      letterGrade: "A",
      summaryFeedback: "Brilliant analysis of semantic boundary detection, sliding window token overlap, and lost-in-the-middle phenomena in ultra-long contexts.",
      strengths: [
        "Effective mathematical justification for chunk size vs retrieval recall",
        "Structured proposition-based extraction breakdown"
      ],
      areasForImprovement: [
        "Analyze compute cost trade-offs of LLM-based chunk summarization"
      ],
      suggestedReviewTopics: [
        "Context compression via selective token pruning"
      ]
    }
  },

  // Deep Learning Track (deep-learning-201)
  {
    id: "dl-eval-1",
    title: "Scaled Dot-Product Attention & QKV Matrix Calculus",
    topic: "Scaled Dot-Product Attention & QKV Projections",
    courseId: "deep-learning-201",
    courseTitle: "Deep Learning Foundations: Transformers & Neural Systems",
    date: "2026-09-12",
    score: 93,
    totalPoints: 100,
    percentage: 93,
    letterGrade: "A",
    openEndedFeedback: {
      score: 93,
      letterGrade: "A",
      summaryFeedback: "Flawless mathematical derivation of 1/sqrt(d_k) scaling factor preventing softmax saturation. Excellent tensor dimension walkthrough.",
      strengths: [
        "Clean derivation of backpropagation gradients through attention weight matrices",
        "Accurate visualization of multi-head subspace projection"
      ],
      areasForImprovement: [
        "Discuss FlashAttention SRAM tiling optimizations"
      ],
      suggestedReviewTopics: [
        "FlashAttention-2 and FlashDecoding kernel mechanics",
        "Grouped-Query Attention (GQA) memory footprint reduction"
      ]
    }
  },
  {
    id: "dl-eval-2",
    title: "LayerNorm vs RMSNorm Dynamics in Deep Transformer Stability",
    topic: "LayerNorm vs RMSNorm Dynamics in Deep Networks",
    courseId: "deep-learning-201",
    courseTitle: "Deep Learning Foundations: Transformers & Neural Systems",
    date: "2026-09-07",
    score: 87,
    totalPoints: 100,
    percentage: 87,
    letterGrade: "B+",
    openEndedFeedback: {
      score: 87,
      letterGrade: "B+",
      summaryFeedback: "Clear comprehension of mean-centering computational overhead in standard LayerNorm and why RMSNorm retains scale invariance.",
      strengths: [
        "Correct formulation of root-mean-square normalization formula",
        "Empirical discussion of pre-LN vs post-LN gradient flow"
      ],
      areasForImprovement: [
        "Detail zero-centered weight initialization strategies"
      ],
      suggestedReviewTopics: [
        "SwiGLU activation function integration with RMSNorm"
      ]
    }
  }
];

/**
 * Returns structured, curated assignment modules strictly aligned to the given course
 */
export function getCourseAssignmentModules(course?: Course | null): CourseAssignmentModule[] {
  if (!course) return [];
  const cid = (course.id || "").toLowerCase();
  const ctitle = (course.title || "").toLowerCase();
  const ccat = (course.category || "").toLowerCase();

  // 1. Cloud-Native & DevOps
  if (cid.includes("cloud") || cid.includes("devops") || ccat.includes("cloud") || ccat.includes("devops")) {
    return [
      {
        id: "mod-devops-1",
        title: "Kubernetes Probes & Graceful Shutdowns",
        topic: "Kubernetes Health Probes & Graceful Shutdowns",
        difficulty: "Intermediate",
        recommendedQuestionCount: 4,
        description: "Analyze container lifecycle events, liveness vs readiness probes, and zero-downtime SIGTERM handling.",
        estimatedMinutes: 20,
        moduleTitle: "Module 1: Container Orchestration & Lifecycle",
        keyCompetencies: ["Probes", "SIGTERM", "Endpoint Deregistration", "Zero Downtime"]
      },
      {
        id: "mod-devops-2",
        title: "Zero-Downtime Rolling Deployments & Blue-Green",
        topic: "Zero-Downtime Rolling Updates & Blue-Green Deployments",
        difficulty: "Advanced",
        recommendedQuestionCount: 4,
        description: "Evaluate deployment rollback strategies, maxSurge / maxUnavailable thresholds, and database migration risks.",
        estimatedMinutes: 25,
        moduleTitle: "Module 2: Release Engineering & Deployment Patterns",
        keyCompetencies: ["Rolling Updates", "Blue-Green", "Health Gates", "Schema Versioning"]
      },
      {
        id: "mod-devops-3",
        title: "Ingress Controllers, TLS & Traffic Routing",
        topic: "Ingress Controllers & In-Flight TLS Termination",
        difficulty: "Intermediate",
        recommendedQuestionCount: 3,
        description: "Configure layer-7 ingress rules, TLS cert-manager lifecycle, SNI multiplexing, and sticky routing.",
        estimatedMinutes: 15,
        moduleTitle: "Module 3: Ingress & Edge Traffic Management",
        keyCompetencies: ["Ingress", "TLS Termination", "Cert-Manager", "HTTP/2 Routing"]
      },
      {
        id: "mod-devops-4",
        title: "Helm Package Management & GitOps Delivery",
        topic: "Helm Charts & GitOps CI/CD Pipelines",
        difficulty: "Intermediate",
        recommendedQuestionCount: 4,
        description: "Structure modular Helm values, atomic releases, and GitOps synchronization with declarative state.",
        estimatedMinutes: 20,
        moduleTitle: "Module 4: Infrastructure as Code & Automation",
        keyCompetencies: ["Helm Charts", "GitOps", "Declarative IaC", "Atomic Rollouts"]
      }
    ];
  }

  // 2. Full Stack Development
  if (cid.includes("fullstack") || ccat.includes("full stack") || ctitle.includes("full-stack")) {
    return [
      {
        id: "mod-fs-1",
        title: "React 19 Server Actions & Optimistic State",
        topic: "React 19 Server Actions & Optimistic State",
        difficulty: "Intermediate",
        recommendedQuestionCount: 4,
        description: "Verify optimistic UI updates, state reconciliation rollbacks, and concurrent transition boundaries.",
        estimatedMinutes: 20,
        moduleTitle: "Module 1: Modern Frontend Architecture & State",
        keyCompetencies: ["React 19", "Optimistic UI", "Server Actions", "State Reconciliation"]
      },
      {
        id: "mod-fs-2",
        title: "Express REST Microservices & JWT Security",
        topic: "Express REST Microservices & JWT Security",
        difficulty: "Intermediate",
        recommendedQuestionCount: 4,
        description: "Design modular API controllers, JWT asymmetric verification, rate limiting, and structured validation.",
        estimatedMinutes: 20,
        moduleTitle: "Module 2: High-Performance Backend APIs",
        keyCompetencies: ["Express.js", "JWT RS256", "Middleware", "Input Validation"]
      },
      {
        id: "mod-fs-3",
        title: "PostgreSQL ACID Transactions & Connection Pooling",
        topic: "PostgreSQL ACID Transactions & Connection Pooling",
        difficulty: "Advanced",
        recommendedQuestionCount: 4,
        description: "Master isolation levels, deadlock prevention, connection pool management, and B-Tree indexing.",
        estimatedMinutes: 25,
        moduleTitle: "Module 3: Scalable Relational Data with PostgreSQL",
        keyCompetencies: ["PostgreSQL", "ACID", "Pool Exhaustion", "Index Strategies"]
      },
      {
        id: "mod-fs-4",
        title: "Redis Cache-Aside Patterns & Edge Invalidation",
        topic: "Redis Cache-Aside Patterns & Edge Invalidation",
        difficulty: "Intermediate",
        recommendedQuestionCount: 3,
        description: "Implement distributed caching, cache stampede prevention, TTL strategies, and stale-while-revalidate.",
        estimatedMinutes: 15,
        moduleTitle: "Module 4: Performance, Caching & Scalability",
        keyCompetencies: ["Redis", "Cache-Aside", "Stampede Defense", "Cache Invalidation"]
      }
    ];
  }

  // 3. Generative AI Track
  if (cid.includes("genai") || ccat.includes("artificial") || ctitle.includes("generative")) {
    return [
      {
        id: "mod-genai-1",
        title: "Hybrid RAG & Reciprocal Rank Fusion",
        topic: "Hybrid RAG & Reciprocal Rank Fusion",
        difficulty: "Intermediate",
        recommendedQuestionCount: 4,
        description: "Evaluate sparse BM25 and dense vector search fusion, cross-encoder reranking, and retrieval latency.",
        estimatedMinutes: 20,
        moduleTitle: "Module 1: Enterprise Retrieval-Augmented Generation",
        keyCompetencies: ["Hybrid RAG", "Reciprocal Rank Fusion", "BM25", "Cross-Encoders"]
      },
      {
        id: "mod-genai-2",
        title: "Hierarchical Context Windows & Semantic Chunking",
        topic: "Hierarchical Context Windows & Semantic Chunking",
        difficulty: "Intermediate",
        recommendedQuestionCount: 4,
        description: "Optimize chunking strategies, parent-child trees, sliding window overlap, and long-context recall.",
        estimatedMinutes: 20,
        moduleTitle: "Module 2: Context Engineering & Chunking Strategies",
        keyCompetencies: ["Semantic Chunking", "Parent-Child Trees", "Window Overlap", "Lost-in-the-Middle"]
      },
      {
        id: "mod-genai-3",
        title: "Multi-Agent Reflection & Grounding Verification",
        topic: "Multi-Agent Reflection & Grounding Verification",
        difficulty: "Advanced",
        recommendedQuestionCount: 4,
        description: "Construct reflective agent feedback loops, tool-calling validation, and hallucination reduction gates.",
        estimatedMinutes: 25,
        moduleTitle: "Module 3: Agentic Workflows & Multi-Step Reasoning",
        keyCompetencies: ["Agent Reflection", "Tool Execution", "Fact Verification", "Self-Correction"]
      },
      {
        id: "mod-genai-4",
        title: "Vector Embeddings & Cosine Similarity Metrics",
        topic: "Vector Embeddings & Cosine Similarity Metrics",
        difficulty: "Intermediate",
        recommendedQuestionCount: 3,
        description: "Analyze vector spaces, cosine distance vs dot product, dimensionality reduction, and HNSW index tuning.",
        estimatedMinutes: 15,
        moduleTitle: "Module 4: Vector Databases & High-Dimensional Geometry",
        keyCompetencies: ["Vector Embeddings", "Cosine Distance", "HNSW Index", "Dimensionality"]
      }
    ];
  }

  // 4. Deep Learning Track
  if (cid.includes("deep") || ccat.includes("machine") || ctitle.includes("neural") || ctitle.includes("transformer")) {
    return [
      {
        id: "mod-dl-1",
        title: "Scaled Dot-Product Attention & QKV Projections",
        topic: "Scaled Dot-Product Attention & QKV Projections",
        difficulty: "Intermediate",
        recommendedQuestionCount: 4,
        description: "Derive attention equations, softmax temperature scaling factor, and multi-head projection tensors.",
        estimatedMinutes: 20,
        moduleTitle: "Module 1: Self-Attention & Query-Key-Value Dynamics",
        keyCompetencies: ["Attention Matrix", "QKV Projections", "Softmax Scaling", "Multi-Head"]
      },
      {
        id: "mod-dl-2",
        title: "LayerNorm vs RMSNorm Dynamics in Deep Transformers",
        topic: "LayerNorm vs RMSNorm Dynamics in Deep Networks",
        difficulty: "Intermediate",
        recommendedQuestionCount: 4,
        description: "Compare mean-variance normalization with root-mean-square normalization for training stabilization.",
        estimatedMinutes: 20,
        moduleTitle: "Module 2: Normalization & Deep Residual Stability",
        keyCompetencies: ["LayerNorm", "RMSNorm", "Pre-LN vs Post-LN", "Gradient Stability"]
      },
      {
        id: "mod-dl-3",
        title: "Rotary Position Embeddings (RoPE) & Context Length",
        topic: "Rotary Position Embeddings (RoPE) & Context Scaling",
        difficulty: "Advanced",
        recommendedQuestionCount: 4,
        description: "Analyze complex rotation matrices, relative token distances, and context extrapolation techniques.",
        estimatedMinutes: 25,
        moduleTitle: "Module 3: Positional Representations in Sequence Models",
        keyCompetencies: ["RoPE", "Complex Numbers", "Relative Distance", "Context Extrapolation"]
      },
      {
        id: "mod-dl-4",
        title: "Backpropagation Mechanics & Loss Optimization",
        topic: "Backpropagation Mechanics & AdamW Optimizer Dynamics",
        difficulty: "Advanced",
        recommendedQuestionCount: 4,
        description: "Calculate computational graphs, gradient accumulation, decoupled weight decay, and warmup schedules.",
        estimatedMinutes: 25,
        moduleTitle: "Module 4: Optimization Dynamics & Loss Landscapes",
        keyCompetencies: ["Backpropagation", "AdamW", "Weight Decay", "Learning Rate Warmup"]
      }
    ];
  }

  // Default fallback built dynamically from course modules
  if (!Array.isArray(course.modules) || course.modules.length === 0) {
    return [
      {
        id: `mod-${cid || 'gen'}-core`,
        title: `${course.title || 'Course'} Comprehensive Assessment`,
        topic: course.title || "Core Concepts",
        difficulty: "Intermediate",
        recommendedQuestionCount: 4,
        description: `Evaluate mastery of fundamental competencies in ${course.title || 'this domain'}.`,
        estimatedMinutes: 20,
        moduleTitle: "Foundational Checkpoint",
        keyCompetencies: [course.category || "General"]
      }
    ];
  }

  return course.modules.map((m, idx) => ({
    id: `mod-fallback-${idx}`,
    title: (m?.title || `Module ${idx + 1}`).replace(/^Module \d+:\s*/i, ""),
    topic: m?.lessons?.[0]?.title || m?.title || `Module ${idx + 1}`,
    difficulty: "Intermediate",
    recommendedQuestionCount: 4,
    description: m?.description || `Master core concepts in ${m?.title || 'this module'}`,
    estimatedMinutes: 20,
    moduleTitle: m?.title || `Module ${idx + 1}`,
    keyCompetencies: m?.lessons?.[0]?.keyTerms || [course?.category || "General"]
  }));
}

/**
 * Filter an array of assessments to only return those matching the given course
 */
export function filterAssessmentsByCourse(
  assessments: AssessmentHistoryItem[],
  course?: Course | null
): AssessmentHistoryItem[] {
  if (!Array.isArray(assessments)) return [];
  if (!course) return assessments;
  const targetId = (course.id || "").toLowerCase();
  const targetTitle = (course.title || "").toLowerCase();
  const targetCat = (course.category || "").toLowerCase();

  return assessments.filter((item) => {
    // 1. Direct courseId match
    if (item.courseId && item.courseId.toLowerCase() === targetId) {
      return true;
    }

    // 2. Direct courseTitle match
    if (item.courseTitle && item.courseTitle.toLowerCase() === targetTitle) {
      return true;
    }

    // 3. Topic or CourseTitle substring matching
    const itemTopic = (item.topic || "").toLowerCase();
    const itemTitle = (item.title || "").toLowerCase();
    const itemCourseTitle = (item.courseTitle || "").toLowerCase();

    // Check Cloud-Native DevOps
    if (targetId.includes("cloud") || targetCat.includes("cloud") || targetCat.includes("devops")) {
      if (
        itemTopic.includes("devops") ||
        itemTopic.includes("kubernetes") ||
        itemTopic.includes("ingress") ||
        itemTopic.includes("helm") ||
        itemTopic.includes("docker") ||
        itemTopic.includes("cloud-native") ||
        itemTitle.includes("kubernetes") ||
        itemCourseTitle.includes("cloud")
      ) {
        return true;
      }
    }

    // Check Full Stack Development
    if (targetId.includes("fullstack") || targetCat.includes("full stack")) {
      if (
        itemTopic.includes("full stack") ||
        itemTopic.includes("full-stack") ||
        itemTopic.includes("react") ||
        itemTopic.includes("node") ||
        itemTopic.includes("express") ||
        itemTopic.includes("postgresql") ||
        itemTopic.includes("redis") ||
        itemTitle.includes("react 19") ||
        itemTitle.includes("express") ||
        itemCourseTitle.includes("full-stack")
      ) {
        return true;
      }
    }

    // Check Generative AI
    if (targetId.includes("genai") || targetCat.includes("artificial") || targetTitle.includes("generative")) {
      if (
        itemTopic.includes("rag") ||
        itemTopic.includes("generative ai") ||
        itemTopic.includes("llm") ||
        itemTopic.includes("chunking") ||
        itemTopic.includes("vector") ||
        itemTitle.includes("rag") ||
        itemCourseTitle.includes("generative")
      ) {
        return true;
      }
    }

    // Check Deep Learning
    if (targetId.includes("deep") || targetCat.includes("machine") || targetTitle.includes("deep learning")) {
      if (
        itemTopic.includes("attention") ||
        itemTopic.includes("transformer") ||
        itemTopic.includes("layernorm") ||
        itemTopic.includes("rmsnorm") ||
        itemTopic.includes("deep learning") ||
        itemTitle.includes("attention") ||
        itemCourseTitle.includes("deep learning")
      ) {
        return true;
      }
    }

    return false;
  });
}
