import Logo from './Logo.jsx';
import { GlobeIcon, LockOutlineIcon, ShieldCheckIcon, UsersIcon } from './Icons.jsx';

const FEATURES = [
  { icon: <ShieldCheckIcon />, text: 'AI-Powered Detection' },
  { icon: <GlobeIcon />, text: 'Supports English, Urdu & Roman Urdu' },
  { icon: <UsersIcon />, text: 'Community Reporting' },
  { icon: <LockOutlineIcon />, text: 'Your Safety, Our Priority' },
];

function Art() {
  return (
    <svg className="brand-art" viewBox="0 0 420 270" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="aGlow" cx="50%" cy="55%" r="50%">
          <stop stopColor="#2f7bff" stopOpacity=".6" /><stop offset="1" stopColor="#2f7bff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="aStroke" x1="128" y1="72" x2="252" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8fd0ff" /><stop offset="1" stopColor="#1f6bff" />
        </linearGradient>
        <linearGradient id="aFill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2358d8" stopOpacity=".6" /><stop offset="1" stopColor="#0a2a7a" stopOpacity=".9" />
        </linearGradient>
        <linearGradient id="aLock" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e6f2ff" /><stop offset="1" stopColor="#7db4ff" />
        </linearGradient>
        <linearGradient id="aCard" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#1d429f" /><stop offset="1" stopColor="#102a70" />
        </linearGradient>
        <linearGradient id="aBright" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#3b8bff" /><stop offset="1" stopColor="#1a50d8" />
        </linearGradient>
        <filter id="aBlur"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>

      <ellipse cx="190" cy="185" rx="200" ry="105" fill="url(#aGlow)" />

      {/* network waves */}
      <g stroke="#3b8bff" strokeOpacity=".35">
        <path d="M0 212C70 188 120 244 200 224S340 190 420 212" />
        <path d="M0 230C80 204 140 262 220 240S350 208 420 230" />
        <path d="M0 250C90 224 150 276 230 256S360 232 420 250" />
      </g>
      <g fill="#6fb2ff" fillOpacity=".8">
        <circle cx="48" cy="205" r="2" /><circle cx="120" cy="236" r="1.8" /><circle cx="330" cy="206" r="2" />
        <circle cx="388" cy="214" r="1.6" /><circle cx="270" cy="244" r="1.8" /><circle cx="22" cy="232" r="1.6" />
      </g>

      {/* floating cards */}
      <g className="float f1">
        <rect x="285" y="5" width="52" height="46" rx="10" fill="url(#aBright)" />
        <path d="M300 50l-6 11 17-11z" fill="#2a6ef0" />
        <rect x="294" y="16" width="34" height="4" rx="2" fill="#fff" fillOpacity=".92" />
        <rect x="294" y="25" width="34" height="4" rx="2" fill="#fff" fillOpacity=".92" />
        <rect x="294" y="34" width="22" height="4" rx="2" fill="#fff" fillOpacity=".92" />
      </g>
      <g className="float f2">
        <rect x="235" y="48" width="60" height="42" rx="9" fill="url(#aCard)" stroke="#3b8bff" strokeOpacity=".5" />
        <circle cx="249" cy="62" r="5" fill="#6fb2ff" />
        <rect x="259" y="58" width="28" height="3.5" rx="1.7" fill="#9cc8ff" />
        <rect x="244" y="72" width="40" height="3.5" rx="1.7" fill="#6fa6f5" />
        <rect x="244" y="79" width="28" height="3.5" rx="1.7" fill="#6fa6f5" />
      </g>
      <g className="float f3">
        <rect x="278" y="78" width="58" height="52" rx="10" fill="url(#aCard)" stroke="#3b8bff" strokeOpacity=".55" />
        <circle cx="322" cy="92" r="3.6" fill="#b8dcff" />
        <path d="M287 121l13-17 9 11 6-7 14 13z" fill="#7db4ff" />
      </g>
      <g className="float f4">
        <rect x="306" y="142" width="50" height="50" rx="12" fill="url(#aBright)" stroke="#7cc4ff" strokeOpacity=".5" />
        <path transform="translate(318.5 154.5) scale(1)" fill="#e6f2ff" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1L6.6 10.8z" />
      </g>
      <g className="float f5">
        <rect x="66" y="125" width="58" height="44" rx="10" fill="url(#aCard)" stroke="#3b8bff" strokeOpacity=".5" />
        <circle cx="86" cy="142" r="5" fill="#8fc0ff" />
        <path d="M76 160c1-6 5-8 10-8s9 2 10 8z" fill="#8fc0ff" />
        <path d="M100 160l7-9 6 9z" fill="#5f9bf0" />
      </g>
      <g className="float f6">
        <rect x="246" y="158" width="54" height="40" rx="9" fill="url(#aCard)" stroke="#3b8bff" strokeOpacity=".45" />
        <rect x="255" y="168" width="36" height="4" rx="2" fill="#7db4ff" />
        <rect x="255" y="177" width="36" height="4" rx="2" fill="#5f9bf0" />
        <rect x="255" y="186" width="22" height="4" rx="2" fill="#5f9bf0" />
      </g>

      {/* hero shield */}
      <g className="shield">
        <ellipse cx="190" cy="234" rx="72" ry="9" fill="#3b8bff" fillOpacity=".55" filter="url(#aBlur)" />
        <path d="M190 72 252 96v56c0 40-26 64-62 78-36-14-62-38-62-78V96z" fill="url(#aFill)" stroke="url(#aStroke)" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M190 85 241 105v47c0 33-21 53-51 65-30-12-51-32-51-65v-47z" stroke="#7cc4ff" strokeOpacity=".55" strokeWidth="1.5" />
        <path d="M176 142v-12a14 14 0 0 1 28 0v12" stroke="#cfe6ff" strokeWidth="5" strokeLinecap="round" />
        <rect x="164" y="140" width="52" height="42" rx="9" fill="url(#aLock)" />
        <circle cx="190" cy="157" r="5.5" fill="#1a4fd6" />
        <rect x="188" y="159" width="4" height="12" rx="2" fill="#1a4fd6" />
      </g>
    </svg>
  );
}

export default function BrandPanel() {
  return (
    <aside className="brand-panel">
      <div className="reveal" style={{ '--i': 0 }}>
        <Logo variant="light" size={58} tagline />
      </div>

      <h2 className="brand-title reveal" style={{ '--i': 1 }}>
        Stop Scams<br />Before They <span>Reach You</span>
      </h2>
      <p className="brand-desc reveal" style={{ '--i': 2 }}>
        Detect and report digital fraud in multiple languages — text, links, screenshots, phone numbers and more.
      </p>

      <ul className="features">
        {FEATURES.map((f, i) => (
          <li key={f.text} className="reveal" style={{ '--i': 3 + i }}>
            <span className="feat-icon">{f.icon}</span>{f.text}
          </li>
        ))}
      </ul>

      <Art />
    </aside>
  );
}
