import { AppState, CoachInsight, DailyLog, Prescription, UserProfile } from '@/types';

const STORAGE_KEY = 'prescribe-fit-v2';

const emptyCoachInsight: CoachInsight = {
  overall: '',
  dinner: '',
  workout: '',
  recovery: '',
  actionItems: [],
  warnings: [],
  generatedBy: 'rule-based'
};

export const emptyAppState: AppState = {
  user: null,
  logs: [],
  prescriptions: [],
  rxCounter: 1
};

function normalizeUser(user: unknown): UserProfile | null {
  if (!user || typeof user !== 'object') return null;
  const value = user as Partial<UserProfile>;
  if (!value.targets || !value.cuisines) return null;

  return {
    nickname: value.nickname ?? 'ユーザー',
    age: Number(value.age ?? 0),
    sex: value.sex === 'female' ? 'female' : 'male',
    heightCm: Number(value.heightCm ?? 0),
    weightKg: Number(value.weightKg ?? 0),
    targetWeightKg: Number(value.targetWeightKg ?? 0),
    goalType: value.goalType === 'bulk' ? 'bulk' : value.goalType === 'maintain' ? 'maintain' : 'cut',
    goalWeeks: Number(value.goalWeeks ?? 12),
    activityLevel: value.activityLevel === 'high' ? 'high' : value.activityLevel === 'low' ? 'low' : 'moderate',
    trainingDaysPerWeek: Number(value.trainingDaysPerWeek ?? 3),
    canCook: Boolean(value.canCook),
    dislikedFoods: Array.isArray(value.dislikedFoods) ? value.dislikedFoods : [],
    cuisines: {
      japanese: Number(value.cuisines.japanese ?? 60),
      western: Number(value.cuisines.western ?? 20),
      chinese: Number(value.cuisines.chinese ?? 20)
    },
    maxCookMinutes: Number(value.maxCookMinutes ?? 25),
    targets: {
      calories: Number(value.targets.calories ?? 0),
      protein: Number(value.targets.protein ?? 0),
      fat: Number(value.targets.fat ?? 0),
      carbs: Number(value.targets.carbs ?? 0)
    },
    setupFeedback: value.setupFeedback
  };
}

function normalizeLogs(logs: unknown): DailyLog[] {
  if (!Array.isArray(logs)) return [];
  return logs
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const value = item as Partial<DailyLog>;
      return {
        date: typeof value.date === 'string' ? value.date : new Date().toISOString().slice(0, 10),
        weightKg: typeof value.weightKg === 'number' ? value.weightKg : undefined,
        bodyFatPercent: typeof value.bodyFatPercent === 'number' ? value.bodyFatPercent : undefined,
        sleepHours: Number(value.sleepHours ?? 0),
        condition: ([1, 2, 3, 4, 5].includes(value.condition as number) ? value.condition : 3) as DailyLog['condition'],
        meals: Array.isArray(value.meals) ? value.meals : [],
        workouts: Array.isArray(value.workouts) ? value.workouts : [],
        notes: typeof value.notes === 'string' ? value.notes : ''
      };
    });
}

function normalizePrescriptions(prescriptions: unknown): Prescription[] {
  if (!Array.isArray(prescriptions)) return [];
  return prescriptions.filter((item) => item && typeof item === 'object').map((item) => {
    const value = item as Partial<Prescription>;
    return {
      ...value,
      id: Number(value.id ?? 1),
      date: typeof value.date === 'string' ? value.date : new Date().toISOString().slice(0, 10),
      coachName: typeof value.coachName === 'string' ? value.coachName : 'OpenAI Fit Coach',
      title: typeof value.title === 'string' ? value.title : '今日のAIメニュー',
      reasoning: Array.isArray(value.reasoning) ? value.reasoning : [],
      message: typeof value.message === 'string' ? value.message : '',
      coachInsight: {
        ...emptyCoachInsight,
        ...(value.coachInsight && typeof value.coachInsight === 'object' ? value.coachInsight : {})
      }
    } as Prescription;
  });
}

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return emptyAppState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAppState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      user: normalizeUser(parsed.user),
      logs: normalizeLogs(parsed.logs),
      prescriptions: normalizePrescriptions(parsed.prescriptions),
      rxCounter: Number(parsed.rxCounter ?? 1)
    };
  } catch {
    return emptyAppState;
  }
}

export function saveAppState(state: AppState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetAppState() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
