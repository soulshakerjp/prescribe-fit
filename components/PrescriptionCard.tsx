'use client';

import Link from 'next/link';
import { ArrowRight, Clock3, Dumbbell, Printer, ShoppingBasket, Sparkles } from 'lucide-react';
import { CoachInsight, Prescription } from '@/types';
import { RxIcon } from '@/components/RxIcon';
import { muscleGroupLabels } from '@/lib/exercises';

function SourceBadge({ generatedBy, model }: { generatedBy: string; model?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${generatedBy === 'openai' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
      <Sparkles className="h-3.5 w-3.5" />
      {generatedBy === 'openai' ? `OpenAI ${model ?? ''}`.trim() : 'ルールベース補完'}
    </span>
  );
}

export function PrescriptionCard({ prescription, compact = false }: { prescription: Prescription; compact?: boolean }) {
  const coachInsight: CoachInsight = {
    overall: prescription.coachInsight?.overall ?? '',
    dinner: prescription.coachInsight?.dinner ?? '',
    workout: prescription.coachInsight?.workout ?? '',
    recovery: prescription.coachInsight?.recovery ?? '',
    actionItems: prescription.coachInsight?.actionItems ?? [],
    warnings: prescription.coachInsight?.warnings ?? [],
    generatedBy: prescription.coachInsight?.generatedBy ?? 'rule-based',
    model: prescription.coachInsight?.model
  };

  return (
    <section className="rx-paper relative overflow-hidden rounded-[32px] border border-rx-line bg-white p-6 shadow-rx">
      <div className="rx-watermark">PF</div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-rx-line pb-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-rx-cyan">
            <RxIcon className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">AI MENU SHEET</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{prescription.title} No.{String(prescription.id).padStart(4, '0')}</h2>
          <p className="mt-1 text-sm text-slate-500">作成日 {prescription.date} / コーチ {prescription.coachName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge generatedBy={coachInsight.generatedBy} model={coachInsight.model} />
          <Link href="/prescription" className="inline-flex items-center gap-2 rounded-full border border-rx-line px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
            詳細を見る <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl bg-rx-soft/60 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-rx-cyan">Dinner Plan</p>
            <h3 className="text-lg font-semibold text-slate-900">{prescription.meal.recipe.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{prescription.message}</p>
            <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700">{coachInsight.dinner || '今日の残り目標に合わせて、夕食の内容を微調整します。'}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">{prescription.meal.recipe.calories} kcal</span>
              <span className="rounded-full bg-white px-3 py-1">P {prescription.meal.recipe.protein}g</span>
              <span className="rounded-full bg-white px-3 py-1">F {prescription.meal.recipe.fat}g</span>
              <span className="rounded-full bg-white px-3 py-1">C {prescription.meal.recipe.carbs}g</span>
            </div>
            {!compact ? (
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-3">
                  <p className="mb-2 flex items-center gap-2 font-medium text-slate-700"><ShoppingBasket className="h-4 w-4 text-rx-cyan" />買い物リスト</p>
                  <ul className="space-y-1 text-xs">
                    {prescription.meal.recipe.shoppingList.map((item) => (
                      <li key={item}>・{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="mb-2 flex items-center gap-2 font-medium text-slate-700"><Clock3 className="h-4 w-4 text-rx-cyan" />調理時間</p>
                  <p className="text-xs">約 {prescription.meal.recipe.cookMinutes} 分</p>
                  <p className="mt-2 text-xs text-slate-500">代替案：{prescription.meal.recipe.alternatives.join(' / ')}</p>
                </div>
              </div>
            ) : null}
          </div>

          {!compact ? (
            <div className="rounded-3xl border border-rx-line/70 bg-white/90 p-4">
              <h3 className="text-base font-semibold text-slate-900">AIコーチ総評</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{coachInsight.overall || 'ログが増えるほど、AIコメントの精度が上がります。'}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{coachInsight.recovery}</p>
              {coachInsight.actionItems.length ? (
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {coachInsight.actionItems.map((item) => (
                    <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">• {item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-rx-line/70 bg-white/90 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-rx-cyan">Workout Plan</p>
          <h3 className="text-lg font-semibold text-slate-900">次回は {muscleGroupLabels[prescription.workout.muscleGroup]} を重点化</h3>
          <p className="mt-2 text-sm text-slate-600">{coachInsight.workout || '次回トレーニングは、直近で間隔の空いた部位を優先しています。'}</p>
          <p className="mt-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-600">{prescription.workout.caution}</p>
          <ul className="mt-4 space-y-3">
            {prescription.workout.exercises.slice(0, compact ? 3 : 4).map((exercise) => (
              <li key={exercise.exercise} className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{exercise.exercise}</span>
                  <span className="text-xs text-slate-500">{exercise.performance.weightKg}kg × {exercise.performance.reps}回 × {exercise.performance.sets}セット</span>
                </div>
              </li>
            ))}
          </ul>
          {coachInsight.warnings.length ? (
            <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-medium">注意ポイント</p>
              <ul className="mt-2 space-y-1">
                {coachInsight.warnings.map((warning) => (
                  <li key={warning}>・{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {!compact ? (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-rx-soft/60 px-3 py-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2"><Dumbbell className="h-4 w-4 text-rx-cyan" />所要時間の目安</span>
              <span>{prescription.workout.durationMinutes}分</span>
            </div>
          ) : null}
        </div>
      </div>

      {!compact ? (
        <div className="mt-6 flex justify-end print:hidden">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-rx-cyan px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            <Printer className="h-4 w-4" />印刷する
          </button>
        </div>
      ) : null}
    </section>
  );
}
