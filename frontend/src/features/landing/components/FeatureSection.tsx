'use client';

const features = [
  {
    title: 'Real-Time AI Analysis',
    description:
      'Our neural engine processes thousands of signals per second, surfacing actionable insights before the market moves.',
    tag: 'Live',
    wide: true,
  },
  {
    title: 'Multi-Asset Coverage',
    description:
      'Equities, crypto, forex, and commodities — one unified intelligence layer.',
    tag: 'All Markets',
    wide: false,
    accent: true,
  },
  {
    title: 'Personalized Dashboards',
    description:
      'Customize your trading view with AI-curated feeds, risk overlays, and portfolio attribution.',
    tag: 'Personalized',
    wide: false,
  },
  {
    title: 'Generative AI Insights',
    description:
      'Natural language summaries of complex market conditions, earnings calls, and macro events — written for you, not analysts.',
    tag: 'GPT-Powered',
    wide: false,
  },
];

export default function FeaturesSection() {
  return (
    <section id='features' className='bg-background py-28 px-6'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='mb-14'>
          <p className='text-primary text-xs font-semibold uppercase tracking-widest mb-3'>
            The Engine of Intelligence
          </p>
          <h2 className='text-foreground text-3xl md:text-4xl font-bold leading-tight max-w-lg'>
            Built for traders who demand precision.
          </h2>
        </div>

        {/* Bento Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Wide card */}
          <div className='md:col-span-2 card-neural group hover:border-primary/20 transition-all duration-300'>
            <span className='inline-block text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-sm mb-4'>
              {features[0].tag}
            </span>
            <h3 className='text-foreground font-semibold text-lg mb-2'>
              {features[0].title}
            </h3>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              {features[0].description}
            </p>

            {/* Mock chart bars */}
            <div className='mt-6 flex items-end gap-1.5 h-16 opacity-30 group-hover:opacity-60 transition-opacity duration-300'>
              {[40, 55, 35, 70, 50, 80, 60, 90, 45, 75, 55, 85].map((h, i) => (
                <div
                  key={i}
                  className='flex-1 rounded-sm bg-primary'
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Accent card */}
          <div className='card-neural border-primary/20 bg-secondary hover:border-primary/40 transition-all duration-300'>
            <div className='w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center mb-4'>
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                <path
                  d='M8 2L14 5V11L8 14L2 11V5L8 2Z'
                  fill='hsl(var(--primary))'
                />
              </svg>
            </div>
            <span className='inline-block text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-sm mb-4'>
              {features[1].tag}
            </span>
            <h3 className='text-foreground font-semibold text-lg mb-2'>
              {features[1].title}
            </h3>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              {features[1].description}
            </p>
          </div>

          {/* Two smaller cards */}
          {features.slice(2).map((f, i) => (
            <div
              key={i}
              className='card-neural hover:border-white/10 transition-all duration-300'
            >
              <span className='inline-block text-xs font-medium text-muted-foreground bg-white/5 px-2.5 py-1 rounded-sm mb-4'>
                {f.tag}
              </span>
              <h3 className='text-foreground font-semibold text-base mb-2'>
                {f.title}
              </h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
