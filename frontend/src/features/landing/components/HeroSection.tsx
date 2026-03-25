import Link from 'next/link';
import { HERO_CONTENT } from '../constants';

export function HeroSection() {
  return (
    <section className='flex flex-col items-center text-center py-24'>
      <h1 className='text-5xl font-bold'>{HERO_CONTENT.heading}</h1>
      <p className='mt-4 text-lg text-gray-600'>{HERO_CONTENT.subheading}</p>
      <Link
        href='/signup'
        className='mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
      >
        Get Started
      </Link>
    </section>
  );
}
