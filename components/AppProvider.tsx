'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, CoachInsight, DailyLog, Prescription, SetupFeedback, UserProfile } from '@/types';
import { createDemoState } from '@/lib/demoData';
import { generatePrescription } from '@/lib/prescriptionEngine';
import { emptyAppState, loadAppState, resetAppState, saveAppState } from '@/lib/storage';

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  todayPrescription: Prescription | null;
  isGeneratingAi: boolean;
  aiError: string | null;
  setProfile: (profile: UserProfile) => Promise<void>;
  saveLog: (log: DailyLog) => Promise<void>;
  loadDemo: () => void;
  resetMealHistory: () => void;
  resetWorkoutHistory: () => void;
  resetAdviceHistory: () => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function today() {
  return new Date().toISOString().slice(0, 10);
}

function mergePrescription(state: AppState, prescription: Prescription) {
  return {
    ...state,
    prescriptions: [
      ...state.prescriptions.filter((item) => item.date !== prescription.date),
      prescription
    ],
    rxCounter: Math.max(state.rxCounter, prescription.id + 1)
  };
}

function buildStateAfterProfile(prev: AppState, profile: UserProfile) {
  const next = { ...prev, user: profile };
  const rx = generatePrescription(next);
  return mergePrescription(next, rx);
}

function buildStateAfterLog(prev: AppState, log: DailyLog) {
  const withoutSameDate = prev.logs.filter((item) => item.date !== log.date);
  const next = {
    ...prev,
    logs: [...withoutSameDate, log].sort((a, b) => (a.date < b.date ? -1 : 1))
  };

  if (!next.user) return next;
  const rx = generatePrescription(next);
  return mergePrescription(next, rx);
}

async function fetchSetupFeedback(profile: UserProfile) {
  const response = await fetch('/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'setup', profile })
  });

  if (!response.ok) throw new Error('AIによるカルテ総評の取得に失敗しました。');
  return response.json() as Promise<SetupFeedback>;
}

async function fetchDailyCoachInsight(state: AppState, prescription: Prescription) {
  const response = await fetch('/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'daily', state, prescription })
  });

  if (!response.ok) throw new Error('AIによる日次アドバイスの取得に失敗しました。');
  return response.json() as Promise<CoachInsight>;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyAppState);
  const [hydrated, setHydrated] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadAppState();
    setState(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveAppState(state);
  }, [hydrated, state]);

  const todayPrescription = useMemo(() => {
    return state.prescriptions.find((item) => item.date === today()) ?? null;
  }, [state.prescriptions]);

  const setProfile = async (profile: UserProfile) => {
    setAiError(null);
    let nextState = emptyAppState;
    let currentPrescription: Prescription | null = null;

    setState((prev) => {
      nextState = buildStateAfterProfile(prev, profile);
      currentPrescription = nextState.prescriptions.find((item) => item.date === today()) ?? null;
      return nextState;
    });

    setIsGeneratingAi(true);
    void (async () => {
      try {
        const feedback = await fetchSetupFeedback(profile);
        setState((prev) => prev.user ? { ...prev, user: { ...prev.user, setupFeedback: feedback } } : prev);

        if (currentPrescription) {
          const coachInsight = await fetchDailyCoachInsight(
            { ...nextState, user: { ...profile, setupFeedback: feedback } },
            currentPrescription
          );
          setState((prev) => ({
            ...prev,
            prescriptions: prev.prescriptions.map((item) => item.date === currentPrescription?.date ? { ...item, coachInsight } : item)
          }));
        }
      } catch (error) {
        setAiError(error instanceof Error ? error.message : 'AI生成に失敗しました。');
      } finally {
        setIsGeneratingAi(false);
      }
    })();
  };

  const saveLog = async (log: DailyLog) => {
    setAiError(null);
    let nextState = emptyAppState;
    let currentPrescription: Prescription | null = null;

    setState((prev) => {
      nextState = buildStateAfterLog(prev, log);
      currentPrescription = nextState.prescriptions.find((item) => item.date === today()) ?? null;
      return nextState;
    });

    if (!nextState.user || !currentPrescription) return;

    setIsGeneratingAi(true);
    void (async () => {
      try {
        const coachInsight = await fetchDailyCoachInsight(nextState, currentPrescription as Prescription);
        setState((prev) => ({
          ...prev,
          prescriptions: prev.prescriptions.map((item) => item.date === currentPrescription?.date ? { ...item, coachInsight } : item)
        }));
      } catch (error) {
        setAiError(error instanceof Error ? error.message : 'AI生成に失敗しました。');
      } finally {
        setIsGeneratingAi(false);
      }
    })();
  };

  const loadDemo = () => {
    setAiError(null);
    setState(createDemoState());
  };

  const resetMealHistory = () => {
    setState((prev) => {
      const next = {
        ...prev,
        logs: prev.logs.map((log) => ({ ...log, meals: [] }))
      };
      if (!next.user) return next;
      return mergePrescription(next, generatePrescription(next));
    });
  };

  const resetWorkoutHistory = () => {
    setState((prev) => {
      const next = {
        ...prev,
        logs: prev.logs.map((log) => ({ ...log, workouts: [] }))
      };
      if (!next.user) return next;
      return mergePrescription(next, generatePrescription(next));
    });
  };

  const resetAdviceHistory = () => {
    setState((prev) => {
      const base = { ...prev, prescriptions: [], rxCounter: 1 };
      if (!base.user) return base;
      return mergePrescription(base, generatePrescription(base));
    });
  };

  const resetAll = () => {
    resetAppState();
    setState(emptyAppState);
    setAiError(null);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        hydrated,
        todayPrescription,
        isGeneratingAi,
        aiError,
        setProfile,
        saveLog,
        loadDemo,
        resetMealHistory,
        resetWorkoutHistory,
        resetAdviceHistory,
        resetAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
