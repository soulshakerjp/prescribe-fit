'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { useApp } from '@/components/AppProvider';
import { commitmentScore, sumMacros } from '@/lib/pfcCalculator';

export default function ReportPage() {
  const { state } = useApp();
  const [mode, setMode] = useState<'weekly' | 'monthly'>('weekly');

  const logs = useMemo(() => {
    const sorted = [...state.logs].sort((a, b) => (a.date < b.date ? -1 : 1));
    return mode === 'weekly' ? sorted.slice(-7) : sorted.slice(-30);
  }, [mode, state.logs]);

  if (!state.user) {
    return (
      <AppShell title="進捗レポート" subtitle="トレーニングカルテとログ入力後に、ここで週次・月次の推移を確認できます。">
        <div className="rounded-3xl border border-rx-line/60 bg-white p-6 text-sm text-slate-600">まだレポートを表示できるデータがありません。</div>
      </AppShell>
    );
  }

  const rows = logs.map((log) => {
    const macros = sumMacros(log.meals);
    return {
      date: log.date,
      weight: log.weightKg,
      protein: Math.round(macros.protein),
      fat: Math.round(macros.fat),
      carbs: Math.round(macros.carbs),
      calories: Math.round(macros.calories),
      commitment: commitmentScore(state.user!.targets, macros, log.sleepHours, Boolean(log.workouts.length)),
      volume: log.workouts.reduce((acc, workout) => acc + workout.performance.weightKg * workout.performance.reps * workout.performance.sets, 0),
      sleep: log.sleepHours,
      workoutCount: log.workouts.length
    };
  });

  const averageCommitment = rows.length ? Math.round(rows.reduce((acc, item) => acc + item.commitment, 0) / rows.length) : 0;
  const averageProtein = rows.length ? Math.round(rows.reduce((acc, item) => acc + item.protein, 0) / rows.length) : 0;
  const averageVolume = rows.length ? Math.round(rows.reduce((acc, item) => acc + item.volume, 0) / rows.length) : 0;
  const averageSleep = rows.length ? Number((rows.reduce((acc, item) => acc + item.sleep, 0) / rows.length).toFixed(1)) : 0;
  const latestCoachComment = state.prescriptions.length
    ? ([...state.prescriptions].sort((a, b) => (a.date < b.date ? 1 : -1))[0].coachInsight?.overall || 'ログが増えるほどコメントの精度が上がります。')
    : 'ログが増えるほどコメントの精度が上がります。';

  return (
    <AppShell title="進捗レポート" subtitle="まずは確実に開ける安全版レポートです。重いグラフは外し、記録一覧で確認しやすくしています。">
      <div className="mb-4 flex gap-2">
        {(['weekly', 'monthly'] as const).map((item) => (
          <button key={item} onClick={() => setMode(item)} className={`rounded-full px-4 py-2 text-sm font-medium ${mode === item ? 'bg-rx-cyan text-white' : 'border border-rx-line bg-white text-slate-700'}`}>
            {item === 'weekly' ? '週次' : '月次'}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-rx-line/60 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-rx-cyan">Commitment（達成度）</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{averageCommitment}</p>
          <p className="mt-2 text-sm text-slate-500">平均コミット度</p>
        </div>
        <div className="rounded-3xl border border-rx-line/60 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-rx-cyan">Protein Avg</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{averageProtein}g</p>
          <p className="mt-2 text-sm text-slate-500">平均たんぱく質摂取</p>
        </div>
        <div className="rounded-3xl border border-rx-line/60 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-rx-cyan">Training Volume</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{averageVolume.toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-500">平均総負荷量</p>
        </div>
        <div className="rounded-3xl border border-rx-line/60 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-rx-cyan">Sleep Avg</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{averageSleep}h</p>
          <p className="mt-2 text-sm text-slate-500">平均睡眠時間</p>
        </div>
      </div>

      <section className="mt-6 rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">最新AIコメント</h2>
        <div className="mt-4 rounded-3xl bg-rx-soft/70 p-5 text-sm leading-7 text-slate-600">
          <p>{latestCoachComment}</p>
          {state.user.setupFeedback ? <p className="mt-3">カルテ所見: {state.user.setupFeedback.trainingSuggestion}</p> : null}
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">記録一覧</h2>
        <div className="mt-4 space-y-3">
          {rows.length ? (
            rows.slice().reverse().map((item) => (
              <div key={item.date} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong className="text-slate-900">{item.date}</strong>
                  <span>体重 {item.weight ?? '-'}kg / 睡眠 {item.sleep}h / 種目 {item.workoutCount}</span>
                </div>
                <p className="mt-2">{item.calories}kcal / P {item.protein}g / F {item.fat}g / C {item.carbs}g</p>
                <p className="mt-1">達成度 {item.commitment} / 総負荷量 {item.volume.toLocaleString()}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">まだ集計対象のログがありません。</div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
