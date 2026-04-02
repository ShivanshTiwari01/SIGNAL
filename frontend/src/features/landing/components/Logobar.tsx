'use client';

const LOGOS = ['Bloomberg', 'Reuters', 'NASDAQ', 'Coinbase', 'Finhub'];

export default function LogoBar() {
  return (
    <section className='relative flex flex-col items-center justify-center bg-background border-y border-border py-8'>
      <p className='text-muted-foreground mb-6'>
        Powering 4M+ daily trades through
      </p>

      <div className='relative max-w-5xl mx-auto px-6'>
        <div className='flex items-center justify-center gap-10 md:gap-16 flex-wrap'>
          {LOGOS.map((logo) => (
            <span
              key={logo}
              className='text-muted-foreground/40 font-bold text-xs tracking-widest uppercase hover:text-muted-foreground transition-colors duration-200 cursor-default'
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
