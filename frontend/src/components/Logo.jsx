export function ShieldLogo({ size = 60 }) {
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 64 72" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lgS" x1="6" y1="3" x2="58" y2="69" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7cc4ff" /><stop offset="1" stopColor="#1f6bff" />
        </linearGradient>
        <linearGradient id="lgF" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2f7bff" stopOpacity=".5" /><stop offset="1" stopColor="#0f3fb8" stopOpacity=".7" />
        </linearGradient>
        <linearGradient id="lgL" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ffffff" /><stop offset="1" stopColor="#a9d0ff" />
        </linearGradient>
      </defs>
      <path d="M32 3 58 13v23c0 17-11 28-26 33C17 64 6 53 6 36V13L32 3Z" fill="url(#lgF)" stroke="url(#lgS)" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M25 33v-5a7 7 0 0 1 14 0v5" stroke="url(#lgL)" strokeWidth="3.2" strokeLinecap="round" />
      <rect x="21" y="32" width="22" height="17" rx="4.5" fill="url(#lgL)" />
      <circle cx="32" cy="39.5" r="2.4" fill="#1a4fd6" />
      <rect x="31" y="41" width="2" height="5" rx="1" fill="#1a4fd6" />
    </svg>
  );
}

// variant: "light" (on dark background) or "dark" (on white background)
export default function Logo({ variant = 'light', size = 60, tagline = false }) {
  return (
    <div className={`logo logo-${variant}`}>
      <ShieldLogo size={size} />
      <div>
        <div className="logo-text">ScamShield<span className="logo-ai"> AI</span></div>
        {tagline && <div className="logo-tagline">Think Before You Click</div>}
      </div>
    </div>
  );
}
