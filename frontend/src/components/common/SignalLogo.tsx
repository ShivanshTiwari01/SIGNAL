interface SignalLogoProps {
  /** Icon size in px. Wordmark scales proportionally. */
  iconSize?: number;
  showWordmark?: boolean;
  className?: string;
}

export default function SignalLogo({
  iconSize = 32,
  showWordmark = true,
  className = '',
}: SignalLogoProps) {
  const fontSize = Math.round(iconSize * 0.44);

  return (
    <div
      className={`flex items-center gap-2.5 select-none ${className}`}
      aria-label='Signal logo'
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 40 40'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <defs>
          {/* Hex background gradient */}
          <linearGradient
            id='slg-bg'
            x1='0'
            y1='0'
            x2='40'
            y2='40'
            gradientUnits='userSpaceOnUse'
          >
            <stop offset='0%' stopColor='#1D4ED8' />
            <stop offset='100%' stopColor='#3B82F6' />
          </linearGradient>

          {/* Waveform gradient – fades left-to-right */}
          <linearGradient
            id='slg-wave'
            x1='6'
            y1='20'
            x2='34'
            y2='20'
            gradientUnits='userSpaceOnUse'
          >
            <stop offset='0%' stopColor='#93C5FD' stopOpacity='0.4' />
            <stop offset='100%' stopColor='#FFFFFF' stopOpacity='0.95' />
          </linearGradient>

          {/* Glow filter for the live dot */}
          <filter
            id='slg-dot-glow'
            x='-100%'
            y='-100%'
            width='300%'
            height='300%'
          >
            <feGaussianBlur stdDeviation='1.5' result='blur' />
            <feComposite in='SourceGraphic' in2='blur' operator='over' />
          </filter>

          {/* Subtle glow for the waveform */}
          <filter
            id='slg-wave-glow'
            x='-10%'
            y='-60%'
            width='120%'
            height='220%'
          >
            <feGaussianBlur stdDeviation='0.8' result='blur' />
            <feComposite in='SourceGraphic' in2='blur' operator='over' />
          </filter>
        </defs>

        {/* ── Flat-top hexagon ── */}
        {/* Vertices: (37,20) (29,35) (11,35) (3,20) (11,5) (29,5) */}
        <path
          d='M37,20 L29,35 L11,35 L3,20 L11,5 L29,5 Z'
          fill='url(#slg-bg)'
          fillOpacity='0.13'
          stroke='url(#slg-bg)'
          strokeWidth='1.4'
          strokeOpacity='0.75'
        />

        {/* ── Inner corner highlights (top-right edge only) ── */}
        <path
          d='M29,5 L37,20'
          stroke='#60A5FA'
          strokeWidth='1.4'
          strokeOpacity='0.5'
          strokeLinecap='round'
        />

        {/* ── Signal / market waveform ── */}
        {/* flat → spike up → valley → mini spike → settle → flat */}
        <path
          d='M6,20 H11 L14,10 L18,27 L21,13 L24,20 H34'
          stroke='url(#slg-wave)'
          strokeWidth='1.8'
          strokeLinecap='round'
          strokeLinejoin='round'
          filter='url(#slg-wave-glow)'
        />

        {/* ── Live signal dot ── */}
        {/* Outer halo */}
        <circle cx='34' cy='20' r='4' fill='#3B82F6' fillOpacity='0.2' />
        {/* Core dot */}
        <circle
          cx='34'
          cy='20'
          r='2.2'
          fill='#3B82F6'
          filter='url(#slg-dot-glow)'
        />
        <circle cx='34' cy='20' r='1.1' fill='#BFDBFE' />
      </svg>

      {showWordmark && (
        <span
          className='font-bold tracking-[0.18em] text-foreground'
          style={{ fontSize }}
        >
          SIGNAL
        </span>
      )}
    </div>
  );
}
