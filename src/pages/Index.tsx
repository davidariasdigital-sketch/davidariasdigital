import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ReelSection from "@/components/ReelSection";
import FramesCarousel from "@/components/FramesCarousel";
import ServicesSection from "@/components/ServicesSection";
import BrandsSection from "@/components/BrandsSection";
import BrandsShowcase from "@/components/BrandsShowcase";
import Footer from "@/components/Footer";
import ElevenLabsWidget from "@/components/ElevenLabsWidget";

const Index = () => {
  return (
    <div className="frame-outer">
      <div className="frame-container bg-[hsl(0,0%,4%)] text-white">
        <Navbar />
        <HeroSection />
        <ReelSection />
        <BrandsShowcase />
        <FramesCarousel />
        <ServicesSection />
        <BrandsSection />
        <Footer />
        <ElevenLabsWidget />
      </div>
    </div>
  );
};

export default Index;