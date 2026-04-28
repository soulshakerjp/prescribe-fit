'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ChevronRight, Dumbbell, NotebookPen, Sparkles, PlayCircle } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PFCMeter } from '@/components/PFCMeter';
import { PrescriptionCard } from '@/components/PrescriptionCard';
import { useApp } from '@/components/AppProvider';
import { commitmentScore, sumMacros } from '@/lib/pfcCalculator';

export default function HomePage() {
  const { state, hydrated, todayPrescription, loadDemo, isGeneratingAi, aiError } = useApp();

  const today = new Date().toISOString().slice(0, 10);
  const todayLog = state.logs.find((log) => log.date === today);
  const consumed = sumMacros(todayLog?.meals ?? []);

  const recentLogs = useMemo(() => {
    return [...state.logs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 7);
  }, [state.logs]);

  if (!hydrated) {
    return (
      <AppShell title="読み込み中" subtitle="保存済みのログとカルテを復元しています。">
        <div className="rounded-3xl border border-rx-line/60 bg-white p-6 text-sm text-slate-500">Loading...</div>
      </AppShell>
    );
  }

  if (!state.user) {
    return (
      <AppShell title="AIフィットネス" subtitle="目標・日々のログ・OpenAIコメントをつなぎ、夕食とトレーニングを毎日更新するMVPです。">
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-rx">
            <p className="text-xs uppercase tracking-[0.2em] text-rx-cyan">Get Started</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">まずはトレーニングカルテを入力</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">身長・目標・日常活動量からPFC目標値を自動算出し、OpenAIが日々のログに応じた夕食とトレーニングを提案します。</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-rx-cyan px-4 py-3 text-sm font-medium text-white transition hover:opacity-90">
                カルテを作成する <ChevronRight className="h-4 w-4" />
              </Link>
              <button onClick={loadDemo} className="inline-flex items-center gap-2 rounded-full border border-rx-line px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <PlayCircle className="h-4 w-4 text-rx-cyan" />デモデータを投入
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-rx">
            <div className="grid gap-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-rx-soft/70 p-4">
                <p className="mb-2 font-medium text-slate-800">このバージョンでできること</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2"><NotebookPen className="h-4 w-4 text-rx-cyan" />食事・睡眠・筋トレを日次入力</li>
                  <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-rx-cyan" />OpenAIまたはローカルロジックで夕食コメントを生成</li>
                  <li className="flex items-center gap-2"><Dumbbell className="h-4 w-4 text-rx-cyan" />過去ログを見ながら次回トレーニング案を更新</li>
                </ul>
              </div>
              <p>GitHubとVercelに載せたまま動かせる構成です。OpenAI APIキーを入れれば、日々のコメントが本物のAI出力に切り替わります。</p>
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  const commitment = commitmentScore(state.user.targets, consumed, todayLog?.sleepHours ?? 7, Boolean(todayLog?.workouts?.length));

  return (
    <AppShell
      title={`ホーム / ${state.user.nickname}さん`}
      subtitle={`今日の目標は ${state.user.targets.calories}kcal / P ${state.user.targets.protein}g。まずは確実に動くことを優先した安全版ホームです。`}
    >
      {isGeneratingAi ? (
        <div className="mb-4 rounded-3xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">OpenAIコメントをバックグラウンドで更新中です。先に画面は操作できます。</div>
      ) : null}
      {aiError ? (
        <div className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{aiError}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-rx-line/60 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-rx-cyan">Today</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{todayLog?.weightKg ?? state.user.weightKg}kg</p>
          <p className="mt-2 text-sm text-slate-500">現在体重 / 目標 {state.user.targetWeightKg}kg</p>
        </div>
        <div className="rounded-3xl border border-rx-line/60 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-rx-cyan">Commitment（達成度）</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{commitment}</p>
          <p className="mt-2 text-sm text-slate-500">100点満点の今日の実行度</p>
        </div>
        <div className="rounded-3xl border border-rx-line/60 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-rx-cyan">Sleep（睡眠時間）</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{todayLog?.sleepHours ?? 0}h</p>
          <p className="mt-2 text-sm text-slate-500">次回メニューのボリューム調整に反映</p>
        </div>
      </div>

      {state.user.setupFeedback ? (
        <section className="mt-6 rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-rx-cyan">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">Setup Comment</p>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">カルテ総評</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{state.user.setupFeedback.summary}</p>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">今日の達成度メーター</h2>
          <Link href="/log" className="text-sm font-medium text-rx-cyan">ログ入力へ</Link>
        </div>
        <PFCMeter consumed={consumed} targets={state.user.targets} />
      </section>

      {todayPrescription ? (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">今日のAIメニュー</h2>
            <Link href="/prescription" className="text-sm font-medium text-rx-cyan">詳細を見る</Link>
          </div>
          <PrescriptionCard prescription={todayPrescription} compact />
        </section>
      ) : null}

      <section className="mt-6 rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">最近の記録</h2>
          <Link href="/report" className="text-sm font-medium text-rx-cyan">レポートへ</Link>
        </div>
        {recentLogs.length ? (
          <div className="space-y-3">
            {recentLogs.map((log) => {
              const macros = sumMacros(log.meals);
              return (
                <div key={log.date} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <strong className="text-slate-900">{log.date}</strong>
                    <span>体重 {log.weightKg ?? '-'}kg / 睡眠 {log.sleepHours}h / 種目 {log.workouts.length}</span>
                  </div>
                  <p className="mt-2">摂取: {Math.round(macros.calories)}kcal / P {Math.round(macros.protein)}g / F {Math.round(macros.fat)}g / C {Math.round(macros.carbs)}g</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">まだログがありません。まずは1件入力して動作を確認しましょう。</div>
        )}
      </section>

      <Link href="/log" className="fixed bottom-24 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-rx-cyan px-5 py-4 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 sm:right-8">
        <NotebookPen className="h-4 w-4" />ログを入力する
      </Link>
    </AppShell>
  );
}
