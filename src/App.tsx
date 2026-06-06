import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { ModuleView } from "./components/ModuleView";
import { LiveBattle } from "./components/LiveBattle";
import { Contests } from "./components/Contests";
import { CertificateGenerator } from "./components/CertificateGenerator";
import { getCurrentUser } from "./services/storage";
import type { UserProfile } from "./services/storage";
import { curriculumModules } from "./data/curriculum";

function App() {
  const [currentTab, setCurrentTab] = useState<string>("landing");
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(getCurrentUser());
  
  // Certificate Modal State
  const [activeCert, setActiveCert] = useState<{
    moduleId: string;
    moduleTitle: string;
    date: string;
    verificationCode: string;
  } | null>(null);

  // Sync profile state on mount and register history listeners
  useEffect(() => {
    refreshProfile();
    
    // Replace initial state with landing
    window.history.replaceState({ tab: "landing", moduleId: null }, "", "");

    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        setCurrentTab(e.state.tab || "landing");
        setActiveModuleId(e.state.moduleId || null);
        refreshProfile();
      } else {
        setCurrentTab("landing");
        setActiveModuleId(null);
        refreshProfile();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const refreshProfile = () => {
    setUserProfile(getCurrentUser());
  };

  // Reset window scroll position on tab changes to prevent scroll offset traps
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  // History sync navigator
  const navigateTo = (tab: string, moduleId: string | null = null) => {
    setCurrentTab(tab);
    setActiveModuleId(moduleId);
    window.history.pushState({ tab, moduleId }, "", "");
  };

  const handleSetTab = (tab: string) => {
    navigateTo(tab, tab === "module" ? activeModuleId : null);
  };

  // UI back button logic (cleans up history stacks)
  const handleBackToDashboard = () => {
    if (window.history.state && window.history.state.tab === "dashboard") {
      window.history.back();
    } else {
      navigateTo("dashboard");
    }
    refreshProfile();
  };

  // Find active module detail
  const activeModule = curriculumModules.find((m) => m.id === activeModuleId);

  // Certificate Viewer trigger
  const handleViewCertificate = (moduleId: string) => {
    const cert = userProfile.certificates.find((c) => c.moduleId === moduleId);
    if (cert) {
      setActiveCert({
        moduleId: cert.moduleId,
        moduleTitle: cert.moduleTitle,
        date: cert.date,
        verificationCode: cert.verificationCode,
      });
    }
  };

  const isFixedView = ["module", "battle", "contests"].includes(currentTab);

  return (
    <div className="main-layout" style={{ backgroundColor: "var(--bg-deep)", display: "flex", flexDirection: "column", ...(isFixedView ? { height: "100vh", overflow: "hidden" } : { minHeight: "100vh" }) }}>
      {/* Decorative Floating Mesh Glows */}
      <div className="bg-mesh-glow-1 float-slow-1" />
      <div className="bg-mesh-glow-2 float-slow-2" />
      <div className="bg-mesh-glow-3 float-slow-1" />

      {/* Navigation Header */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        userProfile={userProfile}
        onProfileUpdate={refreshProfile}
      />

      {/* Screen Views router */}
      <main style={{ display: "flex", flexGrow: 1, flexDirection: "column", position: "relative", zIndex: 10, ...(isFixedView ? { minHeight: 0, overflow: "hidden" } : {}) }}>
        {currentTab === "landing" && (
          <LandingPage
            onStartExploring={() => {
              navigateTo("dashboard");
              refreshProfile();
            }}
            onProfileUpdate={refreshProfile}
          />
        )}

        {currentTab === "dashboard" && (
          <Dashboard
            modules={curriculumModules}
            userProfile={userProfile}
            onSelectModule={(moduleId) => {
              navigateTo("module", moduleId);
            }}
            onViewCertificate={handleViewCertificate}
          />
        )}

        {currentTab === "module" && activeModule && (
          <ModuleView
            module={activeModule}
            userProfile={userProfile}
            onBackToDashboard={handleBackToDashboard}
            onProfileUpdate={refreshProfile}
          />
        )}

        {currentTab === "battle" && (
          <LiveBattle
            userProfile={userProfile}
            onBackToDashboard={handleBackToDashboard}
            onProfileUpdate={refreshProfile}
          />
        )}

        {currentTab === "contests" && (
          <Contests
            userProfile={userProfile}
            onBackToDashboard={handleBackToDashboard}
            onProfileUpdate={refreshProfile}
          />
        )}
      </main>

      {/* Dynamic Canvas Certificate Drawer */}
      {activeCert && (
        <CertificateGenerator
          isOpen={!!activeCert}
          onClose={() => setActiveCert(null)}
          username={userProfile.username}
          moduleTitle={activeCert.moduleTitle}
          date={activeCert.date}
          verificationCode={activeCert.verificationCode}
        />
      )}
    </div>
  );
}

export default App;
