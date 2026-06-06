import React, { useState, useEffect } from "react";
import { authenticateUserSupabase, logout, isUserAuthenticated, fetchAndUpdateCloudProfile, sendPasswordResetEmail, updateUserPassword } from "../services/storage";
import type { UserProfile } from "../services/storage";
import { SettingsModal } from "./SettingsModal";
import { isSupabaseConfigured, supabase } from "../services/supabase";
import { 
  Award, 
  Terminal, 
  User, 
  Database, 
  LogOut, 
  ChevronDown, 
  Zap, 
  LogIn,
  Loader2,
  Layers,
  Trophy,
  Flame,
  UserCheck
} from "lucide-react";

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userProfile: UserProfile;
  onProfileUpdate: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  userProfile,
  onProfileUpdate,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password recovery / Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  // Fetch updated cloud stats on mount if logged in
  useEffect(() => {
    if (isUserAuthenticated()) {
      fetchAndUpdateCloudProfile().then(() => {
        onProfileUpdate();
      });
    }

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, _session: any) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsRecoveringPassword(true);
          setIsProfileOpen(true);
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!emailInput.trim()) {
      setAuthError("Email address is required");
      return;
    }
    
    setLoading(true);
    try {
      const res = await sendPasswordResetEmail(emailInput.trim());
      if (res.success) {
        setPasswordResetSent(true);
      } else {
        setAuthError(res.error || "Failed to send reset email.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!newPasswordInput) {
      setAuthError("Password cannot be empty");
      return;
    }
    
    setLoading(true);
    try {
      const res = await updateUserPassword(newPasswordInput);
      if (res.success) {
        await fetchAndUpdateCloudProfile();
        onProfileUpdate();
        setResetSuccessMsg("Password updated successfully!");
        setNewPasswordInput("");
      } else {
        setAuthError(res.error || "Failed to update password.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!emailInput.trim() || !passwordInput) {
      setAuthError("Email and Password are required");
      return;
    }
    
    if (isSignUp && !usernameInput.trim()) {
      setAuthError("Username is required for Sign Up");
      return;
    }

    setLoading(true);
    try {
      const res = await authenticateUserSupabase(
        usernameInput.trim(),
        emailInput.trim(),
        passwordInput,
        isSignUp
      );

      if (res.success) {
        setUsernameInput("");
        setEmailInput("");
        setPasswordInput("");
        setIsProfileOpen(false);
        onProfileUpdate();
      } else {
        setAuthError(res.error || "Authentication failed.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    onProfileUpdate();
    setCurrentTab("landing");
  };

  // XP Progress Calculation (500 XP per level)
  const currentXPInLevel = userProfile.xp % 500;
  const xpPercent = (currentXPInLevel / 500) * 100;

  return (
    <nav className="main-nav">
      <div className="nav-content-wrapper">
        {/* Logo */}
        <div 
          onClick={() => setCurrentTab("landing")}
          className="nav-logo-group"
        >
          <div className="nav-logo-icon">
            <Terminal />
          </div>
          <span className="nav-logo-text">
            JS.ACADEMY<span className="nav-logo-thunder">⚡</span>
          </span>
        </div>

        {/* Navigation Links */}
        {currentTab !== "landing" && (
          <div className="nav-links-row">
            <button
              onClick={() => setCurrentTab("dashboard")}
              className={`nav-link-btn ${currentTab === "dashboard" ? "active" : ""}`}
            >
              <Layers style={{ width: "16px", height: "16px" }} />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab("contests")}
              className={`nav-link-btn ${currentTab === "contests" ? "active" : ""}`}
            >
              <Trophy style={{ width: "16px", height: "16px" }} />
              Weekly Contests
            </button>
            <button
              onClick={() => setCurrentTab("battle")}
              className={`nav-link-btn ${currentTab === "battle" ? "active" : ""}`}
            >
              <Flame style={{ width: "16px", height: "16px" }} />
              Live Battle
            </button>
          </div>
        )}

        {/* Right Controls */}
        <div className="nav-controls-right">
          {/* XP Tracker */}
          {currentTab !== "landing" && (
            <div className="xp-tracker-pill">
              <div className="xp-tracker-lvl">
                <Zap style={{ width: "14px", height: "14px" }} />
                <span>LVL {userProfile.level}</span>
              </div>
              <div className="xp-bar-track">
                <div 
                  className="xp-bar-fill"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="xp-tracker-text">
                {currentXPInLevel}/500 XP
              </span>
            </div>
          )}

          {/* System Status Indicator */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="System Status"
            className={`api-status-indicator ${isSupabaseConfigured ? "active" : ""}`}
            style={{ width: "34px", height: "34px" }}
          >
            <Database style={{ width: "16px", height: "16px" }} />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" style={{ display: "inline-block" }}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="user-profile-trigger"
            >
              <div className="profile-avatar-icon-box">
                <User style={{ width: "14px", height: "14px" }} />
              </div>
              <span className="profile-trigger-name" style={{ display: "inline-block" }}>
                {userProfile.username}
              </span>
              <ChevronDown className="profile-trigger-chevron" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="profile-dropdown-menu glass-card">
                {/* Dropdown Header */}
                <div className="profile-dropdown-header">
                  <div className="dropdown-header-userinfo">
                    <span className="dropdown-header-name">{userProfile.username}</span>
                    <span className={userProfile.isGuest ? "badge-pill-amber" : "badge-pill-green"}>
                      {userProfile.isGuest ? "Guest" : "Member"}
                    </span>
                  </div>
                  <div className="dropdown-header-stats">
                    <span>Total XP: {userProfile.xp}</span>
                    <span className="text-highlight-green">Level {userProfile.level}</span>
                  </div>
                </div>

                {/* Dropdown Body */}
                <div className="profile-dropdown-body">
                  {/* Stats */}
                  <div className="profile-stats-grid">
                    <div className="profile-stat-box">
                      <div className="stat-box-label">Completed</div>
                      <div className="stat-box-val">{userProfile.completedModules.length} Modules</div>
                    </div>
                    <div className="profile-stat-box">
                      <div className="stat-box-label">Live Battles</div>
                      <div className="stat-box-val">{userProfile.battleStats.wins}W - {userProfile.battleStats.losses}L</div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="profile-badges-section">
                    <div className="badges-section-title">
                      <Award style={{ width: "14px", height: "14px", color: "var(--color-green)" }} />
                      Badges ({userProfile.badges.length})
                    </div>
                    {userProfile.badges.length === 0 ? (
                      <p className="badges-empty-text">No badges earned yet.</p>
                    ) : (
                      <div className="badges-container">
                        {userProfile.badges.map((b) => (
                          <span 
                            key={b} 
                            className="badge-pill-purple"
                          >
                            {b.replace("badge-", "").replace("level-", "Level ").toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Supabase Authentication Panel */}
                  {isRecoveringPassword ? (
                    <div className="profile-auth-box">
                      <h4 className="auth-box-title">
                        <Zap style={{ width: "14px", height: "14px", color: "var(--color-purple)" }} /> 
                        Create New Password
                      </h4>
                      
                      {resetSuccessMsg ? (
                        <div style={{ textAlign: "center", padding: "12px 0" }}>
                          <p style={{ color: "var(--color-green)", fontSize: "0.85rem", fontWeight: "bold" }}>
                            {resetSuccessMsg}
                          </p>
                          <button
                            onClick={() => {
                              setIsRecoveringPassword(false);
                              setResetSuccessMsg("");
                              setIsProfileOpen(false);
                            }}
                            className="primary-btn-green"
                            style={{ marginTop: "14px", width: "100%", padding: "10px" }}
                          >
                            Go to Dashboard
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handlePasswordRecoverySubmit} className="auth-form">
                          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4", marginBottom: "8px" }}>
                            Please type a secure new password for your JavaScript Learning Academy account.
                          </p>
                          <input
                            type="password"
                            placeholder="Enter New Password"
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            className="form-input"
                            disabled={loading}
                            required
                          />
                          
                          {authError && <p className="auth-error-msg">{authError}</p>}
                          
                          <button
                            type="submit"
                            disabled={loading || !newPasswordInput}
                            className="primary-btn-purple"
                            style={{ padding: "10px", width: "100%", fontSize: "0.75rem" }}
                          >
                            {loading ? (
                              <>
                                <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
                                Updating...
                              </>
                            ) : (
                              "Update Password"
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  ) : userProfile.isGuest ? (
                    isForgotPassword ? (
                      <div className="profile-auth-box">
                        <h4 className="auth-box-title">
                          <UserCheck style={{ width: "14px", height: "14px" }} /> 
                          Reset Academy Password
                        </h4>
                        
                        {passwordResetSent ? (
                          <div style={{ textAlign: "center", padding: "12px 0" }}>
                            <p style={{ color: "var(--color-green)", fontSize: "0.85rem", fontWeight: "bold" }}>
                              Reset Link Sent!
                            </p>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginTop: "6px", lineHeight: "1.4" }}>
                              Check your email inbox for instructions to reset your password.
                            </p>
                            <button
                              onClick={() => {
                                setIsForgotPassword(false);
                                setPasswordResetSent(false);
                                setAuthError("");
                              }}
                              className="cert-view-btn"
                              style={{ marginTop: "14px", width: "100%", padding: "8px" }}
                            >
                              Back to Log In
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
                            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4", marginBottom: "8px" }}>
                              Enter your email below, and we will send you a secure link to reset your account password.
                            </p>
                            <input
                              type="text"
                              placeholder="Email address"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              className="form-input"
                              disabled={loading}
                            />
                            
                            {authError && <p className="auth-error-msg">{authError}</p>}
                            
                            <button
                              type="submit"
                              disabled={loading}
                              className="primary-btn-green"
                              style={{ padding: "10px", width: "100%", fontSize: "0.75rem" }}
                            >
                              {loading ? (
                                <>
                                  <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
                                  Sending...
                                </>
                              ) : (
                                "Send Reset Link"
                              )}
                            </button>
                            
                            <div className="text-center pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsForgotPassword(false);
                                  setAuthError("");
                                }}
                                disabled={loading}
                                className="auth-toggle-link"
                              >
                                Back to Log In
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ) : (
                      <div className="profile-auth-box">
                        <h4 className="auth-box-title">
                          {isSignUp ? <UserCheck style={{ width: "14px", height: "14px" }} /> : <LogIn style={{ width: "14px", height: "14px" }} />} 
                          {isSignUp ? "Create Academy Account" : "Access Academy Portal"}
                        </h4>
                        
                        <form onSubmit={handleAuthSubmit} className="auth-form">
                          {isSignUp && (
                            <input
                              type="text"
                              placeholder="Choose Username"
                              value={usernameInput}
                              onChange={(e) => setUsernameInput(e.target.value)}
                              className="form-input"
                              disabled={loading}
                            />
                          )}
                          <input
                            type="text"
                            placeholder="Email address"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="form-input"
                            disabled={loading}
                          />
                          <input
                            type="password"
                            placeholder="Enter Password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="form-input"
                            disabled={loading}
                          />
                          
                          {!isSignUp && (
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-4px", marginBottom: "8px" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsForgotPassword(true);
                                  setAuthError("");
                                }}
                                className="auth-toggle-link"
                                style={{ fontSize: "0.72rem", border: "none", background: "none", cursor: "pointer", padding: 0 }}
                              >
                                Forgot Password?
                              </button>
                            </div>
                          )}
                          
                          {authError && <p className="auth-error-msg">{authError}</p>}
                          
                          <button
                            type="submit"
                            disabled={loading}
                            className="primary-btn-green"
                            style={{ padding: "10px", width: "100%", fontSize: "0.75rem" }}
                          >
                            {loading ? (
                              <>
                                <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
                                Synchronizing...
                              </>
                            ) : (
                              isSignUp ? "Sign Up & Merge Data" : "Log In & Sync"
                            )}
                          </button>
                        </form>

                        <div className="text-center pt-1">
                          <button
                            onClick={() => {
                              setIsSignUp(!isSignUp);
                              setAuthError("");
                            }}
                            disabled={loading}
                            className="auth-toggle-link"
                          >
                            {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="danger-btn-rose"
                      style={{ padding: "12px", width: "100%", fontSize: "0.75rem" }}
                    >
                      <LogOut style={{ width: "16px", height: "16px" }} />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </nav>
  );
};
