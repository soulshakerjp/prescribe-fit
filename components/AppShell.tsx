import { Navigation } from '@/components/Navigation';
import { RxIcon } from '@/components/RxIcon';

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-radial pb-28">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 pb-8 pt-6 sm:px-6">
        <header className="mb-6 rounded-[32px] border border-rx-line/60 bg-white/85 p-5 shadow-rx backdrop-blur sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-rx-soft text-rx-cyan shadow-sm">
                <RxIcon className="h-9 w-9" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rx-cyan">PRESCRIBE FIT</p>
                <p className="mt-1 text-3xl font-black tracking-[0.04em] text-slate-950 sm:text-4xl">{title}</p>
              </div>
            </div>
            <div className="rounded-full border border-rx-line px-4 py-2 text-xs font-medium text-slate-600">
              OpenAI Coach Ready
            </div>
          </div>
          {subtitle ? <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">{subtitle}</p> : null}
        </header>
        <main className="flex-1">{children}</main>
      </div>
      <Navigation />
    </div>
  );
}
