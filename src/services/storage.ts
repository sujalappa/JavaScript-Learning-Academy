import { supabase, isSupabaseConfigured } from "./supabase";

export interface CertificateData {
  moduleId: string;
  moduleTitle: string;
  date: string;
  verificationCode: string;
}

export interface UserProfile {
  username: string;
  isGuest: boolean;
  xp: number;
  level: number;
  unlockedModules: string[];
  completedModules: string[];
  badges: string[];
  certificates: CertificateData[];
  battleStats: {
    wins: number;
    losses: number;
    gamesPlayed: number;
  };
}

const STORAGE_KEYS = {
  CURRENT_USER: "js_academy_current_user",
  GUEST_DATA: "js_academy_guest_backup",
};

const DEFAULT_GUEST: UserProfile = {
  username: "Guest Explorer",
  isGuest: true,
  xp: 0,
  level: 1,
  unlockedModules: ["module-0", "module-1"],
  completedModules: [],
  badges: [],
  certificates: [],
  battleStats: { wins: 0, losses: 0, gamesPlayed: 0 },
};

// Check if a user is currently logged into Supabase
export function isUserAuthenticated(): boolean {
  if (!isSupabaseConfigured) return false;
  const session = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase.auth.token");
  return !!session;
}

export function getCurrentUser(): UserProfile {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_GUEST));
    return DEFAULT_GUEST;
  }
  const profile: UserProfile = JSON.parse(data);
  // Ensure backward compatibility: module-0 should always be unlocked!
  if (!profile.unlockedModules.includes("module-0")) {
    profile.unlockedModules.unshift("module-0");
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
  }
  return profile;
}

export function saveCurrentUser(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
  
  // Asynchronously sync to Supabase if authenticated
  if (!profile.isGuest && isSupabaseConfigured) {
    syncProfileToSupabase(profile);
  }
}

// Background Database sync
async function syncProfileToSupabase(profile: UserProfile) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").upsert({
      id: user.id,
      username: profile.username,
      xp: profile.xp,
      level: profile.level,
      unlocked_modules: profile.unlockedModules,
      completed_modules: profile.completedModules,
      badges: profile.badges,
      battle_wins: profile.battleStats.wins,
      battle_losses: profile.battleStats.losses,
      battle_games_played: profile.battleStats.gamesPlayed,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to sync profile to Supabase:", err);
  }
}

// Fetch cloud profile data and overwrite cache
export async function fetchAndUpdateCloudProfile(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Fetch Profile Table
    const { data: profileData, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileErr) throw profileErr;

    // 2. Fetch Certificates
    const { data: certsData } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id);

    const mappedCerts: CertificateData[] = (certsData || []).map((c: any) => ({
      moduleId: c.module_id,
      moduleTitle: c.module_title,
      date: c.date,
      verificationCode: c.verification_code
    }));

    const updatedProfile: UserProfile = {
      username: profileData.username,
      isGuest: false,
      xp: profileData.xp,
      level: profileData.level,
      unlockedModules: profileData.unlocked_modules,
      completedModules: profileData.completed_modules,
      badges: profileData.badges,
      certificates: mappedCerts,
      battleStats: {
        wins: profileData.battle_wins,
        losses: profileData.battle_losses,
        gamesPlayed: profileData.battle_games_played
      }
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedProfile));
    return updatedProfile;
  } catch (err) {
    console.error("Error fetching cloud profile:", err);
    return null;
  }
}

export async function logout(): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_GUEST));
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

export async function sendPasswordResetEmail(emailInput: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "Supabase is not configured yet. Password reset is not available in guest local mode." };
  }
  try {
    const email = emailInput.includes("@") ? emailInput : `${emailInput.toLowerCase()}@js.academy`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send reset email." };
  }
}

export async function updateUserPassword(passwordInput: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "Supabase is not configured." };
  }
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordInput,
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update password." };
  }
}

/**
 * Handle Auth Sign In and Sign Up.
 * Merges Guest progression automatically.
 */
export async function authenticateUserSupabase(
  username: string,
  emailInput: string,
  passwordInput: string,
  isSignUp: boolean
): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
  if (!isSupabaseConfigured) {
    // Local fallback if Supabase is offline/unconfigured
    const profile = loginUserLocal(username || emailInput.split("@")[0]);
    return { success: true, profile };
  }

  try {
    let authUser = null;
    
    if (isSignUp) {
      // Shorthand registration: if they type 'sujal' we map it to 'sujal@js.academy'
      const email = emailInput.includes("@") ? emailInput : `${emailInput.toLowerCase()}@js.academy`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: passwordInput,
      });
      if (error) throw error;
      authUser = data.user;

      if (authUser) {
        // Create initial profile in database, merging guest data if present
        const guest = getCurrentUser();
        let xp = 0;
        let level = 1;
        let unlocked = ["module-1"];
        let completed: string[] = [];
        let badges: string[] = [];

        if (guest.isGuest && guest.xp > 0) {
          xp = guest.xp;
          level = guest.level;
          unlocked = guest.unlockedModules;
          completed = guest.completedModules;
          badges = guest.badges;
        }

        const displayName = username || emailInput.split("@")[0];

        const { error: profileErr } = await supabase.from("profiles").insert({
          id: authUser.id,
          username: displayName,
          xp,
          level,
          unlocked_modules: unlocked,
          completed_modules: completed,
          badges,
          battle_wins: 0,
          battle_losses: 0,
          battle_games_played: 0
        });

        if (profileErr) throw profileErr;
      }
    } else {
      // Sign In
      const email = emailInput.includes("@") ? emailInput : `${emailInput.toLowerCase()}@js.academy`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passwordInput,
      });
      if (error) throw error;
      authUser = data.user;
    }

    if (authUser) {
      const profile = await fetchAndUpdateCloudProfile();
      if (profile) {
        return { success: true, profile };
      }
    }
    return { success: false, error: "Auth succeeded but profile retrieval failed." };
  } catch (err: any) {
    return { success: false, error: err.message || "Authentication failed." };
  }
}

// Local authentication fallback
function loginUserLocal(username: string): UserProfile {
  const guest = getCurrentUser();
  const profile: UserProfile = {
    username: username,
    isGuest: false,
    xp: guest.isGuest ? guest.xp : 0,
    level: guest.isGuest ? guest.level : 1,
    unlockedModules: guest.isGuest ? guest.unlockedModules : ["module-0", "module-1"],
    completedModules: guest.isGuest ? guest.completedModules : [],
    badges: guest.isGuest ? guest.badges : [],
    certificates: [],
    battleStats: { wins: 0, losses: 0, gamesPlayed: 0 },
  };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
  return profile;
}

export function addXP(amount: number): { xpAdded: number; leveledUp: boolean; newLevel: number } {
  const profile = getCurrentUser();
  const oldLevel = profile.level;
  
  profile.xp += amount;
  
  const newLevel = Math.floor(profile.xp / 500) + 1;
  const leveledUp = newLevel > oldLevel;
  profile.level = newLevel;
  
  if (newLevel >= 2 && !profile.badges.includes("level-2")) {
    profile.badges.push("level-2");
  }
  if (newLevel >= 5 && !profile.badges.includes("level-5")) {
    profile.badges.push("level-5");
  }
  
  saveCurrentUser(profile);
  return { xpAdded: amount, leveledUp, newLevel };
}

export function completeModule(moduleId: string, moduleTitle: string): { certificateGenerated: boolean; certificate?: CertificateData } {
  const profile = getCurrentUser();
  let certificateGenerated = false;
  let certificate: CertificateData | undefined;
  
  if (!profile.completedModules.includes(moduleId)) {
    profile.completedModules.push(moduleId);
    
    const badgeId = `badge-${moduleId}`;
    if (!profile.badges.includes(badgeId)) {
      profile.badges.push(badgeId);
    }
    
    const nextIndex = parseInt(moduleId.split("-")[1]) + 1;
    const nextModuleId = `module-${nextIndex}`;
    if (!profile.unlockedModules.includes(nextModuleId)) {
      profile.unlockedModules.push(nextModuleId);
    }
    
    // Generate certificate ONLY if user is logged in (not guest)
    if (!profile.isGuest) {
      const hasCert = profile.certificates.some(c => c.moduleId === moduleId);
      if (!hasCert) {
        const randHex = Math.random().toString(16).substring(2, 10).toUpperCase();
        certificate = {
          moduleId,
          moduleTitle,
          date: new Date().toLocaleDateString(),
          verificationCode: `JS-${moduleId.toUpperCase()}-${randHex}`,
        };
        profile.certificates.push(certificate);
        certificateGenerated = true;
        
        // Push certificate asynchronously to Supabase
        if (isSupabaseConfigured) {
          syncCertificateToSupabase(certificate);
        }
      }
    }
    
    saveCurrentUser(profile);
  }
  
  return { certificateGenerated, certificate };
}

export function unlockNextModule(moduleId: string): void {
  const profile = getCurrentUser();
  const nextIndex = parseInt(moduleId.split("-")[1]) + 1;
  const nextModuleId = `module-${nextIndex}`;
  if (!profile.unlockedModules.includes(nextModuleId)) {
    profile.unlockedModules.push(nextModuleId);
    saveCurrentUser(profile);
  }
}

async function syncCertificateToSupabase(cert: CertificateData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from("certificates").insert({
      user_id: user.id,
      module_id: cert.moduleId,
      module_title: cert.moduleTitle,
      date: cert.date,
      verification_code: cert.verificationCode
    });
  } catch (err) {
    console.error("Failed to sync certificate to Supabase:", err);
  }
}

export function updateBattleStats(won: boolean): void {
  const profile = getCurrentUser();
  profile.battleStats.gamesPlayed += 1;
  if (won) {
    profile.battleStats.wins += 1;
    if (!profile.badges.includes("first-win")) {
      profile.badges.push("first-win");
    }
  } else {
    profile.battleStats.losses += 1;
  }
  saveCurrentUser(profile);
}

export interface Doubt {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Reply {
  id: string;
  doubtId: string;
  content: string;
  author: string;
  createdAt: string;
}

// Fetch doubts for a module
export async function fetchDoubts(moduleId: string): Promise<Doubt[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("doubts")
        .select("*")
        .eq("module_id", moduleId)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          moduleId: d.module_id,
          title: d.title,
          content: d.content,
          author: d.author,
          createdAt: d.created_at
        }));
      }
    } catch (err) {
      console.warn("Supabase doubts fetch failed, falling back to local:", err);
    }
  }

  // Fallback to localStorage
  const localData = localStorage.getItem("js_academy_doubts") || "[]";
  const doubts: Doubt[] = JSON.parse(localData);
  return doubts
    .filter(d => d.moduleId === moduleId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Create a new doubt
export async function createDoubt(moduleId: string, title: string, content: string, author: string): Promise<Doubt> {
  const newDoubt: Doubt = {
    id: `doubt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    moduleId,
    title,
    content,
    author,
    createdAt: new Date().toISOString()
  };

  // Sync to local
  const localData = localStorage.getItem("js_academy_doubts") || "[]";
  const doubts: Doubt[] = JSON.parse(localData);
  doubts.push(newDoubt);
  localStorage.setItem("js_academy_doubts", JSON.stringify(doubts));

  // Try saving to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.from("doubts").insert({
        id: newDoubt.id,
        module_id: newDoubt.moduleId,
        title: newDoubt.title,
        content: newDoubt.content,
        author: newDoubt.author,
        created_at: newDoubt.createdAt
      });
    } catch (err) {
      console.warn("Supabase doubt insert failed:", err);
    }
  }

  return newDoubt;
}

// Fetch replies for a doubt
export async function fetchReplies(doubtId: string): Promise<Reply[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("replies")
        .select("*")
        .eq("doubt_id", doubtId)
        .order("created_at", { ascending: true });
      
      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id,
          doubtId: r.doubt_id,
          content: r.content,
          author: r.author,
          createdAt: r.created_at
        }));
      }
    } catch (err) {
      console.warn("Supabase replies fetch failed, falling back to local:", err);
    }
  }

  // Fallback to localStorage
  const localData = localStorage.getItem("js_academy_replies") || "[]";
  const replies: Reply[] = JSON.parse(localData);
  return replies
    .filter(r => r.doubtId === doubtId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// Create a new reply
export async function createReply(doubtId: string, content: string, author: string): Promise<Reply> {
  const newReply: Reply = {
    id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    doubtId,
    content,
    author,
    createdAt: new Date().toISOString()
  };

  // Sync to local
  const localData = localStorage.getItem("js_academy_replies") || "[]";
  const replies: Reply[] = JSON.parse(localData);
  replies.push(newReply);
  localStorage.setItem("js_academy_replies", JSON.stringify(replies));

  // Try saving to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.from("replies").insert({
        id: newReply.id,
        doubt_id: newReply.doubtId,
        content: newReply.content,
        author: newReply.author,
        created_at: newReply.createdAt
      });
    } catch (err) {
      console.warn("Supabase reply insert failed:", err);
    }
  }

  return newReply;
}

