'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { HERO_CONTENT } from '../constants';

export default function HeroSection() {
  const { isSignedIn } = useAuth();
  return (
    <section className='relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-neural-gradient'>
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 rounded-full bg-primary/10 blur-[120px]' />
        <div
          className='absolute inset-0'
          style={{
            opacity: 1,
            backgroundImage:
              'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) 1px , transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className='relative mb-6 inline-flex items-center gap-2 glass-morphism rounded-full px-4 py-1.5 '>
        <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
        <span className='text-green-500 text-xs font-medium tracking-wider uppercase'>
          New Claude Sonnet 4.6 & Analysis Live
        </span>
      </div>

      <h1 className='relative text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-none tracking-light max-w-3xl mb-6'>
        Smart Trading for{' '}
        <span className=' text-gradient'>Smart Investors</span>
      </h1>

      <p className='relative text-muted-foreground text-lg max-w-xl mb-10 leading-relaxed'>
        Precision-engineered AI signals for the modern markets. Bridge the gap
        between data and execution with Signal AI.
      </p>

      <div className='relative flex items-center gap-4'>
        {isSignedIn ? (
          <Link href='/chat' className='btn-primary'>
            Go to Chats
          </Link>
        ) : (
          <>
            <Link href='/sign-up' className='btn-primary'>
              Get Started Free
            </Link>
            <button className='btn-secondary'>View Demo</button>
          </>
        )}
      </div>
    </section>
  );
}
