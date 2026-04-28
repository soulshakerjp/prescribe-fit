'use client';

import { AppShell } from '@/components/AppShell';
import { PrescriptionCard } from '@/components/PrescriptionCard';
import { useApp } from '@/components/AppProvider';
import { muscleGroupLabels } from '@/lib/exercises';

export default function PrescriptionPage() {
  const { todayPrescription, state, isGeneratingAi, aiError } = useApp();

  if (!todayPrescription) {
    return (
      <AppShell title="AIメニュー詳細" subtitle="ログ保存後に、ここで今日の夕食案と次回トレーニング案を確認できます。">
        <div className="rounded-3xl border border-rx-line/60 bg-white p-6 text-sm text-slate-600">まだ今日のAIメニューがありません。まずは /log で記録してください。</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="AIメニュー詳細" subtitle="食事・トレーニング・回復の3点をまとめて見られるように整理しています。">
      {isGeneratingAi ? (
        <div className="mb-4 rounded-3xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">OpenAIコメントを再生成中です。</div>
      ) : null}
      {aiError ? (
        <div className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{aiError}</div>
      ) : null}

      <PrescriptionCard prescription={todayPrescription} />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] print:grid-cols-1">
        <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">提案理由</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            {todayPrescription.reasoning.map((reason) => (
              <li key={reason} className="rounded-2xl bg-slate-50 px-4 py-3">• {reason}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">食事・筋トレの内訳</h2>
          <div className="mt-4 space-y-5 text-sm text-slate-600">
            <div>
              <p className="font-medium text-slate-800">今晩の夕食プラン</p>
              <ul className="mt-2 space-y-2">
                {todayPrescription.meal.recipe.ingredients.map((item) => (
                  <li key={item}>・{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-500">買い物リスト：{todayPrescription.meal.recipe.shoppingList.join(' / ')}</p>
            </div>
            <div>
              <p className="font-medium text-slate-800">次回トレーニング ({muscleGroupLabels[todayPrescription.workout.muscleGroup]})</p>
              <ul className="mt-2 space-y-2">
                {todayPrescription.workout.exercises.map((exercise) => (
                  <li key={exercise.exercise}>・{exercise.exercise} — {exercise.performance.weightKg}kg × {exercise.performance.reps}回 × {exercise.performance.sets}セット</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-rx-soft/70 p-4">
              <p className="font-medium text-slate-800">残り目標</p>
              <p className="mt-2">Calories（カロリー） {todayPrescription.meal.remainingTargets.calories} kcal</p>
              <p>Protein（たんぱく質） {todayPrescription.meal.remainingTargets.protein}g / Fat（脂質） {todayPrescription.meal.remainingTargets.fat}g / Carbs（炭水化物） {todayPrescription.meal.remainingTargets.carbs}g</p>
            </div>
          </div>
        </section>
      </div>

      {state.prescriptions.length > 1 ? (
        <section className="mt-6 rounded-[28px] border border-rx-line/60 bg-white p-6 shadow-sm print:hidden">
          <h2 className="text-lg font-semibold text-slate-900">過去のAIメニュー履歴</h2>
          <div className="mt-4 grid gap-3">
            {[...state.prescriptions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8).map((item) => (
              <div key={`${item.date}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span>#{String(item.id).padStart(4, '0')} / {item.date}</span>
                <span>{item.meal.recipe.title}</span>
                <span>{item.workout.exercises[0]?.exercise ?? '-'} を中心に構成</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
