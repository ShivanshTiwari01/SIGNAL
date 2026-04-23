'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SignalLogo from '@/components/common/SignalLogo';

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
        <Link href='/'>
          <SignalLogo iconSize={36} />
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

        <div className='flex items-center gap-3'>
          <Link href='/sign-in' className='btn-outline px-4! py-2! text-sm'>
            Sign In
          </Link>
          <Link href='/sign-up' className='btn-outline px-4! py-2! text-sm'>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
