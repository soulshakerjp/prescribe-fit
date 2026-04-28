import { ActivityLevel, GoalType, MacroTargets, Sex } from '@/types';

const activityMultiplierMap: Record<ActivityLevel, number> = {
  low: 1.35,
  moderate: 1.55,
  high: 1.75
};

export function calculateBmr({ sex, age, heightCm, weightKg }: { sex: Sex; age: number; heightCm: number; weightKg: number }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(base + (sex === 'male' ? 5 : -161));
}

export function calculateTargets(params: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goalType: GoalType;
  activityLevel: ActivityLevel;
}) {
  const bmr = calculateBmr(params);
  const tdee = Math.round(bmr * activityMultiplierMap[params.activityLevel]);
  const adjustment = params.goalType === 'cut' ? -350 : params.goalType === 'bulk' ? 250 : 0;
  const calories = Math.max(1400, tdee + adjustment);
  const protein = Math.round(params.weightKg * (params.goalType === 'cut' ? 2.0 : 1.8));
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  const targets: MacroTargets = { calories, protein, fat, carbs };
  return { bmr, tdee, targets };
}

export function sumMacros(items: Array<{ calories: number; protein: number; fat: number; carbs: number }>): MacroTargets {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fat,
      carbs: acc.carbs + item.carbs
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

export function subtractMacros(targets: MacroTargets, consumed: MacroTargets): MacroTargets {
  return {
    calories: Math.max(0, targets.calories - consumed.calories),
    protein: Math.max(0, targets.protein - consumed.protein),
    fat: Math.max(0, targets.fat - consumed.fat),
    carbs: Math.max(0, targets.carbs - consumed.carbs)
  };
}

export function commitmentScore(targets: MacroTargets, consumed: MacroTargets, sleepHours = 7, workoutDone = false) {
  const calorieScore = 100 - Math.min(100, Math.abs(targets.calories - consumed.calories) / Math.max(1, targets.calories) * 100);
  const proteinScore = Math.min(100, consumed.protein / Math.max(1, targets.protein) * 100);
  const sleepScore = Math.min(100, (sleepHours / 7.5) * 100);
  const workoutScore = workoutDone ? 100 : 60;
  return Math.round(calorieScore * 0.3 + proteinScore * 0.35 + sleepScore * 0.15 + workoutScore * 0.2);
}
