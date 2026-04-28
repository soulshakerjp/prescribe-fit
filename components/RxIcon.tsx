export function RxIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M17 52V12h18c7.732 0 14 6.268 14 14 0 5.9-3.65 10.95-8.82 13.01L48 52" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 32h15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M27 52l18-18" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
