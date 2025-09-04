export const DashboardMock = () => (
  <svg viewBox="0 0 560 360" className="w-full h-auto">
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0" stopColor="#ecfdf5" />
        <stop offset="1" stopColor="#d1fae5" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="560" height="360" rx="24" fill="url(#g1)" />
    <rect x="24" y="24" width="512" height="48" rx="10" fill="#fff" opacity=".9"/>
    <rect x="24" y="92" width="168" height="16" rx="8" fill="#065f46" opacity=".12"/>
    <rect x="24" y="120" width="220" height="10" rx="5" fill="#065f46" opacity=".12"/>
    <rect x="24" y="140" width="180" height="10" rx="5" fill="#065f46" opacity=".09"/>

    <g transform="translate(24,168)">
      {[40,84,120,72,150,110,170].map((h,i)=>(
        <rect key={i} x={i*28} y={120-h} width="18" height={h} rx="4" fill="#10b981" opacity=".85"/>
      ))}
    </g>

    <g transform="translate(320,120)">
      <rect x="0" y="0" width="216" height="160" rx="16" fill="#fff" opacity=".95"/>
      <circle cx="36" cy="42" r="10" fill="#10b981"/>
      <rect x="54" y="32" width="130" height="12" rx="6" fill="#065f46" opacity=".15"/>
      <rect x="54" y="50" width="100" height="10" rx="5" fill="#065f46" opacity=".1"/>
      {[0,1,2,3].map(i=>(
        <rect key={i} x="20" y={80+i*24} width={160-(i*10)} height="10" rx="5" fill="#065f46" opacity=".08"/>
      ))}
    </g>
  </svg>
);

export const BarsCard = () => (
  <svg viewBox="0 0 320 200" className="w-full h-auto">
    <rect width="320" height="200" rx="16" fill="#ffffff" />
    <g transform="translate(20,24)">
      {[70,120,90,140,100].map((h,i)=>(
        <rect key={i} x={i*52} y={140-h} width="28" height={h} rx="6" fill="#10b981" opacity=".9"/>
      ))}
    </g>
  </svg>
);

export const StatsBadge = () => (
  <svg viewBox="0 0 280 120" className="w-full h-auto">
    <rect width="280" height="120" rx="16" fill="#f0fdf4"/>
    <circle cx="44" cy="60" r="18" fill="#10b981"/>
    <rect x="72" y="46" width="160" height="12" rx="6" fill="#065f46" opacity=".2"/>
    <rect x="72" y="64" width="120" height="10" rx="5" fill="#065f46" opacity=".12"/>
  </svg>
);
