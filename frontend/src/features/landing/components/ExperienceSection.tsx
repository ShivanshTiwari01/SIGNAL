'use client';

const bullets = [
  'AI detects market anomalies 10x faster than human analysts',
  'Context-aware alerts — only what matters, when it matters',
  'Continuous learning model that adapts to changing market regimes',
];

const stats = [
  { label: 'Win Rate', value: '73%', delta: '+4.2%', up: true },
  { label: 'Avg. Return', value: '2.4x', delta: '+0.3x', up: true },
  { label: 'Active Signals', value: '12', delta: 'Live', up: null },
];

const activities = [
  { symbol: 'RELIANCE', signal: 'BUY', confidence: 87, time: '2m ago' },
  { symbol: 'TCS', signal: 'HOLD', confidence: 64, time: '5m ago' },
  { symbol: 'HDFC', signal: 'SELL', confidence: 78, time: '11m ago' },
];

export default function ExperienceSection() {
  return (
    <section className='bg-background py-28 px-6'>
      <div className='max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16'>
        {/* Left */}
        <div className='flex-1'>
          <p className='text-primary text-xs font-semibold uppercase tracking-widest mb-4'>
            Experience the Response
          </p>
          <h2 className='text-foreground text-3xl md:text-4xl font-bold leading-tight mb-6'>
            The market never sleeps.{' '}
            <span className='text-muted-foreground font-normal'>
              Neither does Signal AI.
            </span>
          </h2>
          <p className='text-muted-foreground text-sm leading-relaxed mb-8 max-w-md'>
            Built on a continuously learning model, Signal AI adapts to shifting
            market conditions in real-time — so your strategy is always ahead of
            the curve.
          </p>

          <ul className='space-y-4'>
            {bullets.map((b, i) => (
              <li key={i} className='flex items-start gap-3'>
                <span className='mt-0.5 w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0'>
                  <svg width='10' height='10' viewBox='0 0 10 10' fill='none'>
                    <path
                      d='M2 5L4 7L8 3'
                      stroke='hsl(var(--primary))'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
                <span className='text-muted-foreground text-sm leading-relaxed'>
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — enhanced dashboard card */}
        <div className='flex-1 w-full'>
          <div className='card-neural relative overflow-hidden glow-blue'>
            {/* Header */}
            <div className='flex items-center justify-between mb-5'>
              <div>
                <p className='text-foreground font-semibold text-sm'>
                  Portfolio Performance
                </p>
                <p className='text-primary text-xs mt-0.5'>+18.4% this month</p>
              </div>
              <span className='text-xs font-medium text-growth bg-growth/10 border border-growth/20 px-2.5 py-1 rounded-sm flex items-center gap-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-growth animate-pulse' />
                Live
              </span>
            </div>

            {/* Sparkline */}
            <div className='relative h-28 mb-5'>
              <svg
                viewBox='0 0 300 100'
                className='w-full h-full'
                preserveAspectRatio='none'
              >
                <defs>
                  <linearGradient id='sparkGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='0%'
                      stopColor='hsl(var(--chart-line))'
                      stopOpacity='0.35'
                    />
                    <stop
                      offset='100%'
                      stopColor='hsl(var(--chart-line))'
                      stopOpacity='0'
                    />
                  </linearGradient>
                </defs>
                <path
                  d='M0,80 C30,70 50,85 80,60 C110,35 130,70 160,45 C190,20 210,55 240,30 C270,10 280,20 300,15'
                  fill='none'
                  stroke='hsl(var(--chart-line))'
                  strokeWidth='2.5'
                />
                <path
                  d='M0,80 C30,70 50,85 80,60 C110,35 130,70 160,45 C190,20 210,55 240,30 C270,10 280,20 300,15 L300,100 L0,100 Z'
                  fill='url(#sparkGrad)'
                />
                {/* Marker dot */}
                <circle
                  cx='300'
                  cy='15'
                  r='3.5'
                  fill='hsl(var(--chart-line))'
                  opacity='0.9'
                />
              </svg>
            </div>

            {/* Stats row */}
            <div className='grid grid-cols-3 gap-3 mb-5'>
              {stats.map((s) => (
                <div
                  key={s.label}
                  className='bg-secondary/70 rounded-md p-3 text-center border border-white/5'
                >
                  <p className='text-foreground font-bold text-xl'>{s.value}</p>
                  <p className='text-muted-foreground text-xs mt-0.5'>
                    {s.label}
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 ${s.up === null ? 'text-primary' : s.up ? 'text-growth' : 'text-loss'}`}
                  >
                    {s.delta}
                  </p>
                </div>
              ))}
            </div>

            {/* Live signals feed */}
            <div className='border-t border-border/50 pt-4'>
              <p className='text-muted-foreground/50 text-[10px] font-semibold uppercase tracking-wider mb-3'>
                Recent Signals
              </p>
              <div className='space-y-2'>
                {activities.map((a) => (
                  <div key={a.symbol} className='flex items-center gap-3'>
                    <div className='w-16 shrink-0'>
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded-sm ${
                          a.signal === 'BUY'
                            ? 'bg-growth/15 text-growth'
                            : a.signal === 'SELL'
                              ? 'bg-loss/15 text-loss'
                              : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {a.signal}
                      </span>
                    </div>
                    <span className='text-foreground text-xs font-semibold flex-1'>
                      {a.symbol}
                    </span>
                    <div className='flex items-center gap-1.5'>
                      <div className='w-16 h-1.5 rounded-full bg-secondary overflow-hidden'>
                        <div
                          className='h-full rounded-full bg-primary/60'
                          style={{ width: `${a.confidence}%` }}
                        />
                      </div>
                      <span className='text-muted-foreground/50 text-xs tabular-nums'>
                        {a.confidence}%
                      </span>
                    </div>
                    <span className='text-muted-foreground/40 text-xs'>
                      {a.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Glow overlay */}
            <div className='absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none' />
          </div>
        </div>
      </div>
    </section>
  );
}
