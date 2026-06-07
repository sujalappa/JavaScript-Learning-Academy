import React, { useState } from "react";
import { Zap, Sparkles, Code2, Users, ArrowRight, MessageSquare, Award, MessageCircle, HelpCircle } from "lucide-react";
import { authenticateUserSupabase } from "../services/storage";

interface LandingPageProps {
  onStartExploring: () => void;
  onProfileUpdate: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartExploring,
  onProfileUpdate,
}) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setAuthError("Name cannot be empty");
      return;
    }
    if (usernameInput.trim().length < 3) {
      setAuthError("Name must be at least 3 characters");
      return;
    }
    
    setLoading(true);
    setAuthError("");
    try {
      const res = await authenticateUserSupabase(
        usernameInput.trim(), 
        usernameInput.trim(), 
        "AcademyMember123!", 
        true
      );
      if (res.success) {
        onProfileUpdate();
        onStartExploring(); // Takes them directly to dashboard
      } else {
        setAuthError(res.error || "Failed to register profile.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-col items-center justify-center overflow-hidden w-full" style={{ minHeight: "calc(100vh - 64px)", display: "flex", padding: "40px 16px" }}>
      {/* Background Neon Glows */}
      <div className="absolute float-slow-1" style={{ top: "15%", left: "15%", width: "400px", height: "400px", borderRadius: "999px", background: "rgba(16, 185, 129, 0.04)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div className="absolute float-slow-2" style={{ bottom: "15%", right: "15%", width: "400px", height: "400px", borderRadius: "999px", background: "rgba(6, 182, 212, 0.04)", filter: "blur(100px)", pointerEvents: "none" }} />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute"
        style={{
          inset: 0,
          opacity: 0.02,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="landing-hero-container z-10">
        {/* Hero Section */}
        <div className="hero-text-block">
          <div className="badge-pill-green">
            <Sparkles style={{ width: "14px", height: "14px" }} /> Next-Gen JS Academy
          </div>
          <h1 className="hero-title">
            Stop Watching Tutorials. <br />
            <span className="hero-title-highlight text-highlight-green">
              Start Writing Code.
            </span>
          </h1>
          <p className="hero-desc">
            A complete JavaScript arena where you study interactive notes, attempt quizzes, debug buggy code, and solve implementation challenges. Compete with real friends or bots, post your doubts in the community forum, and study with your personal AI mentor.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="hero-cta-group">
          {!showSignup ? (
            <button
              onClick={onStartExploring}
              className="explore-btn primary-btn-green"
            >
              <Code2 style={{ width: "18px", height: "18px" }} />
              Explore Platform
              <ArrowRight style={{ width: "16px", height: "16px" }} />
            </button>
          ) : (
            <div className="landing-signup-card glass-card">
              <div className="signup-card-title-block">
                <h3 className="signup-card-title">Join the Academy</h3>
                <p className="signup-card-subtitle">Save progress to cloud and earn certificates</p>
              </div>
              <form onSubmit={handleSignup} className="auth-form">
                <div>
                  <input
                    type="text"
                    placeholder="Choose your Username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="form-input"
                  />
                  {authError && <p className="auth-error-msg" style={{ marginTop: "8px" }}>{authError}</p>}
                </div>
                <div className="flex-row items-center gap-3" style={{ display: "flex", width: "100%" }}>
                  <button
                    type="button"
                    onClick={() => setShowSignup(false)}
                    disabled={loading}
                    className="auth-toggle-link"
                    style={{ flex: 1, textDecoration: "none", color: "var(--text-secondary)" }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="primary-btn-green"
                    style={{ flex: 2, padding: "10px", fontSize: "0.8rem" }}
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Features Showcase Grid */}
        <div className="landing-features-grid">
          <div className="landing-feature-card glass-card-interactive">
            <div className="feature-card-icon-box icon-box-cyan">
              <HelpCircle style={{ width: "24px", height: "24px" }} />
            </div>
            <h3 className="feature-card-title">Interactive Notes & Quizzes</h3>
            <p className="feature-card-desc">
              Read structured, beginner-friendly lectures and check your understanding with instant, self-generating quizzes.
            </p>
          </div>

          <div className="landing-feature-card glass-card-interactive">
            <div className="feature-card-icon-box icon-box-purple">
              <Code2 style={{ width: "24px", height: "24px" }} />
            </div>
            <h3 className="feature-card-title">Hands-On Coding Quests</h3>
            <p className="feature-card-desc">
              Move from theory to practice. Work in a side-by-side IDE to debug broken code and build logic from scratch.
            </p>
          </div>

          <div className="landing-feature-card glass-card-interactive">
            <div className="feature-card-icon-box icon-box-yellow">
              <MessageSquare style={{ width: "24px", height: "24px" }} />
            </div>
            <h3 className="feature-card-title">AI Mentor on Demand</h3>
            <p className="feature-card-desc">
              Get real-time reviews, hints, and explanations on your code from an intelligent AI tutor without spoilers.
            </p>
          </div>

          <div className="landing-feature-card glass-card-interactive">
            <div className="feature-card-icon-box icon-box-purple">
              <Users style={{ width: "24px", height: "24px" }} />
            </div>
            <h3 className="feature-card-title">Live P2P Speed Duels</h3>
            <p className="feature-card-desc">
              Connect browser-to-browser via WebRTC. Challenge peers in low-latency multiplayer coding battles.
            </p>
          </div>

          <div className="landing-feature-card glass-card-interactive">
            <div className="feature-card-icon-box icon-box-yellow">
              <MessageCircle style={{ width: "24px", height: "24px" }} />
            </div>
            <h3 className="feature-card-title">Community Q&A Forum</h3>
            <p className="feature-card-desc">
              Never code alone. Post questions, share snippets, and discuss logic with other developers directly inside the module forum.
            </p>
          </div>

          <div className="landing-feature-card glass-card-interactive">
            <div className="feature-card-icon-box icon-box-cyan">
              <Award style={{ width: "24px", height: "24px" }} />
            </div>
            <h3 className="feature-card-title">Cloud Sync & Certificates</h3>
            <p className="feature-card-desc">
              Sync your profile progression to Supabase. Complete modules to unlock official, verified certificates.
            </p>
          </div>
        </div>

        {/* Simulated Code Sandbox Visual */}
        <div className="sandbox-mock-editor float-anim">
          {/* Header toolbar */}
          <div className="sandbox-window-bar">
            <div className="window-dots items-center" style={{ display: "flex" }}>
              <div className="window-dot dot-red" />
              <div className="window-dot dot-yellow" />
              <div className="window-dot dot-green" />
              <span className="sandbox-tag">
                sandbox.js
              </span>
            </div>
            <div className="sandbox-engine-status">
              JS Engine Active
            </div>
          </div>
          {/* Editor Text mock */}
          <div className="sandbox-code-content">
            <p><span className="syntax-keyword">const</span> academy = <span className="syntax-string">"JS Academy"</span>;</p>
            <p><span className="syntax-keyword">let</span> status = <span className="syntax-string">"Learning"</span>;</p>
            <p>&nbsp;</p>
            <p><span className="syntax-keyword">function</span> <span className="syntax-function">levelUp</span>(xp) &#123;</p>
            <p style={{ paddingLeft: "24px" }}>status = xp &gt;= <span className="syntax-number">500</span> ? <span className="syntax-string">"Master Coder ⚡"</span> : <span className="syntax-string">"Coding Cadet"</span>;</p>
            <p style={{ paddingLeft: "24px" }}><span className="syntax-keyword">return</span> <span className="syntax-template">`User is now ${status}`</span>;</p>
            <p>&#125;</p>
            <p>&nbsp;</p>
            <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>// Run execution in sandbox environment</p>
            <p className="syntax-console">console.log(levelUp(750));</p>
            <div className="sandbox-console-log">
              <Zap style={{ width: "16px", height: "16px" }} />
              <span>&gt; "User is now Master Coder ⚡"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
