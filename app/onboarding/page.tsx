'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useApp } from '@/components/AppProvider';
import { activityLevelDescriptions, buildSetupFeedback, macroFieldLabels } from '@/lib/coach';
import { calculateBmr, calculateTargets } from '@/lib/pfcCalculator';
import { ActivityLevel, GoalType, Sex, UserProfile } from '@/types';

const suggestionTone = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warn: 'border-amber-200 bg-amber-50 text-amber-800',
  adjust: 'border-cyan-200 bg-cyan-50 text-cyan-800'
} as const;

export default function OnboardingPage() {
  const router = useRouter();
  const {
    setProfile,
    loadDemo,
    state,
    isGeneratingAi,
    aiError,
    resetMealHistory,
    resetWorkoutHistory,
    resetAdviceHistory,
    resetAll
  } = useApp();

  const [form, setForm] = useState({
    nickname: state.user?.nickname ?? '宮永さん',
    age: state.user?.age ?? 36,
    sex: (state.user?.sex ?? 'male') as Sex,
    heightCm: state.user?.heightCm ?? 170,
    weightKg: state.user?.weightKg ?? 70,
    targetWeightKg: state.user?.targetWeightKg ?? 65,
    goalType: (state.user?.goalType ?? 'cut') as GoalType,
    goalWeeks: state.user?.goalWeeks ?? 12,
    activityLevel: (state.user?.activityLevel ?? 'moderate') as ActivityLevel,
    trainingDaysPerWeek: state.user?.trainingDaysPerWeek ?? 4,
    canCook: state.user?.canCook ?? true,
    dislikedFoods: state.user?.dislikedFoods.join('、') ?? '',
    maxCookMinutes: state.user?.maxCookMinutes ?? 25,
    japanese: state.user?.cuisines.japanese ?? 60,
    western: state.user?.cuisines.western ?? 20,
    chinese: state.user?.cuisines.chinese ?? 20
  });

  const calculations = useMemo(() => {
    return calculateTargets({
      sex: form.sex,
      age: Number(form.age),
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      goalType: form.goalType,
      activityLevel: form.activityLevel
    });
  }, [form]);

  const previewProfile = useMemo<UserProfile>(() => {
    const totalCuisine = Number(form.japanese) + Number(form.western) + Number(form.chinese) || 100;
    return {
      nickname: form.nickname,
      age: Number(form.age),
      sex: form.sex,
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      targetWeightKg: Number(form.targetWeightKg),
      goalType: form.goalType,
      goalWeeks: Number(form.goalWeeks),
      activityLevel: form.activityLevel,
      trainingDaysPerWeek: Number(form.trainingDaysPerWeek),
      canCook: form.canCook,
      dislikedFoods: form.dislikedFoods.split(/[、,]/).map((item) => item.trim()).filter(Boolean),
      cuisines: {
        japanese: Math.round((Number(form.japanese) / totalCuisine) * 100),
        western: Math.round((Number(form.western) / totalCuisine) * 100),
        chinese: Math.round((Number(form.chinese) / totalCuisine) * 100)
      },
      maxCookMinutes: Number(form.maxCookMinutes),
      targets: calculations.targets,
      setupFeedback: state.user?.setupFeedback
    };
  }, [calculations.targets, form, state.user?.setupFeedback]);

  const previewFeedback = useMemo(() => buildSetupFeedback(previewProfile), [previewProfile]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setProfile(previewProfile);
      router.push('/');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmReset = (message: string, action: () => void) => {
    if (window.confirm(message)) action();
  };

  return (
    <AppShell title="トレーニングカルテ" subtitle="基本プロフィール・目標設定・食事方針をまとめて整理し、OpenAIが日々の食事とトレーニング提案に使う土台を作ります。">
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
          <div className="space-y-8">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rx-cyan">Basic</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">基本プロフィール</h2>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">ニックネーム</span>
                  <input className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">年齢</span>
                  <input type="number" className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">性別</span>
                  <select className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value as Sex })}>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">日常活動量</span>
                  <select className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: e.target.value as ActivityLevel })}>
                    <option value="low">低い</option>
                    <option value="moderate">中程度</option>
                    <option value="high">高い</option>
                  </select>
                  <span className="text-xs leading-6 text-slate-500">※ ここでの活動量はトレーニング強度ではなく、普段の仕事・移動・立ち座りを含めた日常活動量です。現在: {activityLevelDescriptions[form.activityLevel]}</span>
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">身長 (cm)</span>
                  <input type="number" className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">現在体重 (kg)</span>
                  <input type="number" step="0.1" className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} />
                </label>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rx-cyan">Goal</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">目標設定</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">目標体重 (kg)</span>
                  <input type="number" step="0.1" className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.targetWeightKg} onChange={(e) => setForm({ ...form, targetWeightKg: Number(e.target.value) })} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">目標モード</span>
                  <select className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.goalType} onChange={(e) => setForm({ ...form, goalType: e.target.value as GoalType })}>
                    <option value="cut">減量</option>
                    <option value="maintain">維持</option>
                    <option value="bulk">増量</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">目標期間 (週)</span>
                  <input type="number" className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.goalWeeks} onChange={(e) => setForm({ ...form, goalWeeks: Number(e.target.value) })} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">週のトレーニング可能日数</span>
                  <input type="number" min="1" max="7" className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.trainingDaysPerWeek} onChange={(e) => setForm({ ...form, trainingDaysPerWeek: Number(e.target.value) })} />
                </label>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rx-cyan">Nutrition</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">食事設定</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm sm:col-span-2">
                  <span className="font-medium text-slate-700">苦手食材（読点区切り）</span>
                  <input className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.dislikedFoods} onChange={(e) => setForm({ ...form, dislikedFoods: e.target.value })} placeholder="例: パクチー、セロリ" />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-slate-700">調理時間の上限 (分)</span>
                  <input type="number" className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form.maxCookMinutes} onChange={(e) => setForm({ ...form, maxCookMinutes: Number(e.target.value) })} />
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-rx-line px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" checked={form.canCook} onChange={(e) => setForm({ ...form, canCook: e.target.checked })} />
                  自炊できる
                </label>
              </div>
              <div className="mt-6 rounded-3xl bg-rx-soft/70 p-5">
                <p className="mb-4 text-sm font-semibold text-slate-800">料理テイストの比率</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ['japanese', '和食'],
                    ['western', '洋食'],
                    ['chinese', '中華']
                  ].map(([key, label]) => (
                    <label key={key} className="grid gap-2 text-sm">
                      <span className="font-medium text-slate-700">{label}</span>
                      <input type="number" min="0" max="100" className="rounded-2xl border border-rx-line px-4 py-3 outline-none ring-rx-cyan focus:ring" value={form[key as 'japanese' | 'western' | 'chinese']} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button disabled={isSaving || isGeneratingAi} onClick={handleSave} className="inline-flex items-center gap-2 rounded-full bg-rx-cyan px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {(isSaving || isGeneratingAi) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isSaving || isGeneratingAi ? 'OpenAIコメントを生成中...' : 'この内容で開始する'}
            </button>
            <button onClick={loadDemo} className="rounded-full border border-rx-line px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">デモデータで試す</button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-rx-cyan">Live Estimate</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">目標PFCの自動算出</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">PFCは、Protein（たんぱく質）/ Fat（脂質）/ Carbs（炭水化物）の略です。日々の食事提案はこの目標を基準に調整します。</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>BMR（基礎代謝）</span><strong className="text-slate-900">{calculateBmr({ sex: form.sex, age: Number(form.age), heightCm: Number(form.heightCm), weightKg: Number(form.weightKg) })} kcal</strong></div>
              <div className="flex items-center justify-between"><span>TDEE（推定消費カロリー）</span><strong className="text-slate-900">{calculations.tdee} kcal</strong></div>
              <div className="rounded-2xl bg-rx-soft/70 p-4">
                <p className="font-medium text-slate-800">AIが使う日次目標</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>{macroFieldLabels.calories}: {calculations.targets.calories} kcal</li>
                  <li>{macroFieldLabels.protein}: {calculations.targets.protein} g</li>
                  <li>{macroFieldLabels.fat}: {calculations.targets.fat} g</li>
                  <li>{macroFieldLabels.carbs}: {calculations.targets.carbs} g</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-rx-cyan">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">AI Comment</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">カルテ総評</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{previewFeedback.summary}</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium text-slate-800">トレーニングの見立て</p>
                <p className="mt-2 leading-6">{previewFeedback.trainingSuggestion}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium text-slate-800">食事の見立て</p>
                <p className="mt-2 leading-6">{previewFeedback.nutritionSuggestion}</p>
              </div>
              <div className="space-y-3">
                {previewFeedback.suggestions.map((item) => (
                  <div key={`${item.title}-${item.detail}`} className={`rounded-2xl border p-4 ${suggestionTone[item.level]}`}>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-2 leading-6">{item.detail}</p>
                    {item.proposedValue ? <p className="mt-2 text-xs font-medium">提案値: {item.proposedValue}</p> : null}
                  </div>
                ))}
              </div>
              {previewFeedback.warnings.length ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" />確認したいポイント</p>
                  <ul className="mt-2 space-y-2">
                    {previewFeedback.warnings.map((warning) => (
                      <li key={warning}>・{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {aiError ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{aiError}</p> : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-rx-cyan" />
              <h2 className="text-lg font-semibold text-slate-900">データ管理</h2>
            </div>
            <div className="grid gap-3 text-sm">
              <button onClick={() => confirmReset('食事ログ履歴をリセットします。よろしいですか？', resetMealHistory)} className="rounded-2xl border border-rx-line px-4 py-3 text-left text-slate-700 hover:bg-slate-50">食事ログ履歴をリセット</button>
              <button onClick={() => confirmReset('筋トレ履歴をリセットします。よろしいですか？', resetWorkoutHistory)} className="rounded-2xl border border-rx-line px-4 py-3 text-left text-slate-700 hover:bg-slate-50">筋トレ履歴をリセット</button>
              <button onClick={() => confirmReset('AIメニュー履歴をリセットします。よろしいですか？', resetAdviceHistory)} className="rounded-2xl border border-rx-line px-4 py-3 text-left text-slate-700 hover:bg-slate-50">AIメニュー履歴をリセット</button>
              <button onClick={() => confirmReset('すべての保存データをリセットします。よろしいですか？', resetAll)} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-rose-700 hover:bg-rose-100">すべてのデータをリセット</button>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
