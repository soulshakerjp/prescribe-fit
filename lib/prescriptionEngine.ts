import { AppState, MacroTargets, MuscleGroup, Prescription, Recipe, WorkoutEntry } from '@/types';
import { exercisePresets, muscleGroupLabels } from '@/lib/exercises';
import { buildFallbackCoachInsight } from '@/lib/coach';
import { subtractMacros, sumMacros } from '@/lib/pfcCalculator';
import { recipes } from '@/lib/recipes';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getTodayLog(state: AppState) {
  return state.logs.find((log) => log.date === today());
}

function lastLogs(state: AppState, days = 7) {
  return [...state.logs]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, days);
}

function getSeasonalHint(month: number) {
  if (month >= 2 && month <= 4) return '春野菜を入れやすい時期なので、満腹感と栄養密度を両立しやすい構成です。';
  if (month >= 5 && month <= 7) return '初夏は食欲の波が出やすいので、たんぱく質を確保しつつ重くなりすぎない献立を優先しています。';
  if (month >= 8 && month <= 10) return '秋は食材の選択肢が広いので、満足感と継続性を両立しやすいタイミングです。';
  return '寒い時期は温かい汁物を添えて、回復しやすい夕食に寄せています。';
}

function cuisineWeight(recipe: Recipe, state: AppState) {
  const pref = state.user?.cuisines;
  if (!pref) return 1;
  const value = recipe.cuisine === 'japanese' ? pref.japanese : recipe.cuisine === 'western' ? pref.western : pref.chinese;
  return 1 + value / 100;
}

function pickRecipe(remaining: MacroTargets, state: AppState) {
  const month = new Date().getMonth();
  const disliked = new Set(state.user?.dislikedFoods ?? []);
  const maxCookMinutes = state.user?.maxCookMinutes ?? 30;

  const scored = recipes
    .filter((recipe) => recipe.cookMinutes <= maxCookMinutes + 10)
    .filter((recipe) => recipe.ingredients.every((item) => ![...disliked].some((food) => item.includes(food))))
    .map((recipe) => {
      const score =
        Math.abs(recipe.calories - Math.max(remaining.calories, 500)) * 0.8 +
        Math.abs(recipe.protein - Math.max(remaining.protein, 30)) * 2.4 +
        Math.abs(recipe.fat - Math.max(remaining.fat, 10)) * 1.2 +
        Math.abs(recipe.carbs - Math.max(remaining.carbs, 40)) * 1.1 -
        cuisineWeight(recipe, state) * 8 -
        (recipe.seasonalTags.length > 0 && ((month >= 2 && month <= 4 && recipe.seasonalTags.some((x) => ['筍', '菜の花'].includes(x))) ||
          (month >= 5 && month <= 7 && recipe.seasonalTags.some((x) => ['鰹', 'ピーマン', 'ブロッコリー'].includes(x))) ||
          (month >= 8 && month <= 10 && recipe.seasonalTags.some((x) => ['きのこ', '鮭', 'さつまいも'].includes(x))) ||
          ((month <= 1 || month === 11) && recipe.seasonalTags.some((x) => ['白菜', '大根'].includes(x))))
          ? 18
          : 0);
      return { recipe, score };
    })
    .sort((a, b) => a.score - b.score);

  return scored[0]?.recipe ?? recipes[0];
}

function musclePriority(state: AppState): MuscleGroup {
  const logs = lastLogs(state, 7);
  const groups: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
  const recency = new Map<MuscleGroup, number>();

  groups.forEach((group) => recency.set(group, 999));
  logs.forEach((log, index) => {
    const groupsInLog = new Set(log.workouts.map((workout) => workout.muscleGroup));
    groupsInLog.forEach((group) => {
      if (recency.get(group)! > index) recency.set(group, index);
    });
  });

  return groups.sort((a, b) => recency.get(b)! - recency.get(a)!)[0];
}

function findLastWorkout(state: AppState, group: MuscleGroup) {
  return [...state.logs]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .flatMap((log) => log.workouts)
    .filter((entry) => entry.muscleGroup === group);
}

function buildWorkoutPrescription(state: AppState, sleepHours: number) {
  const group = musclePriority(state);
  const last = findLastWorkout(state, group);
  const presets = exercisePresets.filter((exercise) => exercise.muscleGroup === group).slice(0, 4);
  const isSleepLow = sleepHours < 6;
  const volumeMultiplier = isSleepLow ? 0.8 : 1;

  const exercises: WorkoutEntry[] = presets.map((preset) => {
    const previous = last.find((item) => item.exercise === preset.name);
    const baseWeight = previous?.performance.weightKg ?? preset.defaultWeightKg;
    const baseReps = previous?.performance.reps ?? preset.defaultReps;
    const nextWeight = baseWeight === 0 ? 0 : Math.round((baseWeight + 2.5) * 10) / 10;
    const nextReps = baseWeight === 0 ? baseReps + 1 : baseReps;
    const nextSets = Math.max(2, Math.round((previous?.performance.sets ?? preset.defaultSets) * volumeMultiplier));

    return {
      exercise: preset.name,
      muscleGroup: group,
      prescription: true,
      notes: isSleepLow ? '睡眠不足を考慮してセット数を調整。フォーム優先。' : '小さな上積みを狙うメニューです。',
      performance: {
        weightKg: nextWeight,
        reps: nextReps,
        sets: nextSets
      }
    };
  });

  return {
    muscleGroup: group,
    durationMinutes: isSleepLow ? 45 : 55,
    caution: isSleepLow ? '睡眠が6時間未満のため、ボリュームを約20%抑えています。ウォームアップを丁寧に。' : '回復は概ね良好です。主種目は前回を少しだけ超える意識で十分です。',
    exercises
  };
}

function buildReasoning(state: AppState, remaining: MacroTargets, sleepHours: number, selectedRecipe: Recipe, workoutDone: boolean, group: MuscleGroup) {
  const recent = lastLogs(state, 3);
  const recentProteinAverage = recent.length
    ? Math.round(recent.reduce((acc, log) => acc + sumMacros(log.meals).protein, 0) / recent.length)
    : 0;
  const latestWeightDelta = recent.length >= 2 && recent[0].weightKg && recent[recent.length - 1].weightKg
    ? Number((recent[0].weightKg! - recent[recent.length - 1].weightKg!).toFixed(1))
    : 0;
  const reasons = [
    `本日時点で残り ${remaining.calories}kcal、P ${remaining.protein}g / F ${remaining.fat}g / C ${remaining.carbs}g だったため、${selectedRecipe.title}を選びました。`,
    recentProteinAverage < (state.user?.targets.protein ?? 0) * 0.85
      ? '直近3日でたんぱく質が不足気味だったため、高たんぱく寄りの夕食に補正しています。'
      : '直近3日のたんぱく質達成度は良好なので、継続しやすさも重視した構成です。',
    workoutDone
      ? '今日はすでにトレーニング実績があるため、夕食は回復と栄養補填を優先しました。'
      : '本日はトレーニング未実施のため、次回メニューでは最も間隔の空いた部位を優先しています。',
    sleepHours < 6
      ? '睡眠時間が短いため、次回筋トレはセット数を抑えて疲労管理を優先しています。'
      : '睡眠は大きく崩れていないため、次回は軽い漸進性を狙う設計です。',
    latestWeightDelta < 0
      ? `直近の体重推移は ${latestWeightDelta}kg。減量方向に進んでいるため、極端な制限は避けています。`
      : `直近の体重推移は ${latestWeightDelta >= 0 ? '+' : ''}${latestWeightDelta}kg。夕食の質と継続性を優先しています。`
  ];

  const month = new Date().getMonth();
  reasons.push(getSeasonalHint(month));
  reasons.push(`次回の重点部位は「${muscleGroupLabels[group]}」。直近1週間で最も間隔が空いていたためです。`);
  return reasons;
}

function sleepHoursMessage(sleepHours: number, remainingProtein: number) {
  if (sleepHours < 6) return '今日は攻める日ではなく、崩さない日です。回復優先で進めましょう。';
  if (remainingProtein > 40) return '今日のポイントは、夕食でたんぱく質をきっちり回収することです。';
  return 'かなり良いラインです。無理なく再現できるメニューで積み上げましょう。';
}

export function generatePrescription(state: AppState): Prescription {
  const user = state.user;
  if (!user) {
    throw new Error('User profile is required before generating a prescription.');
  }

  const todayLog = getTodayLog(state);
  const consumed = sumMacros(todayLog?.meals ?? []);
  const remaining = subtractMacros(user.targets, consumed);
  const selectedRecipe = pickRecipe(remaining, state);
  const todaySleep = todayLog?.sleepHours ?? 7;
  const workoutDone = Boolean(todayLog?.workouts.length);
  const workout = buildWorkoutPrescription(state, todaySleep);

  const draft: Prescription = {
    id: state.rxCounter,
    date: today(),
    coachName: 'OpenAI Fit Coach',
    title: '今日のAIメニュー',
    meal: {
      recipe: selectedRecipe,
      remainingTargets: remaining
    },
    workout,
    reasoning: buildReasoning(state, remaining, todaySleep, selectedRecipe, workoutDone, workout.muscleGroup),
    message: sleepHoursMessage(todaySleep, remaining.protein),
    coachInsight: {
      overall: '',
      dinner: '',
      workout: '',
      recovery: '',
      actionItems: [],
      warnings: [],
      generatedBy: 'rule-based'
    }
  };

  draft.coachInsight = buildFallbackCoachInsight(state, draft);
  return draft;
}
