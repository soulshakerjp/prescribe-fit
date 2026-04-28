'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Loader2, Plus, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useApp } from '@/components/AppProvider';
import { macroFieldLabels, mealSlotLabels } from '@/lib/coach';
import { estimateManyMealEntries } from '@/lib/foodDb';
import { exercisePresets, muscleGroupLabels } from '@/lib/exercises';
import { sumMacros } from '@/lib/pfcCalculator';
import { DailyLog, MealSlot, WorkoutEntry } from '@/types';

const mealFields: Array<{ slot: MealSlot; label: string; placeholder: string }> = [
  { slot: 'breakfast', label: '朝食', placeholder: '例: オートミール 40g、プロテイン 30g、バナナ 100g' },
  { slot: 'lunch', label: '昼食', placeholder: '例: 鶏むね肉 180g、ごはん 150g、ブロッコリー 100g' },
  { slot: 'dinner', label: '夕食', placeholder: '例: 鮭 150g、玄米 120g、味噌汁 150g' },
  { slot: 'snack', label: '間食', placeholder: '例: ヨーグルト 150g、プロテイン 30g' }
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function LogPage() {
  const router = useRouter();
  const { state, saveLog, isGeneratingAi, aiError } = useApp();
  const [selectedDate, setSelectedDate] = useState(today());
  const selectedLog = useMemo(() => state.logs.find((item) => item.date === selectedDate), [selectedDate, state.logs]);

  const [mealTexts, setMealTexts] = useState<Record<MealSlot, string>>({
    breakfast: '',
    lunch: '',
    dinner: '',
    snack: ''
  });
  const [weightKg, setWeightKg] = useState(state.user?.weightKg ?? 70);
  const [bodyFat, setBodyFat] = useState(18);
  const [sleepHours, setSleepHours] = useState(6.5);
  const [condition, setCondition] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMealTexts({
      breakfast: selectedLog?.meals.find((meal) => meal.slot === 'breakfast')?.text ?? '',
      lunch: selectedLog?.meals.find((meal) => meal.slot === 'lunch')?.text ?? '',
      dinner: selectedLog?.meals.find((meal) => meal.slot === 'dinner')?.text ?? '',
      snack: selectedLog?.meals.find((meal) => meal.slot === 'snack')?.text ?? ''
    });
    setWeightKg(selectedLog?.weightKg ?? state.user?.weightKg ?? 70);
    setBodyFat(selectedLog?.bodyFatPercent ?? 18);
    setSleepHours(selectedLog?.sleepHours ?? 6.5);
    setCondition(selectedLog?.condition ?? 3);
    setNotes(selectedLog?.notes ?? '');
    setWorkouts(selectedLog?.workouts ?? []);
  }, [selectedDate, selectedLog, state.user?.weightKg]);

  const estimatedMeals = useMemo(() => estimateManyMealEntries(mealFields.map((item) => ({ slot: item.slot, text: mealTexts[item.slot] }))), [mealTexts]);
  const totals = useMemo(() => sumMacros(estimatedMeals), [estimatedMeals]);
  const estimatedMap = useMemo(() => new Map(estimatedMeals.map((meal) => [meal.slot, meal])), [estimatedMeals]);
  const sortedLogs = useMemo(() => [...state.logs].sort((a, b) => (a.date < b.date ? 1 : -1)), [state.logs]);

  if (!state.user) {
    return (
      <AppShell title="ログ入力" subtitle="まずはトレーニングカルテが必要です。">
        <div className="rounded-3xl border border-rx-line/60 bg-white p-6 text-sm text-slate-600">/onboarding からトレーニングカルテを作成してください。</div>
      </AppShell>
    );
  }

  const addWorkout = () => {
    const preset = exercisePresets[0];
    setWorkouts([
      ...workouts,
      {
        exercise: preset.name,
        muscleGroup: preset.muscleGroup,
        performance: {
          weightKg: preset.defaultWeightKg,
          reps: preset.defaultReps,
          sets: preset.defaultSets
        }
      }
    ]);
  };

  const updateWorkout = (index: number, next: WorkoutEntry) => {
    const copied = [...workouts];
    copied[index] = next;
    setWorkouts(copied);
  };

  const save = async () => {
    const log: DailyLog = {
      date: selectedDate,
      weightKg,
      bodyFatPercent: bodyFat,
      sleepHours,
      condition,
      meals: estimatedMeals,
      workouts,
      notes
    };
    setIsSaving(true);
    try {
      await saveLog(log);
      router.push('/prescription');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell title="デイリーログ" subtitle="日付は自動入力されます。入力忘れがあっても、過去日付を選んで後から記録・修正できます。">
      {isGeneratingAi ? (
        <div className="mb-4 rounded-3xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">OpenAIコメントを生成中です。完了後にAIメニューへ移動します。</div>
      ) : null}
      {aiError ? (
        <div className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{aiError}</div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <div className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-700">記録日</span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="date" className="w-full rounded-2xl border border-rx-line py-3 pl-11 pr-4 outline-none ring-rx-cyan focus:ring" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>
              </label>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">未入力の日でも、そのまま新規登録できます。</div>
            </div>
          </div>

          <div className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">食事ログ</h2>
            <div className="mt-4 space-y-4">
              {mealFields.map((field) => {
                const estimate = estimatedMap.get(field.slot);
                return (
                  <div key={field.slot} className="rounded-3xl border border-rx-line/60 p-4">
                    <label className="grid gap-2 text-sm">
                      <span className="font-medium text-slate-700">{field.label}</span>
                      <textarea rows={3} className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" placeholder={field.placeholder} value={mealTexts[field.slot]} onChange={(e) => setMealTexts({ ...mealTexts, [field.slot]: e.target.value })} />
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-slate-50 px-3 py-1">{macroFieldLabels.calories}: {Math.round(estimate?.calories ?? 0)} kcal</span>
                      <span className="rounded-full bg-slate-50 px-3 py-1">P: {Math.round(estimate?.protein ?? 0)}g</span>
                      <span className="rounded-full bg-slate-50 px-3 py-1">F: {Math.round(estimate?.fat ?? 0)}g</span>
                      <span className="rounded-full bg-slate-50 px-3 py-1">C: {Math.round(estimate?.carbs ?? 0)}g</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">筋トレ実績</h2>
              <button onClick={addWorkout} className="inline-flex items-center gap-2 rounded-full border border-rx-line px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Plus className="h-4 w-4" />種目追加
              </button>
            </div>
            <div className="space-y-3">
              {workouts.length === 0 ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">この日はまだ筋トレ実績がありません。休養日でも保存できます。</div> : null}
              {workouts.map((workout, index) => (
                <div key={`${workout.exercise}-${index}`} className="grid gap-3 rounded-3xl border border-rx-line/60 p-4">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_auto]">
                    <div className="grid gap-3">
                      <select
                        className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring"
                        value={workout.exercise}
                        onChange={(e) => {
                          const preset = exercisePresets.find((item) => item.name === e.target.value)!;
                          updateWorkout(index, {
                            ...workout,
                            exercise: preset.name,
                            muscleGroup: preset.muscleGroup,
                            performance: {
                              weightKg: preset.defaultWeightKg,
                              reps: preset.defaultReps,
                              sets: preset.defaultSets
                            }
                          });
                        }}
                      >
                        {exercisePresets.map((preset) => (
                          <option key={preset.name} value={preset.name}>{preset.name} / {muscleGroupLabels[preset.muscleGroup]}</option>
                        ))}
                      </select>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="grid gap-2 text-xs text-slate-500">
                          <span>重量 (kg)</span>
                          <input type="number" step="0.5" className="rounded-2xl border border-rx-line px-4 py-3 text-sm outline-none ring-rx-cyan focus:ring" value={workout.performance.weightKg} onChange={(e) => updateWorkout(index, { ...workout, performance: { ...workout.performance, weightKg: Number(e.target.value) } })} />
                        </label>
                        <label className="grid gap-2 text-xs text-slate-500">
                          <span>回数 (回)</span>
                          <input type="number" className="rounded-2xl border border-rx-line px-4 py-3 text-sm outline-none ring-rx-cyan focus:ring" value={workout.performance.reps} onChange={(e) => updateWorkout(index, { ...workout, performance: { ...workout.performance, reps: Number(e.target.value) } })} />
                        </label>
                        <label className="grid gap-2 text-xs text-slate-500">
                          <span>セット数 (セット)</span>
                          <input type="number" className="rounded-2xl border border-rx-line px-4 py-3 text-sm outline-none ring-rx-cyan focus:ring" value={workout.performance.sets} onChange={(e) => updateWorkout(index, { ...workout, performance: { ...workout.performance, sets: Number(e.target.value) } })} />
                        </label>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">対象部位：<strong className="text-slate-900">{muscleGroupLabels[workout.muscleGroup]}</strong></div>
                    <button onClick={() => setWorkouts(workouts.filter((_, workoutIndex) => workoutIndex !== index))} className="self-start rounded-full border border-rx-line p-3 text-slate-500 hover:bg-slate-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">コンディション</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-700">体重 (kg)</span>
                <input type="number" step="0.1" className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-700">体脂肪率 (%)</span>
                <input type="number" step="0.1" className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={bodyFat} onChange={(e) => setBodyFat(Number(e.target.value))} />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-700">睡眠時間 ({sleepHours}h)</span>
                <input type="range" min="3" max="10" step="0.1" value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} />
              </label>
              <div className="grid gap-2 text-sm">
                <span className="font-medium text-slate-700">体調</span>
                <div className="grid grid-cols-5 gap-2">
                  {['😵', '😐', '🙂', '😀', '🔥'].map((emoji, index) => {
                    const value = (index + 1) as 1 | 2 | 3 | 4 | 5;
                    return (
                      <button type="button" key={emoji} onClick={() => setCondition(value)} className={`rounded-2xl border px-3 py-3 text-lg ${condition === value ? 'border-rx-cyan bg-rx-soft' : 'border-rx-line'}`}>
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-700">メモ</span>
                <textarea rows={5} className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="例: 会食がある、肩に違和感あり、午後に眠気あり" />
              </label>
            </div>
          </section>

          <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">推定栄養サマリー</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>{macroFieldLabels.calories}</span><strong className="text-slate-900">{Math.round(totals.calories)} kcal</strong></div>
              <div className="flex justify-between"><span>{macroFieldLabels.protein}</span><strong className="text-slate-900">{Math.round(totals.protein)} g</strong></div>
              <div className="flex justify-between"><span>{macroFieldLabels.fat}</span><strong className="text-slate-900">{Math.round(totals.fat)} g</strong></div>
              <div className="flex justify-between"><span>{macroFieldLabels.carbs}</span><strong className="text-slate-900">{Math.round(totals.carbs)} g</strong></div>
            </div>
            <button disabled={isSaving || isGeneratingAi} onClick={save} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-rx-cyan px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {(isSaving || isGeneratingAi) ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSaving || isGeneratingAi ? '保存してOpenAIコメントを生成中...' : '保存してAIメニューを更新'}
            </button>
          </section>

          <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">ログ履歴</h2>
            <div className="mt-4 space-y-3">
              {sortedLogs.length === 0 ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">まだ保存済みログはありません。</div> : null}
              {sortedLogs.map((log) => {
                const macros = sumMacros(log.meals);
                const isActive = log.date === selectedDate;
                return (
                  <button
                    type="button"
                    key={log.date}
                    onClick={() => setSelectedDate(log.date)}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition ${isActive ? 'border-rx-cyan bg-rx-soft/60' : 'border-rx-line/60 bg-white hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{log.date}</p>
                        <p className="mt-1 text-xs text-slate-500">体重 {log.weightKg ?? '-'}kg / 睡眠 {log.sleepHours}h / {log.workouts.length}種目</p>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>{Math.round(macros.calories)}kcal</p>
                        <p>P {Math.round(macros.protein)}g</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-600">タップするとこの日の詳細を編集できます。</p>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
