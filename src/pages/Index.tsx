import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ReelSection from "@/components/ReelSection";
import FramesCarousel from "@/components/FramesCarousel";
import ServicesSection from "@/components/ServicesSection";
import BrandsSection from "@/components/BrandsSection";
import BrandsShowcase from "@/components/BrandsShowcase";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <HeroSection />
      <ReelSection />
      <BrandsShowcase />
      <FramesCarousel />
      <ServicesSection />
      <BrandsSection />
      <Footer />
    </div>
  );
};

export default Index;
