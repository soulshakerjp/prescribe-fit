export type Sex = 'male' | 'female';
export type GoalType = 'cut' | 'maintain' | 'bulk';
export type ActivityLevel = 'low' | 'moderate' | 'high';
export type ConditionLevel = 1 | 2 | 3 | 4 | 5;
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
export type InsightSource = 'openai' | 'rule-based';

export interface MacroTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface SetupSuggestion {
  title: string;
  detail: string;
  level: 'good' | 'warn' | 'adjust';
  proposedValue?: string;
}

export interface SetupFeedback {
  summary: string;
  trainingSuggestion: string;
  nutritionSuggestion: string;
  suggestions: SetupSuggestion[];
  warnings: string[];
  generatedBy: InsightSource;
  model?: string;
}

export interface UserProfile {
  nickname: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goalType: GoalType;
  goalWeeks: number;
  activityLevel: ActivityLevel;
  trainingDaysPerWeek: number;
  canCook: boolean;
  dislikedFoods: string[];
  cuisines: {
    japanese: number;
    western: number;
    chinese: number;
  };
  maxCookMinutes: number;
  targets: MacroTargets;
  setupFeedback?: SetupFeedback;
}

export interface MealEntry {
  slot: MealSlot;
  text: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface WorkoutSet {
  weightKg: number;
  reps: number;
  sets: number;
}

export interface WorkoutEntry {
  exercise: string;
  muscleGroup: MuscleGroup;
  prescription?: boolean;
  notes?: string;
  performance: WorkoutSet;
}

export interface DailyLog {
  date: string;
  weightKg?: number;
  bodyFatPercent?: number;
  sleepHours: number;
  condition: ConditionLevel;
  meals: MealEntry[];
  workouts: WorkoutEntry[];
  notes?: string;
}

export interface Recipe {
  id: string;
  title: string;
  cuisine: 'japanese' | 'western' | 'chinese';
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  cookMinutes: number;
  ingredients: string[];
  shoppingList: string[];
  alternatives: string[];
  seasonalTags: string[];
}

export interface ExercisePreset {
  name: string;
  muscleGroup: MuscleGroup;
  defaultWeightKg: number;
  defaultReps: number;
  defaultSets: number;
}

export interface MealPrescription {
  recipe: Recipe;
  remainingTargets: MacroTargets;
}

export interface WorkoutPrescription {
  muscleGroup: MuscleGroup;
  durationMinutes: number;
  caution: string;
  exercises: WorkoutEntry[];
}

export interface CoachInsight {
  overall: string;
  dinner: string;
  workout: string;
  recovery: string;
  actionItems: string[];
  warnings: string[];
  generatedBy: InsightSource;
  model?: string;
}

export interface Prescription {
  id: number;
  date: string;
  coachName: string;
  title: string;
  meal: MealPrescription;
  workout: WorkoutPrescription;
  reasoning: string[];
  message: string;
  coachInsight: CoachInsight;
}

export interface AppState {
  user: UserProfile | null;
  logs: DailyLog[];
  prescriptions: Prescription[];
  rxCounter: number;
}
