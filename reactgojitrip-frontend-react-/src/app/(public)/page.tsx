import Header from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import AboutSection from "@/components/landing/AboutSection";
import FamousRoutes from "@/components/landing/FamousRoutes";
import HowItWorks from "@/components/landing/HowItWorks";
import AIFeatures from "@/components/landing/AIFeatures";
import WhyChooseGojiTrip from "@/components/landing/WhyChooseGojiTrip";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <AboutSection />
      <FamousRoutes />
      <HowItWorks />
      <AIFeatures />
      <WhyChooseGojiTrip />
      <Features />
      <Testimonials />
      <FinalCta />
      <Footer />
    </>
  );
}
