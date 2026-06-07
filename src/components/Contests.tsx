import React, { useState, useEffect } from "react";
import { addXP } from "../services/storage";
import type { UserProfile } from "../services/storage";
import { CodeEditor } from "./CodeEditor";
import { 
  Trophy, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Play, 
  ArrowLeft
} from "lucide-react";

interface ContestsProps {
  userProfile: UserProfile;
  onBackToDashboard: () => void;
  onProfileUpdate: () => void;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time: string; // MM:SS
}

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "SyntaxNinja ⚡", score: 300, time: "02:14" },
  { rank: 2, name: "LoopMaster", score: 300, time: "02:45" },
  { rank: 3, name: "ArraySlayer", score: 300, time: "03:12" },
  { rank: 4, name: "ScopeRanger", score: 200, time: "01:50" },
  { rank: 5, name: "CallbackCoder", score: 200, time: "02:35" },
];

const CONTEST_PROBLEMS = [
  {
    id: "c-prob-1",
    title: "Task 1: Is Number Even?",
    description: "Write a function 'isEven(num)' that returns true if a number is even, and false otherwise.",
    initialCode: "function isEven(num) {\n  // Write code here\n  \n}",
    testCases: [
      { input: [4], expected: true, description: "isEven(4) -> true" },
      { input: [7], expected: false, description: "isEven(7) -> false" }
    ]
  },
  {
    id: "c-prob-2",
    title: "Task 2: Absolute Difference",
    description: "Write a function 'diff21(n)' that returns the absolute difference between n and 21. Double the difference if n is over 21.",
    initialCode: "function diff21(n) {\n  // Write code here\n  \n}",
    testCases: [
      { input: [19], expected: 2, description: "diff21(19) -> 2 (21-19)" },
      { input: [25], expected: 8, description: "diff21(25) -> 8 (2 * (25-21))" }
    ]
  },
  {
    id: "c-prob-3",
    title: "Task 3: Sum of Evens",
    description: "Write a function 'sumEvens(arr)' that returns the sum of all even numbers in an array. Return 0 if empty or no evens.",
    initialCode: "function sumEvens(arr) {\n  // Write code here\n  \n}",
    testCases: [
      { input: [[1, 2, 3, 4, 6]], expected: 12, description: "sumEvens([1, 2, 3, 4, 6]) -> 12" },
      { input: [[1, 3, 5]], expected: 0, description: "sumEvens([1, 3, 5]) -> 0" }
    ]
  }
];

export const Contests: React.FC<ContestsProps> = ({
  userProfile,
  onBackToDashboard,
  onProfileUpdate,
}) => {
  // Views: "sprint-dashboard" | "active-sprint" | "sprint-result"
  const [view, setView] = useState<string>("sprint-dashboard");
  
  // Contest Countdown (Mock: next Sunday at 18:00)
  const [countdown, setCountdown] = useState("2d 04h 15m 32s");
  
  // Sprints states
  const [sprintIndex, setSprintIndex] = useState(0);
  const [sprintTimeLeft, setSprintTimeLeft] = useState(300); // 5 minutes global timer
  const [sprintTimer, setSprintTimer] = useState<any>(null);
  
  // Scoring
  const [scoreList, setScoreList] = useState<boolean[]>([false, false, false]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [userFinalTime, setUserFinalTime] = useState("");
  const [userFinalScore, setUserFinalScore] = useState(0);

  // Editor states
  const [editorKey, setEditorKey] = useState(0);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);

  useEffect(() => {
    // Generate countdown ticks
    const interval = setInterval(() => {
      const hours = Math.floor(Math.random() * 24);
      const mins = Math.floor(Math.random() * 60);
      const secs = Math.floor(Math.random() * 60);
      setCountdown(`1d ${hours.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (sprintTimer) clearInterval(sprintTimer);
    };
  }, [sprintTimer]);

  const handleStartSprint = () => {
    setView("active-sprint");
    setSprintIndex(0);
    setSprintTimeLeft(300);
    setScoreList([false, false, false]);
    setShowForfeitConfirm(false);

    const timer = setInterval(() => {
      setSprintTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitSprint(0, 300); // Fail
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setSprintTimer(timer);
  };

  const handleTaskSuccess = () => {
    const updated = [...scoreList];
    updated[sprintIndex] = true;
    setScoreList(updated);

    // If there is a next task, auto advance
    if (sprintIndex < CONTEST_PROBLEMS.length - 1) {
      setTimeout(() => {
        setSprintIndex(prev => prev + 1);
        setEditorKey(prev => prev + 1); // reload editor with next problem template
      }, 800);
    } else {
      // Completed all 3!
      clearInterval(sprintTimer!);
      const totalTimeSpent = 300 - sprintTimeLeft;
      handleSubmitSprint(3, totalTimeSpent);
    }
  };

  const handleSubmitSprint = (solvedCount: number, timeSpentSecs: number) => {
    const finalScore = solvedCount * 100;
    const minStr = Math.floor(timeSpentSecs / 60).toString().padStart(2, "0");
    const secStr = (timeSpentSecs % 60).toString().padStart(2, "0");
    const finalTimeString = `${minStr}:${secStr}`;

    setUserFinalScore(finalScore);
    setUserFinalTime(finalTimeString);
    setView("sprint-result");

    // Add user to leaderboard if solved at least 1
    if (finalScore > 0) {
      const userEntry: LeaderboardEntry = {
        rank: 0, // calculated next
        name: `${userProfile.username} (You) ⚡`,
        score: finalScore,
        time: finalTimeString,
      };

      const newBoard = [...leaderboard, userEntry]
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          // faster time is better
          return a.time.localeCompare(b.time);
        })
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

      setLeaderboard(newBoard);
      
      // Award partial XP for participating
      addXP(finalScore / 2);
      onProfileUpdate();
    }
  };

  const activeProblem = CONTEST_PROBLEMS[sprintIndex];

  return (
    <div className="dashboard-layout-grid" style={{ minHeight: "calc(100vh - 64px)" }}>
      
      {/* 1. SPRINT DASHBOARD */}
      {view === "sprint-dashboard" && (
        <>
          <div className="sprint-dashboard-header" style={{ gridColumn: "span 2" }}>
            <div className="sprint-info-panel-box glass-card" style={{ position: "relative", height: "auto", minHeight: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ position: "absolute", top: 0, right: 0, padding: "32px", opacity: 0.05, pointerEvents: "none" }}>
                <Trophy style={{ width: "180px", height: "180px" }} />
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span className="sprint-header-badge">
                    Live Event Active
                  </span>
                  <span className="sprint-header-badge" style={{ background: "rgba(168, 85, 247, 0.15)", color: "var(--color-purple)", border: "1px solid rgba(168, 85, 247, 0.25)" }}>
                    Contest runs at 10:00 PM every Sunday
                  </span>
                </div>
                
                <h2 className="timeline-header-title" style={{ fontSize: "1.6rem", margin: 0 }}>Weekly Algorithms Sprint</h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p className="node-desc-text" style={{ maxWidth: "600px", margin: 0 }}>
                    Race against time to solve **3 progressive coding challenges** in under 5 minutes. Climb global ranks and unlock massive XP.
                  </p>
                  
                  {/* Structured Progressive Coding Challenges Details */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
                    gap: "12px", 
                    marginTop: "8px" 
                  }}>
                    <div style={{ 
                      padding: "12px 16px", 
                      borderRadius: "8px", 
                      background: "rgba(255, 255, 255, 0.02)", 
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "4px" 
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-green)" }} />
                        <span style={{ fontSize: "0.65rem", color: "var(--color-green)", fontWeight: 700, textTransform: "uppercase" }}>Challenge 1 (Easy)</span>
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ffffff" }}>Basic Logic Warm-up</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Warm up with simple conditions (e.g. verify if number is even).</span>
                    </div>

                    <div style={{ 
                      padding: "12px 16px", 
                      borderRadius: "8px", 
                      background: "rgba(255, 255, 255, 0.02)", 
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "4px" 
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-amber)" }} />
                        <span style={{ fontSize: "0.65rem", color: "var(--color-amber)", fontWeight: 700, textTransform: "uppercase" }}>Challenge 2 (Medium)</span>
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ffffff" }}>Algorithms & Math</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Apply absolute difference equations and conditional math checks.</span>
                    </div>

                    <div style={{ 
                      padding: "12px 16px", 
                      borderRadius: "8px", 
                      background: "rgba(255, 255, 255, 0.02)", 
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "4px" 
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-rose)" }} />
                        <span style={{ fontSize: "0.65rem", color: "var(--color-rose)", fontWeight: 700, textTransform: "uppercase" }}>Challenge 3 (Hard)</span>
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ffffff" }}>Collection Iteration</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Filter arrays and reduce values to solve complex data challenges.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="workspace-header select-none" style={{ borderTop: "1px solid var(--border-color)", borderBottom: "none", padding: "16px 0", marginTop: "12px", background: "transparent" }}>
                <div className="xp-tracker-lvl">
                  <Clock style={{ width: "16px", height: "16px", color: "var(--color-cyan)" }} />
                  <span>Remaining time: <strong style={{ color: "#ffffff" }}>{countdown}</strong></span>
                </div>
                <button
                  onClick={handleStartSprint}
                  className="primary-btn-green"
                  style={{ padding: "10px 22px", fontSize: "0.75rem" }}
                >
                  <Play style={{ width: "14px", height: "14px", fill: "#030712" }} />
                  Enter Sprint
                </button>
              </div>
            </div>

            {/* Upcoming Contests */}
            <div className="sidebar-section-card glass-card" style={{ marginTop: "24px" }}>
              <h3 className="section-card-title">
                <Calendar style={{ width: "16px", height: "16px", color: "var(--color-purple)" }} />
                Upcoming Contests
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="certificate-item-row" style={{ alignItems: "flex-start", padding: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <h4 className="node-main-title" style={{ fontSize: "0.85rem", color: "#ffffff" }}>
                      Next Scheduled Contest
                    </h4>
                    <p className="restrict-desc" style={{ color: "var(--color-purple)", fontWeight: 600, margin: "2px 0 6px 0" }}>
                      Sunday to Sunday Schedule
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                      The upcoming weekly sprint tournament runs on a Sunday to Sunday schedule. Next scheduled start is Sunday at 10:00 PM.
                    </p>
                  </div>
                  <span className="badge-pill-purple" style={{ whiteSpace: "nowrap" }}>
                    +500 XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Column */}
          <div className="dashboard-sidebar">
            <div className="certificate-card glass-card h-full" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 className="section-card-title">
                <TrendingUp style={{ width: "16px", height: "16px", color: "var(--color-amber)" }} />
                Sprint Leaderboards
              </h3>
              
              <div className="leaderboard-table-wrapper flex-grow">
                {leaderboard.map((user) => (
                  <div 
                    key={user.rank}
                    className={`leaderboard-table-row ${user.name.includes("(You)") ? "self" : ""}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className={`leaderboard-rank-number rank${user.rank}`}>
                        #{user.rank}
                      </span>
                      <span className="leaderboard-user-name" style={{ fontSize: "0.75rem" }}>{user.name}</span>
                    </div>
                    <div className="leaderboard-user-score">
                      <div>{user.score} pts</div>
                      <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: "normal" }}>{user.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <button
                  onClick={onBackToDashboard}
                  className="workspace-back-btn"
                  style={{ display: "inline-flex", margin: "0 auto" }}
                >
                  <ArrowLeft style={{ width: "14px", height: "14px" }} /> Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. ACTIVE CONTEST WORKSPACE */}
      {view === "active-sprint" && activeProblem && (
        <div className="workspace-layout-split" style={{ gridColumn: "span 3", maxWidth: "100%", width: "100%", padding: 0 }}>
          
          {/* Left Column: Problem details & Sprint progress */}
          <div className="notes-workspace-panel glass-card" style={{ padding: "24px" }}>
            {/* Header Timer */}
            <div className="workspace-header select-none" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
              <div>
                <span className="node-meta-title">Time-Limit Sprint</span>
                <h3 className="node-main-title" style={{ marginTop: "4px" }}>Sprint task {sprintIndex + 1} of 3</h3>
              </div>
              <div className="badge-pill-amber" style={{ border: "1px solid rgba(244, 63, 94, 0.3)", color: "var(--color-rose)", background: "rgba(244, 63, 94, 0.08)", fontSize: "0.85rem" }}>
                {Math.floor(sprintTimeLeft / 60)}:{(sprintTimeLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>

            {/* Task list Progress */}
            <div style={{ display: "flex", gap: "8px", margin: "16px 0" }}>
              {CONTEST_PROBLEMS.map((prob, idx) => (
                <div 
                  key={prob.id}
                  className="sprint-bar-progress"
                  style={{ flexGrow: 1 }}
                >
                  <div 
                    className={`sprint-bar-progress-fill ${idx === sprintIndex ? "active" : scoreList[idx] ? "completed" : ""}`}
                    style={{ width: idx <= sprintIndex ? "100%" : "0%" }}
                  />
                </div>
              ))}
            </div>

            {/* Problem Details */}
            <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h4 className="node-main-title">{activeProblem.title}</h4>
              <p className="node-desc-text" style={{ fontSize: "0.85rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {activeProblem.description}
              </p>
            </div>

            {showForfeitConfirm ? (
              <div style={{ 
                marginTop: "16px",
                padding: "12px", 
                borderRadius: "8px", 
                background: "rgba(244, 63, 94, 0.05)", 
                border: "1px solid rgba(244, 63, 94, 0.2)",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <span style={{ fontSize: "0.75rem", color: "var(--color-rose)", fontWeight: 600 }}>
                  Abort Sprint? You will score 0 points.
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      clearInterval(sprintTimer!);
                      setView("sprint-dashboard");
                      setShowForfeitConfirm(false);
                    }}
                    className="primary-btn-red"
                    style={{ 
                      flexGrow: 1, 
                      padding: "8px", 
                      fontSize: "0.75rem", 
                      background: "var(--color-rose)", 
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    Yes, Forfeit
                  </button>
                  <button
                    onClick={() => setShowForfeitConfirm(false)}
                    style={{ 
                      flexGrow: 1, 
                      padding: "8px", 
                      fontSize: "0.75rem", 
                      background: "transparent", 
                      color: "var(--text-muted)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowForfeitConfirm(true)}
                className="sprint-forfeit-btn"
                style={{ padding: "12px", marginTop: "16px" }}
              >
                Forfeit Sprint
              </button>
            )}
          </div>

          {/* Right Column: Code Editor */}
          <div className="editor-workspace-panel" style={{ width: "50%", height: "100%" }}>
            <CodeEditor
              key={`${sprintIndex}-${editorKey}`}
              initialCode={activeProblem.initialCode}
              testCases={activeProblem.testCases}
              challengeId={activeProblem.id}
              challengeType="function"
              onSuccess={handleTaskSuccess}
            />
          </div>

        </div>
      )}

      {/* 3. SPRINT RESULTS SUMMARY */}
      {view === "sprint-result" && (
        <div className="sprint-dashboard-header" style={{ gridColumn: "span 3" }}>
          <div className="result-popup-dialog glass-card">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="result-popup-dialog-avatar">
                <Trophy className="yellow" style={{ animation: "bounce 2s infinite" }} />
              </div>

              <h2 className="result-popup-title">Sprint Complete!</h2>
              <p className="restrict-desc" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Weekly Sprints Tournament #12</p>

              <div className="profile-stats-grid">
                <div className="profile-stat-box">
                  <div className="stat-box-label">Total Score</div>
                  <div className="stat-box-val text-highlight-teal" style={{ fontSize: "1.2rem" }}>{userFinalScore} pts</div>
                </div>
                <div className="profile-stat-box">
                  <div className="stat-box-label">Time Elapsed</div>
                  <div className="stat-box-val text-highlight-purple" style={{ fontSize: "1.2rem" }}>{userFinalTime}</div>
                </div>
              </div>

              {userFinalScore > 0 ? (
                <div className="badge-pill-green" style={{ margin: "0 auto" }}>
                  +{(userFinalScore / 2)} XP GRANTED & RANK PERSISTED
                </div>
              ) : (
                <div className="auth-error-msg" style={{ fontSize: "0.75rem" }}>
                  You didn't solve any problems before the timer expired. Practice makes perfect!
                </div>
              )}
            </div>

            <button
              onClick={() => setView("sprint-dashboard")}
              className="primary-btn-green"
              style={{ width: "100%", padding: "12px", fontSize: "0.8rem" }}
            >
              Go to Tournament Board
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
