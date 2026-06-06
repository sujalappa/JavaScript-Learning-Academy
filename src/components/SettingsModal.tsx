import React from "react";
import { X, ShieldAlert, CheckCircle, Database } from "lucide-react";
import { isSupabaseConfigured } from "../services/supabase";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-backdrop">
      <div className="settings-modal-dialog glass-card pulse-glow-cyan">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-title">
            <Database style={{ width: "20px", height: "20px" }} />
            <h2>System Settings & Status</h2>
          </div>
          <button 
            onClick={onClose}
            className="settings-close-btn"
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Content */}
        <div className="settings-body">
          <p className="settings-description">
            This dashboard displays the configuration status of background services loaded silently from environment variables (`.env`).
          </p>

          {/* Status List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Supabase Status */}
            <div className="diagnostic-info-card">
              <div className="diagnostic-header">
                <div className="diagnostic-title cyan" style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                  <Database style={{ width: "16px", height: "16px", color: "var(--color-cyan)" }} />
                  <span>Supabase Sync</span>
                </div>
                {isSupabaseConfigured ? (
                  <span className="diagnostic-status-pill active">
                    <CheckCircle style={{ width: "12px", height: "12px" }} /> Connected
                  </span>
                ) : (
                  <span className="diagnostic-status-pill fallback">
                    <ShieldAlert style={{ width: "12px", height: "12px" }} /> Local Mode
                  </span>
                )}
              </div>
              <p className="diagnostic-desc">
                {isSupabaseConfigured 
                  ? "Connected! User registrations, progression data, and completion certificates are saved to the Supabase cloud."
                  : "App is saving progress locally in LocalStorage. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable cloud authentication."}
              </p>
            </div>

          </div>

          {/* Buttons */}
          <div className="settings-footer" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              className="settings-footer-btn primary-btn-cyan"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
