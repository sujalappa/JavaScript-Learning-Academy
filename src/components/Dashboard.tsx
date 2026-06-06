import React from "react";
import type { Module } from "../data/curriculum";
import type { UserProfile } from "../services/storage";
import { 
  Lock, 
  CheckCircle, 
  Play, 
  Award, 
  Sparkles, 
  BookOpen, 
  ShieldAlert,
  Layers,
  Zap
} from "lucide-react";

interface DashboardProps {
  modules: Module[];
  userProfile: UserProfile;
  onSelectModule: (moduleId: string) => void;
  onViewCertificate: (moduleId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  modules,
  userProfile,
  onSelectModule,
  onViewCertificate,
}) => {
  const pathways = [
    { id: "javascript", name: "JavaScript Core", active: true, count: modules.length },
    { id: "sysdesign", name: "System Design", active: false, badge: "Upcoming" },
    { id: "python", name: "Python Fundamentals", active: false, badge: "Upcoming" },
  ];

  return (
    <div className="dashboard-layout-grid">
      {/* Sidebar: Pathways & Scalability */}
      <div className="dashboard-sidebar">
        {/* Learning Pathways Card */}
        <div className="sidebar-section-card glass-card">
          <h3 className="section-card-title">
            <Layers style={{ width: "16px", height: "16px", color: "var(--color-green)" }} />
            Learning Pathways
          </h3>
          <div className="pathways-list">
            {pathways.map((path) => (
              <div
                key={path.id}
                className={`pathway-item-card ${path.active ? "active" : "locked"}`}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="pathway-name-text">{path.name}</span>
                  {path.active ? (
                    <span className="pathway-count-tag">
                      {path.count} Modules
                    </span>
                  ) : (
                    <span className="badge-pill-amber">
                      {path.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>

      {/* Learning Tree Map */}
      <div className="timeline-tree-panel glass-card" style={{ gridColumn: "span 2" }}>
        <div className="timeline-header">
          <div>
            <h2 className="timeline-header-title">JavaScript Academy Pathway</h2>
            <p className="timeline-header-desc">Complete each module to unlock the next and earn certificates.</p>
          </div>
          <BookOpen style={{ width: "24px", height: "24px" }} />
        </div>

        {/* Modules Vertical Map */}
        <div className="timeline-tree-container">
          {modules.map((mod, index) => {
            const isCompleted = userProfile.completedModules.includes(mod.id);
            const isUnlocked = userProfile.unlockedModules.includes(mod.id);
            const isActive = isUnlocked && !isCompleted;

            return (
              <div 
                key={mod.id}
                className={`timeline-tree-node ${isCompleted ? "completed" : isActive ? "active" : "locked"}`}
              >
                {/* Connection segment indicator line */}
                {isCompleted && (
                  <div className="node-line-connector" />
                )}

                {/* Status Circle indicator */}
                <div className="node-status-circle">
                  {isCompleted ? (
                    <CheckCircle />
                  ) : isUnlocked ? (
                    <Play style={{ marginLeft: "2px" }} />
                  ) : (
                    <Lock />
                  )}
                </div>

                <div className="node-info-block">
                  <div className="node-info-header">
                    <span className="node-meta-title">
                      Module {index + 1}
                    </span>
                    {isActive && (
                      <span className="node-active-tag">
                        Active
                      </span>
                    )}
                    {isCompleted && (
                      <span className="node-completed-tag">
                        Done
                      </span>
                    )}
                  </div>
                  <h3 className="node-main-title">{mod.title}</h3>
                  <p className="node-desc-text">{mod.description}</p>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {isUnlocked ? (
                    <button
                      onClick={() => onSelectModule(mod.id)}
                      className={isCompleted ? "node-action-btn-review" : "node-action-btn primary-btn-green"}
                    >
                      {isCompleted ? "Review Lesson" : "Start Coding"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="node-action-btn-locked"
                    >
                      <Lock style={{ width: "14px", height: "14px" }} /> Locked
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificates & Progression Status */}
      <div className="dashboard-sidebar">
        {/* Certificate Card */}
        <div className="certificate-card glass-card">
          <h3 className="section-card-title">
            <Award style={{ width: "16px", height: "16px", color: "var(--color-green)" }} />
            Verified Certificates
          </h3>
          
          {userProfile.isGuest ? (
            <div className="certificate-restrict-box">
              <div className="restrict-header">
                <ShieldAlert style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                <span>Guest Restrictions</span>
              </div>
              <p className="restrict-desc">
                Completion certificates are locked for guests. Register via the Profile Menu to sync progress and unlock official downloadable credentials!
              </p>
              <button 
                onClick={() => {
                  const profileBtn = document.querySelector(".user-profile-trigger") as HTMLButtonElement;
                  if (profileBtn) profileBtn.click();
                }}
                className="restrict-btn"
              >
                Create Account Now
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {userProfile.certificates.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Zap style={{ width: "32px", height: "32px", color: "var(--text-muted)", margin: "0 auto" }} />
                  <p className="restrict-desc" style={{ maxWidth: "150px", margin: "0 auto", fontStyle: "italic" }}>
                    Complete your first module to generate a verification certificate.
                  </p>
                </div>
              ) : (
                userProfile.certificates.map((cert) => (
                  <div 
                    key={cert.moduleId}
                    className="certificate-item-row"
                  >
                    <div className="cert-meta-info">
                      <div className="cert-verif-code">
                        ID: {cert.verificationCode}
                      </div>
                      <div className="cert-module-title">
                        {cert.moduleTitle}
                      </div>
                    </div>
                    <button
                      onClick={() => onViewCertificate(cert.moduleId)}
                      className="cert-view-btn"
                    >
                      <Sparkles style={{ width: "14px", height: "14px", color: "var(--color-green)" }} /> View
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
