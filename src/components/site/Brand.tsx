// Custom brand & ornament marks used across the site.
// BridgeMark: a stylized bridge arches with a small cross on top — the project's visual signature.
// Ornament: a thin editorial divider (rule + diamond + rule) used in heroes / section closers.

export function BridgeMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* small cross above center */}
      <line x1="20" y1="3" x2="20" y2="11" />
      <line x1="17" y1="6" x2="23" y2="6" />
      {/* twin arches */}
      <path d="M3 28 C 3 20, 11 14, 15 14 C 19 14, 20 18, 20 22" />
      <path d="M37 28 C 37 20, 29 14, 25 14 C 21 14, 20 18, 20 22" />
      {/* deck */}
      <line x1="2" y1="30" x2="38" y2="30" />
      {/* piers */}
      <line x1="9" y1="30" x2="9" y2="36" />
      <line x1="20" y1="22" x2="20" y2="36" />
      <line x1="31" y1="30" x2="31" y2="36" />
    </svg>
  );
}

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-accent/70 ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-current" />
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor">
        <path d="M6 0 L12 6 L6 12 L0 6 Z" />
      </svg>
      <span className="h-px w-12 bg-current" />
    </div>
  );
}
