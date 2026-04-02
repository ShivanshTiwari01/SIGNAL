'use client';

export default function CTASection() {
  return (
    <section className='bg-background py-28 px-6 relative overflow-hidden'>
      {/* Glow */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[100px] rounded-full' />
      </div>

      <div className='relative max-w-2xl mx-auto text-center'>
        <p className='text-primary text-xs font-semibold uppercase tracking-widest mb-4'>
          The Future of Trading is Neural.
        </p>
        <h2 className='text-foreground text-3xl md:text-5xl font-bold leading-tight mb-5'>
          Join the investors already{' '}
          <span className='text-gradient'>ahead of the curve.</span>
        </h2>
        <p className='text-muted-foreground text-sm max-w-md mx-auto mb-10 leading-relaxed'>
          Get early access to Flux AI and start trading with intelligence that
          compounds.
        </p>
        <button className='btn-primary text-sm px-8 py-4'>
          Claim Early Access →
        </button>
      </div>

      {/* Footer strip */}
      <div className='relative max-w-5xl mx-auto mt-24 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4'>
        <p className='text-muted-foreground/40 text-xs'>
          © 2025 Flux AI. All rights reserved.
        </p>
        <div className='flex gap-6'>
          {['Privacy', 'Terms', 'Contact'].map((l) => (
            <a
              key={l}
              href='#'
              className='text-muted-foreground/40 hover:text-muted-foreground text-xs transition-colors'
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
