import { AppState, DailyLog, UserProfile } from '@/types';
import { calculateTargets } from '@/lib/pfcCalculator';
import { generatePrescription } from '@/lib/prescriptionEngine';

function isoDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export function createDemoProfile(): UserProfile {
  const base = {
    nickname: 'Demo User',
    age: 36,
    sex: 'male' as const,
    heightCm: 170,
    weightKg: 70,
    targetWeightKg: 65,
    goalType: 'cut' as const,
    goalWeeks: 12,
    activityLevel: 'moderate' as const,
    trainingDaysPerWeek: 4,
    canCook: true,
    dislikedFoods: ['パクチー'],
    cuisines: {
      japanese: 60,
      western: 20,
      chinese: 20
    },
    maxCookMinutes: 25
  };

  return {
    ...base,
    targets: calculateTargets(base).targets
  };
}

function log(daysAgo: number, weightKg: number, sleepHours: number, condition: 1 | 2 | 3 | 4 | 5, meals: DailyLog['meals'], workouts: DailyLog['workouts'], notes?: string): DailyLog {
  return {
    date: isoDate(daysAgo),
    weightKg,
    sleepHours,
    condition,
    bodyFatPercent: 19.5 - daysAgo * 0.1,
    meals,
    workouts,
    notes
  };
}

export function createDemoState(): AppState {
  const user = createDemoProfile();
  const logs: DailyLog[] = [
    log(6, 70.4, 7.3, 4, [
      { slot: 'breakfast', text: 'オートミール 40g、プロテイン 30g、バナナ 100g', calories: 318, protein: 28.9, fat: 3.7, carbs: 50.7 },
      { slot: 'lunch', text: '鶏むね肉 180g、玄米 150g、ブロッコリー 100g', calories: 475, protein: 47.4, fat: 4.7, carbs: 49.7 },
      { slot: 'dinner', text: '鮭 150g、ごはん 150g、味噌汁 150g', calories: 475, protein: 38.1, fat: 8, carbs: 50.2 }
    ], [
      { exercise: 'ベンチプレス', muscleGroup: 'chest', performance: { weightKg: 72.5, reps: 8, sets: 4 } },
      { exercise: 'インクラインダンベルプレス', muscleGroup: 'chest', performance: { weightKg: 22, reps: 10, sets: 3 } }
    ], '胸トレの日。フォームは安定。'),
    log(5, 70.2, 6.6, 3, [
      { slot: 'breakfast', text: 'ヨーグルト 150g、バナナ 100g', calories: 177, protein: 6.5, fat: 4.7, carbs: 28.9 },
      { slot: 'lunch', text: 'サバ 120g、雑穀 150g、味噌汁 150g', calories: 514, protein: 32.7, fat: 21.7, carbs: 49.2 },
      { slot: 'dinner', text: '豆腐 200g、鶏ささみ 120g、ごはん 120g', calories: 416, protein: 41.5, fat: 9.1, carbs: 38.7 }
    ], [
      { exercise: 'ラットプルダウン', muscleGroup: 'back', performance: { weightKg: 50, reps: 10, sets: 3 } },
      { exercise: 'ベントオーバーロウ', muscleGroup: 'back', performance: { weightKg: 52.5, reps: 10, sets: 3 } }
    ], 'やや睡眠不足。'),
    log(4, 70.1, 7.1, 4, [
      { slot: 'breakfast', text: '卵 2個、オートミール 40g', calories: 266, protein: 16.2, fat: 12.4, carbs: 26.9 },
      { slot: 'lunch', text: '牛もも 150g、ごはん 150g、キャベツ 100g', calories: 464, protein: 34.6, fat: 16.3, carbs: 51.7 },
      { slot: 'dinner', text: '鮭 150g、ブロッコリー 100g、玄米 120g', calories: 398, protein: 41.6, fat: 7.1, carbs: 40.9 }
    ], [
      { exercise: 'スクワット', muscleGroup: 'legs', performance: { weightKg: 82.5, reps: 6, sets: 4 } },
      { exercise: 'レッグプレス', muscleGroup: 'legs', performance: { weightKg: 130, reps: 10, sets: 3 } }
    ]),
    log(3, 69.9, 7.8, 5, [
      { slot: 'breakfast', text: 'プロテイン 30g、バナナ 100g', calories: 204, protein: 25.1, fat: 1.7, carbs: 24.4 },
      { slot: 'lunch', text: '鶏もも 180g、ごはん 150g、ブロッコリー 100g', calories: 452, protein: 38.5, fat: 9.5, carbs: 51.7 },
      { slot: 'dinner', text: '豆腐 150g、鮭 100g、雑穀 120g', calories: 369, protein: 34, fat: 10.6, carbs: 38.9 }
    ], [
      { exercise: 'ショルダープレス', muscleGroup: 'shoulders', performance: { weightKg: 32.5, reps: 8, sets: 4 } },
      { exercise: 'サイドレイズ', muscleGroup: 'shoulders', performance: { weightKg: 8, reps: 12, sets: 3 } }
    ]),
    log(2, 69.8, 6.2, 3, [
      { slot: 'breakfast', text: 'ヨーグルト 150g、オートミール 30g', calories: 176, protein: 9.2, fat: 6, carbs: 25 },
      { slot: 'lunch', text: '豚ヒレ 150g、ごはん 150g、キャベツ 100g', calories: 393, protein: 37.2, fat: 5.9, carbs: 51.7 },
      { slot: 'dinner', text: 'サバ 100g、豆腐 100g、玄米 120g', calories: 448, protein: 31, fat: 22.4, carbs: 37.3 }
    ], [
      { exercise: 'バーベルカール', muscleGroup: 'arms', performance: { weightKg: 22.5, reps: 10, sets: 3 } },
      { exercise: 'トライセプスエクステンション', muscleGroup: 'arms', performance: { weightKg: 20, reps: 10, sets: 3 } }
    ], '会食があったので脂質多め。'),
    log(1, 69.6, 7.4, 4, [
      { slot: 'breakfast', text: '卵 2個、プロテイン 30g', calories: 272, protein: 36.4, fat: 11.9, carbs: 3.4 },
      { slot: 'lunch', text: '鶏むね肉 180g、ごはん 150g、味噌汁 150g', calories: 427, protein: 46.5, fat: 4.5, carbs: 51 },
      { slot: 'dinner', text: '鮭 100g、豆腐 150g、きのこ 100g、ごはん 120g', calories: 416, protein: 35.9, fat: 10.8, carbs: 42.9 }
    ], []),
    log(0, 69.5, 6.7, 3, [
      { slot: 'breakfast', text: 'オートミール 40g、プロテイン 30g', calories: 272, protein: 29.1, fat: 3.5, carbs: 29.7 },
      { slot: 'lunch', text: '牛もも 150g、ごはん 150g、ブロッコリー 100g', calories: 474, protein: 37.9, fat: 16.9, carbs: 51.7 }
    ], [], '午後から少し空腹感が強い。')
  ];

  const state: AppState = {
    user,
    logs,
    prescriptions: [],
    rxCounter: 1
  };

  const todayPrescription = generatePrescription(state);
  return {
    ...state,
    prescriptions: [todayPrescription],
    rxCounter: 2
  };
}
