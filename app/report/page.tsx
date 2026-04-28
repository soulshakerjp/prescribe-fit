'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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

  const chartData = useMemo(() => {
    return logs.map((log) => {
      const macros = sumMacros(log.meals);
      return {
        date: log.date.slice(5),
        weight: log.weightKg,
        protein: Math.round(macros.protein),
        fat: Math.round(macros.fat),
        carbs: Math.round(macros.carbs),
        commitment: state.user ? commitmentScore(state.user.targets, macros, log.sleepHours, Boolean(log.workouts.length)) : 0,
        volume: log.workouts.reduce((acc, workout) => acc + workout.performance.weightKg * workout.performance.reps * workout.performance.sets, 0),
        sleep: log.sleepHours
      };
    });
  }, [logs, state.user]);

  if (!state.user) {
    return (
      <AppShell title="進捗レポート" subtitle="トレーニングカルテとログ入力後に、ここで週次・月次の推移を確認できます。">
        <div className="rounded-3xl border border-rx-line/60 bg-white p-6 text-sm text-slate-600">まだレポートを表示できるデータがありません。</div>
      </AppShell>
    );
  }

  const averageCommitment = chartData.length ? Math.round(chartData.reduce((acc, item) => acc + item.commitment, 0) / chartData.length) : 0;
  const averageProtein = chartData.length ? Math.round(chartData.reduce((acc, item) => acc + item.protein, 0) / chartData.length) : 0;
  const averageVolume = chartData.length ? Math.round(chartData.reduce((acc, item) => acc + item.volume, 0) / chartData.length) : 0;
  const averageSleep = chartData.length ? Number((chartData.reduce((acc, item) => acc + item.sleep, 0) / chartData.length).toFixed(1)) : 0;
  const latestCoachComment = state.prescriptions.length
    ? ([...state.prescriptions].sort((a, b) => (a.date < b.date ? 1 : -1))[0].coachInsight?.overall || 'ログが増えるほどコメントの精度が上がります。')
    : 'ログが増えるほどコメントの精度が上がります。';

  return (
    <AppShell title="進捗レポート" subtitle="数字だけでなく、次の改善アクションが見えるレポートに寄せています。">
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[28px] border border-rx-line/60 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">体重推移</h2>
          {chartData.length ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#0891b2" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">まだ集計対象のログがありません。</div>
          )}
        </section>

        <section className="rounded-[28px] border border-rx-line/60 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">PFC推移</h2>
          {chartData.length ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="protein" stackId="macro" fill="#0891b2" />
                  <Bar dataKey="fat" stackId="macro" fill="#38bdf8" />
                  <Bar dataKey="carbs" stackId="macro" fill="#99f6e4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">食事ログが入ると、ここに週次・月次の推移が出ます。</div>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-rx-line/60 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">挙上ボリューム推移</h2>
          {chartData.length ? (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">筋トレ実績が保存されるとボリューム推移が表示されます。</div>
          )}
        </section>

        <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">最新AIコメント</h2>
          <div className="mt-4 rounded-3xl bg-rx-soft/70 p-5 text-sm leading-7 text-slate-600">
            <p>{latestCoachComment}</p>
            {state.user.setupFeedback ? <p className="mt-3">カルテ所見: {state.user.setupFeedback.trainingSuggestion}</p> : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
