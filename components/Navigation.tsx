'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ClipboardList, FileText, Home, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/log', label: 'ログ', icon: ClipboardList },
  { href: '/prescription', label: 'AIメニュー', icon: Sparkles },
  { href: '/report', label: 'レポート', icon: Activity },
  { href: '/onboarding', label: 'カルテ', icon: FileText }
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-rx-line/60 bg-white/90 backdrop-blur print:hidden">
      <div className="mx-auto grid max-w-4xl grid-cols-5 px-2 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition',
                active ? 'bg-rx-soft text-rx-cyan' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
