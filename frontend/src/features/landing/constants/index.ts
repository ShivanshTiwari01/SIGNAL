import type { NavLink, HeroContent } from '../types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Sign In', href: '/sign-in' },
];

export const HERO_CONTENT: HeroContent = {
  heading: 'Smart Trading for Smart Investors',
  subheading:
    'Precision-engineered AI signals for the modern markets. Bridge the gap between data and execution with the Neural Architect.',
  ctaLabel: 'Get Started Free',
  ctaHref: 'View Demo',
};
