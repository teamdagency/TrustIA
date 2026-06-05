import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection, FeaturesSection, TestimonialsSection, FAQSection } from '@/components/marketing/sections';
import { PricingSection } from '@/components/marketing/pricing';
import { CTASection } from '@/components/marketing/cta';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
