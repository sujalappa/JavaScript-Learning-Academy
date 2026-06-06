import type { MCQQuestion } from "../data/curriculum";
import { mockAIDatabase } from "../data/mockAIQuestions";

const GROQ_MODEL = "llama-3.1-8b-instant"; // Fast and highly accurate for code/quizzes

export function getGroqApiKey(): string {
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  if (envKey && envKey !== "your_groq_api_key_here") {
    return envKey.trim();
  }
  return "";
}

export function saveGroqApiKey(_key: string): void {
  // API key is loaded from environment variables in background
}

export interface AIReviewResult {
  success: boolean;
  hint: string;
}

/**
 * AI Service to handle code review and quiz generation.
 */
export async function aiEvaluateCode(
  code: string,
  taskDescription: string,
  correctReferenceCode?: string
): Promise<AIReviewResult> {
  const apiKey = getGroqApiKey();
  
  if (!apiKey) {
    // Local Simulator Fallback
    return simulateLocalCodeEvaluation(code, taskDescription, correctReferenceCode);
  }
  
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an expert, encouraging JavaScript coding mentor for absolute beginners. 
Review the user's code against the task description.
Identify any logical errors, syntax bugs, or scope issues.
Explain the issue clearly in a beginner-friendly way, and give a hint on how to fix it.
CRITICAL: Do NOT write the corrected code block. Guide the user to write it themselves.
You MUST respond with a JSON object in this format:
{
  "success": false, // true if code is logically complete and correct, false if it contains bugs or is empty
  "hint": "Your mentor feedback and hints here..."
}`
          },
          {
            role: "user",
            content: `Task: ${taskDescription}\n\nUser's JS Code:\n\`\`\`javascript\n${code}\n\`\`\``
          }
        ],
        temperature: 0.2,
      }),
    });
    
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Groq API Error: ${response.status} - ${errBody}`);
    }
    
    const data = await response.json();
    const resultText = data.choices[0]?.message?.content || "{}";
    const result = JSON.parse(resultText);
    return {
      success: typeof result.success === "boolean" ? result.success : false,
      hint: result.hint || "Review complete. Make sure your function names and outputs match the requirements.",
    };
  } catch (err: any) {
    console.error("Groq Code Review failed, falling back to local simulator:", err);
    return simulateLocalCodeEvaluation(code, taskDescription, correctReferenceCode);
  }
}

export async function aiGenerateQuiz(
  moduleId: string,
  moduleTitle: string,
  failedQuestions: string[] = []
): Promise<MCQQuestion[]> {
  const apiKey = getGroqApiKey();
  
  if (!apiKey) {
    // Local Simulator Fallback
    return simulateLocalQuizGeneration(moduleId);
  }
  
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a JavaScript course creator. Generate a fresh, unique 5-question multiple choice quiz for beginners on the topic: "${moduleTitle}".
Each question should test core concepts, variable naming, logic, loops, or standard syntax.
Provide exactly 4 options per question, with a 0-indexed answerIndex pointing to the correct option.
Provide a short, 1-2 sentence explanation of why the correct option is the right answer.
Do not repeat these failed question IDs if possible: ${failedQuestions.join(", ")}.
You MUST respond with a JSON object containing an array named "questions" like this:
{
  "questions": [
    {
      "id": "generated-q-1",
      "question": "Question text here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 2,
      "explanation": "Short explanation text here..."
    },
    ...
  ]
}`
          },
          {
            role: "user",
            content: `Generate a new 5-question quiz for "${moduleTitle}".`
          }
        ],
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const resultText = data.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(resultText);
    if (Array.isArray(parsed.questions) && parsed.questions.length === 5) {
      return parsed.questions;
    }
    throw new Error("Invalid format returned by AI.");
  } catch (err) {
    console.error("Groq Quiz generation failed, falling back to local simulator:", err);
    return simulateLocalQuizGeneration(moduleId);
  }
}

/**
 * Local Simulator: Code Evaluation
 */
function simulateLocalCodeEvaluation(
  code: string,
  _taskDescription: string,
  correctCode?: string
): AIReviewResult {
  // Check basic compilation
  try {
    new Function(code);
  } catch (err: any) {
    return {
      success: false,
      hint: `⚠️ Syntax Error found: "${err.message}". Double check your closing curly brackets, parentheses, and variable names!`,
    };
  }
  
  if (!code.trim() || code.includes("// Write your code here") && code.split("\n").length <= 4) {
    return {
      success: false,
      hint: "Your editor looks a bit empty! Let's start by defining the function and returning a value.",
    };
  }
  
  // Basic semantic check
  if (correctCode) {
    // Extract variables or function names
    const funcMatch = correctCode.match(/function\s+([a-zA-Z0-9_$]+)/);
    if (funcMatch && funcMatch[1]) {
      const funcName = funcMatch[1];
      if (!code.includes(funcName)) {
        return {
          success: false,
          hint: `Missing Function: Make sure you name your function exactly "${funcName}". JavaScript is case-sensitive!`,
        };
      }
    }
  }
  
  // Return random tip
  const generalHints = mockAIDatabase.hints.syntax.concat(mockAIDatabase.hints.variables);
  const randomHint = generalHints[Math.floor(Math.random() * generalHints.length)];
  
  return {
    success: false,
    hint: `💡 [Mentor Tip] Code compiles successfully! However, tests are still failing. Here is a hint: ${randomHint}`,
  };
}

/**
 * Local Simulator: Quiz Generation
 */
function simulateLocalQuizGeneration(moduleId: string): MCQQuestion[] {
  // Grab standard questions or fallback questions
  const pool = mockAIDatabase.quizzes[moduleId] || [];
  if (pool.length === 0) {
    // Return a default mock set
    return [
      {
        id: `mock-q-1`,
        question: "Is JavaScript an implementation of the ECMAScript standard?",
        options: ["Yes", "No", "Only on mobile", "Deprecated"],
        answerIndex: 0
      }
    ];
  }
  
  // Shuffle the pool and take up to 5
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5).map((q, idx) => ({
    ...q,
    id: `simulated-${moduleId}-${idx}-${Date.now()}` // generate fresh ID
  }));
}

export async function aiChatWithMentor(
  moduleTitle: string,
  activeTab: string,
  notes: string,
  quizQuestions: MCQQuestion[],
  debugging: any,
  implementation: any,
  editorCode: string,
  userMessage: string,
  chatHistory: { sender: "user" | "mentor"; text: string }[]
): Promise<string> {
  const apiKey = getGroqApiKey();
  
  if (!apiKey) {
    return "I am currently in guest simulation mode. Add a Groq API Key to enable live conversation!";
  }

  const systemContent = `You are "AI Mentor", an expert and encouraging JavaScript coding tutor.
You have full access to the current learning environment:
- Module: ${moduleTitle}
- Active Tab: ${activeTab}

[Module Notes]
${notes}

[Quiz Questions]
${JSON.stringify(quizQuestions.map(q => ({ question: q.question, options: q.options })))}

[Debugging Challenge]
Description: ${debugging.description}
Buggy Code: ${debugging.buggyCode}

[Implementation Challenge]
Description: ${implementation.description}
Initial Code: ${implementation.initialCode}

[User's Current Code]
\`\`\`javascript
${editorCode}
\`\`\`

Instructions:
1. Answer the user's questions. Be friendly and helpful.
2. If they are asking about the quiz, guide them to understand the concept, but do NOT reveal the exact answer.
3. If they are asking about a coding challenge, identify bugs in their current code and give hints, but do NOT write the final code for them.`;

  const messages = [
    { role: "system", content: systemContent },
    ...chatHistory.slice(-6).map(msg => ({
      role: msg.sender === "mentor" ? ("assistant" as const) : ("user" as const),
      content: msg.text
    })),
    { role: "user", content: userMessage }
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  } catch (err) {
    console.error("AI Mentor Chat failed:", err);
    return "I ran into a network error contacting the AI server. Please check your connection!";
  }
}

