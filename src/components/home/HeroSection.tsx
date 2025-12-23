import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Snowflake } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-float hidden lg:block" />
      <div className="absolute bottom-40 right-40 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-float hidden lg:block" style={{ animationDelay: "2s" }} />

      {/* Content */}
      <div className="container relative z-10 py-12 md:py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-primary-light px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up">
            <Snowflake className="h-4 w-4" />
            Kenya's Trusted Refrigeration Partner
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Premium Refrigeration & <span className="text-primary-glow">HVAC Solutions</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-background/80 mb-8 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
            From cold rooms to ice machines, we provide expert installation, maintenance, and quality equipment for your business needs in Nairobi and across Kenya.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/shop">
              <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                Browse Products
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/quote">
              <Button variant="frost" size="xl" className="w-full sm:w-auto">
                Request Quotation
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-4 mt-10 pt-8 border-t border-background/20 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <a href="tel:+254707154948" className="flex items-center gap-3 text-background/80 hover:text-primary-light transition-colors">
              <div className="w-12 h-12 bg-background/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-background/60">Call Us Now</p>
                <p className="font-semibold">+254 707 154 948</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
