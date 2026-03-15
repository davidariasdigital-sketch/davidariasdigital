import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ReelSection from "@/components/ReelSection";
import ServicesSection from "@/components/ServicesSection";
import BrandsShowcase from "@/components/BrandsShowcase";
import Footer from "@/components/Footer";
import ElevenLabsWidget from "@/components/ElevenLabsWidget";

const Index = () => {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ReelSection />
      <BrandsShowcase />
      <ServicesSection />
      <Footer />
      <ElevenLabsWidget />
    </div>
  );
};

export default Index;