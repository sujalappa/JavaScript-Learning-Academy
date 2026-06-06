import React, { useState, useEffect } from "react";
import type { Module, MCQQuestion } from "../data/curriculum";
import { 
  completeModule, 
  unlockNextModule,
  addXP,
  fetchDoubts,
  createDoubt,
  fetchReplies,
  createReply
} from "../services/storage";
import type { UserProfile, Doubt, Reply } from "../services/storage";
import { CodeEditor } from "./CodeEditor";
import { aiEvaluateCode, aiGenerateQuiz, aiChatWithMentor, aiGenerateChallenge } from "../services/ai";
import { 
  ArrowLeft, 
  BookOpen, 
  HelpCircle, 
  Bug, 
  CheckSquare, 
  Sparkles, 
  MessageSquare,
  AlertTriangle,
  Award,
  ArrowRight,
  RefreshCw,
  Send,
  Loader2,
  MessageCircle,
  Search,
  Plus,
  ChevronLeft
} from "lucide-react";
import confetti from "canvas-confetti";

interface ModuleViewProps {
  module: Module;
  userProfile: UserProfile;
  onBackToDashboard: () => void;
  onProfileUpdate: () => void;
}

export const ModuleView: React.FC<ModuleViewProps> = ({
  module,
  userProfile,
  onBackToDashboard,
  onProfileUpdate,
}) => {
  // Tabs: "notes" | "quiz" | "debugging" | "implementation" | "ai"
  const [activeTab, setActiveTab] = useState<string>("notes");
  
  // Progress states
  const [quizPassed, setQuizPassed] = useState(false);
  const [debuggingPassed, setDebuggingPassed] = useState(false);
  const [implementationPassed, setImplementationPassed] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  
  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState<MCQQuestion[]>(module.quiz);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  
  // AI Mentor Chat states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChat, setAiChat] = useState<{ sender: "user" | "mentor"; text: string }[]>([
    { sender: "mentor", text: `Hi ${userProfile.username}! I am your AI Mentor. Stuck on any exercises? Ask me questions, or click the buttons below to evaluate your code!` }
  ]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Q&A states
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [activeDoubt, setActiveDoubt] = useState<Doubt | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [doubtTitle, setDoubtTitle] = useState("");
  const [doubtContent, setDoubtContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isCreatingDoubt, setIsCreatingDoubt] = useState(false);
  const [qaSearch, setQaSearch] = useState("");
  const [qaSort, setQaSort] = useState<"newest" | "active">("newest");
  const [loadingQA, setLoadingQA] = useState(false);
  const [submittingQA, setSubmittingQA] = useState(false);
  const [doubtRepliesCount, setDoubtRepliesCount] = useState<Record<string, number>>({});

  // force editor reload when changing tabs
  const [editorKey, setEditorKey] = useState(0); 
  const [currentCode, setCurrentCode] = useState("");
  
  // Custom AI Challenges states
  const [customDebugging, setCustomDebugging] = useState<any>(null);
  const [customImplementation, setCustomImplementation] = useState<any>(null);
  const [topicInput, setTopicInput] = useState("");
  const [generatingCustom, setGeneratingCustom] = useState(false);
  
  // Sandbox Toggle state
  const [showSandbox, setShowSandbox] = useState(false);
  const isEditorVisible = activeTab === "debugging" || activeTab === "implementation" || showSandbox;
  
  // Track code state in parent to pass to AI
  const handleCodeChange = (code: string) => {
    setCurrentCode(code);
  };

  const loadDoubts = async () => {
    setLoadingQA(true);
    try {
      const data = await fetchDoubts(module.id);
      setDoubts(data);
      
      // Load replies counts in parallel
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (d) => {
          try {
            const reps = await fetchReplies(d.id);
            counts[d.id] = reps.length;
          } catch (err) {
            counts[d.id] = 0;
          }
        })
      );
      setDoubtRepliesCount(counts);
    } catch (err) {
      console.error("Error loading doubts:", err);
    } finally {
      setLoadingQA(false);
    }
  };

  const handleSelectDoubt = async (doubt: Doubt) => {
    setActiveDoubt(doubt);
    setLoadingQA(true);
    try {
      const data = await fetchReplies(doubt.id);
      setReplies(data);
    } catch (err) {
      console.error("Error loading replies:", err);
    } finally {
      setLoadingQA(false);
    }
  };

  const handleCreateDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtTitle.trim() || !doubtContent.trim()) return;
    
    setSubmittingQA(true);
    try {
      const authorName = userProfile.username || "Anonymous";
      const newDoubt = await createDoubt(module.id, doubtTitle, doubtContent, authorName);
      setDoubts(prev => [newDoubt, ...prev]);
      setDoubtRepliesCount(prev => ({ ...prev, [newDoubt.id]: 0 }));
      setDoubtTitle("");
      setDoubtContent("");
      setIsCreatingDoubt(false);
      handleSelectDoubt(newDoubt);
    } catch (err) {
      console.error("Error creating doubt:", err);
    } finally {
      setSubmittingQA(false);
    }
  };

  const handleCreateReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoubt || !replyContent.trim()) return;
    
    setSubmittingQA(true);
    try {
      const authorName = userProfile.username || "Anonymous";
      const newReply = await createReply(activeDoubt.id, replyContent, authorName);
      setReplies(prev => [...prev, newReply]);
      setReplyContent("");
      setDoubtRepliesCount(prev => ({
        ...prev,
        [activeDoubt.id]: (prev[activeDoubt.id] || 0) + 1
      }));
    } catch (err) {
      console.error("Error creating reply:", err);
    } finally {
      setSubmittingQA(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  const saveSubModuleProgress = (moduleId: string, updates: { quizPassed?: boolean; debuggingPassed?: boolean; implementationPassed?: boolean }) => {
    const key = `js_academy_progress_${userProfile.username}_${moduleId}`;
    const existing = localStorage.getItem(key);
    const progress = existing ? JSON.parse(existing) : { quizPassed: false, debuggingPassed: false, implementationPassed: false };
    const updated = { ...progress, ...updates };
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const checkModuleCompletion = (moduleId: string, qPass: boolean, dPass: boolean, iPass: boolean) => {
    if (qPass && dPass && iPass) {
      const alreadyCompleted = userProfile.completedModules.includes(moduleId);
      if (!alreadyCompleted) {
        completeModule(moduleId, module.title);
        setModuleCompleted(true);
        onProfileUpdate();

        // Confetti!
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  useEffect(() => {
    // Reset module stats when module changes
    setQuizQuestions(module.quiz);
    setSelectedAnswers({});
    setQuizScore(null);
    
    const isModuleFinished = userProfile.completedModules.includes(module.id);
    if (isModuleFinished) {
      setQuizPassed(true);
      setDebuggingPassed(true);
      setImplementationPassed(true);
      setModuleCompleted(true);
    } else {
      // Load individual progress from localStorage
      const key = `js_academy_progress_${userProfile.username}_${module.id}`;
      const saved = localStorage.getItem(key);
      const progress = saved ? JSON.parse(saved) : { quizPassed: false, debuggingPassed: false, implementationPassed: false };
      
      setQuizPassed(progress.quizPassed || false);
      setDebuggingPassed(progress.debuggingPassed || false);
      setImplementationPassed(progress.implementationPassed || false);
      setModuleCompleted(false);
    }
    
    setAiChat([
      { sender: "mentor", text: `Welcome to ${module.title}! I am your AI Mentor. Stuck on the quiz or code challenges? Ask me anything or let me evaluate your editor code!` }
    ]);
    setActiveTab("notes");
    setShowSandbox(false);
    setCurrentCode("");
    
    // Reset Q&A states
    setDoubts([]);
    setActiveDoubt(null);
    setReplies([]);
    setDoubtTitle("");
    setDoubtContent("");
    setReplyContent("");
    setIsCreatingDoubt(false);
    setQaSearch("");
    setQaSort("newest");
  }, [module.id]);

  useEffect(() => {
    if (activeTab === "qa") {
      loadDoubts();
    }
  }, [activeTab, module.id]);

  // Determine current active editor template and tests
  const activeDebugging = customDebugging || module.debugging;
  const activeImplementation = customImplementation || module.implementation;

  let editorInitialCode = "";
  let editorTestCases: any[] = [];
  let challengeType: "function" | "class" | "async" = "function";
  let challengeId = "";

  if (activeTab === "debugging") {
    editorInitialCode = activeDebugging.buggyCode || "";
    editorTestCases = activeDebugging.testCases;
    challengeId = activeDebugging.id;
  } else if (activeTab === "implementation") {
    editorInitialCode = activeImplementation.initialCode || "";
    editorTestCases = activeImplementation.testCases;
    challengeId = activeImplementation.id;
    if (!customImplementation) {
      if (module.id === "module-6") challengeType = "class";
      if (module.id === "module-7") challengeType = "async";
    }
  } else {
    // Standard sandbox template
    editorInitialCode = currentCode || `// Free coding Sandbox\n// Test out concepts from the notes!\nconsole.log("Hello Academy!");\n`;
    editorTestCases = [];
  }

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    if (quizPassed) return; // locked once passed
    setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.answerIndex) {
        correct++;
      }
    });

    const percent = (correct / quizQuestions.length) * 100;
    setQuizScore(percent);

    if (percent >= 70) {
      setQuizPassed(true);
      saveSubModuleProgress(module.id, { quizPassed: true });
      unlockNextModule(module.id);
      // Give partial XP if not already completed previously
      const alreadyCompleted = userProfile.completedModules.includes(module.id);
      if (!alreadyCompleted) {
        addXP(40);
      }
      onProfileUpdate();
      checkModuleCompletion(module.id, true, debuggingPassed, implementationPassed);
      setActiveTab("debugging"); // auto advance
    }
  };

  const handleRegenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const freshQuestions = await aiGenerateQuiz(module.id, module.title, quizQuestions.map(q => q.id));
      setQuizQuestions(freshQuestions);
      setSelectedAnswers({});
      setQuizScore(null);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleDebuggingSuccess = () => {
    if (!debuggingPassed) {
      setDebuggingPassed(true);
      saveSubModuleProgress(module.id, { debuggingPassed: true });
      addXP(50);
      onProfileUpdate();
      checkModuleCompletion(module.id, quizPassed, true, implementationPassed);
      setActiveTab("implementation"); // auto advance
    }
  };

  const handleImplementationSuccess = () => {
    if (!implementationPassed) {
      setImplementationPassed(true);
      saveSubModuleProgress(module.id, { implementationPassed: true });
      addXP(70);
      onProfileUpdate();
      checkModuleCompletion(module.id, quizPassed, debuggingPassed, true);
    }
  };

  const handleGenerateCustomChallenge = async (type: "debugging" | "implementation") => {
    if (!topicInput.trim() || generatingCustom) return;
    setGeneratingCustom(true);
    try {
      const challengeType = type === "debugging" ? "debug" : "implementation";
      const customChallenge = await aiGenerateChallenge(topicInput, challengeType);
      
      if (type === "debugging") {
        setCustomDebugging(customChallenge);
        setDebuggingPassed(false);
      } else {
        setCustomImplementation(customChallenge);
        setImplementationPassed(false);
      }
      
      setTopicInput("");
      setEditorKey(prev => prev + 1); // reload CodeEditor
    } catch (err) {
      alert("Failed to generate custom challenge. Please try again.");
      console.error(err);
    } finally {
      setGeneratingCustom(false);
    }
  };

  const handleResetCustomChallenge = (type: "debugging" | "implementation") => {
    if (type === "debugging") {
      setCustomDebugging(null);
      const key = `js_academy_progress_${userProfile.username}_${module.id}`;
      const saved = localStorage.getItem(key);
      const progress = saved ? JSON.parse(saved) : { debuggingPassed: false };
      setDebuggingPassed(userProfile.completedModules.includes(module.id) || progress.debuggingPassed);
    } else {
      setCustomImplementation(null);
      const key = `js_academy_progress_${userProfile.username}_${module.id}`;
      const saved = localStorage.getItem(key);
      const progress = saved ? JSON.parse(saved) : { implementationPassed: false };
      setImplementationPassed(userProfile.completedModules.includes(module.id) || progress.implementationPassed);
    }
    setEditorKey(prev => prev + 1); // reload CodeEditor
  };

  const renderCustomChallengeForm = (type: "debugging" | "implementation") => {
    const isCustomActive = type === "debugging" ? !!customDebugging : !!customImplementation;
    return (
      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles style={{ width: "16px", height: "16px", color: "var(--color-purple)" }} />
          <h4 style={{ fontSize: "0.95rem", color: "#ffffff", fontWeight: 600 }}>Practice More: Generate Custom Challenge</h4>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
          Want extra practice? Tell the AI Mentor what topic or requirement you want to practice, and it will build a brand new custom challenge for you!
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <input
            type="text"
            placeholder="e.g., Array filtering, arrow functions, nested loops..."
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            disabled={generatingCustom}
            className="form-input"
            style={{ flex: 1, fontSize: "0.85rem", padding: "10px 14px" }}
          />
          <button
            onClick={() => handleGenerateCustomChallenge(type)}
            disabled={generatingCustom || !topicInput.trim()}
            className="primary-btn-purple"
            style={{ padding: "10px 18px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px", cursor: (generatingCustom || !topicInput.trim()) ? "not-allowed" : "pointer" }}
          >
            {generatingCustom ? (
              <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
            ) : (
              <Sparkles style={{ width: "14px", height: "14px" }} />
            )}
            {generatingCustom ? "Generating..." : "Generate"}
          </button>
        </div>
        
        {isCustomActive && (
          <button
            onClick={() => handleResetCustomChallenge(type)}
            className="cert-view-btn"
            style={{ alignSelf: "flex-start", padding: "6px 12px", fontSize: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer", marginTop: "4px" }}
          >
            Reset to Original Module Challenge
          </button>
        )}
      </div>
    );
  };

  // AI Mentor Prompt Sender
  const handleSendAiPrompt = async (textToSend?: string) => {
    const query = textToSend || aiPrompt;
    if (!query.trim()) return;

    const currentHistory = [...aiChat];

    setAiChat(prev => [...prev, { sender: "user", text: query }]);
    if (!textToSend) setAiPrompt("");
    setLoadingAI(true);

    try {
      const responseText = await aiChatWithMentor(
        module.title,
        activeTab,
        module.notes,
        quizQuestions,
        module.debugging,
        module.implementation,
        currentCode,
        query,
        currentHistory
      );
      setAiChat(prev => [...prev, { sender: "mentor", text: responseText }]);
    } catch (err) {
      setAiChat(prev => [...prev, { sender: "mentor", text: "I ran into a network error contacting the AI server. Please check your internet connection or your API key settings!" }]);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAskForCodeHint = async () => {
    setLoadingAI(true);
    setAiChat(prev => [...prev, { sender: "user", text: "Evaluate my code in the editor and give me a hint." }]);
    
    const currentTask = activeTab === "debugging" ? module.debugging.description : module.implementation.description;
    const refCode = activeTab === "debugging" ? module.debugging.correctCode : module.implementation.correctCode;

    try {
      const res = await aiEvaluateCode(currentCode, currentTask, refCode);
      setAiChat(prev => [...prev, { sender: "mentor", text: res.hint }]);
    } catch (err) {
      setAiChat(prev => [...prev, { sender: "mentor", text: "Unable to evaluate code right now. Try checking your syntax manually!" }]);
    } finally {
      setLoadingAI(false);
    }
  };

  const formatInlineText = (text: string) => {
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: "#ffffff", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="code-font text-highlight-teal" style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "3px", fontSize: "0.85rem" }}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Custom simple Markdown Parser helper
  const parseMarkdown = (markdownText: string) => {
    const lines = markdownText.split("\n");
    let inCodeBlock = false;
    let codeContent: string[] = [];

    return lines.map((line, idx) => {
      // Code Blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeStr = codeContent.join("\n");
          codeContent = [];
          return (
            <div key={idx} className="sandbox-mock-editor" style={{ maxWidth: "100%", margin: "20px 0" }}>
              <pre className="code-font text-highlight-teal" style={{ overflowX: "auto", fontSize: "0.75rem", whiteSpace: "pre" }}>{codeStr}</pre>
              <button
                onClick={() => {
                  setCurrentCode(codeStr);
                  setEditorKey(prev => prev + 1); // trigger editor refresh
                  setShowSandbox(true); // Auto-open sandbox!
                }}
                className="cert-view-btn"
                style={{ marginTop: "12px" }}
              >
                Try in Editor
              </button>
            </div>
          );
        } else {
          inCodeBlock = true;
          return null;
        }
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return null;
      }

      // Headers
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="timeline-header-title" style={{ fontSize: "1.8rem", marginTop: "16px", marginBottom: "24px", color: "#ffffff" }}>{line.substring(2)}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="timeline-header-title" style={{ fontSize: "1.5rem", marginTop: "32px", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>{line.substring(3)}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="node-main-title text-highlight-teal" style={{ fontSize: "1.25rem", marginTop: "24px", marginBottom: "12px" }}>{line.substring(4)}</h3>;
      }
      if (line.startsWith("#### ")) {
        return <h4 key={idx} className="node-main-title" style={{ fontSize: "1.1rem", marginTop: "16px", marginBottom: "8px", color: "#ffffff" }}>{line.substring(5)}</h4>;
      }

      // Horizontal Rule
      if (line.trim() === "---") {
        return <hr key={idx} style={{ border: "0", borderTop: "1px solid var(--border-color)", margin: "24px 0" }} />;
      }

      // Blockquote
      if (line.trim().startsWith("> ")) {
        return (
          <blockquote key={idx} style={{ borderLeft: "4px solid var(--color-purple)", paddingLeft: "16px", margin: "16px 0", color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.95rem" }}>
            {formatInlineText(line.trim().substring(2))}
          </blockquote>
        );
      }

      // Bullet Lists
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const indentLevel = line.indexOf(line.trim().substring(0, 1));
        const paddingLeft = 24 + indentLevel * 4;
        return (
          <ul key={idx} className="node-desc-text" style={{ paddingLeft: `${paddingLeft}px`, listStyleType: "disc", margin: "4px 0", fontSize: "0.95rem" }}>
            <li>{formatInlineText(line.trim().substring(2))}</li>
          </ul>
        );
      }

      // Number lists
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <ol key={idx} className="node-desc-text" style={{ paddingLeft: "24px", listStyleType: "decimal", margin: "8px 0", fontSize: "0.95rem" }}>
            <li style={{ listStyleType: "decimal" }}>{formatInlineText(numMatch[2])}</li>
          </ol>
        );
      }

      // Standard Text Paragraphs
      if (line.trim() === "") return <div key={idx} className="h-3" style={{ height: "12px" }} />;
      return <p key={idx} className="node-desc-text" style={{ fontSize: "0.95rem", lineHeight: "1.65", margin: "8px 0" }}>{formatInlineText(line)}</p>;
    }).filter(el => el !== null);
  };

  return (
    <div className="workspace-layout-split">
      {/* LEFT COLUMN: Notes, Quizzes, Instructions */}
      <div 
        className="notes-workspace-panel glass-card"
        style={{ width: isEditorVisible ? "50%" : "100%", height: "100%", transition: "width 0.2s ease-in-out" }}
      >
        {/* Module Header Toolbar */}
        <div className="workspace-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={onBackToDashboard}
              className="workspace-back-btn"
            >
              <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back to Dashboard
            </button>
            <span className="workspace-header-title">
              {module.title}
            </span>
          </div>
          
          {(activeTab === "notes" || activeTab === "quiz" || activeTab === "ai" || activeTab === "qa") && (
            <button
              onClick={() => setShowSandbox(prev => !prev)}
              className="cert-view-btn"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "6px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer" }}
            >
              <Sparkles style={{ width: "14px", height: "14px" }} />
              {showSandbox ? "Close Sandbox" : "Practice Sandbox"}
            </button>
          )}
        </div>

        {/* Workspace Tab Swapper */}
        <div className="workspace-tab-bar">
          <button
            onClick={() => setActiveTab("notes")}
            className={`workspace-tab-btn ${activeTab === "notes" ? "active" : ""}`}
          >
            <BookOpen style={{ width: "16px", height: "16px" }} /> Notes
          </button>
          
          <button
            onClick={() => setActiveTab("quiz")}
            className={`workspace-tab-btn ${activeTab === "quiz" ? "active" : ""}`}
          >
            <HelpCircle style={{ width: "16px", height: "16px" }} /> Quiz
          </button>

          <button
            onClick={() => setActiveTab("debugging")}
            className={`workspace-tab-btn ${activeTab === "debugging" ? "active" : ""}`}
          >
            <Bug style={{ width: "16px", height: "16px" }} /> Debug
          </button>

          <button
            onClick={() => setActiveTab("implementation")}
            className={`workspace-tab-btn ${activeTab === "implementation" ? "active" : ""}`}
          >
            <CheckSquare style={{ width: "16px", height: "16px" }} /> Challenge
          </button>

          <button
            onClick={() => setActiveTab("qa")}
            className={`workspace-tab-btn ${activeTab === "qa" ? "active" : ""}`}
          >
            <MessageCircle style={{ width: "16px", height: "16px" }} /> Q&A
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`workspace-tab-btn ${activeTab === "ai" ? "active" : ""}`}
            style={{ color: activeTab === "ai" ? "var(--color-purple)" : "" }}
          >
            <MessageSquare style={{ width: "16px", height: "16px" }} /> AI Mentor
          </button>
        </div>

        {/* Tab View Contents (Scrollable) */}
        <div className="notes-body">
          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="notes-wrapper" style={{ maxWidth: "800px", margin: "0 auto" }}>
              {parseMarkdown(module.notes)}
              
              <div className="notes-footer" style={{ marginTop: "24px" }}>
                <span className="notes-footer-text">Review notes carefully, then launch the quiz.</span>
                <button
                  onClick={() => setActiveTab("quiz")}
                  className="notes-footer-btn primary-btn-green"
                >
                  Take Quiz <ArrowRight style={{ width: "14px", height: "14px" }} />
                </button>
              </div>
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === "quiz" && (
            <div className="quiz-workspace-wrapper" style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div className="quiz-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                <div>
                  <h3>Module Comprehension Test</h3>
                  <p>Score at least 70% ({Math.ceil(quizQuestions.length * 0.7)}/{quizQuestions.length} correct answers) to unlock coding quests.</p>
                </div>
                {(Object.keys(selectedAnswers).length > 0 || quizPassed) && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to reset this quiz? This will reset your answers, score, and restore default questions.")) {
                        setSelectedAnswers({});
                        setQuizScore(null);
                        setQuizQuestions(module.quiz);
                        setQuizPassed(false);
                      }
                    }}
                    className="cert-view-btn"
                    style={{ padding: "6px 12px", fontSize: "0.75rem", whiteSpace: "nowrap", border: "1px solid var(--border-color)", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Reset Quiz
                  </button>
                )}
              </div>

              <div className="quiz-questions-list">
                {quizQuestions.map((q, qIdx) => (
                  <div key={q.id} className="quiz-question-card">
                    <span className="question-card-index">Question {qIdx + 1}</span>
                    <h4 className="question-card-title">{q.question}</h4>
                    
                    <div className="quiz-options-grid">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        const isCorrect = optIdx === q.answerIndex;
                        const isIncorrect = isSelected && !isCorrect;

                        let btnStyle: React.CSSProperties = {};
                        let btnClass = "quiz-option-btn";

                        if (quizScore !== null) {
                          if (isCorrect) {
                            btnStyle = {
                              borderColor: "var(--color-green, #10b981)",
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#ffffff"
                            };
                          } else if (isIncorrect) {
                            btnStyle = {
                              borderColor: "#ef4444",
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#ffffff"
                            };
                          } else {
                            btnStyle = {
                              opacity: 0.4,
                              cursor: "not-allowed"
                            };
                          }
                        } else if (isSelected) {
                          btnClass += " selected";
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizPassed || quizScore !== null}
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            className={btnClass}
                            style={btnStyle}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizScore !== null && (
                      <div className="quiz-explanation-box" style={{ marginTop: "16px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", borderLeft: "3px solid var(--color-purple)", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4", margin: 0 }}>
                          <strong style={{ color: "#ffffff" }}>Explanation:</strong> {q.explanation || "No explanation provided."}
                        </p>
                        <button
                          onClick={() => {
                            const userSel = selectedAnswers[q.id] !== undefined ? q.options[selectedAnswers[q.id]] : "None";
                            setActiveTab("ai");
                            handleSendAiPrompt(
                              `I need help understanding this quiz question:\n"${q.question}"\n\nOptions:\n${q.options.map((o, idx) => `${idx + 1}. ${o}`).join("\n")}\n\nThe correct answer is: "${q.options[q.answerIndex]}"\nI selected: "${userSel}"\n\nCan you explain the concept behind this question and why the correct answer is right?`
                            );
                          }}
                          className="cert-view-btn"
                          style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", padding: "4px 8px", cursor: "pointer", border: "1px solid var(--border-color)", borderRadius: "4px" }}
                        >
                          <MessageSquare style={{ width: "12px", height: "12px" }} /> Ask AI Mentor
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit / Retry Actions */}
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                {quizScore !== null ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" }}>
                    <div className={quizScore >= 70 ? "quiz-score-banner-success" : "quiz-score-banner-fail"}>
                      <h4>
                        {quizScore >= 70 ? "🎉 Quiz Passed!" : "❌ Try Again!"}
                      </h4>
                      <p style={{ marginTop: "6px" }}>
                        You scored **{quizScore}%** ({Math.round((quizScore / 100) * quizQuestions.length)} / {quizQuestions.length} correct).
                      </p>
                    </div>
                    
                    {quizScore < 70 && (
                      <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                        <button
                          onClick={() => {
                            setSelectedAnswers({});
                            setQuizScore(null);
                          }}
                          className="primary-btn-green"
                          style={{ padding: "12px", flex: 1, fontSize: "0.8rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                        >
                          <RefreshCw style={{ width: "16px", height: "16px" }} />
                          Retry Same Quiz
                        </button>
                        <button
                          onClick={handleRegenerateQuiz}
                          disabled={generatingQuiz}
                          className="primary-btn-purple"
                          style={{ padding: "12px", flex: 1, fontSize: "0.8rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                        >
                          {generatingQuiz ? (
                            <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                          ) : (
                            <Sparkles style={{ width: "16px", height: "16px" }} />
                          )}
                          {generatingQuiz ? "Generating..." : "AI Generate New Quiz"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                    className="primary-btn-green"
                    style={{ padding: "12px", width: "100%", fontSize: "0.8rem", cursor: Object.keys(selectedAnswers).length < quizQuestions.length ? "not-allowed" : "pointer" }}
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Debugging Tab */}
          {activeTab === "debugging" && (
            <div className="quiz-workspace-wrapper">
              <div className="mission-info-box">
                <AlertTriangle className="mission-info-icon amber" />
                <div className="mission-info-text-block">
                  <h4 className="mission-info-title amber">Debugging Mission</h4>
                  <p className="mission-info-desc">
                    The code in the editor contains a logical or structural syntax error. Inspect the boilerplate code, debug the core function, and run code assertions.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 className="instructions-title">Task Instructions:</h3>
                <p className="instructions-body-text">
                  {activeDebugging.description}
                </p>
              </div>

              {renderCustomChallengeForm("debugging")}
            </div>
          )}

          {/* Code Challenge Tab */}
          {activeTab === "implementation" && (
            <div className="quiz-workspace-wrapper">
              <div className="mission-info-box purple-style">
                <Sparkles className="mission-info-icon purple" style={{ animation: "pulse 2s infinite" }} />
                <div className="mission-info-text-block">
                  <h4 className="mission-info-title purple">Implementation Challenge</h4>
                  <p className="mission-info-desc">
                    Build the requested functionality from scratch. Make sure you return values exactly as expected, handling any extreme parameters.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 className="instructions-title">Task Instructions:</h3>
                <p className="instructions-body-text">
                  {activeImplementation.description}
                </p>
              </div>

              {renderCustomChallengeForm("implementation")}
            </div>
          )}

          {/* Q&A / Doubt Discussion Tab */}
          {activeTab === "qa" && (
            <div className="qa-workspace-wrapper" style={{ maxWidth: "800px", margin: "0 auto" }}>
              {isCreatingDoubt ? (
                /* Ask a Doubt Form */
                <div className="qa-form-container">
                  <div className="qa-back-header" style={{ marginBottom: "20px" }}>
                    <button 
                      onClick={() => setIsCreatingDoubt(false)}
                      className="qa-back-btn"
                    >
                      <ChevronLeft style={{ width: "16px", height: "16px" }} /> Back to Q&A
                    </button>
                  </div>
                  <h3 className="qa-section-title">Ask a Doubt</h3>
                  <p className="qa-section-subtitle">Be descriptive. You can post code snippets using standard formatting.</p>
                  
                  <form onSubmit={handleCreateDoubtSubmit} className="qa-form">
                    <div className="qa-form-group">
                      <label className="qa-form-label">Title / Summary</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Why does typeof null return 'object'?"
                        value={doubtTitle}
                        onChange={(e) => setDoubtTitle(e.target.value)}
                        required
                        maxLength={150}
                        className="qa-form-input form-input"
                      />
                    </div>
                    
                    <div className="qa-form-group" style={{ marginTop: "16px" }}>
                      <label className="qa-form-label">Detailed Explanation</label>
                      <textarea
                        placeholder="Provide details about your doubt. Explain what you've tried and paste any relevant code..."
                        value={doubtContent}
                        onChange={(e) => setDoubtContent(e.target.value)}
                        required
                        rows={8}
                        className="qa-form-textarea form-input"
                      />
                    </div>

                    <div className="qa-form-actions" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                      <button 
                        type="submit" 
                        disabled={submittingQA}
                        className="primary-btn-green"
                        style={{ flex: 1, padding: "12px", cursor: submittingQA ? "not-allowed" : "pointer" }}
                      >
                        {submittingQA ? "Posting..." : "Post Doubt"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsCreatingDoubt(false)}
                        className="cert-view-btn"
                        style={{ padding: "12px 24px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : activeDoubt ? (
                /* Doubt Detail View & Discussion Thread */
                <div className="qa-detail-container">
                  <div className="qa-back-header" style={{ marginBottom: "20px" }}>
                    <button 
                      onClick={() => {
                        setActiveDoubt(null);
                        setReplies([]);
                      }}
                      className="qa-back-btn"
                    >
                      <ChevronLeft style={{ width: "16px", height: "16px" }} /> Back to all doubts
                    </button>
                  </div>

                  {/* Main doubt card */}
                  <div className="qa-main-card">
                    <div className="qa-card-meta">
                      <span className="qa-card-author">{activeDoubt.author}</span>
                      <span className="qa-card-dot">•</span>
                      <span className="qa-card-time">{formatDate(activeDoubt.createdAt)}</span>
                    </div>
                    <h2 className="qa-detail-title">{activeDoubt.title}</h2>
                    <div className="qa-detail-body">
                      {activeDoubt.content.split("\n").map((line: string, i: number) => (
                        <p key={i} style={{ margin: "6px 0", wordBreak: "break-word" }}>{line}</p>
                      ))}
                    </div>
                  </div>

                  {/* Replies Section */}
                  <div className="qa-replies-section" style={{ marginTop: "32px" }}>
                    <h3 className="qa-replies-title">Replies ({replies.length})</h3>
                    
                    {loadingQA && replies.length === 0 ? (
                      <div className="qa-loading" style={{ padding: "24px 0", textAlign: "center" }}>
                        <Loader2 style={{ width: "24px", height: "24px", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                      </div>
                    ) : replies.length === 0 ? (
                      <p className="qa-no-replies" style={{ padding: "20px 0", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                        No replies yet. Be the first to help out!
                      </p>
                    ) : (
                      <div className="qa-replies-list" style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                        {replies.map((reply) => (
                          <div key={reply.id} className="qa-reply-card">
                            <div className="qa-card-meta">
                              <span className="qa-card-reply-author">{reply.author}</span>
                              <span className="qa-card-dot">•</span>
                              <span className="qa-card-time">{formatDate(reply.createdAt)}</span>
                            </div>
                            <div className="qa-reply-body" style={{ marginTop: "8px", fontSize: "0.95rem", lineHeight: "1.6" }}>
                              {reply.content.split("\n").map((line, i) => (
                                <p key={i} style={{ margin: "4px 0", wordBreak: "break-word" }}>{line}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Reply Form */}
                  <div className="qa-reply-form-container" style={{ marginTop: "32px", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
                    <h4 style={{ fontSize: "1.05rem", color: "#ffffff", marginBottom: "12px", fontWeight: 600 }}>Post a Reply</h4>
                    <form onSubmit={handleCreateReplySubmit} className="qa-reply-form">
                      <textarea
                        placeholder="Write a helpful reply or code example..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        required
                        rows={4}
                        className="qa-form-textarea form-input"
                        style={{ minHeight: "100px" }}
                      />
                      <button 
                        type="submit" 
                        disabled={submittingQA || !replyContent.trim()}
                        className="primary-btn-green"
                        style={{ marginTop: "12px", padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: (submittingQA || !replyContent.trim()) ? "not-allowed" : "pointer" }}
                      >
                        {submittingQA ? "Posting..." : "Post Reply"}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* Doubts Dashboard */
                <div className="qa-dashboard-container">
                  <div className="qa-dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px" }}>
                    <div>
                      <h3 className="qa-section-title">Doubts & Discussions</h3>
                      <p className="qa-section-subtitle">Get stuck? Ask questions here and collaborate with the community.</p>
                    </div>
                    <button 
                      onClick={() => setIsCreatingDoubt(true)}
                      className="primary-btn-green"
                      style={{ padding: "10px 18px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      <Plus style={{ width: "16px", height: "16px" }} /> Ask a Doubt
                    </button>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className="qa-search-bar" style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <Search style={{ width: "16px", height: "16px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        placeholder="Search doubts..."
                        value={qaSearch}
                        onChange={(e) => setQaSearch(e.target.value)}
                        className="qa-search-input form-input"
                        style={{ paddingLeft: "38px" }}
                      />
                    </div>
                    
                    <select
                      value={qaSort}
                      onChange={(e) => setQaSort(e.target.value as any)}
                      className="qa-sort-select form-input"
                      style={{ width: "160px", cursor: "pointer" }}
                    >
                      <option value="newest">Newest first</option>
                      <option value="active">Most active</option>
                    </select>
                  </div>

                  {/* Doubts List */}
                  {loadingQA && doubts.length === 0 ? (
                    <div className="qa-loading" style={{ padding: "48px 0", textAlign: "center" }}>
                      <Loader2 style={{ width: "32px", height: "32px", animation: "spin 1s linear infinite", margin: "0 auto", color: "var(--color-green)" }} />
                      <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>Loading discussions...</p>
                    </div>
                  ) : (
                    <div className="qa-doubts-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {(() => {
                        const filtered = doubts
                          .filter(d => 
                            d.title.toLowerCase().includes(qaSearch.toLowerCase()) || 
                            d.content.toLowerCase().includes(qaSearch.toLowerCase())
                          )
                          .sort((a, b) => {
                            if (qaSort === "newest") {
                              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            } else {
                              const countA = doubtRepliesCount[a.id] || 0;
                              const countB = doubtRepliesCount[b.id] || 0;
                              return countB - countA;
                            }
                          });

                        if (filtered.length === 0) {
                          return (
                            <div className="qa-empty-state" style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "12px", background: "rgba(255,255,255,0.01)" }}>
                              <MessageCircle style={{ width: "40px", height: "40px", margin: "0 auto 12px", color: "var(--text-muted)", opacity: 0.6 }} />
                              <h4 style={{ color: "#ffffff", fontSize: "1.05rem", fontWeight: 600 }}>No doubts found</h4>
                              <p style={{ color: "var(--text-muted)", marginTop: "4px", fontSize: "0.95rem" }}>
                                {qaSearch ? "Try refining your search keywords." : "Be the first to post a doubt in this module!"}
                              </p>
                              {!qaSearch && (
                                <button 
                                  onClick={() => setIsCreatingDoubt(true)}
                                  className="cert-view-btn"
                                  style={{ marginTop: "16px", padding: "8px 16px", fontSize: "0.8rem", cursor: "pointer" }}
                                >
                                  Create First Doubt
                                </button>
                              )}
                            </div>
                          );
                        }

                        return filtered.map((doubt) => {
                          const replyCount = doubtRepliesCount[doubt.id] || 0;
                          return (
                            <div 
                              key={doubt.id} 
                              onClick={() => handleSelectDoubt(doubt)}
                              className="qa-doubt-card"
                            >
                              <div className="qa-doubt-card-left" style={{ flex: 1 }}>
                                <h4 className="qa-doubt-card-title">{doubt.title}</h4>
                                <p className="qa-doubt-card-excerpt">
                                  {doubt.content.length > 180 ? `${doubt.content.substring(0, 180)}...` : doubt.content}
                                </p>
                                <div className="qa-card-meta" style={{ marginTop: "12px" }}>
                                  <span className="qa-card-author">{doubt.author}</span>
                                  <span className="qa-card-dot">•</span>
                                  <span className="qa-card-time">{formatDate(doubt.createdAt)}</span>
                                </div>
                              </div>
                              <div className="qa-doubt-card-right" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div className="qa-reply-badge">
                                  <MessageCircle style={{ width: "14px", height: "14px" }} />
                                  <span>{replyCount} {replyCount === 1 ? "reply" : "replies"}</span>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Mentor Chat Tab */}
          {activeTab === "ai" && (
            <div className="mentor-chat-wrapper" style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div className="mentor-chat-log">
                {aiChat.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`chat-balloon ${msg.sender === "mentor" ? "chat-balloon-mentor" : "chat-balloon-user"}`}
                  >
                    <strong>{msg.sender === "mentor" ? "🤖 AI Mentor: " : "👤 You: "}</strong>
                    <p style={{ marginTop: "4px", whiteSpace: "pre-wrap" }}>{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mentor-actions-row">
                <button
                  onClick={handleAskForCodeHint}
                  disabled={loadingAI}
                  className="mentor-action-btn-pill purple-border"
                >
                  Evaluate Editor Code
                </button>
                <button
                  onClick={() => handleSendAiPrompt("Explain closures and scope in JavaScript")}
                  disabled={loadingAI}
                  className="mentor-action-btn-pill"
                >
                  Explain Closures
                </button>
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiPrompt();
                }}
                className="chat-form-input"
              >
                <input
                  type="text"
                  placeholder="Type your question..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={loadingAI}
                  className="chat-text-input form-input"
                />
                <button
                  type="submit"
                  disabled={loadingAI || !aiPrompt.trim()}
                  className="chat-send-btn"
                  style={{ width: "32px", height: "32px" }}
                >
                  {loadingAI ? (
                    <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Send style={{ width: "16px", height: "16px" }} />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Global Module Bottom Banner */}
        {moduleCompleted && (
          <div className="completion-bottom-banner animate-pulse">
            <div className="completion-banner-left">
              <Award style={{ width: "20px", height: "20px" }} />
              <span>Quest completed! +160 XP Earned. Certificate active!</span>
            </div>
            <button
              onClick={onBackToDashboard}
              className="completion-banner-btn primary-btn-green"
              style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              Finish Module <ArrowRight style={{ width: "14px", height: "14px", fill: "#030712" }} />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Code Editor Sandbox */}
      {isEditorVisible && (
        <div className="editor-workspace-panel" style={{ width: "50%", height: "100%" }}>
          <CodeEditor
            key={`${activeTab}-${editorKey}`} // force reload when changing tabs or clicking Try in Editor
            initialCode={editorInitialCode}
            testCases={editorTestCases}
            challengeId={challengeId}
            challengeType={challengeType}
            challengeDescription={activeTab === "debugging" ? activeDebugging.description : activeImplementation.description}
            onSuccess={activeTab === "debugging" ? handleDebuggingSuccess : handleImplementationSuccess}
            onChange={handleCodeChange}
            onAskAiMentor={(query) => {
              setActiveTab("ai");
              handleSendAiPrompt(query);
            }}
          />
        </div>
      )}

    </div>
  );
};
