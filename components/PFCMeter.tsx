import { macroFieldLabels } from '@/lib/coach';
import { MacroTargets } from '@/types';

const labels: Array<keyof MacroTargets> = ['calories', 'protein', 'fat', 'carbs'];
const unitMap: Record<keyof MacroTargets, string> = {
  calories: 'kcal',
  protein: 'g',
  fat: 'g',
  carbs: 'g'
};

export function PFCMeter({ consumed, targets }: { consumed: MacroTargets; targets: MacroTargets }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {labels.map((key) => {
        const percent = Math.min(100, Math.round((consumed[key] / Math.max(1, targets[key])) * 100));
        return (
          <div key={key} className="rounded-3xl border border-rx-line/60 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700">{macroFieldLabels[key]}</span>
              <span className="text-slate-500">
                {Math.round(consumed[key])} / {Math.round(targets[key])}
                {unitMap[key]}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rx-cyan to-teal-400 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">達成度 {percent}%</p>
          </div>
        );
      })}
    </div>
  );
}
