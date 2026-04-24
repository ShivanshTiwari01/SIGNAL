'use client';

const plans = [
  {
    name: 'Explorer',
    price: '₹0',
    period: '/month',
    description:
      'Get started with basic signals and essential market coverage.',
    features: [
      '5 signals/day',
      'Basic market insights',
      'Nifty index data',
      'Community access',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Trader',
    price: '₹1,999',
    period: '/month',
    description:
      'Everything in Explorer plus advanced tools for active traders.',
    features: [
      'Unlimited signals',
      'All basic features',
      'Real-time market data',
      'Advanced charting',
      'Priority alerts',
    ],
    cta: 'Start Trading',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro Trader',
    price: '₹19,999',
    period: '/month',
    description:
      'Full access to every feature — built for serious professionals.',
    features: [
      'Everything in Trader',
      'AI Portfolio advisor',
      'Dedicated model training',
      'API access',
      'SLA guarantees',
      'Priority support',
    ],
    cta: 'Go Pro',
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id='pricing' className='bg-background py-28 px-6'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-16'>
          <p className='text-primary text-xs font-semibold uppercase tracking-widest mb-3'>
            Precision Tiered Access
          </p>
          <h2 className='text-foreground text-3xl md:text-4xl font-bold'>
            Choose your edge.
          </h2>
          <p className='text-muted-foreground text-sm mt-3 max-w-md mx-auto'>
            Every plan includes our core AI engine. Upgrade as your strategy
            evolves.
          </p>
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 items-start'>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-md p-6 flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? 'bg-secondary border-2 border-primary shadow-xl glow-blue scale-[1.02]'
                  : 'card-neural hover:border-white/10'
              }`}
            >
              {plan.badge && (
                <div className='absolute -top-3.5 left-1/2 -translate-x-1/2'>
                  <span className='bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full'>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className='mb-6'>
                <p className='text-muted-foreground text-sm font-medium mb-1'>
                  {plan.name}
                </p>
                <div className='flex items-baseline gap-1'>
                  <span className='text-foreground text-4xl font-bold'>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className='text-muted-foreground text-sm'>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className='text-muted-foreground text-xs mt-2 leading-relaxed'>
                  {plan.description}
                </p>
              </div>

              <ul className='space-y-3 flex-1 mb-8'>
                {plan.features.map((f) => (
                  <li key={f} className='flex items-start gap-2.5 text-sm'>
                    <svg
                      className='mt-0.5 flex-shrink-0'
                      width='14'
                      height='14'
                      viewBox='0 0 14 14'
                      fill='none'
                    >
                      <circle
                        cx='7'
                        cy='7'
                        r='6'
                        fill={
                          plan.highlight
                            ? 'hsl(var(--primary))'
                            : 'hsl(var(--secondary))'
                        }
                      />
                      <path
                        d='M4.5 7L6.2 8.7L9.5 5.5'
                        stroke={
                          plan.highlight ? 'white' : 'hsl(var(--primary))'
                        }
                        strokeWidth='1.3'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <span className='text-muted-foreground'>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={
                  plan.highlight ? 'btn-primary w-full' : 'btn-outline w-full'
                }
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
