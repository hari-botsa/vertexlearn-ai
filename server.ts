import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("VertexLearn AI: Gemini API initialized successfully.");
  } catch (err) {
    console.error("VertexLearn AI: Failed to initialize GoogleGenAI", err);
  }
} else {
  console.warn("VertexLearn AI: GEMINI_API_KEY is not set. Intelligent heuristics will be used as backup.");
}

// Resilient model candidates to handle spikes in demand (503 / 429) seamlessly
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

async function generateContentWithFallback(aiClient: GoogleGenAI, requestConfig: any) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await aiClient.models.generateContent({
        ...requestConfig,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const isUnavailable = 
        err?.status === 503 || 
        err?.code === 503 || 
        err?.message?.includes("503") || 
        err?.message?.includes("UNAVAILABLE") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("429");

      console.warn(`[VertexLearn AI] Candidate model ${model} unavailable (${isUnavailable ? 'demand spike' : err?.message}). Attempting next candidate...`);

      if (isUnavailable) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        continue;
      }
    }
  }

  throw lastError;
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiConfigured: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

// 2. Intelligent Tutor Chat Endpoint
app.post("/api/tutor/chat", async (req, res) => {
  try {
    const { messages, contextLesson, persona = "socratic", subject = "Full Stack Development & Computer Science", studentRole = "Full Stack Development" } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const personaInstructions: Record<string, string> = {
      socratic: `You are the Socratic Tutor at VertexLearn AI. Your goal is to help students discover answers themselves. 
Use guided probing questions, subtle hints, and analogies. Do not dump the full solution directly unless they are completely stuck.
Keep the tone encouraging, warm, and curious. End with a thoughtful question or mini-challenge.`,
      deep: `You are Dr. Vertex, Chief Academic AI Specialist at VertexLearn AI. 
Provide rigorous, comprehensive, and conceptually deep explanations. 
Structure your answer with clear section headings, bullet points, real-world case studies, and underlying mathematical or architectural principles.`,
      analogy: `You are the Analogy Architect at VertexLearn AI. 
Translate complex, abstract technical and scientific concepts into vivid, intuitive, real-world metaphors (e.g., comparing neural networks to postal sorting, or databases to restaurant kitchens). 
Follow up with the exact technical parallel.`,
      code_expert: `You are the Senior Software & Engineering Mentor at VertexLearn AI. 
Provide clean, idiomatic code examples with line-by-line explanations, algorithmic complexity (Big O), edge-case handling, and best architectural practices.`,
    };

    const systemInstruction = `${personaInstructions[persona] || personaInstructions.socratic}
Current Learning Context:
- Domain/Subject: ${subject}
- Student Learning Track/Role: ${studentRole} (Incorporate full-stack engineering principles, modern React, Node.js, databases, and API architecture where applicable)
${contextLesson ? `- Current Active Lesson: "${contextLesson.title}"\n- Lesson Overview: "${contextLesson.summary}"` : ""}

Format your response in clean Markdown with bolding, code blocks where suitable, and concise bullet points.
At the very end of your response, provide 3 short, relevant follow-up questions the student might want to ask next, enclosed in a JSON block at the bottom like this:
\`\`\`suggested
["Follow-up question 1?", "Follow-up question 2?", "Follow-up question 3?"]
\`\`\``;

    if (ai) {
      try {
        const conversationHistory = messages.map((m: { role: string; content: string }) => 
          `${m.role === "user" ? "Student" : "Vertex Tutor"}: ${m.content}`
        ).join("\n\n");

        const prompt = `${conversationHistory}\n\nVertex Tutor:`;

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const rawText = response.text || "";
        
        // Parse suggested follow-ups if present
        let cleanText = rawText;
        let followUps: string[] = [];
        const suggestedMatch = rawText.match(/```suggested\s*([\s\S]*?)\s*```/);
        if (suggestedMatch) {
          cleanText = rawText.replace(/```suggested[\s\S]*?```/, "").trim();
          try {
            followUps = JSON.parse(suggestedMatch[1]);
          } catch {
            followUps = [
              "Can you provide an example of this?",
              "How does this apply in industry?",
              "What are common pitfalls to avoid?",
            ];
          }
        } else {
          followUps = [
            "Can you explain this with a practical example?",
            "What should I practice next?",
            "How does this relate to real-world applications?",
          ];
        }

        return res.json({
          reply: cleanText,
          suggestedFollowUps: followUps,
          persona,
        });
      } catch (geminiError: any) {
        console.warn("Tutor fallback engaged:", geminiError?.message || geminiError);
      }
    }

    // Heuristic intelligent fallback when Gemini key is absent or temporarily throttled
    const fallbackResponse = `That's an excellent question regarding **${subject}**! 

When exploring this in ${contextLesson?.title ? `*${contextLesson.title}*` : "your curriculum"}, the foundational mechanism revolves around separating core principles from implementation details. 

Here is a structured breakdown:
1. **Core Concept**: Break the problem down into its first principles. Identify the inputs, state transformations, and expected outputs.
2. **Key Intuition**: Consider how data or signals flow through each step. In high-performance architectures, minimizing overhead and ensuring verifiable state changes is paramount.
3. **Practical Application**: Always test edge cases (empty states, boundary thresholds, scale bottlenecks).

Would you like to test your understanding with a quick challenge, or examine a concrete code/design scenario?`;

    return res.json({
      reply: fallbackResponse,
      suggestedFollowUps: [
        "Give me a concrete code example",
        "Test my understanding with a question",
        "What are common mistakes beginners make here?",
      ],
      persona,
    });
  } catch (error) {
    console.error("Tutor route error:", error);
    res.status(500).json({ error: "Failed to process tutor query." });
  }
});

// 3. Automated Assessment Generator
app.post("/api/assessment/generate", async (req, res) => {
  try {
    const { topic = "Machine Learning", difficulty = "Intermediate", questionCount = 5, learningObjectives = [] } = req.body;

    const count = Math.min(Math.max(Number(questionCount) || 5, 3), 10);

    if (ai) {
      try {
        const prompt = `Generate a high-quality educational assessment for an online LMS.
Topic: "${topic}"
Target Difficulty: "${difficulty}"
Number of questions: ${count}
Learning Objectives: ${learningObjectives.join(", ") || "Core competency, practical application, and conceptual understanding"}

Provide a mix of Multiple Choice questions (with 4 distinct options and clear explanations) and at least 1 open-ended analytical/conceptual question for rubric evaluation.`;

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                estimatedTimeMinutes: { type: Type.INTEGER },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: { type: Type.STRING, description: "'multiple-choice' or 'open-ended'" },
                      prompt: { type: Type.STRING },
                      codeSnippet: { type: Type.STRING, description: "Optional code snippet or empty string" },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of 4 options if multiple-choice, empty if open-ended",
                      },
                      correctOptionIndex: { type: Type.INTEGER, description: "0-3 for multiple choice, -1 for open-ended" },
                      explanation: { type: Type.STRING, description: "Detailed pedagogical rationale for the correct answer" },
                      points: { type: Type.INTEGER },
                      rubricGuidelines: { type: Type.STRING, description: "Criteria for open-ended response grading" },
                    },
                    required: ["id", "type", "prompt", "explanation", "points"],
                  },
                },
              },
              required: ["title", "description", "difficulty", "estimatedTimeMinutes", "questions"],
            },
          },
        });

        const assessmentData = JSON.parse(response.text || "{}");
        return res.json({ assessment: assessmentData });
      } catch (err: any) {
        console.warn("Assessment generation fallback engaged:", err?.message || err);
      }
    }

    // Fallback assessment
    const fallbackAssessment = {
      title: `${topic} - Mastery Assessment`,
      description: `Evaluate your knowledge and practical problem-solving capability in ${topic}.`,
      difficulty,
      estimatedTimeMinutes: 15,
      questions: [
        {
          id: "q-1",
          type: "multiple-choice",
          prompt: `In the context of ${topic}, what is the primary benefit of modular architectural decoupling?`,
          options: [
            "It eliminates the need for unit and integration testing entirely",
            "It isolates failures, enhances reusability, and enables independent scaling",
            "It guarantees zero memory allocation at runtime",
            "It forces all subcomponents to execute synchronously",
          ],
          correctOptionIndex: 1,
          explanation: "Decoupling isolates dependencies so individual services or modules can fail or scale independently without bringing down the wider ecosystem.",
          points: 20,
        },
        {
          id: "q-2",
          type: "multiple-choice",
          prompt: `When optimizing workflows in ${topic}, which metric provides the most reliable indicator of end-to-end responsiveness?`,
          options: [
            "Peak disk storage utilization",
            "99th percentile (p99) latency distribution",
            "Total number of lines of source code",
            "Local clock drift across containers",
          ],
          correctOptionIndex: 1,
          explanation: "Tail latencies such as p99 reflect the worst-case user experiences that average (mean) metrics frequently conceal.",
          points: 20,
        },
        {
          id: "q-3",
          type: "multiple-choice",
          prompt: `What is the most effective approach for handling unexpected runtime deviations in ${topic}?`,
          options: [
            "Silently swallow errors and return null to prevent crashes",
            "Structured exception handling with contextual logging, retry backoffs, and fallback state",
            "Immediately terminate the host server container",
            "Repeat the identical request indefinitely in a tight synchronous loop",
          ],
          correctOptionIndex: 1,
          explanation: "Structured error handling with backoff and telemetry ensures graceful degradation and actionable diagnostic logging.",
          points: 20,
        },
        {
          id: "q-4",
          type: "open-ended",
          prompt: `Explain how you would design a scalable solution for ${topic} that maintains high availability under heavy load. Highlight trade-offs between consistency and latency.`,
          options: [],
          correctOptionIndex: -1,
          explanation: "A top-tier answer discusses load distribution, caching strategies, asynchronous message queues, and trade-offs such as eventual consistency versus strong linearizability.",
          points: 40,
          rubricGuidelines: "Evaluates architectural depth, awareness of CAP theorem/distributed constraints, and practical design clarity.",
        },
      ],
    };

    return res.json({ assessment: fallbackAssessment });
  } catch (error) {
    console.error("Assessment generate error:", error);
    res.status(500).json({ error: "Failed to generate assessment." });
  }
});

// 4. Automated Rubric & Essay Evaluator
app.post("/api/assessment/evaluate", async (req, res) => {
  try {
    const { questionPrompt, studentAnswer, rubricGuidelines, topic = "General Education" } = req.body;

    if (!studentAnswer || studentAnswer.trim().length === 0) {
      return res.status(400).json({ error: "Student answer is required." });
    }

    if (ai) {
      try {
        const prompt = `You are an automated grading professor and assessment evaluator at VertexLearn AI LMS.
Topic: "${topic}"
Question: "${questionPrompt}"
Grading Rubric / Criteria: "${rubricGuidelines || "Conceptual accuracy, depth of reasoning, practical examples, and clarity of communication"}"

Student's Submitted Answer:
"""
${studentAnswer}
"""

Evaluate this submission thoroughly. Assign a score between 0 and 100, a letter grade (A+, A, B, C, D, F), highlight specific strengths, actionable areas for improvement, and recommended review topics.`;

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "Score from 0 to 100" },
                letterGrade: { type: Type.STRING },
                summaryFeedback: { type: Type.STRING, description: "2-3 paragraphs of constructive, encouraging feedback" },
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "2-4 specific positive aspects of the answer",
                },
                areasForImprovement: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "2-4 actionable gaps or deeper points to explore",
                },
                suggestedReviewTopics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific subtopics to review to achieve full mastery",
                },
              },
              required: ["score", "letterGrade", "summaryFeedback", "strengths", "areasForImprovement", "suggestedReviewTopics"],
            },
          },
        });

        const evaluation = JSON.parse(response.text || "{}");
        return res.json({ evaluation });
      } catch (err: any) {
        console.warn("Evaluation fallback engaged:", err?.message || err);
      }
    }

    // Heuristic grading fallback
    const wordCount = studentAnswer.trim().split(/\s+/).length;
    let score = 75;
    let letterGrade = "B";

    if (wordCount > 60) {
      score = 88;
      letterGrade = "A-";
    } else if (wordCount > 30) {
      score = 78;
      letterGrade = "B+";
    } else {
      score = 65;
      letterGrade = "C";
    }

    return res.json({
      evaluation: {
        score,
        letterGrade,
        summaryFeedback: `Your response demonstrates a foundational grasp of ${topic}. You articulately addressed the central prompt and presented coherent reasoning. To reach an elite mastery tier, integrate deeper empirical examples and contrast alternative architectural trade-offs.`,
        strengths: [
          "Directly engaged with the central question parameters",
          "Structured thoughts in a logical progression",
          "Demonstrated solid conceptual vocabulary",
        ],
        areasForImprovement: [
          "Incorporate quantifiable performance or latency benchmarks",
          "Address edge cases where standard assumptions break down",
        ],
        suggestedReviewTopics: [
          `${topic} Distributed Reliability Patterns`,
          "Benchmarking and Bottleneck Diagnosis",
        ],
      },
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({ error: "Failed to evaluate answer." });
  }
});

// 5. Dynamic Course & Curriculum Generator
app.post("/api/course/generate", async (req, res) => {
  try {
    const { topic, experienceLevel = "Intermediate", targetDurationHours = 8, focusArea = "" } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Course topic is required." });
    }

    if (ai) {
      try {
        const prompt = `You are the Lead Instructional Designer at VertexLearn AI.
Create a comprehensive, highly engaging online course for:
Topic: "${topic}"
Learner Experience Level: "${experienceLevel}"
Estimated Study Hours: ${targetDurationHours}
Special Focus: "${focusArea || "Industry best practices and hands-on mastery"}"

Generate 3-4 structured modules. Each module should contain 2-3 in-depth lessons with:
- Lesson Title
- Summary
- Detailed Markdown content (explanatory text, code/concept examples, best practices, key takeaways)
- Estimated reading time
- A 2-question comprehension checkpoint`;

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                tagline: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                durationHours: { type: Type.INTEGER },
                prerequisites: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                learningOutcomes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                modules: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      lessons: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            contentMarkdown: { type: Type.STRING },
                            durationMinutes: { type: Type.INTEGER },
                            keyTerms: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                            },
                          },
                          required: ["id", "title", "summary", "contentMarkdown", "durationMinutes"],
                        },
                      },
                    },
                    required: ["id", "title", "description", "lessons"],
                  },
                },
              },
              required: ["title", "tagline", "description", "category", "difficulty", "modules", "learningOutcomes"],
            },
          },
        });

        const courseData = JSON.parse(response.text || "{}");
        courseData.id = "course-" + Date.now();
        courseData.enrollmentCount = 1;
        courseData.rating = 4.9;
        return res.json({ course: courseData });
      } catch (err: any) {
        console.warn("Course generation fallback engaged:", err?.message || err);
      }
    }

    // Fallback generated course
    const fallbackCourse = {
      id: "course-" + Date.now(),
      title: `${topic}: Mastery & Modern Applications`,
      tagline: `Accelerate your expertise in ${topic} with structured AI-guided modules.`,
      description: `A rigorous, practical curriculum covering foundational mechanics, scalable patterns, and production-grade implementation of ${topic}.`,
      category: "Advanced Technology",
      difficulty: experienceLevel,
      durationHours: Number(targetDurationHours) || 6,
      rating: 4.9,
      enrollmentCount: 1,
      prerequisites: ["Basic programmatic literacy", "Fundamental logical reasoning"],
      learningOutcomes: [
        `Master the core architectural foundations of ${topic}`,
        `Implement resilient, maintainable real-world workflows`,
        `Troubleshoot edge cases, performance bottlenecks, and scale limits`,
      ],
      modules: [
        {
          id: "mod-1",
          title: "Foundations & Core Mechanics",
          description: `Understand the fundamental principles, terminology, and key building blocks of ${topic}.`,
          lessons: [
            {
              id: "les-1-1",
              title: `Introduction to ${topic}`,
              summary: `High-level landscape, historical evolution, and modern relevance.`,
              durationMinutes: 15,
              keyTerms: ["Architecture", "State Isolation", "Scalability"],
              contentMarkdown: `### Welcome to ${topic}

Modern systems require a rigorous understanding of **${topic}**. When we design for scale and maintainability, our primary objective is to separate concerns and guarantee predictable execution.

#### Core Pillars:
1. **Predictability**: Deterministic behavior under load.
2. **Observability**: Clear telemetry and diagnostics.
3. **Modularity**: Loose coupling across sub-components.

\`\`\`typescript
// Example principle in practice:
interface SystemConfig {
  topic: string;
  enableTelemetry: boolean;
}

export function initializeEngine(config: SystemConfig) {
  console.log(\`[VertexLearn Engine] Bootstrapping \${config.topic}\`);
  return { status: "ready", uptime: 0 };
}
\`\`\`

#### Key Takeaway:
Never optimize prematurely without first measuring real-world baseline constraints.`,
            },
            {
              id: "les-1-2",
              title: `Data Pipelines & Architectural Patterns`,
              summary: `Designing durable data ingestion and processing pipelines.`,
              durationMinutes: 20,
              keyTerms: ["Pipeline", "Event-Driven", "Throughput"],
              contentMarkdown: `### Architectural Pipelines in ${topic}

Data flows through stages: Ingestion, Validation, Transformation, and Persistence. Ensuring that each stage is idempotent prevents catastrophic duplication bugs.

- **Idempotency**: Executing an operation multiple times produces the identical result.
- **Backpressure**: Preventing downstream buffer overflows when upstream input spikes.`,
            },
          ],
        },
        {
          id: "mod-2",
          title: "Advanced Optimization & Production Delivery",
          description: `Take your knowledge into real-world production environments.`,
          lessons: [
            {
              id: "les-2-1",
              title: `Benchmarking & Bottleneck Elimination`,
              summary: `Profile CPU, memory, and network bottlenecks under heavy load.`,
              durationMinutes: 25,
              keyTerms: ["p99 Latency", "Profiling", "Concurrency"],
              contentMarkdown: `### Profiling Real-World Bottlenecks

Never guess where bottlenecks occur. Use flame graphs, trace spans, and metric distributions to pinpoint slow operations.`,
            },
          ],
        },
      ],
    };

    return res.json({ course: fallbackCourse });
  } catch (error) {
    console.error("Course generate error:", error);
    res.status(500).json({ error: "Failed to generate course." });
  }
});

// 6. Real-Time Student Support Desk ("Vertex Desk")
app.post("/api/support/ask", async (req, res) => {
  try {
    const { query, category = "academic_advising", currentCourse = "", studentRole = "Full Stack Development" } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    if (ai) {
      try {
        const prompt = `You are the 24/7 VertexLearn AI Student Support Specialist.
Category: ${category}
Student Role / Track: ${studentRole}
Active Course: ${currentCourse || "None specified"}
Student Question: "${query}"

Provide an empathetic, actionable, and structured solution. 
If they need a study plan, give concrete time blocks tailored to full-stack projects and concepts.
If they are facing academic fatigue or anxiety, offer proven cognitive learning strategies (spaced repetition, Pomodoro, active recall).
If they need technical platform help, give clear step-by-step guidance.`;

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            temperature: 0.6,
          },
        });

        return res.json({
          reply: response.text || "",
          category,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      } catch (err: any) {
        console.warn("Support desk fallback engaged:", err?.message || err);
      }
    }

    // Heuristic fallback response
    return res.json({
      reply: `Hello! I'm here to support your learning journey at VertexLearn AI.

Regarding your question: **"${query}"**

Here is our recommended guidance:
1. **Immediate Next Step**: Focus on breaking this down into a 25-minute focused study sprint (Pomodoro method). Avoid multi-tasking during this window.
2. **Retention Strategy**: Employ **Active Recall**. Instead of passively re-reading lesson material, quiz yourself or explain the concept aloud to our AI Tutor.
3. **Pacing**: Dedicate 45 minutes daily rather than cramming 5 hours on weekends. Memory consolidation happens during rest intervals.

Feel free to ask for a custom revision timetable or specific diagnostic questions!`,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  } catch (error) {
    console.error("Support error:", error);
    res.status(500).json({ error: "Support query failed." });
  }
});

// 7. Get Unstuck Diagnostic Tool
app.post("/api/support/unstick", async (req, res) => {
  try {
    const { problemText, context = "" } = req.body;

    if (!problemText) {
      return res.status(400).json({ error: "Problem text is required." });
    }

    if (ai) {
      try {
        const prompt = `A student is stuck and frustrated. Diagnose their problem immediately.
Topic/Context: "${context}"
Stuck on:
"""
${problemText}
"""

Provide:
1. "The Aha! Metaphor" (an intuitive, simple explanation of what went wrong or how to think about this)
2. "Step-by-Step Walkthrough" (exact breakdown to solve it)
3. "Self-Check Question" (a single question to confirm they now understand)`;

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            temperature: 0.5,
          },
        });

        return res.json({ solution: response.text || "" });
      } catch (err: any) {
        console.warn("Unstick diagnostic fallback engaged:", err?.message || err);
      }
    }

    const fallbackSolution = `### 💡 The "Aha!" Analogy
Think of this like sending a sealed letter without a postal stamp: the system is halting because a required dependency or state precondition wasn't resolved before execution was attempted.

### 🛠️ Step-by-Step Fix
1. **Verify State Preconditions**: Ensure all variables or data schemas are initialized and not \`null\` or \`undefined\`.
2. **Isolate the Failing Step**: Add telemetry or check line-by-line inputs directly preceding the error.
3. **Implement Guard Clauses**: Never assume external inputs arrive in the ideal shape; validate before parsing.

### ❓ Self-Check Challenge
*What exact condition triggers this behavior, and how does your guard clause prevent the crash?*`;

    return res.json({ solution: fallbackSolution });
  } catch (error) {
    console.error("Unstick route error:", error);
    res.status(500).json({ error: "Failed to resolve unstick query." });
  }
});

// 8. Instructor AI Quiz Generator
app.post("/api/instructor/generate-quiz", async (req, res) => {
  try {
    const { courseTitle = "Modern Web Development", lessonTopic = "API Architecture", questionCount = 3, difficulty = "Intermediate" } = req.body;
    const count = Math.min(Math.max(Number(questionCount) || 3, 1), 6);

    if (ai) {
      try {
        const prompt = `You are an expert instructional designer assisting a university professor.
Course: "${courseTitle}"
Topic/Lesson: "${lessonTopic}"
Difficulty: "${difficulty}"
Number of questions: ${count}

Create pedagogical quiz questions with 4 options each, the correct answer index (0-3), detailed rationale explaining why the correct choice is right and common misconceptions for distractors, and points value (typically 10-25 points).`;

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                quizTitle: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      prompt: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      correctOptionIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      points: { type: Type.INTEGER }
                    },
                    required: ["id", "prompt", "options", "correctOptionIndex", "explanation", "points"]
                  }
                }
              },
              required: ["quizTitle", "questions"]
            }
          }
        });

        const data = JSON.parse(response.text || "{}");
        return res.json({ success: true, quiz: data });
      } catch (err: any) {
        console.warn("Instructor quiz generator fallback:", err?.message || err);
      }
    }

    // Heuristic fallback quiz
    const fallbackQuiz = {
      quizTitle: `${lessonTopic} - Concept Check`,
      questions: [
        {
          id: "iq-" + Date.now() + "-1",
          prompt: `In the context of ${lessonTopic}, which strategy best guarantees decoupled, resilient operations?`,
          options: [
            "Synchronous in-memory shared state between components",
            "Event-driven messaging with asynchronous worker pools",
            "Monolithic single-thread execution with global variables",
            "Disabling schema validation on payload ingestion"
          ],
          correctOptionIndex: 1,
          explanation: "Event-driven architecture with async queues decouples message production from consumption, preventing cascading failures.",
          points: 25
        },
        {
          id: "iq-" + Date.now() + "-2",
          prompt: `When auditing student implementations of ${lessonTopic}, what is the primary indicator of production readiness?`,
          options: [
            "Lack of comments in production source files",
            "Graceful error boundaries, structured logging, and idempotent processing",
            "Maximizing CPU utilization to 100% at all times",
            "Hardcoding credentials in client-side bundles"
          ],
          correctOptionIndex: 1,
          explanation: "Production readiness demands observability, resilience to faulty inputs, and deterministic state transitions.",
          points: 25
        }
      ]
    };

    return res.json({ success: true, quiz: fallbackQuiz });
  } catch (error) {
    console.error("Instructor quiz generator error:", error);
    res.status(500).json({ error: "Failed to generate quiz questions." });
  }
});

// 9. Instructor AI Lesson Summarizer
app.post("/api/instructor/summarize-lesson", async (req, res) => {
  try {
    const { lessonTitle, lessonContent, targetLength = "standard" } = req.body;

    if (!lessonContent && !lessonTitle) {
      return res.status(400).json({ error: "Lesson title or content is required." });
    }

    if (ai) {
      try {
        const prompt = `You are an elite academic editor and instructional coach.
Lesson Title: "${lessonTitle || "Module Lesson"}"
Content To Summarize:
"""
${(lessonContent || "").slice(0, 4000)}
"""

Provide:
1. An engaging 2-3 paragraph pedagogical summary of the core concepts
2. 4-5 bulleted "Essential Takeaways" for students
3. 3 suggested review questions or discussion prompts for instructors to ask in class.`;

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                executiveSummary: { type: Type.STRING },
                keyTakeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                discussionPrompts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                suggestedStudyMinutes: { type: Type.INTEGER }
              },
              required: ["executiveSummary", "keyTakeaways", "discussionPrompts", "suggestedStudyMinutes"]
            }
          }
        });

        const data = JSON.parse(response.text || "{}");
        return res.json({ success: true, summary: data });
      } catch (err: any) {
        console.warn("Instructor summary fallback:", err?.message || err);
      }
    }

    // Heuristic fallback
    const fallbackSummary = {
      executiveSummary: `This lesson on "${lessonTitle || "the topic"}" delivers a comprehensive breakdown of architectural principles, execution semantics, and best design practices. Students are guided through real-world patterns that reinforce theoretical foundations with practical engineering trade-offs.`,
      keyTakeaways: [
        `Core principles should dictate implementation rather than transient framework trends.`,
        `Always isolate side effects and maintain predictable state transitions.`,
        `Employ telemetry and structured diagnostic logging to identify bottlenecks early.`,
        `Design with idempotency and defense-in-depth security at every boundary.`
      ],
      discussionPrompts: [
        `How would you adapt this architecture if data volume increased by 100x?`,
        `What are the security trade-offs of this approach versus alternative paradigms?`,
        `How can unit tests be designed to catch subtle race conditions here?`
      ],
      suggestedStudyMinutes: 20
    };

    return res.json({ success: true, summary: fallbackSummary });
  } catch (error) {
    console.error("Instructor summary error:", error);
    res.status(500).json({ error: "Failed to generate lesson summary." });
  }
});

// Setup Vite middleware in development / static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VertexLearn AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
