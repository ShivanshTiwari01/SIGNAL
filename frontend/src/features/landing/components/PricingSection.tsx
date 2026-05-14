'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const plans = [
  {
    name: 'Explorer',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description:
      'Get started with basic signals and essential market coverage.',
    features: [
      '5 signals/day',
      'Basic market insights',
      'Nifty index data',
      'Community access',
    ],
    cta: 'Start Free',
    ctaHref: '/sign-up',
    highlight: false,
  },
  {
    name: 'Trader',
    monthlyPrice: 1999,
    yearlyPrice: 19990,
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
    ctaHref: '/sign-up',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro Trader',
    monthlyPrice: 19999,
    yearlyPrice: 199990,
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
    ctaHref: '/sign-up',
    highlight: false,
  },
];

function CheckIcon({ highlight }: { highlight: boolean }) {
  return (
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
        fill={highlight ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'}
      />
      <path
        d='M4.5 7L6.2 8.7L9.5 5.5'
        stroke={highlight ? 'white' : 'hsl(var(--primary))'}
        strokeWidth='1.3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <section id='pricing' className='bg-background py-28 px-6'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-10'>
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

        {/* Billing toggle */}
        <div className='flex items-center justify-center gap-3 mb-12'>
          <span
            className={`text-sm font-medium ${!yearly ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setYearly((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
              yearly ? 'bg-primary' : 'bg-secondary border border-border'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                yearly ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${yearly ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Yearly
          </span>
          <span className='text-xs font-semibold text-growth bg-growth/10 border border-growth/20 px-2 py-0.5 rounded-full'>
            2 months free
          </span>
        </div>

        {/* Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 items-start'>
          {plans.map((plan) => {
            const displayPrice = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const monthlyEquivalent =
              yearly && plan.yearlyPrice > 0
                ? Math.round(plan.yearlyPrice / 12)
                : null;

            return (
              <div
                key={plan.name}
                className={`relative rounded-lg p-6 flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-secondary border-2 border-primary shadow-xl glow-blue scale-[1.02]'
                    : 'bg-card border border-white/5 hover:border-white/10'
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
                  <p className='text-muted-foreground text-sm font-medium mb-2'>
                    {plan.name}
                  </p>
                  <div className='flex items-baseline gap-1.5'>
                    <span className='text-foreground text-4xl font-bold'>
                      {displayPrice === 0
                        ? '₹0'
                        : `₹${displayPrice.toLocaleString('en-IN')}`}
                    </span>
                    {displayPrice > 0 && (
                      <span className='text-muted-foreground text-sm'>
                        /{yearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {monthlyEquivalent && (
                    <p className='text-growth text-xs mt-1 font-medium'>
                      ~₹{monthlyEquivalent.toLocaleString('en-IN')}/mo — save 2
                      months
                    </p>
                  )}
                  <p className='text-muted-foreground text-xs mt-2 leading-relaxed'>
                    {plan.description}
                  </p>
                </div>

                <ul className='space-y-3 flex-1 mb-8'>
                  {plan.features.map((f) => (
                    <li key={f} className='flex items-start gap-2.5 text-sm'>
                      <CheckIcon highlight={plan.highlight} />
                      <span className='text-muted-foreground'>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={isSignedIn ? '/chat' : plan.ctaHref}
                  className={
                    plan.highlight
                      ? 'btn-primary w-full text-center'
                      : 'btn-outline w-full text-center'
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <p className='text-muted-foreground/40 text-xs text-center mt-8'>
          All prices in INR · Billed via Razorpay · Cancel anytime
        </p>
      </div>
    </section>
  );
}
