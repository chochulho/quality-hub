export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 420 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-md"
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle cx="210" cy="190" r="160" fill="#FFF8F0" />

      {/* Lighthouse body */}
      <rect x="185" y="100" width="50" height="140" rx="6" fill="#2B4B8C" />
      <rect x="190" y="108" width="40" height="12" rx="3" fill="#4A6EAD" />
      <rect x="190" y="128" width="40" height="12" rx="3" fill="#4A6EAD" />
      <rect x="190" y="148" width="40" height="12" rx="3" fill="#4A6EAD" />
      <rect x="190" y="168" width="40" height="12" rx="3" fill="#4A6EAD" />
      <rect x="190" y="188" width="40" height="12" rx="3" fill="#4A6EAD" />

      {/* Lighthouse top */}
      <polygon points="210,60 180,100 240,100" fill="#F26B3A" />
      <rect x="195" y="70" width="30" height="30" rx="4" fill="#FFD166" opacity="0.9" />
      <circle cx="210" cy="85" r="8" fill="#F26B3A" opacity="0.9" />

      {/* Light beams */}
      <line x1="210" y1="85" x2="300" y2="50" stroke="#F26B3A" strokeWidth="2" opacity="0.3" strokeDasharray="4 4" />
      <line x1="210" y1="85" x2="320" y2="90" stroke="#F26B3A" strokeWidth="2" opacity="0.3" strokeDasharray="4 4" />
      <line x1="210" y1="85" x2="100" y2="50" stroke="#F26B3A" strokeWidth="2" opacity="0.2" strokeDasharray="4 4" />

      {/* Base */}
      <rect x="170" y="240" width="80" height="16" rx="8" fill="#2B4B8C" />
      <rect x="155" y="252" width="110" height="8" rx="4" fill="#1E3666" />

      {/* Book stack (left) */}
      <rect x="90" y="220" width="60" height="12" rx="3" fill="#F26B3A" />
      <rect x="93" y="208" width="55" height="14" rx="3" fill="#4A6EAD" />
      <rect x="87" y="196" width="62" height="14" rx="3" fill="#FFD166" />
      <rect x="92" y="184" width="52" height="14" rx="3" fill="#E55A28" />

      {/* Book stack (right) */}
      <rect x="270" y="220" width="60" height="12" rx="3" fill="#4A6EAD" />
      <rect x="273" y="208" width="55" height="14" rx="3" fill="#F26B3A" />
      <rect x="267" y="196" width="62" height="14" rx="3" fill="#2B4B8C" />

      {/* Compass (bottom right) */}
      <circle cx="310" cy="300" r="28" fill="white" stroke="#E8E4DC" strokeWidth="2" />
      <circle cx="310" cy="300" r="20" fill="#FDFBF7" />
      <polygon points="310,280 315,300 310,320 305,300" fill="#F26B3A" opacity="0.9" />
      <polygon points="310,280 315,300 310,320 305,300" fill="#F26B3A" opacity="0.9" />
      <polygon points="290,300 310,295 330,300 310,305" fill="#2B4B8C" opacity="0.6" />
      <circle cx="310" cy="300" r="3" fill="#1A1F2E" />

      {/* Small dots decoration */}
      <circle cx="340" cy="150" r="5" fill="#F26B3A" opacity="0.4" />
      <circle cx="360" cy="170" r="3" fill="#2B4B8C" opacity="0.3" />
      <circle cx="70" cy="280" r="4" fill="#F26B3A" opacity="0.3" />
      <circle cx="80" cy="310" r="6" fill="#2B4B8C" opacity="0.2" />

      {/* Checkmark badges */}
      <rect x="290" y="190" width="80" height="30" rx="15" fill="white" stroke="#E8E4DC" strokeWidth="1.5" />
      <circle cx="310" cy="205" r="8" fill="#16A34A" />
      <polyline points="306,205 309,208 315,202" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="322" y="199" width="40" height="6" rx="3" fill="#E8E4DC" />
      <rect x="322" y="208" width="30" height="4" rx="2" fill="#E8E4DC" />

      <rect x="50" y="145" width="80" height="30" rx="15" fill="white" stroke="#E8E4DC" strokeWidth="1.5" />
      <circle cx="70" cy="160" r="8" fill="#2B4B8C" />
      <text x="70" y="165" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">16949</text>
      <rect x="82" y="154" width="40" height="6" rx="3" fill="#E8E4DC" />
      <rect x="82" y="163" width="30" height="4" rx="2" fill="#E8E4DC" />
    </svg>
  );
}
