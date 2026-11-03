import React from "react";

interface FlagIconProps {
  code: string;
  className?: string;
}

export function FlagIcon({ code, className = "w-5 h-3.5" }: FlagIconProps) {
  const normCode = code.toLowerCase();

  switch (normCode) {
    case "en":
    case "us":
      // United States Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#bd3d44" d="M0 0h640v480H0z" />
          <path
            stroke="#fff"
            strokeWidth="37"
            d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640"
          />
          <path fill="#192f5d" d="M0 0h260v259H0z" />
          <g fill="#fff">
            {[30, 80, 130, 180, 230].map((x) =>
              [25, 75, 125, 175, 225].map((y) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="6" />
              ))
            )}
            {[55, 105, 155, 205].map((x) =>
              [50, 100, 150, 200].map((y) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#fff" />
              ))
            )}
          </g>
        </svg>
      );

    case "id":
      // Indonesia Flag (Merah Putih)
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#e11f26" d="M0 0h640v240H0z" />
          <path fill="#ffffff" d="M0 240h640v240H0z" />
        </svg>
      );

    case "es":
      // Spain Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#c60b1e" d="M0 0h640v480H0z" />
          <path fill="#ffc400" d="M0 120h640v240H0z" />
          <rect x="120" y="190" width="60" height="80" rx="10" fill="#c60b1e" />
          <circle cx="150" cy="230" r="15" fill="#ffc400" />
        </svg>
      );

    case "zh":
    case "cn":
      // China Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#de2910" d="M0 0h640v480H0z" />
          <polygon
            fill="#ffde00"
            points="100,60 112,96 150,96 119,118 131,154 100,132 69,154 81,118 50,96 88,96"
          />
          <polygon fill="#ffde00" points="180,40 185,55 200,55 188,65 192,80 180,70 168,80 172,65 160,55 175,55" transform="scale(0.6) translate(100, 20)" />
          <polygon fill="#ffde00" points="220,80 225,95 240,95 228,105 232,120 220,110 208,120 212,105 200,95 215,95" transform="scale(0.6) translate(130, 40)" />
          <polygon fill="#ffde00" points="220,140 225,155 240,155 228,165 232,180 220,170 208,180 212,165 200,155 215,155" transform="scale(0.6) translate(130, 70)" />
          <polygon fill="#ffde00" points="180,180 185,195 200,195 188,205 192,220 180,210 168,220 172,205 160,195 175,195" transform="scale(0.6) translate(100, 100)" />
        </svg>
      );

    case "ar":
    case "sa":
      // Saudi Arabia Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#006c35" d="M0 0h640v480H0z" />
          <path
            fill="#ffffff"
            d="M170 280h300v16H170zM210 260h220v8H210zM190 230h260v12H190zM170 290l-30 15 30 15v-10h300v-10H170z"
          />
        </svg>
      );

    case "ja":
    case "jp":
      // Japan Flag (Hinomaru)
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#ffffff" d="M0 0h640v480H0z" />
          <circle cx="320" cy="240" r="140" fill="#bc002d" />
        </svg>
      );

    case "fr":
      // France Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#002654" d="M0 0h213.3v480H0z" />
          <path fill="#ffffff" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#ed2939" d="M426.7 0H640v480H426.7z" />
        </svg>
      );

    case "de":
      // Germany Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#000000" d="M0 0h640v160H0z" />
          <path fill="#dd0000" d="M0 160h640v160H0z" />
          <path fill="#ffce00" d="M0 320h640v160H0z" />
        </svg>
      );

    case "pt":
    case "br":
      // Brazil Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#009c3b" d="M0 0h640v480H0z" />
          <polygon fill="#ffdf00" points="320,40 600,240 320,440 40,240" />
          <circle cx="320" cy="240" r="105" fill="#002776" />
          <path
            d="M216 235a110 110 0 0 0 208 10"
            fill="none"
            stroke="#ffffff"
            strokeWidth="14"
          />
        </svg>
      );

    case "hi":
    case "in":
      // India Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#ff9933" d="M0 0h640v160H0z" />
          <path fill="#ffffff" d="M0 160h640v160H0z" />
          <path fill="#138808" d="M0 320h640v160H0z" />
          <circle cx="320" cy="240" r="50" fill="none" stroke="#000080" strokeWidth="6" />
          <circle cx="320" cy="240" r="12" fill="#000080" />
        </svg>
      );

    case "ko":
    case "kr":
      // South Korea Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#ffffff" d="M0 0h640v480H0z" />
          <path
            fill="#c60c30"
            d="M320 140a100 100 0 0 1 0 200 50 50 0 0 1 0-100 50 50 0 0 0 0-100z"
          />
          <path
            fill="#003478"
            d="M320 340a100 100 0 0 1 0-200 50 50 0 0 1 0 100 50 50 0 0 0 0 100z"
          />
          <rect x="100" y="70" width="50" height="8" fill="#000000" transform="rotate(35 125 74)" />
          <rect x="100" y="85" width="50" height="8" fill="#000000" transform="rotate(35 125 89)" />
          <rect x="490" y="380" width="50" height="8" fill="#000000" transform="rotate(35 515 384)" />
          <rect x="490" y="395" width="50" height="8" fill="#000000" transform="rotate(35 515 399)" />
        </svg>
      );

    case "ms":
    case "my":
      // Malaysia Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#cc0000" d="M0 0h640v480H0z" />
          <path
            stroke="#ffffff"
            strokeWidth="34.3"
            d="M0 51.4h640M0 120h640M0 188.6h640M0 257.1h640M0 325.7h640M0 394.3h640M0 462.9h640"
          />
          <path fill="#000066" d="M0 0h320v274.3H0z" />
          <circle cx="160" cy="137" r="70" fill="#ffcc00" />
          <circle cx="180" cy="137" r="60" fill="#000066" />
          <polygon
            fill="#ffcc00"
            points="210,137 200,123 216,124 204,112 219,119 212,105 224,115 222,99 231,112 233,96 239,111 245,96 247,112 256,99 254,115 266,105 259,119 274,112 262,124 278,123 268,137 278,151 262,150 274,162 259,155 266,169 254,159 256,175 247,162 245,178 239,163 233,178 231,162 222,175 224,159 212,169 219,155 204,162 216,150 200,151"
            transform="scale(0.8) translate(50, 28)"
          />
        </svg>
      );

    case "vi":
    case "vn":
      // Vietnam Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#da251d" d="M0 0h640v480H0z" />
          <polygon
            fill="#ffff00"
            points="320,120 357,234 477,234 380,304 417,418 320,348 223,418 260,304 163,234 283,234"
          />
        </svg>
      );

    case "th":
      // Thailand Flag
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-black/10 ${className}`}
          aria-hidden="true"
        >
          <path fill="#ed1c24" d="M0 0h640v480H0z" />
          <path fill="#ffffff" d="M0 80h640v320H0z" />
          <path fill="#241d4f" d="M0 160h640v160H0z" />
        </svg>
      );

    default:
      return (
        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-1 py-0.5 rounded-xs border border-slate-200">
          {code.toUpperCase()}
        </span>
      );
  }
}

