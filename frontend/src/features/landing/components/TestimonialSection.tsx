'use client';

const testimonials = [
  {
    name: 'James Whitfield',
    role: 'Hedge Fund Manager',
    quote:
      'Flux AI completely changed how we approach signal generation. Our alpha has improved meaningfully since we started using their real-time feeds.',
    rating: 5,
  },
  {
    name: 'Priya Anand',
    role: 'Retail Options Trader',
    quote:
      "I've tried every trading tool out there. Nothing comes close to the clarity and precision of Flux AI's insights. It's like having a quant on staff 24/7.",
    rating: 5,
  },
  {
    name: 'Ryan Osei',
    role: 'Crypto Portfolio Strategist',
    quote:
      "The generative insights are a game-changer. I used to spend 3 hours reading earnings transcripts — now it's done in 30 seconds.",
    rating: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className='flex gap-0.5 mb-3'>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          width='14'
          height='14'
          viewBox='0 0 14 14'
          fill='hsl(var(--warning))'
        >
          <path d='M7 1L8.5 5.5H13L9.5 8L10.5 12.5L7 10L3.5 12.5L4.5 8L1 5.5H5.5L7 1Z' />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className='bg-background py-28 px-6'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-14'>
          <p className='text-primary text-xs font-semibold uppercase tracking-widest mb-3'>
            Trusted by Architects of Wealth
          </p>
          <h2 className='text-foreground text-3xl md:text-4xl font-bold'>
            What traders are saying.
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
          {testimonials.map((t) => (
            <div
              key={t.name}
              className='card-neural hover:border-white/10 transition-all duration-300 flex flex-col'
            >
              <Stars count={t.rating} />
              <p className='text-muted-foreground text-sm leading-relaxed mb-6 flex-1'>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className='flex items-center gap-3 pt-4 border-t border-border'>
                <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0'>
                  {t.name[0]}
                </div>
                <div>
                  <p className='text-foreground text-xs font-semibold'>
                    {t.name}
                  </p>
                  <p className='text-muted-foreground text-xs'>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
