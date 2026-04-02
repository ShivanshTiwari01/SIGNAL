import {
  CTASection,
  ExperienceSection,
  FeaturesSection,
  HeroSection,
  LogoBar,
  Navbar,
  PricingSection,
  TestimonialsSection,
} from '@/features/landing/components';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LogoBar />
        <FeaturesSection />
        <ExperienceSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
    </>
  );
}
