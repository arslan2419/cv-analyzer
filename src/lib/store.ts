import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ParsedResume,
  ParsedJobDescription,
  AnalysisResult,
  ImprovementSuggestion,
  RoleCategory,
  ToneType,
  ResumeVersion,
  AnalysisHistory,
} from "@/types";
import { generateId } from "./utils";

// ============================================================================
// App Store - Main Application State
// ============================================================================
interface AppStore {
  // Current session state
  currentStep: number;
  hasStartedAnalysis: boolean;
  resume: ParsedResume | null;
  jd: ParsedJobDescription | null;
  analysis: AnalysisResult | null;
  improvements: ImprovementSuggestion[];
  selectedRole: RoleCategory | null;
  selectedTone: ToneType;

  // UI state
  isAnalyzing: boolean;
  isImproving: boolean;
  error: string | null;

  // Actions
  setStep: (step: number) => void;
  setHasStartedAnalysis: (started: boolean) => void;
  setResume: (resume: ParsedResume | null) => void;
  setJD: (jd: ParsedJobDescription | null) => void;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  addImprovement: (improvement: ImprovementSuggestion) => void;
  setImprovements: (improvements: ImprovementSuggestion[]) => void;
  setSelectedRole: (role: RoleCategory | null) => void;
  setSelectedTone: (tone: ToneType) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setIsImproving: (isImproving: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const initialAppState = {
  currentStep: 0,
  hasStartedAnalysis: false,
  resume: null,
  jd: null,
  analysis: null,
  improvements: [],
  selectedRole: null,
  selectedTone: "professional" as ToneType,
  isAnalyzing: false,
  isImproving: false,
  error: null,
};

export const useAppStore = create<AppStore>()((set, get) => ({
  ...initialAppState,

  setStep: (step) => set({ currentStep: step }),
  setHasStartedAnalysis: (hasStartedAnalysis) => set({ hasStartedAnalysis }),
  setResume: (resume) => set({ resume }),
  setJD: (jd) => set({ jd }),
  setAnalysis: (analysis) => set({ analysis }),
  addImprovement: (improvement) =>
    set((state) => ({ improvements: [...state.improvements, improvement] })),
  setImprovements: (improvements) => set({ improvements }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  setSelectedTone: (tone) => set({ selectedTone: tone }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setIsImproving: (isImproving) => set({ isImproving }),
  setError: (error) => set({ error }),

  resetSession: () => set(initialAppState),

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 4) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
}));

// ============================================================================
// History Store - Resume Versions & Analysis History
// ============================================================================
interface HistoryStore {
  versions: ResumeVersion[];
  history: AnalysisHistory[];

  // Actions
  addVersion: (version: Omit<ResumeVersion, "id" | "createdAt">) => string;
  getVersion: (id: string) => ResumeVersion | undefined;
  addHistory: (entry: Omit<AnalysisHistory, "id" | "createdAt">) => string;
  getHistory: (id: string) => AnalysisHistory | undefined;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      versions: [],
      history: [],

      addVersion: (versionData) => {
        const id = generateId();
        const version: ResumeVersion = {
          ...versionData,
          id,
          createdAt: new Date(),
        };
        set((state) => ({
          versions: [version, ...state.versions].slice(0, 50),
        }));
        return id;
      },

      getVersion: (id) => get().versions.find((v) => v.id === id),

      addHistory: (entryData) => {
        const id = generateId();
        const entry: AnalysisHistory = {
          ...entryData,
          id,
          createdAt: new Date(),
        };
        set((state) => ({ history: [entry, ...state.history].slice(0, 100) }));
        return id;
      },

      getHistory: (id) => get().history.find((h) => h.id === id),

      clearHistory: () => set({ versions: [], history: [] }),

      deleteHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
          versions: state.versions.filter((v) => v.id !== id),
        })),
    }),
    {
      name: "cv-analyzer-history",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        versions: state.versions.slice(0, 10),
        history: state.history.slice(0, 20),
      }),
    }
  )
);

// ============================================================================
// Privacy Store - User Preferences & Consent
// ============================================================================
interface PrivacyStore {
  hasConsented: boolean;
  hasAcceptedDisclaimer: boolean;
  storeData: boolean;
  analyticsEnabled: boolean;
  sessionOnly: boolean;

  setConsent: (consented: boolean) => void;
  setHasAcceptedDisclaimer: (accepted: boolean) => void;
  setStoreData: (store: boolean) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  setSessionOnly: (sessionOnly: boolean) => void;
  clearAllData: () => void;
}

export const usePrivacyStore = create<PrivacyStore>()(
  persist(
    (set) => ({
      hasConsented: false,
      hasAcceptedDisclaimer: false,
      storeData: false,
      analyticsEnabled: false,
      sessionOnly: true,

      setConsent: (hasConsented) => set({ hasConsented }),
      setHasAcceptedDisclaimer: (hasAcceptedDisclaimer) => set({ hasAcceptedDisclaimer }),
      setStoreData: (storeData) => set({ storeData }),
      setAnalyticsEnabled: (analyticsEnabled) => set({ analyticsEnabled }),
      setSessionOnly: (sessionOnly) => set({ sessionOnly }),
      clearAllData: () => {
        localStorage.removeItem("cv-analyzer-history");
        set({
          hasConsented: false,
          storeData: false,
          analyticsEnabled: false,
          sessionOnly: true,
        });
      },
    }),
    {
      name: "cv-analyzer-privacy",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================================
// UI Store - Theme & UI Preferences
// ============================================================================
interface UIStore {
  sidebarCollapsed: boolean;
  showTips: boolean;
  animationsEnabled: boolean;

  toggleSidebar: () => void;
  setShowTips: (show: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      showTips: true,
      animationsEnabled: true,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setShowTips: (showTips) => set({ showTips }),
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
    }),
    {
      name: "cv-analyzer-ui",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
