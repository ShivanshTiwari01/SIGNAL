import {
  FeaturesSection,
  HeroSection,
  LogoBar,
  Navbar,
} from '@/features/landing/components';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LogoBar />
        <FeaturesSection />
      </main>
    </>
  );
}
