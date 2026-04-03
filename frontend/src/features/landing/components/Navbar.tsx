'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-morphism shadow-xl' : 'bg-transparent'}`}
    >
      <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-2'>
          <div className='w-7 h-7 rounded-md bg-primary flex items-center justify-center glow-blue'>
            <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
              <path
                d='M7 1L13 4V10L7 13L1 10V4L7 1Z'
                fill='white'
                fillOpacity='0.9'
              />
            </svg>
          </div>
          <span className='text-foreground font-bold text-sm tracking-wide'>
            SIGNAL
          </span>
        </Link>

        <div className='hidden md:flex items-center gap-7'>
          {['Pricing', 'Features', 'Blog'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className='text-muted-foreground hover:text-foreground text-sm transition-colors duration-200'
            >
              {item}
            </Link>
          ))}
        </div>

        <button className='btn-primary px-4! py-2! test-sm'>Sign In</button>
      </div>
    </nav>
  );
}
