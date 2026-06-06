import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Trash2, CheckCircle2, XCircle, AlertCircle, Terminal, Check, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { evaluateCode } from "../services/evaluator";
import type { TestResult } from "../services/evaluator";
import { aiExplainCodeError } from "../services/ai";

interface CodeEditorProps {
  initialCode: string;
  testCases: any[];
  challengeId: string;
  challengeType: "function" | "class" | "async";
  challengeDescription?: string;
  onSuccess: () => void; // Called when all tests pass
  onChange?: (code: string) => void; // Added for state sync
  onAskAiMentor?: (query: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode,
  testCases,
  challengeId,
  challengeType,
  challengeDescription = "",
  onSuccess,
  onChange,
  onAskAiMentor,
}) => {
  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiExplanationLoading, setAiExplanationLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCode(initialCode);
    if (onChange) onChange(initialCode);
    setLogs([]);
    setError(null);
    setTests([]);
    setHasRun(false);
    setAiExplanation(null);
    setAiExplanationLoading(false);
  }, [initialCode, challengeId]);

  useEffect(() => {
    // Auto-scroll console to bottom when logs change
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, error, tests]);

  const handleRunCode = async () => {
    setRunning(true);
    setError(null);
    setHasRun(true);
    setLogs(["⚡ Compiling and running code..."]);
    setTests([]);
    setAiExplanation(null);
    setAiExplanationLoading(false);

    try {
      const res = await evaluateCode(code, testCases, challengeType, challengeId);
      
      setLogs(res.logs);
      
      let hasFailure = false;
      let failureDetail = "";

      if (res.error) {
        setError(res.error);
        hasFailure = true;
        failureDetail = res.error;
      } else if (res.tests) {
        setTests(res.tests);
        if (res.passedAll) {
          onSuccess();
        } else {
          hasFailure = true;
          const failed = res.tests.filter(t => !t.passed);
          failureDetail = failed.map(t => {
            if (t.error) return `${t.description}: ${t.error}`;
            return `${t.description} (Expected: ${JSON.stringify(t.expected)}, Got: ${JSON.stringify(t.actual)})`;
          }).join("\n");
        }
      }

      if (hasFailure && failureDetail) {
        setAiExplanationLoading(true);
        try {
          const explanation = await aiExplainCodeError(code, failureDetail, challengeDescription);
          setAiExplanation(explanation);
        } catch (err) {
          setAiExplanation("Unable to get AI explanation. Please check your network or API Key settings.");
        } finally {
          setAiExplanationLoading(false);
        }
      }
    } catch (err: any) {
      const errMsg = err.message || "Failed to execute code.";
      setError(errMsg);
      setAiExplanationLoading(true);
      try {
        const explanation = await aiExplainCodeError(code, errMsg, challengeDescription);
        setAiExplanation(explanation);
      } catch (err) {
        setAiExplanation("Unable to get AI explanation. Please check your network or API Key settings.");
      } finally {
        setAiExplanationLoading(false);
      }
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your editor to the default template?")) {
      setCode(initialCode);
      if (onChange) onChange(initialCode);
      setError(null);
      setLogs([]);
      setTests([]);
      setHasRun(false);
    }
  };

  const handleClearConsole = () => {
    setLogs([]);
    setError(null);
    setTests([]);
    setHasRun(false);
  };

  // Synchronized line numbers calculation
  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  // Helper to parse line number from error message
  const getErrorLine = (errorMsg: string | null): number | null => {
    if (!errorMsg) return null;
    const patterns = [
      /line (\d+)/i,
      /:(\d+):(\d+)/,
      /(\d+):(\d+)/,
      /at (\d+)/i
    ];
    for (const pattern of patterns) {
      const match = errorMsg.match(pattern);
      if (match) {
        const lineNum = parseInt(match[1], 10);
        if (!isNaN(lineNum) && lineNum > 0) {
          return lineNum;
        }
      }
    }
    return null;
  };

  const errorLine = getErrorLine(error);

  // Interactive VS Code-like key down helper
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    // 1. Tab key indenter (inserts 2 spaces)
    if (e.key === "Tab") {
      e.preventDefault();
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      if (onChange) onChange(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // 2. Bracket completion: (, {, [, ", ', `
    const bracketPairs: Record<string, string> = {
      "(": ")",
      "{": "}",
      "[": "]",
      '"': '"',
      "'": "'",
      "`": "`",
    };

    if (bracketPairs[e.key] !== undefined) {
      e.preventDefault();
      const closingChar = bracketPairs[e.key];
      
      // If text is selected, wrap it!
      if (start !== end) {
        const selectedText = code.substring(start, end);
        const newCode = code.substring(0, start) + e.key + selectedText + closingChar + code.substring(end);
        setCode(newCode);
        if (onChange) onChange(newCode);
        setTimeout(() => {
          target.selectionStart = start + 1;
          target.selectionEnd = end + 1;
        }, 0);
      } else {
        // Insert pair
        const newCode = code.substring(0, start) + e.key + closingChar + code.substring(end);
        setCode(newCode);
        if (onChange) onChange(newCode);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1;
        }, 0);
      }
      return;
    }

    // 3. Skip typing closing character if it is already there
    const closingChars = [")", "}", "]", '"', "'", "`"];
    if (closingChars.includes(e.key) && start === end && code.charAt(start) === e.key) {
      e.preventDefault();
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // 4. Backspace: delete matching pair if cursor is in between
    if (e.key === "Backspace" && start === end && start > 0) {
      const charBefore = code.charAt(start - 1);
      const charAfter = code.charAt(start);
      if (
        (charBefore === "(" && charAfter === ")") ||
        (charBefore === "{" && charAfter === "}") ||
        (charBefore === "[" && charAfter === "]") ||
        (charBefore === '"' && charAfter === '"') ||
        (charBefore === "'" && charAfter === "'") ||
        (charBefore === "`" && charAfter === "`")
      ) {
        e.preventDefault();
        const newCode = code.substring(0, start - 1) + code.substring(start + 1);
        setCode(newCode);
        if (onChange) onChange(newCode);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start - 1;
        }, 0);
        return;
      }
    }

    // 5. Enter key auto-indentation inside braces
    if (e.key === "Enter" && start === end && start > 0) {
      const charBefore = code.charAt(start - 1);
      const charAfter = code.charAt(start);
      
      // If we are pressing Enter between { and }
      if (charBefore === "{" && charAfter === "}") {
        e.preventDefault();
        const linesBefore = code.substring(0, start).split("\n");
        const currentLine = linesBefore[linesBefore.length - 1];
        const indentMatch = currentLine.match(/^(\s*)/);
        const currentIndent = indentMatch ? indentMatch[1] : "";
        
        const indent = currentIndent + "  ";
        const newCode = code.substring(0, start) + "\n" + indent + "\n" + currentIndent + code.substring(end);
        setCode(newCode);
        if (onChange) onChange(newCode);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1 + indent.length;
        }, 0);
        return;
      }
      
      // General Enter auto-indentation (match previous line's indent)
      const linesBefore = code.substring(0, start).split("\n");
      const currentLine = linesBefore[linesBefore.length - 1];
      const indentMatch = currentLine.match(/^(\s*)/);
      if (indentMatch && indentMatch[1].length > 0) {
        e.preventDefault();
        const indent = indentMatch[1];
        const newCode = code.substring(0, start) + "\n" + indent + code.substring(end);
        setCode(newCode);
        if (onChange) onChange(newCode);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1 + indent.length;
        }, 0);
        return;
      }
    }
  };

  return (
    <div className="editor-ide-container glass-card" style={{ height: "100%", width: "100%" }}>
      {/* Editor Header */}
      <div className="editor-header-bar">
        <div className="editor-header-title-wrapper">
          <Terminal style={{ width: "16px", height: "16px" }} />
          <span>Practice Arena</span>
        </div>
        <div className="editor-header-btn-row">
          <button
            onClick={handleReset}
            title="Reset code boilerplate"
            className="editor-action-btn-small"
          >
            <RotateCcw style={{ width: "14px", height: "14px" }} />
          </button>
          <button
            onClick={handleClearConsole}
            title="Clear console"
            className="editor-action-btn-small"
          >
            <Trash2 style={{ width: "14px", height: "14px" }} />
          </button>
          <button
            onClick={handleRunCode}
            disabled={running}
            className="editor-run-btn primary-btn-green"
          >
            <Play style={{ width: "14px", height: "14px", fill: "#030712" }} />
            {running ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* Editor Body: Line numbers + Textarea */}
      <div className="editor-editing-area">
        {/* Line numbers column */}
        <div className="line-numbers-col">
          {lineNumbers.map((num) => {
            const isErrorLine = num === errorLine;
            return (
              <div 
                key={num} 
                className={isErrorLine ? "line-number-error" : ""}
                style={isErrorLine ? { color: "var(--color-rose)", fontWeight: "bold", background: "rgba(244, 63, 94, 0.15)", textShadow: "0 0 8px rgba(244, 63, 94, 0.4)" } : {}}
              >
                {num}
              </div>
            );
          })}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => {
            const val = e.target.value;
            setCode(val);
            if (onChange) onChange(val);
          }}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={`ide-textarea ${error ? "has-compile-error" : ""}`}
          placeholder="// Type your JavaScript code here..."
        />
      </div>

      {/* Virtual Console Drawer */}
      <div className="console-drawer">
        {/* Console Header */}
        <div className="console-drawer-header">
          <span>Console & Assertions</span>
          {running && (
            <span className="text-highlight-green" style={{ animation: "pulse 1.5s infinite" }}>Running test assertions...</span>
          )}
        </div>

        {/* Console Logs */}
        <div className="console-logs-container">
          {logs.map((log, idx) => (
            <div key={idx} className="console-log-row">
              {log.startsWith("⚡") ? (
                <span className="console-log-row-running">{log}</span>
              ) : (
                <>
                  <span className="console-log-row-prompt">&gt; </span>
                  <span className="console-log-row-prompt-val">{log}</span>
                </>
              )}
            </div>
          ))}

          {/* Runtime Errors */}
          {error && (
            <div className="console-error-card">
              <AlertCircle />
              <div className="console-error-details">
                <div className="console-error-title">Execution Failed</div>
                <div style={{ marginTop: "4px" }}>{error}</div>
              </div>
            </div>
          )}

          {/* Test Case Results */}
          {hasRun && tests.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
              <div className="console-suite-header">Test Suite Output:</div>
              {tests.map((test, idx) => (
                <div 
                  key={idx} 
                  className={`assertion-result-row ${test.passed ? "passed" : "failed"}`}
                >
                  <div className="assertion-meta-header">
                    {test.passed ? (
                      <CheckCircle2 className="green" />
                    ) : (
                      <XCircle className="rose" />
                    )}
                    <span className="assertion-desc-text">{test.description}</span>
                  </div>
                  {!test.passed && (
                    <div className="assertion-details-output">
                      {test.error ? (
                        <span style={{ color: "var(--color-rose)", fontWeight: "bold" }}>{test.error}</span>
                      ) : (
                        <span>
                          Expected: <span style={{ color: "#ffffff", fontWeight: "bold" }}>{JSON.stringify(test.expected)}</span> | 
                          Got: <span style={{ color: "var(--color-rose)", fontWeight: "bold" }}>{JSON.stringify(test.actual)}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* AI Mentor Error Explainer */}
          {hasRun && (error || (tests.length > 0 && tests.some(t => !t.passed))) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
              {aiExplanationLoading && (
                <div style={{ padding: "14px", background: "rgba(139, 92, 246, 0.04)", borderRadius: "8px", border: "1px solid rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite", color: "var(--color-purple)" }} />
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>AI Mentor is analyzing your code and error...</span>
                </div>
              )}

              {aiExplanation && (
                <div style={{ padding: "14px", background: "rgba(139, 92, 246, 0.06)", borderRadius: "8px", border: "1px solid rgba(139, 92, 246, 0.2)", borderLeft: "4px solid var(--color-purple)", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontWeight: "bold", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
                      <Sparkles style={{ width: "14px", height: "14px", color: "var(--color-purple)" }} />
                      AI Mentor Explanation:
                    </div>
                    {onAskAiMentor && (
                      <button
                        onClick={() => {
                          let failureDetail = error || "";
                          if (!failureDetail && tests.length > 0) {
                            failureDetail = tests.filter(t => !t.passed).map(t => t.description).join(", ");
                          }
                          const query = `I'm stuck on this challenge: "${challengeDescription}".\nMy code gets the error: "${failureDetail}".\nCan you help me understand how to fix it?`;
                          onAskAiMentor(query);
                        }}
                        className="cert-view-btn"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "4px 10px", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "6px", cursor: "pointer", background: "rgba(139, 92, 246, 0.1)" }}
                      >
                        <MessageSquare style={{ width: "12px", height: "12px" }} />
                        Ask AI Mentor
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: "0.82rem", lineHeight: "1.45", color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                    {aiExplanation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* If successfully passed tests */}
          {hasRun && tests.length > 0 && tests.every(t => t.passed) && !error && (
            <div className="console-success-alert animate-bounce">
              <Check style={{ width: "18px", height: "18px", strokeWidth: "3px" }} />
              All test cases passed successfully!
            </div>
          )}

          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
};
