import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import { updateBattleStats, addXP } from "../services/storage";
import type { UserProfile } from "../services/storage";
import { CodeEditor } from "./CodeEditor";
import { 
  Trophy, 
  Users, 
  User as UserIcon, 
  Zap, 
  Send, 
  ArrowLeft, 
  Loader2, 
  XCircle
} from "lucide-react";

interface LiveBattleProps {
  userProfile: UserProfile;
  onBackToDashboard: () => void;
  onProfileUpdate: () => void;
}

interface BattleProblem {
  id: string;
  title: string;
  description: string;
  initialCode: string;
  testCases: any[];
}

// Battle Challenges Pool
const BATTLE_PROBLEMS: BattleProblem[] = [
  {
    id: "b-prob-1",
    title: "Reverse a String",
    description: "Write a function 'reverseString(str)' that accepts a string and returns it reversed. E.g. 'hello' should return 'olleh'.",
    initialCode: "function reverseString(str) {\n  // Write your code here\n  \n}",
    testCases: [
      { input: ["hello"], expected: "olleh", description: "reverseString('hello')" },
      { input: ["JavaScript"], expected: "tpircSavaJ", description: "reverseString('JavaScript')" },
      { input: ["a"], expected: "a", description: "reverseString('a')" }
    ]
  },
  {
    id: "b-prob-2",
    title: "Sum of Array",
    description: "Write a function 'sumArray(arr)' that sums all the numbers in an array. Return 0 if the array is empty.",
    initialCode: "function sumArray(arr) {\n  // Write your code here\n  \n}",
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 10, description: "sumArray([1, 2, 3, 4])" },
      { input: [[-1, -2, 3]], expected: 0, description: "sumArray([-1, -2, 3])" },
      { input: [[]], expected: 0, description: "sumArray([])" }
    ]
  },
  {
    id: "b-prob-3",
    title: "Find Maximum Element",
    description: "Write a function 'findMax(arr)' that returns the largest number in the array. Return -Infinity if empty.",
    initialCode: "function findMax(arr) {\n  // Write your code here\n  \n}",
    testCases: [
      { input: [[1, 5, 2, 8, 3]], expected: 8, description: "findMax([1, 5, 2, 8, 3])" },
      { input: [[-5, -10, -2]], expected: -2, description: "findMax([-5, -10, -2])" },
      { input: [[]], expected: -Infinity, description: "findMax([])" }
    ]
  },
  {
    id: "b-prob-4",
    title: "FizzBuzz Array",
    description: "Write a function 'fizzBuzz(n)' returning an array of numbers from 1 to n. Swap numbers divisible by 3 with 'Fizz', by 5 with 'Buzz', and both with 'FizzBuzz'.",
    initialCode: "function fizzBuzz(n) {\n  // Write your code here\n  \n}",
    testCases: [
      { input: [5], expected: [1, 2, "Fizz", 4, "Buzz"], description: "fizzBuzz(5)" },
      { input: [3], expected: [1, 2, "Fizz"], description: "fizzBuzz(3)" }
    ]
  }
];

export const LiveBattle: React.FC<LiveBattleProps> = ({
  userProfile,
  onBackToDashboard,
  onProfileUpdate,
}) => {
  // Modes: "select" | "bot-setup" | "bot-battle" | "p2p-setup" | "p2p-lobby" | "p2p-battle" | "result"
  const [battleMode, setBattleMode] = useState<string>("select");
  
  // Bot Settings
  const [botDifficulty, setBotDifficulty] = useState<"easy" | "medium" | "hard" | "expert">("medium");
  const [botProgress, setBotProgress] = useState(0);
  const [botStatusText, setBotStatusText] = useState("Initializing code environment...");
  const [botTimer, setBotTimer] = useState<any>(null);

  // PeerJS / P2P states
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState("");
  const [targetRoomCode, setTargetRoomCode] = useState("");
  const [conn, setConn] = useState<any>(null);
  const [p2pRole, setP2pRole] = useState<"host" | "guest">("host");
  const [opponentName, setOpponentName] = useState("Opponent");
  const [readyOpponent, setReadyOpponent] = useState(false);
  const [readySelf, setReadySelf] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [p2pOpponentProgress, setP2pOpponentProgress] = useState(0); // 0 to 100

  // Shared Battle States
  const [problem, setProblem] = useState<BattleProblem>(BATTLE_PROBLEMS[0]);
  const [gameTimeLeft, setGameTimeLeft] = useState(180); // 3 minutes standard
  const [gameTimer, setGameTimer] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<{ won: boolean; reason: string } | null>(null);
  
  // Editor State
  const [userCode, setUserCode] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (botTimer) clearInterval(botTimer);
      if (gameTimer) clearInterval(gameTimer);
      if (peer) peer.destroy();
    };
  }, [botTimer, gameTimer, peer]);

  // Setup PeerJS connection when entering P2P Setup
  const initializeP2P = () => {
    if (peer) return;

    // Generate random room code
    const randCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    
    // Create a local peer with room code as ID prefix to simplify signaling
    const newPeer = new Peer(`js-academy-${randCode}`);
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      // Room Code is the 6 digit number
      setPeerId(id.replace("js-academy-", ""));
    });

    newPeer.on("connection", (incomingConn) => {
      // Host receives connection
      setConn(incomingConn);
      setP2pRole("host");
      setupConnectionHandlers(incomingConn);
    });

    newPeer.on("error", (err) => {
      console.error("PeerJS Connection Error: ", err);
      alert("Signaling server connection failed. Defaulting back to VS Bot Mode.");
      setBattleMode("select");
    });
  };

  const handleJoinRoom = () => {
    if (!targetRoomCode.trim()) return;
    setP2pRole("guest");
    initializeP2P(); // Ensure initialized
    
    const targetPeerId = `js-academy-${targetRoomCode.trim()}`;
    const newConn = peer ? peer.connect(targetPeerId) : new Peer().connect(targetPeerId);
    
    setConn(newConn);
    setupConnectionHandlers(newConn);
  };

  const setupConnectionHandlers = (c: any) => {
    c.on("open", () => {
      setBattleMode("p2p-lobby");
      // Send self username
      c.send({ type: "handshake", name: userProfile.username });
    });

    c.on("data", (data: any) => {
      if (data.type === "handshake") {
        setOpponentName(data.name);
      } else if (data.type === "chat") {
        setChatMessages(prev => [...prev, { sender: opponentName, text: data.text }]);
      } else if (data.type === "ready") {
        setReadyOpponent(data.val);
      } else if (data.type === "start-game") {
        // Guest receives start command from Host
        setProblem(data.problem);
        setGameTimeLeft(data.duration);
        setBattleMode("p2p-battle");
        startSharedGameCountdown();
      } else if (data.type === "progress") {
        setP2pOpponentProgress(data.percent);
      } else if (data.type === "win") {
        resolveGame(false, `Opponent solved all tests first!`);
      }
    });

    c.on("close", () => {
      alert("Opponent disconnected!");
      setBattleMode("select");
    });
  };

  // Lobby Action Handlers
  const handleToggleReady = () => {
    const newVal = !readySelf;
    setReadySelf(newVal);
    if (conn) {
      conn.send({ type: "ready", val: newVal });
    }
  };

  const handleHostStartGame = () => {
    // Select random problem
    const randomProb = BATTLE_PROBLEMS[Math.floor(Math.random() * BATTLE_PROBLEMS.length)];
    setProblem(randomProb);
    setGameTimeLeft(180);
    setBattleMode("p2p-battle");

    if (conn) {
      conn.send({
        type: "start-game",
        problem: randomProb,
        duration: 180
      });
    }
    startSharedGameCountdown();
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !conn) return;

    conn.send({ type: "chat", text: chatInput.trim() });
    setChatMessages(prev => [...prev, { sender: "You", text: chatInput.trim() }]);
    setChatInput("");
  };

  // Start Common Countdown
  const startSharedGameCountdown = () => {
    const timer = setInterval(() => {
      setGameTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          resolveGame(false, "Time limit exceeded! Draw.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setGameTimer(timer);
  };

  // --- BOT BATTLE SIMULATION LOGIC ---
  const handleStartBotBattle = () => {
    const selectedProblem = BATTLE_PROBLEMS[Math.floor(Math.random() * BATTLE_PROBLEMS.length)];
    setProblem(selectedProblem);
    setGameTimeLeft(180);
    setBotProgress(0);
    setBattleResult(null);
    setBattleMode("bot-battle");
    
    // Start countdown
    startSharedGameCountdown();

    // Start Bot Speed Simulating
    let intervalMs = 1800; // Easy (180s) -> 1% every 1.8s
    if (botDifficulty === "medium") intervalMs = 1200; // 120s
    if (botDifficulty === "hard") intervalMs = 750; // 75s
    if (botDifficulty === "expert") intervalMs = 450; // 45s

    const botTick = setInterval(() => {
      setBotProgress((prev) => {
        const next = prev + 1;
        
        // Dynamic status updates
        if (next === 10) setBotStatusText("Defining helper function declarations...");
        if (next === 30) setBotStatusText("Adding conditional bounds check...");
        if (next === 50) setBotStatusText("Iterating array using map/filter...");
        if (next === 65) {
          if (botDifficulty === "easy") {
            setBotStatusText("⚠️ Bot hit a ReferenceError! Debugging...");
            // slow down bot
            return prev - 5; 
          }
        }
        if (next === 80) setBotStatusText("Validating test assertions...");
        
        if (next >= 100) {
          clearInterval(botTick);
          resolveGame(false, `Bot solved the problem first!`);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    setBotTimer(botTick);
  };

  // --- SOLVING RESOLUTION ENGINE ---
  const handleCodeSuccess = () => {
    // Player passed all tests!
    resolveGame(true, "You passed all test cases first!");
    if (conn) {
      conn.send({ type: "win" });
    }
  };

  const handleCodeChangeLocal = (code: string) => {
    setUserCode(code);
    
    // Send progress over WebRTC data channel if in multiplayer
    if (battleMode === "p2p-battle" && conn) {
      // Calculate how many letters they typed
      const len = code.trim().length;
      const pct = Math.min(Math.round((len / 150) * 100), 95); // cap at 95 until success
      conn.send({
        type: "progress",
        percent: pct,
        passed: 0,
        total: problem.testCases.length
      });
    }
  };

  const resolveGame = (won: boolean, reason: string) => {
    // Clear timers
    if (botTimer) clearInterval(botTimer);
    if (gameTimer) clearInterval(gameTimer);
    
    setBattleResult({ won, reason });
    setBattleMode("result");

    // Save statistics in storage
    updateBattleStats(won);
    
    if (won) {
      // Award Battle XP
      addXP(100);
      onProfileUpdate();
    }
  };

  const resetBattleArena = () => {
    if (conn) conn.close();
    if (peer) peer.destroy();
    setPeer(null);
    setConn(null);
    setReadySelf(false);
    setReadyOpponent(false);
    setChatMessages([]);
    setBotProgress(0);
    setBattleResult(null);
    setBattleMode("select");
  };

  return (
    <div className="battle-lobby-dialog" style={{ maxWidth: "100%", width: "100%", minHeight: "calc(100vh - 64px)", display: "flex", padding: "40px 16px" }}>
      
      {/* 1. SELECTION SCREEN */}
      {battleMode === "select" && (
        <div className="selection-lobby-card glass-card">
          <div className="lobby-header">
            <Trophy style={{ width: "48px", height: "48px", color: "var(--color-amber)", margin: "0 auto", animation: "bounce 2s infinite" }} />
            <h2>Live Battle Arena</h2>
            <p>Put your JavaScript skills to the test in speed coding duels.</p>
          </div>

          <div className="lobby-cards-row">
            {/* VS Bot Card */}
            <div className="lobby-card-box cyan-hover">
              <div className="lobby-card-header">
                <div className="lobby-card-icon-box cyan">
                  <Zap style={{ width: "20px", height: "20px" }} />
                </div>
                <h3 className="lobby-card-title">VS Bot</h3>
                <p className="lobby-card-desc">
                  Practice coding speeds against a machine. Choose from 4 difficulty levels. Excellent for solo preparation!
                </p>
              </div>
              <button
                onClick={() => setBattleMode("bot-setup")}
                className="primary-btn-cyan"
                style={{ padding: "12px", width: "100%", fontSize: "0.75rem" }}
              >
                Choose Difficulty
              </button>
            </div>

            {/* VS Friend Card */}
            <div className="lobby-card-box purple-hover">
              <div className="lobby-card-header">
                <div className="lobby-card-icon-box purple">
                  <Users style={{ width: "20px", height: "20px" }} />
                </div>
                <h3 className="lobby-card-title">VS Friend</h3>
                <p className="lobby-card-desc">
                  Generate a room code and challenge friends directly in real-time. Completely peer-to-peer!
                </p>
              </div>
              <button
                onClick={() => {
                  setBattleMode("p2p-setup");
                  initializeP2P();
                }}
                className="primary-btn-purple"
                style={{ padding: "12px", width: "100%", fontSize: "0.75rem" }}
              >
                Connect P2P Room
              </button>
            </div>
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
      )}

      {/* 2. BOT BATTLE SETUP */}
      {battleMode === "bot-setup" && (
        <div className="selection-lobby-card glass-card" style={{ maxWidth: "440px" }}>
          <h3 className="lobby-card-title" style={{ textAlign: "center", marginBottom: "16px" }}>Configure Bot Difficulty</h3>
          
          <div className="difficulty-selectors-grid">
            {[
              { id: "easy", label: "Cadet (Easy)", time: "180s" },
              { id: "medium", label: "Ranger (Medium)", time: "120s" },
              { id: "hard", label: "Legend (Hard)", time: "75s" },
              { id: "expert", label: "Terror (Expert)", time: "45s" }
            ].map((diff) => (
              <button
                key={diff.id}
                onClick={() => setBotDifficulty(diff.id as any)}
                className={`difficulty-selector-btn ${botDifficulty === diff.id ? "active" : ""}`}
              >
                <div className="difficulty-btn-title">{diff.label}</div>
                <div className="difficulty-btn-subtitle">Goal: {diff.time}</div>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              onClick={() => setBattleMode("select")}
              className="sprint-forfeit-btn"
              style={{ flex: 1, padding: "12px" }}
            >
              Cancel
            </button>
            <button
              onClick={handleStartBotBattle}
              className="primary-btn-cyan"
              style={{ flex: 1, padding: "12px" }}
            >
              Enter Combat
            </button>
          </div>
        </div>
      )}

      {/* 3. P2P ROOM SETUP */}
      {battleMode === "p2p-setup" && (
        <div className="selection-lobby-card glass-card" style={{ maxWidth: "440px" }}>
          <h3 className="lobby-card-title" style={{ textAlign: "center", marginBottom: "16px" }}>Multiplayer P2P Lobby</h3>

          {/* Host Side */}
          <div className="diagnostic-info-card text-center">
            <span style={{ fontSize: "0.6rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Option A: Host Room</span>
            {peerId ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                <div className="timeline-header-title text-highlight-teal animate-pulse" style={{ fontSize: "1.75rem", letterSpacing: "0.15em" }}>{peerId}</div>
                <p className="diagnostic-desc">
                  Share this 6-digit Room ID with your friend. Keep this window open!
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "16px 0" }}>
                <Loader2 style={{ width: "16px", height: "16px", color: "var(--color-cyan)", animation: "spin 1s linear infinite" }} />
                <span className="diagnostic-desc">Creating signal endpoint...</span>
              </div>
            )}
          </div>

          <div className="relative" style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "16px 0" }}>
            <div style={{ borderTop: "1px solid var(--border-color)", flexGrow: 1 }} />
            <span style={{ margin: "0 16px", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)" }}>Or</span>
            <div style={{ borderTop: "1px solid var(--border-color)", flexGrow: 1 }} />
          </div>

          {/* Join Side */}
          <div className="diagnostic-info-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Option B: Join Room</span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-Digit Room ID"
                value={targetRoomCode}
                onChange={(e) => setTargetRoomCode(e.target.value)}
                className="form-input text-center font-bold"
                style={{ flexGrow: 1, letterSpacing: "0.1em" }}
              />
              <button
                onClick={handleJoinRoom}
                className="primary-btn-purple"
                style={{ padding: "10px 18px", fontSize: "0.75rem" }}
              >
                Join
              </button>
            </div>
          </div>

          <button
            onClick={resetBattleArena}
            className="sprint-forfeit-btn"
            style={{ padding: "12px", marginTop: "16px" }}
          >
            Cancel and Back
          </button>
        </div>
      )}

      {/* 4. P2P LOBBY (WAITING PLAYER) */}
      {battleMode === "p2p-lobby" && (
        <div className="selection-lobby-card glass-card" style={{ maxWidth: "440px" }}>
          <div className="lobby-header">
            <h3>Combat Connection Active!</h3>
            <p className="text-highlight-green" style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Direct WebRTC Data Link Established</p>
          </div>

          {/* Player Cards */}
          <div className="lobby-cards-row" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Self Card */}
            <div className="lobby-avatar-card cyan-style">
              <UserIcon className="lobby-avatar-icon" />
              <div className="lobby-avatar-name">{userProfile.username}</div>
              <button
                onClick={handleToggleReady}
                className={`lobby-avatar-ready-btn ${readySelf ? "active" : "inactive"}`}
              >
                {readySelf ? "Ready!" : "Click Ready"}
              </button>
            </div>

            {/* Opponent Card */}
            <div className="lobby-avatar-card purple-style">
              <UserIcon className="lobby-avatar-icon" />
              <div className="lobby-avatar-name">{opponentName}</div>
              <div className={readyOpponent ? "lobby-avatar-ready-tag-active" : "lobby-avatar-ready-tag-inactive"}>
                {readyOpponent ? "Ready!" : "Not Ready"}
              </div>
            </div>
          </div>

          {/* Lobby chat */}
          <div className="chat-lobby-window">
            <div className="chat-lobby-log">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="chat-lobby-log-row">
                  <span className={msg.sender === "You" ? "cyan" : "purple"}>
                    {msg.sender}:
                  </span>{" "}
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendChat} className="chat-form-input">
              <input
                type="text"
                placeholder="Say hello in lobby..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="form-input chat-text-input"
              />
              <button type="submit" className="chat-send-btn" style={{ width: "32px", height: "32px" }}>
                <Send style={{ width: "16px", height: "16px" }} />
              </button>
            </form>
          </div>

          {/* Launch Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button
              onClick={resetBattleArena}
              className="sprint-forfeit-btn"
              style={{ flex: 1, padding: "12px" }}
            >
              Leave Game
            </button>
            
            {p2pRole === "host" && (
              <button
                onClick={handleHostStartGame}
                disabled={!readySelf || !readyOpponent}
                className="primary-btn-green"
                style={{ flex: 2, padding: "12px", fontSize: "0.8rem" }}
              >
                Launch Battle!
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. ACTIVE BATTLE SCREEN (BOT OR P2P) */}
      {(battleMode === "bot-battle" || battleMode === "p2p-battle") && (
        <div className="workspace-layout-split" style={{ maxWidth: "100%", width: "100%" }}>
          
          {/* Left Column: Problem description & Status Trackers */}
          <div className="notes-workspace-panel glass-card" style={{ padding: "24px" }}>
            {/* Header / Timer */}
            <div className="workspace-header select-none" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
              <div>
                <span className="node-meta-title">Active Speed Duel</span>
                <h3 className="node-main-title" style={{ marginTop: "4px" }}>{problem.title}</h3>
              </div>
              <div className="badge-pill-amber" style={{ border: "1px solid rgba(244, 63, 94, 0.3)", color: "var(--color-rose)", background: "rgba(244, 63, 94, 0.08)", fontSize: "0.85rem" }}>
                {Math.floor(gameTimeLeft / 60)}:{(gameTimeLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>

            {/* Problem Description */}
            <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="node-desc-text" style={{ fontSize: "0.85rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {problem.description}
              </div>

              {/* Status Tracker: Bot or Friend */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                <h4 className="instructions-title">Competition Progress:</h4>
                
                {/* User Progress */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "bold" }}>
                    <span style={{ color: "#ffffff" }}>You ({userProfile.username})</span>
                    <span className="text-highlight-green">Active</span>
                  </div>
                  <div className="battle-progress-bar-track">
                    <div 
                      className="battle-progress-bar-fill cyan"
                      style={{ width: `${Math.min(Math.round((userCode.trim().length / 150) * 100), 95)}%` }}
                    />
                  </div>
                </div>

                {/* Opponent Progress (Bot or Friend) */}
                {battleMode === "bot-battle" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "bold" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Bot (Difficulty: {botDifficulty})</span>
                      <span>{botProgress}%</span>
                    </div>
                    <div className="battle-progress-bar-track">
                      <div 
                        className="battle-progress-bar-fill purple"
                        style={{ width: `${botProgress}%` }}
                      />
                    </div>
                    <p className="text-highlight-teal" style={{ fontSize: "0.7rem", fontStyle: "italic", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <Loader2 style={{ width: "12px", height: "12px", animation: "spin 1s linear infinite" }} />
                      {botStatusText}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "bold" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Opponent ({opponentName})</span>
                      <span>{p2pOpponentProgress}%</span>
                    </div>
                    <div className="battle-progress-bar-track">
                      <div 
                        className="battle-progress-bar-fill purple"
                        style={{ width: `${p2pOpponentProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Surrender button */}
            <button
              onClick={() => {
                if (window.confirm("Abandon battle? This counts as a defeat!")) {
                  resolveGame(false, "You surrendered the duel.");
                }
              }}
              className="sprint-forfeit-btn"
              style={{ padding: "12px", marginTop: "16px" }}
            >
              Surrender Duel
            </button>
          </div>

          {/* Right Column: Code Editor */}
          <div className="editor-workspace-panel" style={{ width: "50%", height: "100%" }}>
            <CodeEditor
              key={problem.id}
              initialCode={problem.initialCode}
              testCases={problem.testCases}
              challengeId={problem.id}
              challengeType="function"
              onSuccess={handleCodeSuccess}
            />
            {/* transparent sniffer helpers */}
            <div style={{ display: "none" }}>
              <textarea 
                value={userCode} 
                onChange={(e) => handleCodeChangeLocal(e.target.value)} 
              />
            </div>
            <EditorSniffer onChange={handleCodeChangeLocal} />
          </div>

        </div>
      )}

      {/* 6. RESULTS POPUP */}
      {battleMode === "result" && battleResult && (
        <div className="result-popup-dialog glass-card">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="result-popup-dialog-avatar">
              {battleResult.won ? (
                <Trophy className="yellow" style={{ animation: "bounce 2s infinite" }} />
              ) : (
                <XCircle className="rose" />
              )}
            </div>

            <h2 className="result-popup-title">
              {battleResult.won ? "VICTORY!" : "DEFEATED"}
            </h2>

            <p className="result-popup-desc">
              {battleResult.reason}
            </p>

            {battleResult.won && (
              <div className="badge-pill-green" style={{ margin: "0 auto" }}>
                +100 XP REWARDED
              </div>
            )}
          </div>

          <button
            onClick={resetBattleArena}
            className="primary-btn-green"
            style={{ width: "100%", padding: "12px", fontSize: "0.8rem" }}
          >
            Return to Arena lobby
          </button>
        </div>
      )}

    </div>
  );
};

// sniffer hook
const EditorSniffer: React.FC<{ onChange: (val: string) => void }> = ({ onChange }) => {
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const textarea = document.querySelector(".editor-ide-container textarea");
      if (textarea) {
        clearInterval(checkInterval);
        
        const handleInput = (e: Event) => {
          const val = (e.target as HTMLTextAreaElement).value;
          onChange(val);
        };
        
        textarea.addEventListener("input", handleInput);
        
        return () => {
          textarea.removeEventListener("input", handleInput);
        };
      }
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, [onChange]);

  return null;
};
