import { AppState, CoachInsight, DailyLog, GoalType, MacroTargets, MealSlot, Prescription, SetupFeedback, SetupSuggestion, UserProfile } from '@/types';
import { sumMacros } from '@/lib/pfcCalculator';

export const mealSlotLabels: Record<MealSlot, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食'
};

export const macroFieldLabels: Record<keyof MacroTargets, string> = {
  calories: 'Calories（カロリー）',
  protein: 'Protein（たんぱく質）',
  fat: 'Fat（脂質）',
  carbs: 'Carbs（炭水化物）'
};

export const activityLevelDescriptions = {
  low: '日常活動量が低め（デスクワーク中心・移動少なめ）',
  moderate: '日常活動量が標準（移動や立ち仕事がある）',
  high: '日常活動量が高め（立ち仕事・外回り・歩行量が多い）'
} as const;

function weeklyTargetDelta(profile: Pick<UserProfile, 'weightKg' | 'targetWeightKg' | 'goalWeeks'>) {
  return Number(((profile.targetWeightKg - profile.weightKg) / Math.max(1, profile.goalWeeks)).toFixed(2));
}

function recommendedGoalWeeks(weightKg: number, targetWeightKg: number) {
  const diff = Math.abs(targetWeightKg - weightKg);
  return Math.max(6, Math.ceil(diff / 0.45));
}

function recommendedTrainingDays(goalType: GoalType) {
  if (goalType === 'bulk') return 4;
  if (goalType === 'cut') return 3;
  return 3;
}

function mealProteinGuide(profile: UserProfile) {
  return Math.max(20, Math.round(profile.targets.protein / 3));
}

function mealCaloriesGuide(profile: UserProfile) {
  const breakfast = Math.round(profile.targets.calories * 0.25);
  const lunch = Math.round(profile.targets.calories * 0.3);
  const dinner = Math.round(profile.targets.calories * 0.35);
  const snack = Math.max(100, profile.targets.calories - breakfast - lunch - dinner);
  return { breakfast, lunch, dinner, snack };
}

export function buildSetupFeedback(profile: UserProfile): SetupFeedback {
  const delta = weeklyTargetDelta(profile);
  const goalWeeksSuggestion = recommendedGoalWeeks(profile.weightKg, profile.targetWeightKg);
  const trainingDaysSuggestion = recommendedTrainingDays(profile.goalType);
  const calories = mealCaloriesGuide(profile);
  const proteinPerMeal = mealProteinGuide(profile);
  const suggestions: SetupSuggestion[] = [];
  const warnings: string[] = [];

  if (Math.abs(delta) > 0.8) {
    warnings.push(`週あたり ${delta}kg の変化はやや急です。体重差に対して期間を伸ばしたほうが再現性が上がります。`);
    suggestions.push({
      title: '目標期間の見直し',
      detail: `現在の設定だと週あたり ${delta}kg ペースです。無理を減らすなら ${goalWeeksSuggestion} 週前後が現実的です。`,
      level: 'warn',
      proposedValue: `${goalWeeksSuggestion}週`
    });
  } else {
    suggestions.push({
      title: '目標期間',
      detail: `週あたり ${delta}kg ペースなので、比較的現実的なレンジです。`,
      level: 'good'
    });
  }

  if (profile.trainingDaysPerWeek < 2 && profile.goalType !== 'maintain') {
    warnings.push('トレーニング日数が少なめです。体型変化を狙うなら週3日前後あると組みやすいです。');
    suggestions.push({
      title: '週のトレーニング可能日数',
      detail: `現在は週${profile.trainingDaysPerWeek}日です。目標に対しては週${trainingDaysSuggestion}日ほど確保できると進めやすいです。`,
      level: 'adjust',
      proposedValue: `週${trainingDaysSuggestion}日`
    });
  } else if (profile.trainingDaysPerWeek > 6) {
    warnings.push('頻度が高すぎる可能性があります。疲労管理と継続性を考えると週4〜5日でも十分です。');
    suggestions.push({
      title: 'トレーニング頻度',
      detail: `週${profile.trainingDaysPerWeek}日は高頻度です。回復を含めるなら週4〜5日に抑えても成果は作れます。`,
      level: 'warn',
      proposedValue: '週4〜5日'
    });
  } else {
    suggestions.push({
      title: 'トレーニング頻度',
      detail: `週${profile.trainingDaysPerWeek}日は十分に組みやすい頻度です。`,
      level: 'good'
    });
  }

  suggestions.push({
    title: '食事の目安',
    detail: `1食あたりのたんぱく質は ${proteinPerMeal}g 前後を目安にすると届きやすいです。夕食は ${calories.dinner}kcal 前後、朝食 ${calories.breakfast}kcal / 昼食 ${calories.lunch}kcal / 間食 ${calories.snack}kcal が目安です。`,
    level: 'adjust'
  });

  const summary =
    profile.goalType === 'cut'
      ? `減量方針は明確です。急ぎすぎない範囲で、たんぱく質確保とトレーニング頻度の再現性を優先すると成功率が上がります。`
      : profile.goalType === 'bulk'
        ? `増量方針は組めています。食事量だけでなく、週のトレーニング回数と睡眠の安定をセットで見るのが鍵です。`
        : `維持方針なので、無理な制限よりも継続しやすい入力設計と日々の微調整が効きます。`;

  return {
    summary,
    trainingSuggestion: `現状なら週${trainingDaysSuggestion}日前後を基準に、忙しい週は2日、余裕のある週は4日まで振れる設計が扱いやすいです。`,
    nutritionSuggestion: `日次目標は ${profile.targets.calories}kcal、たんぱく質 ${profile.targets.protein}g です。1食ごとの配分を決めておくと夜の迷いが減ります。`,
    suggestions,
    warnings,
    generatedBy: 'rule-based'
  };
}

function getRecentLogs(logs: DailyLog[], days = 7) {
  return [...logs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, days);
}

function recentWeightDelta(logs: DailyLog[]) {
  const recent = getRecentLogs(logs, 7).filter((log) => typeof log.weightKg === 'number');
  if (recent.length < 2) return 0;
  return Number(((recent[0].weightKg ?? 0) - (recent[recent.length - 1].weightKg ?? 0)).toFixed(1));
}

function averageSleep(logs: DailyLog[]) {
  const recent = getRecentLogs(logs, 7);
  if (!recent.length) return 0;
  return Number((recent.reduce((sum, log) => sum + log.sleepHours, 0) / recent.length).toFixed(1));
}

function averageProtein(logs: DailyLog[]) {
  const recent = getRecentLogs(logs, 7);
  if (!recent.length) return 0;
  return Math.round(recent.reduce((sum, log) => sum + sumMacros(log.meals).protein, 0) / recent.length);
}

export function buildFallbackCoachInsight(state: AppState, prescription: Prescription): CoachInsight {
  const recentLogs = getRecentLogs(state.logs, 7);
  const avgSleep = averageSleep(state.logs);
  const avgProtein = averageProtein(state.logs);
  const delta = recentWeightDelta(state.logs);
  const actions = [
    `夕食は ${prescription.meal.recipe.title} を軸に、たんぱく質を ${prescription.meal.recipe.protein}g 回収する。`,
    `次回トレーニングは ${prescription.workout.durationMinutes}分を目安に、主種目のフォームを崩さず完遂する。`
  ];
  const warnings: string[] = [];

  if (avgSleep > 0 && avgSleep < 6.5) warnings.push(`直近7日の平均睡眠は ${avgSleep}時間です。まず回復を立て直すほうが成果につながります。`);
  if (avgProtein > 0 && state.user && avgProtein < state.user.targets.protein * 0.85) warnings.push(`直近の平均たんぱく質は ${avgProtein}g で不足気味です。昼食か間食で前倒し補給すると安定します。`);
  if (recentLogs.length < 3) warnings.push('ログ件数がまだ少ないため、アドバイスの精度はこれから上がります。');

  return {
    overall: delta < 0
      ? `体重はゆるやかに下降しています。今は勢いよりも再現性を優先する局面です。`
      : `体重は横ばい〜微増です。食事量の整え方とトレーニング頻度の一貫性が次の差になります。`,
    dinner: `今日の残り目標に対して、夕食は ${prescription.meal.recipe.calories}kcal / P${prescription.meal.recipe.protein}g の構成が噛み合っています。`,
    workout: `次回は ${prescription.workout.exercises[0]?.exercise ?? 'メイン種目'} を軸に、${prescription.workout.exercises.length}種目でボリュームを組む形が適切です。`,
    recovery: avgSleep < 6.5
      ? `睡眠が短めなので、攻めるより崩さない設計に寄せています。`
      : `睡眠は大きく崩れていないので、軽い漸進を狙えるコンディションです。`,
    actionItems: actions,
    warnings,
    generatedBy: 'rule-based'
  };
}

function toJsonBlock(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function buildSetupPrompt(profile: UserProfile, feedback: SetupFeedback) {
  return [
    'あなたは厳しさと現実性を両立する日本語のパーソナルトレーナーです。',
    '返答は断定しすぎず、しかし曖昧にもせず、実行可能な助言にしてください。',
    'JSONのみを返してください。Markdownは禁止。',
    '必要なキーは summary, trainingSuggestion, nutritionSuggestion, suggestions, warnings です。',
    'suggestions は { title, detail, level, proposedValue } の配列にしてください。level は good / warn / adjust のいずれか。',
    'warnings は文字列配列です。',
    '入力プロフィール:',
    toJsonBlock(profile),
    '事前に算出した提案:',
    toJsonBlock(feedback)
  ].join('\n');
}

export function buildDailyPrompt(state: AppState, prescription: Prescription) {
  const recentLogs = getRecentLogs(state.logs, 14).map((log) => ({
    date: log.date,
    weightKg: log.weightKg,
    sleepHours: log.sleepHours,
    condition: log.condition,
    calories: Math.round(sumMacros(log.meals).calories),
    protein: Math.round(sumMacros(log.meals).protein),
    workouts: log.workouts.map((item) => ({
      exercise: item.exercise,
      muscleGroup: item.muscleGroup,
      weightKg: item.performance.weightKg,
      reps: item.performance.reps,
      sets: item.performance.sets
    })),
    notes: log.notes ?? ''
  }));

  return [
    'あなたは日本語でアドバイスする、食事と筋トレの両方に強いパーソナルトレーナーです。',
    '日々のログを読み、過去傾向を踏まえて、今日の夕食と次回トレーニングを一貫したストーリーで提案してください。',
    'JSONのみを返してください。Markdownは禁止。',
    '必要なキーは overall, dinner, workout, recovery, actionItems, warnings です。',
    'actionItems と warnings は文字列配列です。',
    'ユーザープロフィール:',
    toJsonBlock(state.user),
    '直近ログ:',
    toJsonBlock(recentLogs),
    '現在の提案たたき台:',
    toJsonBlock({
      title: prescription.title,
      meal: {
        recipe: prescription.meal.recipe.title,
        calories: prescription.meal.recipe.calories,
        protein: prescription.meal.recipe.protein,
        fat: prescription.meal.recipe.fat,
        carbs: prescription.meal.recipe.carbs,
        remainingTargets: prescription.meal.remainingTargets
      },
      workout: {
        muscleGroup: prescription.workout.muscleGroup,
        durationMinutes: prescription.workout.durationMinutes,
        caution: prescription.workout.caution,
        exercises: prescription.workout.exercises
      },
      reasoning: prescription.reasoning
    })
  ].join('\n');
}
