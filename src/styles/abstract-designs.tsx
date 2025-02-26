
export const MobileIcon = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="100%" height="40" viewBox="0 0 240 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        {/* First element */}
        <g transform="translate(10, 0)">
          <circle cx="20" cy="20" r="15" stroke="black" strokeWidth="2" fill="#f0e9d6" />
          <circle cx="20" cy="20" r="8" stroke="black" strokeWidth="1.5" fill="#c084fc" />
          <circle cx="20" cy="20" r="3" fill="black" />
        </g>
        
        {/* Connecting line */}
        <line x1="40" y1="20" x2="70" y2="20" stroke="black" strokeWidth="2" strokeDasharray="4 2" />
        
        {/* Second element */}
        <g transform="translate(80, 0)">
          <rect x="0" y="5" width="30" height="30" rx="6" stroke="black" strokeWidth="2" fill="#fcd34d" />
          <circle cx="15" cy="20" r="8" stroke="black" strokeWidth="1.5" fill="white" />
          <circle cx="15" cy="20" r="3" fill="black" />
        </g>
        
        {/* Connecting line */}
        <line x1="120" y1="20" x2="150" y2="20" stroke="black" strokeWidth="2" strokeDasharray="4 2" />
        
        {/* Third element */}
        <g transform="translate(160, 0)">
          <circle cx="20" cy="20" r="15" stroke="black" strokeWidth="2" fill="#a78bfa" />
          <path d="M13 20 L27 20 M20 13 L20 27" stroke="black" strokeWidth="2" />
        </g>

        {/* Fourth element */}
        <g transform="translate(200, 0)">
          <rect x="5" y="5" width="30" height="30" rx="15" stroke="black" strokeWidth="2" fill="#fb7185" />
          <path d="M15 20 L25 20" stroke="white" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
};

export const WeirdDesigns = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="overflow-x-hidden w-full">
        <svg width="100%" height="100" viewBox="0 0 600 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          {/* Design 1: Concentric circles with dots */}
          <g transform="translate(30, 10)">
            <circle cx="40" cy="40" r="30" stroke="black" strokeWidth="2.5" fill="#f0e9d6" />
            <circle cx="40" cy="40" r="20" stroke="black" strokeWidth="2" fill="#ead193" />
            <circle cx="40" cy="40" r="10" stroke="black" strokeWidth="1.75" fill="black" />
            <circle cx="40" cy="40" r="4" fill="white" />
            <circle cx="40" cy="10" r="4" fill="black" />
            <circle cx="40" cy="70" r="4" fill="black" />
            <circle cx="10" cy="40" r="4" fill="black" />
            <circle cx="70" cy="40" r="4" fill="black" />
          </g>
          
          {/* Design 2: Alchemical symbol */}
          <g transform="translate(150, 10)">
            <circle cx="40" cy="40" r="30" stroke="black" strokeWidth="2.5" fill="#c084fc" />
            <line x1="40" y1="10" x2="40" y2="70" stroke="black" strokeWidth="3" />
            <line x1="10" y1="40" x2="70" y2="40" stroke="black" strokeWidth="3" />
            <path d="M40 10 L50 28 L30 28 Z" fill="black" />
          </g>
          
          {/* Design 3: Strange geometric pattern */}
          <g transform="translate(270, 10)">
            <rect x="10" y="10" width="60" height="60" fill="transparent" stroke="transparent" />
            <path d="M25 15 L55 15 L40 45 Z" stroke="black" strokeWidth="2" fill="#fcd34d" />
            <path d="M25 65 L55 65 L40 35 Z" stroke="black" strokeWidth="2" fill="#fb923c" />
            <path d="M10 40 L40 40 L25 10 Z" stroke="black" strokeWidth="2" fill="#fb7185" />
            <path d="M40 40 L70 40 L55 70 Z" stroke="black" strokeWidth="2" fill="#a78bfa" />
            <circle cx="40" cy="40" r="5" fill="black" />
          </g>
          
          {/* Design 4: Musical staff with unusual notes */}
          <g transform="translate(390, 10)">
            <rect x="10" y="10" width="60" height="60" rx="8" fill="#eee6f1" stroke="black" strokeWidth="2" />
            <line x1="15" y1="20" x2="65" y2="20" stroke="black" strokeWidth="2" />
            <line x1="15" y1="30" x2="65" y2="30" stroke="black" strokeWidth="2" />
            <line x1="15" y1="40" x2="65" y2="40" stroke="black" strokeWidth="2" />
            <line x1="15" y1="50" x2="65" y2="50" stroke="black" strokeWidth="2" />
            <line x1="15" y1="60" x2="65" y2="60" stroke="black" strokeWidth="2" />
            <circle cx="25" cy="30" r="6" stroke="black" strokeWidth="2" fill="black" />
            <path d="M31 30 L31 15" stroke="black" strokeWidth="2" />
            <rect x="37" y="25" width="8" height="12" fill="black" />
            <path d="M45 25 L45 15" stroke="black" strokeWidth="2" />
            <path d="M52 40 L62 20" stroke="black" strokeWidth="2.5" />
          </g>
          
          {/* Design 5: Eye-like symbol */}
          <g transform="translate(510, 10)">
            <rect x="10" y="10" width="60" height="60" fill="transparent" stroke="transparent" />
            <ellipse cx="40" cy="40" rx="30" ry="20" stroke="black" strokeWidth="2.5" fill="#f9d2b5" />
            <circle cx="40" cy="40" r="12" stroke="black" strokeWidth="2" fill="#8b5cf6" />
            <circle cx="40" cy="40" r="4" fill="black" />
            <path d="M5 40 L15 40 M65 40 L75 40" stroke="black" strokeWidth="2.5" />
          </g>
        </svg>
      </div>
    </div>
  );
};